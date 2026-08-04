import React from 'react';

export default function Logo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <img src="/logo.png" alt="Zedech Logo" className={`${className} object-contain`} />
  );
}
