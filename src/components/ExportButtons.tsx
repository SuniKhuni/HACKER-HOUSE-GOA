'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface ExportButtonsProps {
  stageRef: React.RefObject<any>;
  templateScale: number;
  templateType: 'solo' | 'team';
  teamName: string;
  hasPhotos: boolean;
  hasNames: boolean;
}

// Hacker House Goa X handle — update if official handle changes
const HH_GOA_X = '@HackerHouseGoa';
const CREATOR_X   = '@Suni_creates';

export default function ExportButtons({
  stageRef,
  templateScale,
  templateType,
  teamName,
  hasPhotos,
  hasNames,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const getExportCaption = () => {
    const credit = `\n\nDesigned by ${CREATOR_X} for ${HH_GOA_X} #HackerHouseGoa #FrameInGoa`;
    if (templateType === 'team') {
      const teamText = teamName ? `Team ${teamName}` : 'Our team';
      return `Proudly presenting the ${teamText} ID card from Hacker House Goa 2026! Let's build!${credit}`;
    }
    return `Just built my Builder ID for Hacker House Goa 2026! Ready to hack.${credit}`;
  };

  const generateFile = (): { file: File; blob: Blob; downloadBlob: Blob; dataUrl: string } | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    try {
      // Stage always renders at full template resolution (preview uses CSS scale).
      // pixelRatio:1 gives an exact template.width × template.height output.
      const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
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

  const triggerDownload = (generated: { file: File; downloadBlob: Blob }) => {
    const blobUrl = URL.createObjectURL(generated.downloadBlob);
    const link = document.createElement('a');
    link.download = generated.file.name;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const handleDownload = () => {
    setShareMessage(null);
    setShareState('idle');
    if (!hasNames) { setShareMessage('Please enter name(s) before downloading.'); setShareState('error'); return; }
    if (!hasPhotos) { setShareMessage('Please upload photo(s) before downloading.'); setShareState('error'); return; }
    setIsExporting(true);
    setTimeout(() => {
      const generated = generateFile();
      if (!generated) {
        setShareMessage('Export failed. Please check if browser graphics are enabled.');
        setShareState('error');
        setIsExporting(false);
        return;
      }
      triggerDownload(generated);
      setIsExporting(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#059669', '#f43f5e', '#ffffff'] });
    }, 100);
  };

  const handleShare = async () => {
    setShareMessage(null);
    setShareState('idle');
    if (!hasNames) { setShareMessage('Please enter name(s) before sharing.'); setShareState('error'); return; }
    if (!hasPhotos) { setShareMessage('Please upload photo(s) before sharing.'); setShareState('error'); return; }

    const caption = getExportCaption();
    const generated = generateFile();
    if (!generated) { setShareMessage('Failed to generate image for sharing.'); setShareState('error'); return; }

    // ── Mobile: Web Share API (can attach file + text natively) ──────────────
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [generated.file] })) {
      try {
        await navigator.share({ files: [generated.file], title: 'Hacker House Goa 2026 ID Card', text: caption });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // user cancelled — silent exit
        console.warn('Web Share failed, falling back to desktop flow:', err);
      }
    }

    // ── Desktop: auto-download + copy image to clipboard + open X intent ─────
    // Step 1: Auto-download the image so user has it locally.
    triggerDownload(generated);

    // Step 2: Copy image PNG to clipboard (modern Clipboard API).
    let clipboardOk = false;
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const pngBlob = generated.blob;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob }),
        ]);
        clipboardOk = true;
      }
    } catch (clipErr) {
      console.warn('Clipboard image write not supported:', clipErr);
    }

    // Step 3: Open X/Twitter intent with pre-filled caption.
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');

    // Step 4: Show instruction banner.
    if (clipboardOk) {
      setShareState('copied');
      setShareMessage('Image copied to clipboard — paste it (Ctrl+V / Cmd+V) into the X post!');
    } else {
      setShareState('copied');
      setShareMessage('Image downloaded — attach it manually in the X post that just opened.');
    }

    // Auto-clear the message after 8 seconds.
    setTimeout(() => { setShareState('idle'); setShareMessage(null); }, 8000);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Download Button — dark glass amber glow */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className={`group relative flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 cursor-pointer focus:outline-none
            ${isExporting
              ? 'bg-black/30 border border-white/[0.06] text-[#444] cursor-not-allowed'
              : `bg-black/50 backdrop-blur-xl
                 border border-amber-500/50 hover:border-amber-400/80
                 text-amber-400 hover:text-amber-300
                 shadow-[0_0_14px_rgba(245,158,11,0.20),inset_0_1px_0_rgba(255,255,255,0.05)]
                 hover:shadow-[0_0_24px_rgba(245,158,11,0.45),0_0_50px_rgba(245,158,11,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]
                 hover:scale-[1.02] active:scale-[0.98]`
            }`}
          aria-label="Download generated image as PNG"
        >
          {!isExporting && <span className="absolute inset-0 rounded-xl bg-amber-400/[0.03] group-hover:bg-amber-400/[0.07] transition-all duration-300" />}
          <span className="relative flex items-center gap-2">
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#333] border-t-amber-500 rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15V3m0 12l-4-4m4 4l4-4" />
                  <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
                </svg>
                Download PNG
              </>
            )}
          </span>
        </button>

        {/* Share to X — dark glass indigo glow */}
        <button
          type="button"
          onClick={handleShare}
          className="group relative flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 cursor-pointer focus:outline-none
            bg-black/50 backdrop-blur-xl
            border border-indigo-500/40 hover:border-indigo-400/70
            text-indigo-300 hover:text-indigo-200
            shadow-[0_0_14px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]
            hover:shadow-[0_0_24px_rgba(99,102,241,0.40),0_0_50px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]
            hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Share generator card to X (Twitter)"
        >
          <span className="absolute inset-0 rounded-xl bg-indigo-500/[0.03] group-hover:bg-indigo-500/[0.07] transition-all duration-300" />
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L2.25 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post to X
          </span>
        </button>
      </div>

      {/* Status / instruction banner */}
      {shareMessage && (
        <div className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-[12px] font-mono leading-relaxed transition-all
          ${shareState === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-200'
          }`}
        >
          {shareState === 'error' ? (
            <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {shareMessage}
        </div>
      )}
    </div>
  );
}
