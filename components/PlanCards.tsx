import React from 'react';

interface PlanProps {
  onSelect: (plan: string) => void;
}

const CheckIcon = () => (
  <svg className="w-4 h-4 text-nile-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

const PlanCards: React.FC<PlanProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-4">
      
      {/* Basic Plan */}
      <div 
        className="group relative bg-white border border-earth-800/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
        onClick={() => onSelect("Basic (100 GHS)")}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-earth-800 rounded-t-2xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-earth-800">Basic</h3>
            <p className="text-sm text-earth-800/60 mt-1">Student Essentials</p>
          </div>
          <span className="font-display font-bold text-2xl text-earth-800">100 <span className="text-sm font-sans font-normal">GHS</span></span>
        </div>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> AI Tutor Access</li>
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> Homework Help</li>
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> Quick Tasks</li>
        </ul>
        <button className="w-full py-2.5 rounded-lg border-2 border-earth-800 text-earth-800 font-semibold text-sm hover:bg-earth-800 hover:text-white transition-colors">
          Choose Basic
        </button>
      </div>

      {/* Advanced Plan */}
      <div 
        className="group relative bg-sand-100 border border-orange-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
        onClick={() => onSelect("Advanced (150 GHS)")}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-sunset-500 rounded-t-2xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-earth-800">Advanced</h3>
            <p className="text-sm text-earth-800/60 mt-1">Deep Research</p>
          </div>
          <span className="font-display font-bold text-2xl text-sunset-500">150 <span className="text-sm font-sans font-normal text-earth-800">GHS</span></span>
        </div>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> Everything in Basic</li>
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> Dissertation Support</li>
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> Scholarship Search</li>
          <li className="flex items-center text-sm text-earth-800/80"><CheckIcon /> Extended Writing Tools</li>
        </ul>
        <button className="w-full py-2.5 rounded-lg bg-sunset-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-sunset-500/20">
          Choose Advanced
        </button>
      </div>

      {/* LAB Plan - Premium */}
      <div 
        className="group relative bg-earth-900 border border-gold-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer overflow-hidden"
        onClick={() => onSelect("Lab (200 GHS)")}
      >
        {/* Holographic/Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -inset-[1px] bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 rounded-2xl opacity-30 blur-sm group-hover:opacity-60 transition-opacity"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                LAB
                <span className="text-[10px] bg-gold-500 text-earth-900 px-1.5 py-0.5 rounded font-bold tracking-wider">PREMIUM</span>
              </h3>
              <p className="text-sm text-gold-400 mt-1">Experimental Access</p>
            </div>
            <span className="font-display font-bold text-2xl text-gold-400">200 <span className="text-sm font-sans font-normal text-gray-400">GHS</span></span>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mb-4"></div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-200"><CheckIcon /> <strong>Full Lab Access</strong></li>
            <li className="flex items-center text-sm text-gray-200"><CheckIcon /> Virtual Experiments</li>
            <li className="flex items-center text-sm text-gray-200"><CheckIcon /> Priority Support</li>
          </ul>
          <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-earth-900 font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_15px_rgba(203,163,73,0.3)]">
            Activate Lab
          </button>
        </div>
        
        {/* Egyptian Corner Motifs */}
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-gold-500/30 rounded-tr-lg"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-gold-500/30 rounded-bl-lg"></div>
      </div>

    </div>
  );
};

export default PlanCards;