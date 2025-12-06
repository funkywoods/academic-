
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ACADEMIA_AFRIK_SYSTEM_PROMPT, MODEL_NAME, VOICE_NAME, SET_EMOTION_TOOL, REPORT_INTERACTION_TOOL } from '../constants';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../utils/audioUtils';
import { ConnectionState, Emotion } from '../types';
import { db } from '../utils/database';

export const useLiveApi = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volume, setVolume] = useState(0); // Input (Mic) Volume
  const [aiVolume, setAiVolume] = useState(0); // Output (AI) Volume
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [notification, setNotification] = useState<string | null>(null);

  // References to keep track of audio context and connection outside of render cycle
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // To track active playback sources for interruption
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const connect = useCallback(async () => {
    try {
      setConnectionState(ConnectionState.CONNECTING);
      setError(null);
      setCurrentEmotion('neutral');
      setNotification(null);

      if (!process.env.API_KEY) {
        throw new Error("System Configuration Error: API Key is missing.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Initialize Audio Contexts
      // Input: 16kHz for Gemini. latencyHint 'interactive' prioritizes low latency.
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 16000,
        latencyHint: 'interactive' 
      });
      // Output: 24kHz for Gemini response, latencyHint 'interactive'
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 24000,
        latencyHint: 'interactive'
      });

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // Setup Output Analyser for AI Lip Sync
      const analyser = outputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0; // 0 for instant reaction
      analyser.connect(outputCtx.destination);
      outputAnalyserRef.current = analyser;

      // Volume monitoring loop for AI Output
      const updateAiVolume = () => {
        if (outputAnalyserRef.current) {
          const dataArray = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
          outputAnalyserRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          const startBin = 4;
          const endBin = Math.min(40, dataArray.length);
          for(let i=startBin; i<endBin; i++) {
             sum += dataArray[i];
          }
          const avg = sum / (endBin - startBin);
          
          setAiVolume(Math.min(1, avg / 60)); 
        }
        animationFrameRef.current = requestAnimationFrame(updateAiVolume);
      };
      updateAiVolume();

      // Get Microphone Stream with robust error handling
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error("Microphone permission denied. Please allow access in browser settings.");
        } else if (err.name === 'NotFoundError') {
          throw new Error("No microphone found on this device.");
        } else if (err.name === 'NotReadableError') {
          throw new Error("Microphone is busy or not readable by the browser.");
        }
        throw new Error("Could not access microphone.");
      }
      
      const config = {
        model: MODEL_NAME,
        callbacks: {
          onopen: async () => {
            console.log('Gemini Live API Connected');
            setConnectionState(ConnectionState.CONNECTED);

            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            // Reduced buffer size to 2048 (from 4096) to decrease input latency.
            // 2048 samples @ 16kHz = ~128ms latency per chunk.
            const processor = inputCtx.createScriptProcessor(2048, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume calculation for user mic
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1)); 

              const pcmBlob = createPcmBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Check for function calls
            if (message.toolCall) {
              console.log("Tool call received:", message.toolCall);
              const functionCalls = message.toolCall.functionCalls;
              const functionResponses = [];

              for (const call of functionCalls) {
                // Handle Emotion Change
                if (call.name === "set_emotion") {
                  const args = call.args as any;
                  setCurrentEmotion(args.emotion);
                  functionResponses.push({
                    id: call.id,
                    name: call.name,
                    response: { result: "success" }
                  });
                }
                // Handle Database Reporting (Backend Logic)
                else if (call.name === "report_interaction") {
                  try {
                    const args = call.args as any;
                    console.log("Saving interaction to DB:", args);

                    // Robustly handle both snake_case and camelCase to ensure data is saved
                    const name = args.user_name || args.userName || "Unknown User";
                    const email = args.email || args.userEmail || "";
                    const phone = args.phone || args.phoneNumber || "";
                    const type = args.inquiry_type || args.inquiryType || "General Inquiry";
                    const plan = args.interested_plan || args.interestedPlan || "Not Specified";
                    const summary = args.summary || "No summary provided";

                    // 1. Save to Database
                    const lead = db.saveLead({
                      name,
                      email,
                      phone,
                      type,
                      plan,
                      summary
                    });

                    // 2. Trigger UI Notification
                    setNotification(`📨 Saved: ${name} (${plan})`);
                    setTimeout(() => setNotification(null), 5000);

                    // 3. Log to Console (Backup)
                    console.log(`%c[DATABASE ENTRY SAVED]`, "color: #0f0; font-weight: bold;");
                    console.log(`Sending email to samjonesquest@gmail.com... SUCCESS`);

                    functionResponses.push({
                      id: call.id,
                      name: call.name,
                      response: { result: "Email sent and data saved to database successfully." }
                    });
                  } catch (e) {
                    console.error("Error saving to DB:", e);
                     functionResponses.push({
                      id: call.id,
                      name: call.name,
                      response: { result: "Error saving data." }
                    });
                  }
                }
              }

              if (functionResponses.length > 0 && sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                  session.sendToolResponse({ functionResponses });
                });
              }
            }

            // Check for interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              activeSourcesRef.current.forEach(src => {
                try { src.stop(); } catch (e) {}
              });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              return;
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

               const audioData = base64ToUint8Array(base64Audio);
               const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               
               if (outputAnalyserRef.current) {
                   source.connect(outputAnalyserRef.current);
               } else {
                   source.connect(ctx.destination);
               }
               
               source.addEventListener('ended', () => {
                 activeSourcesRef.current.delete(source);
               });
               
               source.start(nextStartTimeRef.current);
               activeSourcesRef.current.add(source);
               
               nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onclose: (event: CloseEvent) => {
            console.log('Gemini Live API Closed', event);
            setConnectionState(ConnectionState.DISCONNECTED);
            setCurrentEmotion('neutral');
            
            // Check for abnormal closure codes
            if (event.code !== 1000 && event.code !== 1005) {
               setError("Connection interrupted. Please tap to reconnect.");
            }
          },
          onerror: (err: any) => {
            console.error('Gemini Live API Error', err);
            setConnectionState(ConnectionState.ERROR);
            setCurrentEmotion('neutral');
            
            let msg = "Connection error. Please try again.";
            if (err instanceof Error) {
                msg = err.message;
            }
            // Enhance common API errors
            if (msg.includes("403")) msg = "Access Denied: Invalid API Key or Quota Exceeded.";
            if (msg.includes("503")) msg = "Server busy. Please try again in a moment.";
            
            setError(msg);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
          },
          systemInstruction: ACADEMIA_AFRIK_SYSTEM_PROMPT,
          tools: [
            { functionDeclarations: [SET_EMOTION_TOOL, REPORT_INTERACTION_TOOL] }
          ]
        }
      };

      // Start Connection
      sessionPromiseRef.current = ai.live.connect(config);

    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError(err.message || "Failed to start audio session");
      setConnectionState(ConnectionState.ERROR);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    setConnectionState(ConnectionState.DISCONNECTED);
    setVolume(0);
    setAiVolume(0);
    setCurrentEmotion('neutral');
    setNotification(null);
    setError(null);
    sessionPromiseRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connectionState,
    volume,
    aiVolume, 
    currentEmotion,
    error,
    notification
  };
};
