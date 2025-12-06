import React, { useEffect, useState, useMemo } from 'react';
import { Emotion } from '../types';

interface AvatarProps {
  volume: number;
  isActive: boolean;
  emotion?: Emotion;
}

const Avatar: React.FC<AvatarProps> = ({ volume, isActive, emotion = 'neutral' }) => {
  const [blink, setBlink] = useState(false);
  const [smoothVol, setSmoothVol] = useState(0);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  
  // Responsive smoothing for natural but reactive lip movement
  useEffect(() => {
    if (!isActive) {
      setSmoothVol(0);
      return;
    }
    
    // Threshold to eliminate background noise (mouth shouldn't quiver at silence)
    const threshold = 0.05;
    let targetVolume = volume < threshold ? 0 : volume;

    // Normalize volume to a 0-1 range for the animation
    // Typical speech often hovers around 0.3-0.7
    targetVolume = Math.min(targetVolume * 2, 1); 
    
    setSmoothVol(prev => {
        // Physics: Attack vs Decay
        if (targetVolume > prev) {
            // Attack: Open quickly for plosives and loud sounds
            return prev + (targetVolume - prev) * 0.7; 
        } else {
            // Decay: Close relatively quickly to separate syllables
            return prev + (targetVolume - prev) * 0.4;
        }
    });

  }, [volume, isActive]);

  // Blink logic
  useEffect(() => {
    const blinkLoop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
      const nextBlink = Math.random() * 4000 + 3000; 
      setTimeout(blinkLoop, nextBlink);
    };
    const timer = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Natural Eye Movement logic
  useEffect(() => {
    const lookLoop = () => {
        let chanceToLookAway = 0.3;
        
        // Thoughtful avatars look away/up more often
        if (emotion === 'thoughtful') {
          chanceToLookAway = 0.8;
        }

        if (Math.random() < chanceToLookAway) {
            let x = (Math.random() - 0.5) * 4;
            let y = (Math.random() - 0.5) * 2;
            
            // Look up/right for thoughtfulness
            if (emotion === 'thoughtful') {
                x = 3;
                y = -2;
            }

            setEyePosition({ x, y });
        } else {
            setEyePosition({ x: 0, y: 0 });
        }
        setTimeout(lookLoop, Math.random() * 2000 + 1000);
    };
    const timer = setTimeout(lookLoop, 2000);
    return () => clearTimeout(timer);
  }, [emotion]);

  // --- Dynamic Facial Features based on Emotion ---

  const { eyebrowPaths, mouthConfig } = useMemo(() => {
     let brows = {
        left: "M68 105 Q80 100 92 105", // Neutral
        right: "M108 105 Q120 100 132 105"
     };
     let mouthBase = { curveTop: -2, curveBot: 5 }; // Neutral Smile

     if (emotion === 'happy') {
        brows = {
           left: "M68 100 Q80 90 92 100", // Raised High
           right: "M108 100 Q120 90 132 100"
        };
        mouthBase = { curveTop: -1, curveBot: 12 }; // Wider smile
     } else if (emotion === 'concerned') {
        brows = {
           left: "M68 102 Q80 98 92 105", // Inner angled up (worry)
           right: "M108 105 Q120 98 132 102"
        };
        mouthBase = { curveTop: -1, curveBot: 2 }; // Flat/slight frown
     } else if (emotion === 'thoughtful') {
        brows = {
           left: "M68 105 Q80 100 92 105", // Normal Left
           right: "M108 100 Q120 90 132 100" // Raised Right (Questioning)
        };
        mouthBase = { curveTop: -2, curveBot: 3 }; // Pursed
     }

     return { eyebrowPaths: brows, mouthConfig: mouthBase };
  }, [emotion]);
  
  // Mouth Animation Calculation
  const intensity = smoothVol; // smoothVol is 0-1
  
  // Mouth width expands slightly with volume, but mostly vertical opening
  const mouthWidth = 14 + (intensity * 1.5); 
  
  // Calculate opening
  const openAmount = intensity * 18; // Max open height pixels
  
  const topLipCurve = mouthConfig.curveTop - (openAmount * 0.5);
  const botLipCurve = mouthConfig.curveBot + (openAmount * 0.9);

  const lipColor = "#7A2E2E"; 
  const skinColor = "#8D5524";
  const skinShadow = "#6D411B";

  return (
    <div className="relative w-72 h-72 flex items-center justify-center animate-float" style={{ animationDuration: '6s' }}>
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl overflow-visible">
        <defs>
          <linearGradient id="skinGradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#A66E44" />
            <stop offset="100%" stopColor="#784B2B" />
          </linearGradient>
        </defs>

        {/* --- HAIR (Back Layer) --- */}
        <circle cx="40" cy="80" r="45" fill="#1A1A1A" />
        <circle cx="160" cy="80" r="45" fill="#1A1A1A" />
        <path d="M40 80 Q30 70 40 60 Q50 70 40 80" stroke="#2A2A2A" fill="none" opacity="0.5" />
        <path d="M160 80 Q150 70 160 60 Q170 70 160 80" stroke="#2A2A2A" fill="none" opacity="0.5" />
        
        {/* Neck */}
        <path d="M80 170 L80 230 Q100 245 120 230 L120 170 Z" fill={skinShadow} />

        {/* --- FACE SHAPE --- */}
        <path 
            d="M50 90 Q50 50 100 50 Q150 50 150 90 L150 145 Q150 195 100 205 Q50 195 50 145 Z" 
            fill="url(#skinGradient)" 
        />
        
        {/* Hair Front/Headband */}
        <path d="M48 85 Q100 55 152 85 Q152 100 148 105 Q100 75 52 105 Q48 100 48 85" fill="#1A1A1A" />
        <path d="M46 80 Q100 50 154 80 L154 90 Q100 60 46 90 Z" fill="#E56A32" />

        {/* Ears & Earrings */}
        <circle cx="48" cy="135" r="9" fill={skinColor} />
        <circle cx="152" cy="135" r="9" fill={skinColor} />
        <ellipse cx="46" cy="148" rx="6" ry="12" stroke="#FFD700" strokeWidth="2.5" fill="none" />
        <ellipse cx="154" cy="148" rx="6" ry="12" stroke="#FFD700" strokeWidth="2.5" fill="none" />

        {/* --- FEATURES Group --- */}
        <g transform="translate(0, 10)">
            
            {/* Eyebrows (Dynamic Emotion) - Slow Transition */}
            <g className="transition-all duration-500 ease-in-out">
                <path d={eyebrowPaths.left} stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d={eyebrowPaths.right} stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>

            {/* Eyes */}
            {blink ? (
                <g stroke="#2A1A10" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M70 120 Q80 125 90 120" />
                    <path d="M110 120 Q120 125 130 120" />
                </g>
            ) : (
                <g>
                    {/* Sclera */}
                    <path d="M68 120 Q80 110 92 120 Q80 130 68 120 Z" fill="#FFF" />
                    <path d="M108 120 Q120 110 132 120 Q120 130 108 120 Z" fill="#FFF" />
                    
                    {/* Eyeliner */}
                    <path d="M67 119 Q80 108 93 119" stroke="#1A1A1A" strokeWidth="2" fill="none" />
                    <path d="M107 119 Q120 108 133 119" stroke="#1A1A1A" strokeWidth="2" fill="none" />

                    {/* Iris & Pupil (Moving) */}
                    <g transform={`translate(${eyePosition.x}, ${eyePosition.y})`} className="transition-transform duration-300 ease-out">
                        <circle cx="80" cy="120" r="4.5" fill="#3E2723" /> 
                        <circle cx="120" cy="120" r="4.5" fill="#3E2723" />
                        
                        <circle cx="80" cy="120" r="2" fill="#000" />
                        <circle cx="120" cy="120" r="2" fill="#000" />
                        
                        <circle cx="81.5" cy="118.5" r="1.5" fill="#FFF" opacity="0.8" />
                        <circle cx="121.5" cy="118.5" r="1.5" fill="#FFF" opacity="0.8" />
                    </g>
                </g>
            )}

            {/* Nose */}
            <path d="M92 145 Q100 152 108 145" stroke="#5D3A1A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            
            {/* Cheeks Highlight */}
            <ellipse cx="70" cy="140" rx="10" ry="6" fill="#DFA888" opacity={emotion === 'happy' ? 0.3 : 0.15} />
            <ellipse cx="130" cy="140" rx="10" ry="6" fill="#DFA888" opacity={emotion === 'happy' ? 0.3 : 0.15} />

            {/* MOUTH Container - NO TRANSITION (Frame-by-frame) */}
            <g transform="translate(100, 168)">
                {/* Mouth Interior */}
                <path 
                   d={`M -${mouthWidth} 0 
                       Q 0 ${topLipCurve} ${mouthWidth} 0 
                       Q 0 ${botLipCurve} -${mouthWidth} 0 Z`} 
                   fill="#3A0A0A"
                />

                {/* Teeth - visible when speaking or happy */}
                {(intensity > 0.1 || emotion === 'happy') && (
                     <path 
                        d={`M -8 0 Q 0 ${topLipCurve + 3} 8 0`} 
                        stroke="#FFF" strokeWidth="2" fill="none" opacity="0.8"
                     />
                )}
                
                {/* Upper Lip */}
                <path 
                   d={`M -${mouthWidth + 2} 0 
                       Q 0 ${topLipCurve - 5} ${mouthWidth + 2} 0 
                       Q 0 ${topLipCurve + 2} -${mouthWidth + 2} 0 Z`} 
                   fill={lipColor}
                />

                {/* Lower Lip */}
                <path 
                   d={`M -${mouthWidth} 0 
                       Q 0 ${botLipCurve} ${mouthWidth} 0 
                       Q 0 ${botLipCurve + 6} -${mouthWidth} 0 Z`} 
                   fill={lipColor}
                />
            </g>
        </g>
      </svg>
    </div>
  );
};

export default Avatar;