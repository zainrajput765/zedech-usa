import React from 'react';

export default function Logo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className={className}>
      <image href="/logo.png" x="0" y="0" height="800" width="1200" />
    </svg>
  );
}
