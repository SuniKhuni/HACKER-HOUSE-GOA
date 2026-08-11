'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface FontOption {
  value: string;
  label: string;
  category: string;
  sampleText: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: 'Sora', label: 'Sora', category: 'Default • Geometric Sans', sampleText: 'Modern & Clean' },
  { value: 'Fraunces', label: 'Fraunces', category: 'Editorial Serif', sampleText: 'Classic Serif' },
  { value: 'Outfit', label: 'Outfit', category: 'Clean Sans-Serif', sampleText: 'Balanced & Crisp' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Dev Monospace', sampleText: '01001000 01000001' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Tech & Futuristic', sampleText: 'Cyberpunk Mode' },
  { value: 'Bungee', label: 'Bungee', category: 'Bold Impact', sampleText: 'MAX IMPACT' },
];

interface TypographySelectProps {
  value: string;
  onChange: (font: string) => void;
}

export default function TypographySelect({ value, onChange }: TypographySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFont = FONT_OPTIONS.find((f) => f.value === value) || FONT_OPTIONS[0];

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/40 border transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] bg-black/60'
            : 'border-white/[0.08] hover:border-amber-500/35 hover:bg-black/50'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span
            className="text-[14px] font-medium text-amber-300 truncate"
            style={{ fontFamily: selectedFont.value }}
          >
            {selectedFont.label}
          </span>
          <span className="text-[10px] font-mono text-[#777] uppercase tracking-wider hidden sm:inline-block">
            — {selectedFont.category.split('•')[0].trim()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <svg
            className={`w-4 h-4 text-amber-400/80 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Floating Dropdown Options Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 p-1.5 rounded-2xl bg-[#09120e]/95 backdrop-blur-2xl border border-amber-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.15)] max-h-80 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-amber-500/20"
        >
          {FONT_OPTIONS.map((font) => {
            const isSelected = font.value === value;
            return (
              <button
                key={font.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(font.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[inset_0_0_12px_rgba(245,158,11,0.12)]'
                    : 'border border-transparent text-[#bbb] hover:text-white hover:bg-emerald-950/40 hover:border-emerald-700/30'
                }`}
              >
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[15px] transition-colors ${isSelected ? 'text-amber-300 font-semibold' : 'group-hover:text-amber-200'}`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-emerald-400/60 tracking-wide uppercase">
                    {font.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className="text-[11px] font-mono text-[#666] group-hover:text-[#aaa] hidden md:inline-block"
                    style={{ fontFamily: font.value }}
                  >
                    {font.sampleText}
                  </span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
