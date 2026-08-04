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

        <linearGradient id="hexRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>

      <path d="M 50,6 L 12,27 L 12,73 L 50,94 Z" fill="url(#logoBlueComp)" />
      <path d="M 50,6 L 88,27 L 88,73 L 50,94 Z" fill="url(#hexRight)" />
      <path d="M 50,6 L 88,27 L 88,73 L 50,94 Z" fill="#ffffff" fill-opacity="0.04" />

      <polygon points="50,6 88,27 88,73 50,94 12,73 12,27" fill="none" stroke="#0f172a" stroke-width="2" />
      <polygon points="50,11 83,30 83,70 50,89 17,70 17,30" fill="none" stroke="#475569" stroke-width="1.5" stroke-opacity="0.4" />

      <line x1="62" y1="20" x2="62" y2="80" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
      <line x1="72" y1="28" x2="72" y2="72" stroke="#64748b" stroke-width="5" stroke-linecap="round" />
      <line x1="82" y1="36" x2="82" y2="64" stroke="#475569" stroke-width="5" stroke-linecap="round" />

      <path d="M 48,54 L 62,42" fill="none" stroke="url(#logoTealComp)" stroke-width="9.5" stroke-linecap="square" />

      <path d="M 40,42 L 40,28 L 72,28 L 32,68 L 68,68 L 68,54" fill="none" stroke="url(#logoTealComp)" stroke-width="9.5" stroke-linecap="square" stroke-linejoin="miter" />
    </svg>
  );
}
