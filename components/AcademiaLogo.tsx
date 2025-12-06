import React from 'react';

const AcademiaLogo: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none"
    >
      <defs>
        <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EACC70" />
          <stop offset="100%" stopColor="#CBA349" />
        </linearGradient>
        <linearGradient id="logoEarth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B2F2F" />
          <stop offset="100%" stopColor="#2A2020" />
        </linearGradient>
      </defs>

      {/* Geometric Pyramid / Triangle Base (Stability/Egypt) */}
      <path 
        d="M 50,15 L 85,80 L 15,80 Z" 
        fill="url(#logoGold)" 
        opacity="0.9"
      />
      
      {/* Abstract Sun / Knowledge Circle */}
      <circle cx="50" cy="45" r="12" fill="#E56A32" />
      
      {/* Stylized African Pattern Overlay / 'A' shape */}
      <path 
        d="M 50,25 L 75,75 H 25 L 50,25 Z M 50,38 L 40,65 H 60 L 50,38 Z" 
        fill="url(#logoEarth)"
      />

      {/* Horizontal 'Horizon' Line */}
      <rect x="20" y="85" width="60" height="3" rx="1.5" fill="#3AA77C" />
    </svg>
  );
};

export default AcademiaLogo;