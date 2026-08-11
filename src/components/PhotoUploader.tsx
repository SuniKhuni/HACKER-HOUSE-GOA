'use client';

import React, { useRef, useState } from 'react';

interface PhotoUploaderProps {
  label: string;
  onImageUploaded: (file: File, url: string) => void;
  onClear: () => void;
  hasImage: boolean;
}

export default function PhotoUploader({ label, onImageUploaded, onClear, hasImage }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'heic'].includes(fileType || '')) {
      setErrorMsg('Unsupported file type. Please upload a JPG, PNG, or HEIC image.');
      return;
    }
    setIsProcessing(true);
    try {
      let finalFile = file;
      if (fileType === 'heic') {
        const heic2any = (await import('heic2any')).default;
        const conversionResult = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
        finalFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }
      const reader = new FileReader();
      reader.onload = () => {
        const objectUrl = URL.createObjectURL(finalFile);
        onImageUploaded(finalFile, objectUrl);
        setIsProcessing(false);
      };
      reader.onerror = () => { setErrorMsg('Error reading image file.'); setIsProcessing(false); };
      reader.readAsDataURL(finalFile);
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setErrorMsg('Failed to process image (HEIC conversion might be unsupported on this device).');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full space-y-1.5">
      {hasImage ? (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0f1f14] border border-emerald-500/20">
          <div className="flex items-center gap-2">
            {/* Checkmark icon */}
            <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[12px] font-mono text-emerald-400">Photo loaded</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#1a0f0f] hover:bg-[#2a1515] border border-rose-500/20 hover:border-rose-500/40 text-rose-400 transition-colors cursor-pointer"
            aria-label="Remove photo"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-5 px-4 cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400/60 bg-amber-400/5'
              : 'border-[#222] bg-[#0a0a0a] hover:border-[#333] hover:bg-[#0f0f0f]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.heic"
            className="hidden"
            id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            aria-label={`Upload photo for ${label}`}
          />
          {isProcessing ? (
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-t-amber-400 border-[#333] rounded-full animate-spin" />
              <span className="text-[12px] font-mono text-amber-400">Processing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center">
              {/* Upload icon */}
              <svg className="w-6 h-6 text-[#333] mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-[12px] text-[#555]">
                Drop or <span className="text-amber-400 underline underline-offset-2">browse</span>
              </p>
              <p className="text-[10px] text-[#333] font-mono">JPG · PNG · HEIC</p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMsg}
        </div>
      )}
    </div>
  );
}
