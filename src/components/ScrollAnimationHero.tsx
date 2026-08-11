'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationHeroProps {
  generatorId: string;
}

export default function ScrollAnimationHero({ generatorId }: ScrollAnimationHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showMusicHint, setShowMusicHint] = useState(true);

  const loadedImagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const totalFrames = 59;

  useEffect(() => {
    loadedImagesRef.current = new Array(totalFrames).fill(null);
  }, []);

  // Reactive scroll tracker
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const fadeEnd = viewportHeight * 0.45;
  const logoOpacity = Math.max(0, 1 - scrollY / fadeEnd);
  const logoY = -scrollY * 0.15;

  // Load first frame immediately
  useEffect(() => {
    const img = new window.Image();
    img.src = '/ezgif-712f2e53e2829cd2-jpg/ezgif-frame-001.jpg';
    img.onload = () => {
      loadedImagesRef.current[0] = img;
      setFirstFrameLoaded(true);
      setLoadProgress(Math.round((1 / totalFrames) * 100));
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) drawCover(canvas, ctx, img);
      }
    };
  }, []);

  // Preload remaining images
  useEffect(() => {
    if (!firstFrameLoaded) return;
    let loadedCount = 1;
    let isMounted = true;

    const loadRemainingImages = async () => {
      const promises = [];
      for (let i = 2; i <= totalFrames; i++) {
        const imgPath = `/ezgif-712f2e53e2829cd2-jpg/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
        const promise = new Promise<void>((resolve) => {
          const img = new window.Image();
          img.src = imgPath;
          img.onload = () => {
            if (isMounted) {
              loadedImagesRef.current[i - 1] = img;
              loadedCount++;
              setLoadProgress(Math.min(100, Math.round((loadedCount / totalFrames) * 100)));
            }
            resolve();
          };
          img.onerror = () => {
            if (isMounted) {
              loadedCount++;
              setLoadProgress(Math.min(100, Math.round((loadedCount / totalFrames) * 100)));
            }
            resolve();
          };
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      if (isMounted) setIsLoaded(true);
    };

    loadRemainingImages();
    return () => { isMounted = false; };
  }, [firstFrameLoaded]);

  const drawCover = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const cw = canvas.width, ch = canvas.height;
    const iw = img.width, ih = img.height;
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale, h = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  const renderCanvas = (imageIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let targetImg = loadedImagesRef.current[imageIndex];
    if (!targetImg) {
      let distance = 1;
      while (distance < totalFrames) {
        const prevIdx = imageIndex - distance;
        const nextIdx = imageIndex + distance;
        if (prevIdx >= 0 && loadedImagesRef.current[prevIdx]) { targetImg = loadedImagesRef.current[prevIdx]; break; }
        if (nextIdx < totalFrames && loadedImagesRef.current[nextIdx]) { targetImg = loadedImagesRef.current[nextIdx]; break; }
        distance++;
      }
    }
    if (targetImg) drawCover(canvas, ctx, targetImg);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderCanvas(currentFrameRef.current);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [firstFrameLoaded]);

  useEffect(() => {
    if (!firstFrameLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const animationObj = { frame: 0 };
    const ctx = gsap.context(() => {
      gsap.to(animationObj, {
        frame: totalFrames - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: () => {
            const frameIndex = Math.round(animationObj.frame);
            currentFrameRef.current = frameIndex;
            renderCanvas(frameIndex);
          },
        },
      });
    });
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);
    return () => { ctx.revert(); window.removeEventListener('load', handleLoad); };
  }, [firstFrameLoaded]);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleScrollToGenerator = () => {
    const target = document.getElementById(generatorId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setShowMusicHint(false);

    if (isMuted) {
      audio.play()
        .then(() => {
          audio.muted = false;
          setIsMuted(false);
        })
        .catch((err) => console.warn('Audio play failed:', err));
    } else {
      audio.muted = true;
      audio.pause();
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Fixed Full-Screen Background Canvas */}
      <div className="fixed inset-0 w-full h-full z-0 bg-black pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full object-cover block" />
      </div>

      {/* Audio element */}
      <audio ref={audioRef} src="/bg-music.mp3" loop muted />

      {/* Hero Content */}
      <div
        ref={heroRef}
        className="relative w-full h-screen flex flex-col items-center justify-center px-4 select-none z-10"
      >
        <div
          ref={contentRef}
          style={{ opacity: logoOpacity, transform: `translateY(${logoY}px)` }}
          className="flex flex-col items-center justify-center text-center pointer-events-none w-full"
        >
          {/* Logo */}
          <div className="relative w-full max-w-[380px] sm:max-w-[520px] md:max-w-[660px] aspect-[1920/523] mb-10 pointer-events-auto filter drop-shadow-[0_12px_32px_rgba(10,24,19,0.85)]">
            <Image
              src="/logo.png"
              alt="Hacker House Goa Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Music Button — centered, prominent, with hint text */}
          <div className="pointer-events-auto mb-8 flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`group relative flex items-center space-x-2.5 px-5 py-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 select-none backdrop-blur-xl
                bg-black/50
                border font-mono font-bold tracking-widest text-xs uppercase
                ${isMuted
                  ? 'border-white/15 text-white/50 hover:border-amber-500/40 hover:text-amber-400/80 shadow-[0_0_10px_rgba(0,0,0,0.3)]'
                  : 'border-amber-500/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.40),0_0_50px_rgba(245,158,11,0.15)] hover:shadow-[0_0_28px_rgba(245,158,11,0.60),0_0_70px_rgba(245,158,11,0.25)]'
                }`}
              aria-label="Toggle background music"
            >
              {/* Music note SVG icon */}
              <svg
                className={`w-5 h-5 transition-all ${isMuted ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
              <span className="text-sm font-bold tracking-widest font-mono uppercase">
                {isMuted ? 'Play Music' : 'Music On'}
              </span>
              {!isMuted && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute right-3 top-3" />
              )}
            </button>
            {showMusicHint && (
              <p className="text-[10px] font-mono text-emerald-400/60 tracking-widest animate-pulse drop-shadow-[0_2px_8px_rgba(10,24,19,0.9)]">
                TAP TO START THE VIBE
              </p>
            )}
          </div>

          {/* Loader or CTA */}
          <div className="flex flex-col items-center justify-center min-h-[70px] w-full pointer-events-auto">
            {!isLoaded ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-56 sm:w-64 h-1.5 bg-[#0a1813]/70 backdrop-blur-md rounded-full overflow-hidden border border-[#d97706]/20 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 rounded-full transition-all duration-100"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(10,24,19,0.9)]">
                  PRELOADING... {loadProgress}%
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleScrollToGenerator}
                className="group relative px-10 py-4 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95
                  bg-black/50 backdrop-blur-xl
                  border border-amber-500/50 hover:border-amber-400/80
                  text-amber-400 hover:text-amber-300
                  font-bold tracking-[0.2em] font-mono text-xs sm:text-sm uppercase
                  shadow-[0_0_18px_rgba(245,158,11,0.25),0_0_40px_rgba(245,158,11,0.10),inset_0_1px_0_rgba(255,255,255,0.06)]
                  hover:shadow-[0_0_28px_rgba(245,158,11,0.55),0_0_60px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]
                "
              >
                {/* Inner ambient glow layer */}
                <span className="absolute inset-0 rounded-full bg-amber-400/[0.04] group-hover:bg-amber-400/[0.08] transition-all duration-300" />
                <span className="relative">CRAFT YOUR IDENTITY</span>
              </button>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        {isLoaded && (
          <div
            style={{ opacity: logoOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 animate-bounce text-emerald-400 drop-shadow-[0_2px_8px_rgba(10,24,19,0.9)] pointer-events-none"
          >
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">SCROLL TO EXPLORE</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
