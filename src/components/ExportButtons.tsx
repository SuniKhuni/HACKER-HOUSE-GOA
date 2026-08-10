'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface ExportButtonsProps {
  stageRef: React.RefObject<any>;
  templateScale: number; // width / templateWidth
  templateType: 'solo' | 'team';
  teamName: string;
  hasPhotos: boolean;
  hasNames: boolean;
}

export default function ExportButtons({
  stageRef,
  templateScale,
  templateType,
  teamName,
  hasPhotos,
  hasNames,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const getExportCaption = () => {
    if (templateType === 'team') {
      const teamText = teamName ? `Team ${teamName}` : 'Our team';
      return `Proudly presenting the ${teamText} ID card from Hacker House Goa 2026! 🌴💻 Let's build! #FrameInGoa`;
    }
    return `Just built my Builder ID for Hacker House Goa 2026! 🌴💻 Ready to hack under the palms. #FrameInGoa`;
  };

  const generateFile = (): { file: File; blob: Blob; downloadBlob: Blob; dataUrl: string } | null => {
    const stage = stageRef.current;
    if (!stage) return null;

    try {
      // Export at 1:1 original template size by dividing by the current preview scale
      const dataUrl = stage.toDataURL({
        pixelRatio: 1 / templateScale,
        mimeType: 'image/png',
      });

      // Convert to file for Web Share API
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const fileName = templateType === 'team'
        ? `${teamName.replace(/\s+/g, '_') || 'team'}_hh_goa_2026.png`
        : 'builder_id_hh_goa_2026.png';

      const blob = new Blob([u8arr], { type: mime });
      const downloadBlob = new Blob([u8arr], { type: 'application/octet-stream' });
      const file = new File([blob], fileName, { type: mime });
      return { file, blob, downloadBlob, dataUrl };
    } catch (err) {
      console.error('Error generating canvas file:', err);
      return null;
    }
  };

  const handleDownload = () => {
    setShareError(null);
    if (!hasNames) {
      setShareError('Please enter name(s) before downloading.');
      return;
    }
    if (!hasPhotos) {
      setShareError('Please upload photo(s) before downloading.');
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      const generated = generateFile();
      if (!generated) {
        setShareError('Export failed. Please check if browser graphics are enabled.');
        setIsExporting(false);
        return;
      }

      // Trigger standard browser download anchor using an octet-stream Blob URL to force download
      const blobUrl = URL.createObjectURL(generated.downloadBlob);
      const link = document.createElement('a');
      link.download = generated.file.name;
      link.setAttribute('download', generated.file.name);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Delay revocation to allow the browser's download thread to safely resolve the file stream
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);

      setIsExporting(false);

      // Playful confetti burst!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#059669', '#f43f5e', '#ffffff'],
      });
    }, 100);
  };

  const handleShare = async () => {
    setShareError(null);
    if (!hasNames) {
      setShareError('Please enter name(s) before sharing.');
      return;
    }
    if (!hasPhotos) {
      setShareError('Please upload photo(s) before sharing.');
      return;
    }

    const caption = getExportCaption();
    const generated = generateFile();

    if (!generated) {
      setShareError('Failed to generate image file for sharing.');
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Try Web Share API first (ONLY on mobile devices that support file sharing)
    if (
      isMobile &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [generated.file] })
    ) {
      try {
        await navigator.share({
          files: [generated.file],
          title: 'Hacker House Goa 2026 ID Card',
          text: caption,
        });
        return; // Success!
      } catch (err: any) {
        // If user cancelled, don't show error. Otherwise fall back to X Intent.
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed, falling back to X intent:', err);
        } else {
          return;
        }
      }
    }

    // Fallback: Twitter intent (standard X Sharing)
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 disabled:from-emerald-950/20 disabled:to-emerald-950/20 disabled:text-emerald-500 disabled:border-emerald-950/50 disabled:cursor-not-allowed text-emerald-950 font-bold border border-amber-300 text-center transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-amber-500/10 focus:outline-none"
          aria-label="Download generated image as PNG"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-t-emerald-950 border-amber-300 rounded-full animate-spin"></div>
              <span>Exporting PNG...</span>
            </>
          ) : (
            <>
              <span className="text-lg">📥</span>
              <span>DOWNLOAD PNG</span>
            </>
          )}
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/30 text-white font-bold text-center transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-emerald-500/10 focus:outline-none"
          aria-label="Share generator card to X (Twitter)"
        >
          <span className="text-lg">𝕏</span>
          <span>SHARE TO X</span>
        </button>
      </div>

      {shareError && (
        <div className="text-xs font-mono text-rose-400 text-center select-none">
          ⚠️ {shareError}
        </div>
      )}
    </div>
  );
}
