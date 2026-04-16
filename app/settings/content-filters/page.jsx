'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useState, useEffect } from 'react';

export default function ContentFiltersPage() {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState([]);

  const availableFilters = [
    { id: 'music', label: 'Music', icon: 'ph-music-note' },
    { id: 'art', label: 'Digital Art', icon: 'ph-palette' },
    { id: 'video', label: 'Videos', icon: 'ph-video' },
    { id: 'photography', label: 'Photography', icon: 'ph-camera' },
    { id: 'animation', label: 'Animation', icon: 'ph-film-strip' },
    { id: 'design', label: 'Graphic Design', icon: 'ph-square-half' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('contentFilters');
    if (saved) setSelectedFilters(JSON.parse(saved));
  }, []);

  const toggleFilter = (id) => {
    const updated = selectedFilters.includes(id)
      ? selectedFilters.filter(f => f !== id)
      : [...selectedFilters, id];
    setSelectedFilters(updated);
    localStorage.setItem('contentFilters', JSON.stringify(updated));
  };

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
            <h1 className="text-2xl font-bold drop-shadow-lg">Content Filters</h1>
          </div>

          {/* Description */}
          <div className="px-4 mb-6">
            <p className="text-white/60 text-sm">Select content types to see them in your feed</p>
          </div>

          {/* Filter Grid */}
          <div className="px-4 pb-32 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {availableFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedFilters.includes(filter.id)
                      ? 'glass-effect border-cyan-500/50 bg-cyan-500/20'
                      : 'glass-effect border-white/15 bg-white/5 hover:border-white/25'
                  }`}
                >
                  <i className={`ph-bold ${filter.icon} text-2xl block mb-2 ${selectedFilters.includes(filter.id) ? 'text-cyan-400' : 'text-white/60'}`}></i>
                  <p className={`text-xs font-semibold ${selectedFilters.includes(filter.id) ? 'text-cyan-400' : 'text-white'}`}>
                    {filter.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
