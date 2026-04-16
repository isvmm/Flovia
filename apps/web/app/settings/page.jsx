'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [autoPlay, setAutoPlay] = useState(false);
  const [videoNotifications, setVideoNotifications] = useState(true);
  const [familyFriendly, setFamilyFriendly] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('autoPlay');
    const savedNotif = localStorage.getItem('videoNotifications');
    const savedFamily = localStorage.getItem('familyFriendly');
    if (saved !== null) setAutoPlay(JSON.parse(saved));
    if (savedNotif !== null) setVideoNotifications(JSON.parse(savedNotif));
    if (savedFamily !== null) setFamilyFriendly(JSON.parse(savedFamily));
  }, []);

  // Save preferences to localStorage
  const handleAutoPlayChange = () => {
    const newValue = !autoPlay;
    setAutoPlay(newValue);
    localStorage.setItem('autoPlay', JSON.stringify(newValue));
  };

  const handleVideoNotificationsChange = () => {
    const newValue = !videoNotifications;
    setVideoNotifications(newValue);
    localStorage.setItem('videoNotifications', JSON.stringify(newValue));
  };

  const handleFamilyFriendlyChange = () => {
    const newValue = !familyFriendly;
    setFamilyFriendly(newValue);
    localStorage.setItem('familyFriendly', JSON.stringify(newValue));
  };

    return (
      <>
        <div className="bg-black text-white w-full h-screen overflow-hidden relative font-sans pt-[55px] pb-[20px] pb-20">
          {/* Ambient Blur Globs (Cinema Lighting) */}
    <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-blob z-0"></div>
    <div className="absolute bottom-[15%] right-[-15%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-blob z-0" style={{ animationDelay: '2s' }}></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none mix-blend-screen animate-blob z-0" style={{ animationDelay: '4s' }}></div>

    {/* Main Scrollable Content */}
    <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 mb-6">
            <h1 className="text-2xl font-bold drop-shadow-lg">Settings</h1>
            <button className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/15 transition-colors" onClick={() => router.push('/profile')}>
                <i className="ph-bold ph-x text-xl"></i>
            </button>
        </div>

        {/* Account Section */}
        <div className="px-4 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">Account</h2>
            
            {/* Account Settings Card */}
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
                
                {/* Edit Profile */}
                <button onClick={() => router.push('/edit-profile')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-user-circle text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Edit Profile</p>
                            <p className="text-xs text-white/40 mt-0.5">Update your info</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>

                {/* Change Password */}
                <button onClick={() => router.push('/settings/change-password')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-lock text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Password</p>
                            <p className="text-xs text-white/40 mt-0.5">Change your password</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>

                {/* Privacy & Safety */}
                <button onClick={() => router.push('/settings/privacy-safety')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-shield-check text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Privacy & Safety</p>
                            <p className="text-xs text-white/40 mt-0.5">Control your visibility</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>
            </div>
        </div>

        {/* Preferences Section */}
        <div className="px-4 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">Preferences</h2>
            
            {/* Preferences Card */}
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
                
                {/* Dark Mode */}
                <div className="w-full px-4 py-3 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-fuchsia-400">
                            <i className="ph-bold ph-moon text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Dark Mode</p>
                            <p className="text-xs text-white/40 mt-0.5">Always enabled</p>
                        </div>
                    </div>
                    <div className="w-12 h-7 rounded-full bg-cyan-500/30 border border-cyan-500/50 flex items-center justify-end px-1 toggle-switch active">
                        <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"></div>
                    </div>
                </div>

                {/* Auto-Play Videos */}
                <div className="w-full px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={handleAutoPlayChange}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-cyan-400">
                            <i className="ph-bold ph-video text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Auto-Play Videos</p>
                            <p className="text-xs text-white/40 mt-0.5">{autoPlay ? 'Enabled' : 'Off'}</p>
                        </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full border flex items-center transition-all ${autoPlay ? 'bg-cyan-500/30 border-cyan-500/50 justify-end' : 'bg-white/10 border-white/20 justify-start'}`}>
                        <div className={`w-5 h-5 rounded-full ${autoPlay ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'bg-white/30'}`}></div>
                    </div>
                </div>

                {/* Video Notifications */}
                <div className="w-full px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={handleVideoNotificationsChange}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-indigo-400">
                            <i className="ph-bold ph-bell text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Video Notifications</p>
                            <p className="text-xs text-white/40 mt-0.5">{videoNotifications ? 'All enabled' : 'Disabled'}</p>
                        </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full border flex items-center transition-all ${videoNotifications ? 'bg-cyan-500/30 border-cyan-500/50 justify-end' : 'bg-white/10 border-white/20 justify-start'}`}>
                        <div className={`w-5 h-5 rounded-full ${videoNotifications ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'bg-white/30'}`}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Credits Section */}
        <div className="px-4 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">Credits</h2>
            
            {/* Credits Card */}
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
                
                {/* Buy More Credits */}
                <button onClick={() => router.push('/buy-credits')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-lightning text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Buy More Credits</p>
                            <p className="text-xs text-white/40 mt-0.5">Unlock premium features</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>
            </div>
        </div>

        {/* Content Section */}
        <div className="px-4 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">Content</h2>
            
            {/* Content Card */}
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
                
                {/* Blocked Users */}
                <button onClick={() => router.push('/settings/blocked-users')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-prohibit text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Blocked Users</p>
                            <p className="text-xs text-white/40 mt-0.5">Manage blocked accounts</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>

                {/* Content Filters */}
                <button onClick={() => router.push('/settings/content-filters')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-sliders-horizontal text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Content Filters</p>
                            <p className="text-xs text-white/40 mt-0.5">Filter content by tags</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>

                {/* Family Controls */}
                <div className="w-full px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={handleFamilyFriendlyChange}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-green-400">
                            <i className="ph-bold ph-heart text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Family Controls</p>
                            <p className="text-xs text-white/40 mt-0.5">{familyFriendly ? 'Enabled' : 'Off'}</p>
                        </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full border flex items-center transition-all ${familyFriendly ? 'bg-green-500/30 border-green-500/50 justify-end' : 'bg-white/10 border-white/20 justify-start'}`}>
                        <div className={`w-5 h-5 rounded-full ${familyFriendly ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]' : 'bg-white/30'}`}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* About Section */}
        <div className="px-4 mb-6">
            <h2 className="text-xs font-bold uppercase text-white/40 tracking-wider mb-3 ml-1">About</h2>
            
            {/* About Card */}
            <div className="glass-effect rounded-2xl overflow-hidden border border-white/15 divide-y divide-white/10">
                
                {/* Friends List */}
                <button onClick={() => router.push('/settings/friends-list')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-users-three text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">Friends List</p>
                            <p className="text-xs text-white/40 mt-0.5">Manage your friends</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>

                {/* About Flovia */}
                <button onClick={() => router.push('/settings/about')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                            <i className="ph-bold ph-info text-lg"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">About Flovia</p>
                            <p className="text-xs text-white/40 mt-0.5">Version 2.1.0</p>
                        </div>
                    </div>
                    <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                </button>

                {/* Legal */}
                <div className="divide-y divide-white/10">
                    <button onClick={() => router.push('/legal/terms')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <i className="ph-bold ph-note text-lg"></i>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">Terms of Service</p>
                                <p className="text-xs text-white/40 mt-0.5">Read our terms</p>
                            </div>
                        </div>
                        <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                    </button>

                    <button onClick={() => router.push('/legal/privacy')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <i className="ph-bold ph-lock text-lg"></i>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">Privacy Policy</p>
                                <p className="text-xs text-white/40 mt-0.5">Your data protection</p>
                            </div>
                        </div>
                        <i className="ph ph-caret-right text-white/30 group-hover:text-white/60 transition-colors"></i>
                    </button>
                </div>
            </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 pb-32 mb-6">
            <button onClick={async () => {
              await signOut();
              router.push('/login');
            }} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600/20 to-red-600/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:from-red-600/30 hover:to-red-600/20 hover:border-red-500/50 transition-all active:scale-95">
                <i className="ph-bold ph-sign-out text-lg mr-2 inline-block"></i>Log Out
            </button>
        </div>
    </div>

    {/* Bottom Tab Navigation (Floating Style) */}
        </div>
      <BottomNav />
      </>
    );
}
