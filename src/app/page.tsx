import Image from 'next/image';
import Generator from '../components/Generator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER SECTION */}
      <header className="w-full pt-8 pb-4 px-4 flex flex-col items-center text-center space-y-4">
        <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] aspect-[1920/523] select-none pointer-events-none hover:scale-105 transition-transform duration-300">
          <Image
            src="/logo.png"
            alt="Hacker House Goa 2026 Logo"
            fill
            className="object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]"
            priority
          />
        </div>
        
        <div className="max-w-2xl space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 bg-clip-text text-transparent font-space">
            Frame / Builder ID Generator
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400/80 max-w-lg mx-auto font-sans leading-relaxed">
            Upload your photo, configure your stack, and customize transforms in real time. 
            No signups, no databases, processed 100% locally.
          </p>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Generator />
      </main>

      {/* FOOTER SECTION */}
      <footer className="w-full py-8 px-4 mt-12 border-t border-emerald-950/40 text-center space-y-2 select-none bg-black/25">
        <p className="text-[11px] font-mono text-emerald-500/70">
          Built for the Goan Hacker Summer • Powered by React & HTML5 Canvas
        </p>
        <p className="text-[10px] font-mono text-amber-500/50">
          HH GOA 2026 — Frame / Builder ID Generator • All images remain on your device
        </p>
      </footer>
    </div>
  );
}
