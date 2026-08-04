import React from 'react';

export default function Logo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="300 35 592 640" className={className}>
      {/* Hexagonal backing with thick borders, fully containing the logo */}
      <polygon 
        points="596,50 872,200 872,510 596,660 320,510 320,200" 
        fill="#0d1117" 
        stroke="#30363d" 
        strokeWidth="16" 
        strokeLinejoin="round"
      />
      {/* Center original logo image */}
      <image href="/logo.png" x="0" y="0" height="800" width="1200" />
    </svg>
  );
}
