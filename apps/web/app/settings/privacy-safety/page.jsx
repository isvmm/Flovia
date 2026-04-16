'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useState, useEffect } from 'react';

export default function PrivacySafetyPage() {
  const router = useRouter();
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('profilePrivate');
    const savedMsg = localStorage.getItem('allowMessages');
    const savedActivity = localStorage.getItem('showActivity');
    if (saved !== null) setProfilePrivate(JSON.parse(saved));
    if (savedMsg !== null) setAllowMessages(JSON.parse(savedMsg));
    if (savedActivity !== null) setShowActivity(JSON.parse(savedActivity));
  }, []);

  const togglePrivate = () => {
    const newValue = !profilePrivate;
    setProfilePrivate(newValue);
    localStorage.setItem('profilePrivate', JSON.stringify(newValue));
  };

  const toggleMessages = () => {
    const newValue = !allowMessages;
    setAllowMessages(newValue);
    localStorage.setItem('allowMessages', JSON.stringify(newValue));
  };

  const toggleActivity = () => {
    const newValue = !showActivity;
    setShowActivity(newValue);
    localStorage.setItem('showActivity', JSON.stringify(newValue));
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
            <h1 className="text-2xl font-bold drop-shadow-lg">Privacy & Safety</h1>
          </div>

          {/* Privacy Settings */}
          <div className="px-4 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">Account Visibility</h2>
            
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
              {/* Private Profile */}
              <div className="w-full px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={togglePrivate}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-indigo-400">
                    <i className="ph-bold ph-lock text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Private Profile</p>
                    <p className="text-xs text-white/40 mt-0.5">Only approved followers can see posts</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full border flex items-center transition-all ${profilePrivate ? 'bg-indigo-500/30 border-indigo-500/50 justify-end' : 'bg-white/10 border-white/20 justify-start'}`}>
                  <div className={`w-5 h-5 rounded-full ${profilePrivate ? 'bg-indigo-400 shadow-[0_0_12px_rgba(102,51,153,0.6)]' : 'bg-white/30'}`}></div>
                </div>
              </div>

              {/* Allow Direct Messages */}
              <div className="w-full px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={toggleMessages}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-cyan-400">
                    <i className="ph-bold ph-chat-dots text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Allow Direct Messages</p>
                    <p className="text-xs text-white/40 mt-0.5">Let anyone message you</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full border flex items-center transition-all ${allowMessages ? 'bg-cyan-500/30 border-cyan-500/50 justify-end' : 'bg-white/10 border-white/20 justify-start'}`}>
                  <div className={`w-5 h-5 rounded-full ${allowMessages ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'bg-white/30'}`}></div>
                </div>
              </div>

              {/* Show Activity Status */}
              <div className="w-full px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={toggleActivity}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-green-400">
                    <i className="ph-bold ph-pulse text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Activity Status</p>
                    <p className="text-xs text-white/40 mt-0.5">Show when you're active</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full border flex items-center transition-all ${showActivity ? 'bg-green-500/30 border-green-500/50 justify-end' : 'bg-white/10 border-white/20 justify-start'}`}>
                  <div className={`w-5 h-5 rounded-full ${showActivity ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]' : 'bg-white/30'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Settings */}
          <div className="px-4 pb-32 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">Safety</h2>
            
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <i className="ph-bold ph-warning text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Report a Problem</p>
                    <p className="text-xs text-white/40 mt-0.5">Report abuse or inappropriate content</p>
                  </div>
                </div>
                <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
              </button>

              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <i className="ph-bold ph-trash text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Delete Account</p>
                    <p className="text-xs text-white/40 mt-0.5">Permanently delete your account</p>
                  </div>
                </div>
                <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
