'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import BottomNav from '@/app/components/BottomNav';

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [promptText, setPromptText] = useState('');
  const [styleIntensity, setStyleIntensity] = useState(50);

  // Load prompt from URL parameter or localStorage (remix) on mount
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt) {
      setPromptText(decodeURIComponent(urlPrompt));
    } else if (searchParams.get('remix') === 'true') {
      // Load from remix
      const remixPrompt = localStorage.getItem('remixPrompt');
      if (remixPrompt) {
        setPromptText(remixPrompt);
        localStorage.removeItem('remixPrompt'); // Clear after use
      }
    }
  }, [searchParams]);

  return (
    <>
      <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
        {/* Ambient Blur Globs */}
        <div className="absolute top-[10%] left-[-20%] w-80 h-80 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDelay: '2s' }}></div>

        <main className="relative z-10 w-full h-full px-6 overflow-y-auto pb-40 no-scrollbar">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Studio</h1>
              <p className="text-white/60 text-sm mt-1">Generate your next masterpiece</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
              <i className="ph-bold ph-gear-six text-lg"></i>
            </button>
          </header>

          {/* AI Image Generation Card */}
          <section className="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl">
            <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
              <i className="ph-fill ph-arrow-up-right text-fuchsia-400"></i>
            </div>
            <h2 className="text-sm font-semibold mb-4 text-white/80 flex items-center gap-2">
              <i className="ph-fill ph-image text-fuchsia-400"></i> AI Visuals
            </h2>
            <div className="relative w-full h-32 mb-4 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
              <p className="text-white/30 text-xs text-center p-4 italic">No image generated yet. Describe your vision to begin...</p>
            </div>
            <div className="space-y-4">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm h-20 placeholder:text-white/20 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
                placeholder="Enter a prompt for your creation..."
              ></textarea>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-white/60">Style Intensity</span>
                <input
                  type="range"
                  value={styleIntensity}
                  onChange={(e) => setStyleIntensity(e.target.value)}
                  className="w-2/3 accent-fuchsia-500 h-1 bg-white/20 rounded-full appearance-none"
                />
              </div>
            </div>
          </section>

          {/* Music Composition Card */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl" onClick={() => router.push('/text-to-content')} style={{ cursor: 'pointer' }}>
            <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
              <i className="ph-fill ph-arrow-up-right text-indigo-400"></i>
            </div>
            <h2 className="text-sm font-semibold mb-6 text-white/80 flex items-center gap-2">
              <i className="ph-fill ph-music-notes text-indigo-400"></i> AI Soundscape
            </h2>
            <div className="space-y-6">
              {/* Tempo Slider */}
              <div>
                <div className="flex justify-between text-xs mb-2 px-1">
                  <span className="text-white/60">Tempo (BPM)</span>
                  <span className="font-bold">128</span>
                </div>
                <input type="range" className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-full appearance-none" />
              </div>
              {/* Mood Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium hover:border-indigo-500/50 transition-colors">Chill/Lofi</button>
                <button className="py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium hover:border-indigo-500/50 transition-colors">Upbeat</button>
                <button className="py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium hover:border-indigo-500/50 transition-colors">Cinematic</button>
                <button className="py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium hover:border-indigo-500/50 transition-colors">Abstract</button>
              </div>
            </div>
          </section>

          {/* Primary Action Buttons */}
          <div className="space-y-3 mt-8">
            <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-lg shadow-[0_10px_20px_-5px_rgba(99,102,241,0.3)] hover:scale-[0.98] transition-transform" onClick={() => router.push('/upload')}>
              <i className="ph-fill ph-cloud-arrow-up mr-2"></i>
              Upload Media
            </button>
            <button className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-2xl font-bold text-lg shadow-[0_10px_20px_-5px_rgba(217,70,239,0.3)] hover:scale-[0.98] transition-transform" onClick={() => router.push('/text-to-content')}>
              <i className="ph-fill ph-sparkles mr-2"></i>
              Generate from Text
            </button>
          </div>
        </main>

        {/* Bottom Tab Navigation (Consistent) */}
      </div>
      <BottomNav />
    </>
  );
}

export default function CreativeStudioPage() {
  return (
    <Suspense>
      <StudioContent />
    </Suspense>
  );
}
