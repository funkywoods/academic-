
import React, { useState, useEffect } from 'react';
import { useLiveApi } from './hooks/useLiveApi';
import Avatar from './components/Avatar';
import AcademiaLogo from './components/AcademiaLogo';
import AdminDashboard from './components/AdminDashboard';
import { ConnectionState } from './types';

// Icons
const MicIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a3 3 0 013 3v1.5a3 3 0 01-6 0V4.5a3 3 0 013-3z" />
  </svg>
);

const StopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </svg>
);

const MailIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export default function App() {
  const { connect, disconnect, connectionState, volume, aiVolume, currentEmotion, error, notification } = useLiveApi();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [secretCount, setSecretCount] = useState(0);

  const handleToggle = () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      disconnect();
    } else {
      connect();
    }
  };

  // Secret Admin Access: Tap logo 5 times
  const handleSecretTrigger = () => {
    setSecretCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsAdminOpen(true);
        return 0;
      }
      return newCount;
    });
    
    // Reset if too slow
    setTimeout(() => setSecretCount(0), 1500);
  };

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  return (
    <div className="h-screen w-screen font-sans text-earth-800 bg-sand-50 flex flex-col relative overflow-hidden">
      
      {/* Background Patterns */}
      <div className="absolute top-0 left-0 w-full h-full bg-egyptian opacity-30 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-contours opacity-30 pointer-events-none z-0"></div>

      {/* BRANDING WATERMARK */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.04] flex flex-col items-center justify-center select-none">
        <AcademiaLogo className="w-[500px] h-[500px]" />
      </div>

      {/* Backend/Email Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[70] animate-float w-max max-w-[90vw]">
          <div className="bg-earth-800 text-gold-400 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gold-500/30">
             <div className="p-2 bg-gold-500/20 rounded-full">
               <MailIcon className="w-6 h-6 text-gold-500" />
             </div>
             <div>
               <p className="font-bold text-sm tracking-wide text-white">SYSTEM ALERT</p>
               <span className="font-medium text-sm">{notification}</span>
             </div>
          </div>
        </div>
      )}

      {/* --- MINIMAL HEADER --- */}
      <header className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center">
        {/* Secret Trigger Area */}
        <div className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform" onClick={handleSecretTrigger}>
          <div className="w-10 h-10 opacity-90 drop-shadow-md">
            <AcademiaLogo />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-earth-900 tracking-tight leading-none">Academia</span>
            <span className="font-display font-bold text-lg text-gold-600 tracking-widest leading-none">AFRIK</span>
          </div>
        </div>
      </header>

      {/* --- MAIN INTERFACE --- */}
      <main className="flex-grow z-10 flex flex-col items-center justify-center relative">
        
        {/* Avatar Container */}
        <div className="relative mb-12 transform scale-125 md:scale-150 transition-all duration-500">
           {isConnecting ? (
             <div className="w-72 h-72 flex flex-col items-center justify-center gap-4">
               <div className="w-16 h-16 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin"></div>
               <span className="text-sm font-medium text-gold-600 animate-pulse">Initializing Ama...</span>
             </div>
           ) : !isConnected ? (
             // Idle State
             <div className="w-72 h-72 flex items-center justify-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <Avatar volume={0} isActive={false} emotion="neutral" />
             </div>
           ) : (
              // Active State
              <Avatar volume={aiVolume} isActive={isConnected} emotion={currentEmotion} />
           )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleToggle}
            className={`
              relative group flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300
              ${isConnected 
                ? 'bg-earth-100 text-earth-900 hover:bg-red-50 hover:text-red-600 ring-4 ring-transparent hover:ring-red-100' 
                : 'bg-gradient-to-br from-earth-900 to-earth-800 text-gold-400 hover:scale-110 ring-4 ring-gold-500/20'
              }
            `}
          >
            {isConnected ? (
              <StopIcon className="w-8 h-8" />
            ) : (
              <MicIcon className="w-8 h-8" />
            )}
            
            {/* Ripple effect when inactive/ready */}
            {!isConnected && !isConnecting && (
              <span className="absolute inset-0 rounded-full border-2 border-gold-400 opacity-20 animate-ping"></span>
            )}
          </button>
          
          <div className="h-10 flex flex-col items-center justify-center">
            {isConnecting && <span className="text-sm text-gold-600 font-medium">Connecting...</span>}
            
            {error && (
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                 <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <span className="text-sm text-red-600 font-medium">{error}</span>
              </div>
            )}

            {isConnected && !error && <span className="text-sm text-nile-500 font-medium animate-pulse">Listening...</span>}
            {!isConnected && !isConnecting && !error && <span className="text-sm text-earth-800/40 font-medium">Tap to start</span>}
          </div>
        </div>

      </main>

      {/* Admin Dashboard Modal */}
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
