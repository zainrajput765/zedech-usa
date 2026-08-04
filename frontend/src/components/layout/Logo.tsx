import React from 'react';

export default function Logo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="logoTealComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2dd4bf" />
          <stop offset="50%" stop-color="#14b8a6" />
          <stop offset="100%" stop-color="#0f766e" />
        </linearGradient>
        <linearGradient id="logoBlueComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      
      {/* Hexagon split colors */}
      <path d="M 50,5 L 10,28 L 10,72 L 50,95 Z" fill="url(#logoBlueComp)" />
      <path d="M 50,5 L 90,28 L 90,72 L 50,95 Z" fill="#1e293b" />
      <path d="M 50,5 L 90,28 L 90,72 L 50,95 Z" fill="#ffffff" fill-opacity="0.05" />
      <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="none" stroke="#334155" stroke-width="2" />
      
      {/* H vertical pillar elements */}
      <line x1="56" y1="20" x2="56" y2="80" stroke="#64748b" stroke-width="4.5" stroke-linecap="round" />
      <line x1="66" y1="28" x2="66" y2="72" stroke="#475569" stroke-width="4.5" stroke-linecap="round" />
      <line x1="76" y1="36" x2="76" y2="64" stroke="#334155" stroke-width="4.5" stroke-linecap="round" />
      
      {/* Front Z Monogram */}
      <path d="M 24,32 L 72,32 L 32,68 L 68,68" fill="none" stroke="url(#logoTealComp)" stroke-width="9.5" stroke-linecap="square" stroke-linejoin="miter" />
    </svg>
  );
}
