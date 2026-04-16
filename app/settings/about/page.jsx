'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';

export default function AboutPage() {
  const router = useRouter();

  return (
    <>
      <div className="bg-black text-white w-full h-screen overflow-hidden relative font-sans pt-[55px] pb-20">
        {/* Ambient Blur Globs */}
        <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-blob z-0"></div>
        <div className="absolute bottom-[15%] right-[-15%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-blob z-0" style={{ animationDelay: '2s' }}></div>

        {/* Main Content */}
        <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/15 transition-colors">
              <i className="ph-bold ph-caret-left text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold drop-shadow-lg">About Flovia</h1>
          </div>

          {/* App Info */}
          <div className="px-4 space-y-6 pb-32">
            {/* Logo Section */}
            <div className="glass-effect rounded-2xl border border-white/15 p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <i className="ph-bold ph-sparkle text-4xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Flovia</h2>
              <p className="text-white/60 text-sm">AI-Powered Creative Platform</p>
            </div>

            {/* Version Info */}
            <div className="glass-effect rounded-2xl border border-white/15 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Version</span>
                <span className="text-white font-semibold">2.1.0</span>
              </div>
              <div className="border-t border-white/10"></div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Build</span>
                <span className="text-white font-semibold">2024.001</span>
              </div>
              <div className="border-t border-white/10"></div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Released</span>
                <span className="text-white font-semibold">Dec 2024</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-white/40 tracking-wider">Features</h3>
              <div className="glass-effect rounded-2xl border border-white/15 divide-y divide-white/10 overflow-hidden">
                <div className="px-4 py-3 flex items-start gap-3">
                  <i className="ph-bold ph-images text-cyan-400 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-white font-semibold text-sm">AI Image Generation</p>
                    <p className="text-white/40 text-xs mt-1">Create stunning images with Gemini AI</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <i className="ph-bold ph-music-notes text-fuchsia-400 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-white font-semibold text-sm">Music Generation</p>
                    <p className="text-white/40 text-xs mt-1">Generate original music tracks</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <i className="ph-bold ph-video text-green-400 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-white font-semibold text-sm">Video Creation</p>
                    <p className="text-white/40 text-xs mt-1">Create cinematic video content</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-start gap-3">
                  <i className="ph-bold ph-pencil text-indigo-400 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-white font-semibold text-sm">AI Editing</p>
                    <p className="text-white/40 text-xs mt-1">Smart image analysis and editing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-white/40 tracking-wider">Support</h3>
              <div className="glass-effect rounded-2xl border border-white/15 divide-y divide-white/10 overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <i className="ph-bold ph-globe text-cyan-400 text-lg"></i>
                    <span className="text-white font-semibold text-sm">Visit Website</span>
                  </div>
                  <i className="ph ph-arrow-up-right text-white/30"></i>
                </button>
                <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <i className="ph-bold ph-envelope text-indigo-400 text-lg"></i>
                    <span className="text-white font-semibold text-sm">Contact Support</span>
                  </div>
                  <i className="ph ph-arrow-up-right text-white/30"></i>
                </button>
              </div>
            </div>

            {/* Credits */}
            <div className="glass-effect rounded-2xl border border-white/15 p-6 text-center">
              <p className="text-white/60 text-xs mb-2">
                Built with <span className="text-red-400">♡</span> using cutting-edge AI technology
              </p>
              <p className="text-white/40 text-xs">© 2024 Flovia. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
