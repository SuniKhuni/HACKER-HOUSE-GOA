'use client';

import React, { useRef, useState } from 'react';

interface PhotoUploaderProps {
  label: string;
  onImageUploaded: (file: File, url: string) => void;
  onClear: () => void;
  hasImage: boolean;
}

export default function PhotoUploader({
  label,
  onImageUploaded,
  onClear,
  hasImage,
}: PhotoUploaderProps) {
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

      // Handle HEIC conversion client-side
      if (fileType === 'heic') {
        const heic2any = (await import('heic2any')).default;
        const conversionResult = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });
        
        const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
        finalFile = new File(
          [blob],
          file.name.replace(/\.heic$/i, '.jpg'),
          { type: 'image/jpeg' }
        );
      }

      // Read image and create Object URL for rendering
      const reader = new FileReader();
      reader.onload = () => {
        const objectUrl = URL.createObjectURL(finalFile);
        onImageUploaded(finalFile, objectUrl);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setErrorMsg('Error reading image file.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(finalFile);

    } catch (err: any) {
      console.error('Image processing failed:', err);
      setErrorMsg('Failed to process image (HEIC conversion might be unsupported on this device).');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-emerald-400 mb-1.5 font-sans">
        {label}
      </label>

      {hasImage ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="text-xl">📸</span>
            <span className="text-sm font-mono truncate font-medium">Photo Loaded Successfully</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-colors"
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
          onClick={triggerFilePicker}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/5'
              : 'border-emerald-800/40 bg-emerald-950/10 hover:border-emerald-500/30 hover:bg-emerald-950/20'
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
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-2 border-t-amber-400 border-emerald-950 rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-amber-400">Processing Image...</span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-2xl mb-2 block">🌴</span>
              <p className="text-sm font-medium text-emerald-200">
                Drag & drop or <span className="text-amber-400 underline">browse</span>
              </p>
              <p className="text-xs text-emerald-500/70 mt-1 font-mono">
                Supports JPG, PNG, HEIC
              </p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mt-2 text-xs font-mono text-rose-400 flex items-start space-x-1">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
