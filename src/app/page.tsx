import Generator from '../components/Generator';
import ScrollAnimationHero from '../components/ScrollAnimationHero';
import Footer from '../components/Footer';
import ApplyButton from '../components/ApplyButton';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* TOP RIGHT APPLY BUTTON */}
      <ApplyButton />

      {/* FULL-SCREEN SCROLL HERO */}
      <ScrollAnimationHero generatorId="generator-section" />

      {/* FRAME GENERATOR */}
      <main
        id="generator-section"
        className="flex-1 w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-20"
      >
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-tight text-amber-500 font-fraunces">
            Hackers New Identity
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400/80 max-w-lg mx-auto font-sans leading-relaxed">
            Craft your builder identity for Hacker House Goa 2026. Configured instantly, processed entirely on your device.
          </p>
        </div>
        <Generator />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
