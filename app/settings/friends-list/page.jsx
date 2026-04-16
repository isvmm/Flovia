'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useState, useEffect } from 'react';

export default function FriendsListPage() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Sample friends data
    const sampleFriends = [
      { id: 1, username: 'alexsmith', displayName: 'Alex Smith', status: 'online' },
      { id: 2, username: 'emilyjones', displayName: 'Emily Jones', status: 'offline' },
      { id: 3, username: 'chrisdoe', displayName: 'Chris Doe', status: 'online' },
      { id: 4, username: 'sarahwilson', displayName: 'Sarah Wilson', status: 'online' },
      { id: 5, username: 'mikebrown', displayName: 'Mike Brown', status: 'offline' },
    ];
    setFriends(sampleFriends);
  }, []);

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeFriend = (id) => {
    setFriends(friends.filter(f => f.id !== id));
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
            <h1 className="text-2xl font-bold drop-shadow-lg">Friends List</h1>
            <span className="ml-auto text-white/40 text-sm">{friends.length}</span>
          </div>

          {/* Search */}
          <div className="px-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full px-4 py-3 rounded-xl glass-effect border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>

          {/* Friends List */}
          <div className="px-4 pb-32 mb-6 space-y-3">
            {filteredFriends.length === 0 ? (
              <div className="glass-effect rounded-2xl border border-white/15 p-8 text-center">
                <i className="ph-bold ph-users-three text-5xl text-white/20 mb-4 block"></i>
                <p className="text-white font-semibold mb-2">No friends found</p>
                <p className="text-white/40 text-sm">Start adding friends to build your network</p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="glass-effect rounded-xl p-4 flex items-center justify-between border border-white/15 hover:border-white/25 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-white font-semibold relative">
                      {friend.displayName[0].toUpperCase()}
                      {friend.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border border-black"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{friend.displayName}</p>
                      <p className="text-xs text-white/40">@{friend.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 hover:border-red-500/50 transition-all"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
