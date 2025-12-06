import React from 'react';

interface VisualizerProps {
  volume: number;
  isActive: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive }) => {
  // Create 5 bars
  const bars = [0, 1, 2, 3, 4];
  
  return (
    <div className="flex items-center justify-center space-x-3 h-24">
      {bars.map((i) => {
        let height = 12;
        if (isActive) {
           const wave = Math.sin(Date.now() / 200 + i); 
           height = 24 + (volume * 180) + (wave * 12);
           height = Math.min(Math.max(height, 12), 110); // Clamp
        }

        return (
          <div
            key={i}
            className={`w-3 md:w-4 rounded-full transition-all duration-100 ease-out shadow-sm ${isActive ? 'bg-gradient-to-t from-sunset-500 to-gold-500' : 'bg-sand-100'}`}
            style={{ 
              height: `${isActive ? height : 12}px`,
              opacity: isActive ? 0.9 + (volume * 0.1) : 0.6,
              transform: isActive ? `scaleY(${1 + volume * 0.2})` : 'none'
            }}
          />
        );
      })}
    </div>
  );
};

export default Visualizer;