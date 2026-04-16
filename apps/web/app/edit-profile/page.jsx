'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BottomNav from '@/app/components/BottomNav';

const selectDropdownSvg = "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e\")";

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('filmmaker');

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
            <button onClick={() => router.push('/profile')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <i className="ph-bold ph-arrow-left text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold drop-shadow-lg">Edit Profile</h1>
            <div className="w-6"></div>
        </div>

        {/* Profile Picture Edit Card */}
        <div className="px-4 mb-6">
            <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-indigo-600/20 rounded-3xl blur-2xl"></div>
                
                {/* Card Content */}
                <div className="relative glass-effect rounded-3xl p-6 border border-white/15 shadow-[0_8px_32px_rgba(217,70,239,0.15)] flex flex-col items-center">
                    {/* Profile Picture with Edit Overlay */}
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_40px_rgba(217,70,239,0.4)]">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" className="w-full h-full rounded-full object-cover border-[3px] border-black" alt="Profile" />
                        </div>
                        {/* Edit Overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/40 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <i className="ph-bold ph-camera text-white text-2xl drop-shadow-md"></i>
                        </div>
                    </div>

                    <p className="text-xs text-white/50 text-center">Tap to change profile picture</p>
                </div>
            </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 space-y-4 pb-32">
            
            {/* Full Name */}
            <div>
                <label className="text-sm font-semibold text-white/80 mb-2 block">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field w-full" placeholder="Enter your name" />
            </div>

            {/* Username */}
            <div>
                <label className="text-sm font-semibold text-white/80 mb-2 block">Username</label>
                <div className="flex items-center">
                    <span className="text-white/50 mr-2">@</span>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field w-full flex-1" placeholder="Enter username" />
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="text-sm font-semibold text-white/80 mb-2 block">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field w-full h-24 resize-none" placeholder="Tell us about yourself"></textarea>
            </div>

            {/* Location */}
            <div>
                <label className="text-sm font-semibold text-white/80 mb-2 block">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field w-full" placeholder="Enter your location" />
            </div>

            {/* Website */}
            <div>
                <label className="text-sm font-semibold text-white/80 mb-2 block">Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field w-full" placeholder="https://example.com" />
            </div>

            {/* Category */}
            <div>
                <label className="text-sm font-semibold text-white/80 mb-2 block">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="input-field w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white appearance-none cursor-pointer pr-10"
                  style={{ 
                    backgroundImage: selectDropdownSvg,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                    <option value="filmmaker" style={{ backgroundColor: '#000', color: 'white' }}>Filmmaker</option>
                    <option value="artist" style={{ backgroundColor: '#000', color: 'white' }}>Visual Artist</option>
                    <option value="musician" style={{ backgroundColor: '#000', color: 'white' }}>Musician</option>
                    <option value="developer" style={{ backgroundColor: '#000', color: 'white' }}>Developer</option>
                    <option value="other" style={{ backgroundColor: '#000', color: 'white' }}>Other</option>
                </select>
            </div>

            {/* Privacy Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Account Privacy</h3>
                
                {/* Private Account Toggle */}
                <div className="glass-effect rounded-2xl p-4 border border-white/15 flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <i className="ph-bold ph-lock text-cyan-400 text-xl"></i>
                        <div>
                            <p className="font-semibold text-sm text-white">Private Account</p>
                            <p className="text-xs text-white/40">Only approved followers can see your content</p>
                        </div>
                    </div>
                    <div className="w-12 h-6 bg-white/20 rounded-full border border-white/30 relative cursor-pointer transition-all hover:bg-white/30">
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform"></div>
                    </div>
                </div>

                {/* Allow Messages Toggle */}
                <div className="glass-effect rounded-2xl p-4 border border-white/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <i className="ph-bold ph-envelope text-fuchsia-400 text-xl"></i>
                        <div>
                            <p className="font-semibold text-sm text-white">Allow Messages</p>
                            <p className="text-xs text-white/40">Accept direct messages from anyone</p>
                        </div>
                    </div>
                    <div className="w-12 h-6 bg-cyan-500/40 rounded-full border border-cyan-500/50 relative cursor-pointer transition-all hover:bg-cyan-500/60">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-white/10">
                <button onClick={() => router.push('/profile')} className="flex-1 py-3 rounded-xl glass-effect border border-white/30 text-white font-semibold text-sm hover:bg-white/15 transition-all active:scale-95">
                    Cancel
                </button>
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all active:scale-95">
                    Save Changes
                </button>
            </div>
        </div>
    </div>

    {/* Bottom Tab Navigation (Floating Style) */}
        </div>
      <BottomNav />
      </>
    );
}
