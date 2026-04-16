'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useState, useEffect } from 'react';

export default function BlockedUsersPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('blockedUsers');
    if (saved) setBlockedUsers(JSON.parse(saved));
  }, []);

  const unblockUser = (username) => {
    const updated = blockedUsers.filter(user => user !== username);
    setBlockedUsers(updated);
    localStorage.setItem('blockedUsers', JSON.stringify(updated));
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
            <h1 className="text-2xl font-bold drop-shadow-lg">Blocked Users</h1>
          </div>

          {/* Blocked Users List */}
          <div className="px-4 pb-32 mb-6">
            {blockedUsers.length === 0 ? (
              <div className="glass-effect rounded-2xl border border-white/15 p-8 text-center">
                <i className="ph-bold ph-check-circle text-5xl text-green-400 mb-4 block"></i>
                <p className="text-white font-semibold mb-2">No blocked users</p>
                <p className="text-white/40 text-sm">You haven't blocked anyone yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <div key={user} className="glass-effect rounded-xl p-4 flex items-center justify-between border border-white/15 hover:border-white/25 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {user[0].toUpperCase()}
                      </div>
                      <p className="text-white font-semibold">@{user}</p>
                    </div>
                    <button
                      onClick={() => unblockUser(user)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 hover:border-red-500/50 transition-all"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
