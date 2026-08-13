'use client';

import React from 'react';
import { ImageTransform } from '../types/generator';

interface ImageControlsProps {
  memberName: string;
  transform: ImageTransform;
  /** The scale that makes the image exactly cover the slot (from getDefaultTransform). Used to compute slider range. */
  fitScale: number;
  /** Half-width of the slot in px — used as the ±range for the X position slider. */
  posRangeX?: number;
  /** Half-height of the slot in px — used as the ±range for the Y position slider. */
  posRangeY?: number;
  onUpdateTransform: (updates: Partial<ImageTransform>) => void;
  onReset: () => void;
}

// Individual slider row matching the reference dark-UI design
function SliderRow({
  id,
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] font-semibold tracking-wide text-[#aaa] uppercase">
          {label}
        </label>
        <span className="text-[11px] font-mono text-[#bbb] tabular-nums bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-[#2a2a2a]">
          {displayValue}
        </span>
      </div>
      <div className="relative h-7 flex items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-[#1e1e1e] border border-[#2a2a2a]" />
        {/* Fill */}
        <div
          className="absolute left-0 h-[3px] rounded-full bg-gradient-to-r from-amber-500 to-amber-400 pointer-events-none"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#333]
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.6)]
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#333]
            [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.6)]
          "
        />
      </div>
    </div>
  );
}

export default function ImageControls({
  memberName,
  transform,
  fitScale,
  posRangeX = 250,
  posRangeY = 250,
  onUpdateTransform,
  onReset,
}: ImageControlsProps) {
  // Zoom range: allow zooming out to 40% of fit (so image can always be shrunk below fill)
  // and up to 4× fit for tight crops. Rounded to avoid floating point noise.
  const zoomMin = Math.max(0.05, parseFloat((fitScale * 0.4).toFixed(3)));
  const zoomMax = parseFloat((fitScale * 4).toFixed(3));
  // Clamp displayed value inside range so fill percentage stays 0–100%
  const clampedScale = Math.min(zoomMax, Math.max(zoomMin, transform.scaleX));
  // Clamp x/y values for the fill indicator (actual value can go out of range via drag)
  const clampedX = Math.min(posRangeX, Math.max(-posRangeX, transform.x));
  const clampedY = Math.min(posRangeY, Math.max(-posRangeY, transform.y));
  return (
    <div className="rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.10] shadow-2xl overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          {/* Crop / adjust icon */}
          <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" />
          </svg>
          <span className="text-[13px] font-semibold text-[#ddd] tracking-wide">
            {memberName ? memberName : 'Photo Composition'}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-[11px] font-mono text-[#aaa] hover:text-amber-400 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-white/[0.06]"
          aria-label="Reset photo position and scale"
        >
          {/* Reset icon */}
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <SliderRow
            id="scale-slider"
            label="Zoom"
            value={clampedScale}
            displayValue={`${transform.scaleX.toFixed(2)}×`}
            min={zoomMin}
            max={zoomMax}
            step={parseFloat((fitScale * 0.005).toFixed(4))}
            onChange={(v) => onUpdateTransform({ scaleX: v, scaleY: v })}
          />
          <SliderRow
            id="rotation-slider"
            label="Rotation"
            value={transform.rotation}
            displayValue={`${Math.round(transform.rotation)}°`}
            min={-90}
            max={90}
            step={0.5}
            onChange={(v) => onUpdateTransform({ rotation: v })}
          />
          <SliderRow
            id="x-slider"
            label="X Position"
            value={clampedX}
            displayValue={`${Math.round(transform.x)}px`}
            min={-posRangeX}
            max={posRangeX}
            step={0.5}
            onChange={(v) => onUpdateTransform({ x: v })}
          />
          <SliderRow
            id="y-slider"
            label="Y Position"
            value={clampedY}
            displayValue={`${Math.round(transform.y)}px`}
            min={-posRangeY}
            max={posRangeY}
            step={0.5}
            onChange={(v) => onUpdateTransform({ y: v })}
          />
        </div>

        <p className="text-[10px] text-[#444] font-mono">
          Drag directly on the canvas, or scroll to zoom.
        </p>
      </div>
    </div>
  );
}
