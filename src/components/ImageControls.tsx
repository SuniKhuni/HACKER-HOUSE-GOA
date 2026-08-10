'use client';

import React from 'react';
import { ImageTransform } from '../types/generator';

interface ImageControlsProps {
  memberName: string;
  transform: ImageTransform;
  onUpdateTransform: (updates: Partial<ImageTransform>) => void;
  onReset: () => void;
}

export default function ImageControls({
  memberName,
  transform,
  onUpdateTransform,
  onReset,
}: ImageControlsProps) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-emerald-950/60 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
          Edit Photo: {memberName || 'Member'}
        </h4>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1"
          aria-label="Reset photo position and scale"
        >
          <span>🔄</span>
          <span>Reset Transform</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Zoom Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-emerald-300">
            <label htmlFor="scale-slider">Zoom / Scale</label>
            <span>{transform.scaleX.toFixed(2)}x</span>
          </div>
          <input
            id="scale-slider"
            type="range"
            min="0.1"
            max="4"
            step="0.01"
            value={transform.scaleX}
            onChange={(e) =>
              onUpdateTransform({
                scaleX: parseFloat(e.target.value),
                scaleY: parseFloat(e.target.value),
              })
            }
            className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-emerald-300">
            <label htmlFor="rotation-slider">Rotation</label>
            <span>{transform.rotation}°</span>
          </div>
          <input
            id="rotation-slider"
            type="range"
            min="-180"
            max="180"
            step="1"
            value={transform.rotation}
            onChange={(e) =>
              onUpdateTransform({
                rotation: parseInt(e.target.value, 10),
              })
            }
            className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
        </div>

        {/* X Translation Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-emerald-300">
            <label htmlFor="x-slider">X Position</label>
            <span>{Math.round(transform.x)}px</span>
          </div>
          <input
            id="x-slider"
            type="range"
            min="-500"
            max="500"
            step="1"
            value={transform.x}
            onChange={(e) =>
              onUpdateTransform({
                x: parseInt(e.target.value, 10),
              })
            }
            className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
        </div>

        {/* Y Translation Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-emerald-300">
            <label htmlFor="y-slider">Y Position</label>
            <span>{Math.round(transform.y)}px</span>
          </div>
          <input
            id="y-slider"
            type="range"
            min="-500"
            max="500"
            step="1"
            value={transform.y}
            onChange={(e) =>
              onUpdateTransform({
                y: parseInt(e.target.value, 10),
              })
            }
            className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
        </div>
      </div>
      
      <p className="text-[10px] text-emerald-500/70 font-mono select-none">
        💡 Pro-Tip: You can also drag the image directly on the canvas, or use your mouse scroll wheel to zoom.
      </p>
    </div>
  );
}
