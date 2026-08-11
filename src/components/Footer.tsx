'use client';

export default function Footer() {
  return (
    <footer className="relative z-20 w-full mt-8">
      {/* Top separator line with amber glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="w-full bg-black/60 backdrop-blur-2xl border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Left — branding */}
          <p className="text-[11px] font-mono text-white/40 tracking-widest uppercase select-none">
            HH GOA 2026 &mdash; Builder ID Generator &bull; All images stay on your device
          </p>

          {/* Right — designed by */}
          <a
            href="https://www.linkedin.com/in/swarnavachakraborty/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 cursor-pointer select-none"
            aria-label="Swarnava Chakraborty's LinkedIn profile"
          >
            <span className="text-[11px] font-mono text-white/50 tracking-wide group-hover:text-white/70 transition-colors duration-200">
              Designed by
            </span>

            <span className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-black/50 backdrop-blur-xl
              border border-amber-500/30 group-hover:border-amber-400/60
              text-amber-400 group-hover:text-amber-300
              text-[12px] font-bold font-mono tracking-wide
              shadow-[0_0_10px_rgba(245,158,11,0.12)]
              group-hover:shadow-[0_0_20px_rgba(245,158,11,0.35),0_0_40px_rgba(245,158,11,0.12)]
              transition-all duration-300
            ">
              {/* LinkedIn icon */}
              <svg
                className="w-3.5 h-3.5 shrink-0 text-amber-400 group-hover:text-amber-300 transition-colors"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Swarnava Chakraborty
            </span>
          </a>

        </div>
      </div>
    </footer>
  );
}
