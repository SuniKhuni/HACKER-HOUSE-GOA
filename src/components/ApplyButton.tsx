'use client';

import React from 'react';

export default function ApplyButton() {
  return (
    <a
      href="https://hacker-house-goa-2026.devfolio.co/overview"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 sm:top-6 sm:right-8 z-50 group flex items-center gap-2 sm:gap-2.5 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full bg-[#0a1813]/85 backdrop-blur-xl border border-amber-500/50 hover:border-amber-400 text-amber-400 hover:text-amber-300 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_0_32px_rgba(245,158,11,0.55),0_0_60px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-105 active:scale-95 select-none"
      aria-label="Apply for Hacker House Goa 2026 on Devfolio"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span>APPLY NOW</span>
      <svg
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    </a>
  );
}
