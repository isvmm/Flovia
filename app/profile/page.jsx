'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';
import { apiUrl } from '@/lib/apiUrl';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch credits
        const creditsResponse = await fetch(apiUrl(`/credits/balance`));
        const creditsData = await creditsResponse.json();
        setCredits(creditsData.lifetime_gift_credits || 10);

        // Fetch user's posts if logged in
        if (user?.id) {
          const postsResponse = await fetch(apiUrl(`/posts?userId=${user.id}`));
          const postsData = await postsResponse.json();
          setUserPosts(postsData.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setCredits(10);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <>
        <div className="bg-black text-white w-full h-screen overflow-hidden relative font-sans pt-[55px] pb-[20px] pb-20 flex items-center justify-center">
          <div className="text-white/60">Loading...</div>
        </div>
        <BottomNav />
      </>
    );
  }

  const profileName = user?.name || 'Guest';
  const profileImage = user?.image || null;
  const isGuest = !user;

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
            <h1 className="text-2xl font-bold drop-shadow-lg">Profile</h1>
            <button className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/15 transition-colors" onClick={() => router.push('/settings')}>
                <i className="ph-bold ph-gear text-xl"></i>
            </button>
        </div>

        {/* Profile Header Card */}
        <div className="px-4 mb-6">
            <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-indigo-600/20 rounded-3xl blur-2xl"></div>
                
                {/* Card Content */}
                <div className="relative glass-effect rounded-3xl p-6 border border-white/15 shadow-[0_8px_32px_rgba(217,70,239,0.15)]">
                    {/* Profile Picture Circle */}
                    <div className="flex justify-center mb-5">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_40px_rgba(217,70,239,0.4)]">
                                {profileImage ? (
                                  <img src={profileImage} className="w-full h-full rounded-full object-cover border-[3px] border-black" alt="Profile" />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gray-600 border-[3px] border-black flex items-center justify-center">
                                    <i className="ph-bold ph-user text-4xl text-gray-400"></i>
                                  </div>
                                )}
                            </div>
                            {!isGuest && <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-cyan-400 border-2 border-black shadow-[0_0_16px_rgba(34,211,238,0.6)]"></div>}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-bold mb-1 drop-shadow-md">{profileName}</h2>
                        {!isGuest && <p className="text-cyan-400 font-semibold text-sm drop-shadow-sm">@{user.email?.split('@')[0]}</p>}
                        {isGuest && <p className="text-white/60 text-xs mt-2">Log in to create your profile</p>}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                        <div className="text-center group cursor-pointer">
                            <p className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">0</p>
                            <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wide">Followers</p>
                        </div>
                        <div className="text-center group cursor-pointer">
                            <p className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">0</p>
                            <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wide">Following</p>
                        </div>
                        <div className="text-center group cursor-pointer">
                            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">0</p>
                            <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wide">Videos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mb-6 flex gap-3">
            {!isGuest && (
              <>
                <button className="flex-1 py-3 rounded-xl glass-effect border border-cyan-500/50 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/20 transition-all group" onClick={() => router.push('/edit-profile')}>
                  <i className="ph ph-pencil text-lg mr-1 inline-block"></i>Edit Profile
                </button>
                <button className="flex-1 py-3 rounded-xl glass-effect border border-white/30 text-white font-semibold text-sm hover:bg-white/15 transition-all">
                  <i className="ph ph-envelope text-lg mr-1 inline-block"></i>Message
                </button>
                <button className="w-12 h-12 rounded-xl glass-effect border border-white/30 flex items-center justify-center text-white hover:bg-white/15 transition-all">
                  <i className="ph-bold ph-share-fat text-lg"></i>
                </button>
              </>
            )}
            {isGuest && (
              <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-all" onClick={() => router.push('/login')}>
                <i className="ph ph-sign-in text-lg mr-1 inline-block"></i>Sign In
              </button>
            )}
        </div>

        {/* Earn Credits Card */}
        {!isGuest && (
          <div className="px-4 mb-6">
            <button onClick={() => router.push('/referrals')} className="w-full glass-effect rounded-2xl border border-amber-500/40 p-4 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all group">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Invite Friends</p>
                  <h3 className="text-sm font-bold text-amber-400">Earn 10 Credits per Referral</h3>
                  <p className="text-white/50 text-xs mt-2">Share your referral code & earn free AI credits</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <i className="ph-bold ph-gift text-lg text-amber-400"></i>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Credit Status Card */}
        {!isGuest && (
          <div className="px-4 mb-6">
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-500 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <div className="glass-effect rounded-2xl p-5 bg-black/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Your Flovia Energy</p>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {loading ? '...' : `${credits}/10`}
                    </h3>
                    <p className="text-white/50 text-[10px] mt-2 leading-relaxed">Your starter credits never expire. Use them whenever inspiration strikes.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <i className="ph-bold ph-lightning text-lg text-cyan-400"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!isGuest && (
          <>
            <div className="px-4 mb-4 flex gap-6 border-b border-white/10 pb-3">
              <button className="text-sm font-semibold text-white pb-3 border-b-2 border-fuchsia-500 hover:opacity-80 transition-opacity">
                <i className="ph-bold ph-square-half text-lg mr-1 inline-block"></i>Videos
              </button>
              <button className="text-sm font-semibold text-white/40 pb-3 border-b-2 border-transparent hover:text-white transition-colors">
                <i className="ph ph-heart text-lg mr-1 inline-block"></i>Liked
              </button>
              <button className="text-sm font-semibold text-white/40 pb-3 border-b-2 border-transparent hover:text-white transition-colors">
                <i className="ph ph-bookmark text-lg mr-1 inline-block"></i>Saved
              </button>
            </div>
          </>
        )}

        {/* Video Grid or Empty State */}
        <div className="px-4 pb-32">
            {isGuest ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <i className="ph-bold ph-sign-in text-3xl text-white/40"></i>
                </div>
                <p className="text-white text-base font-semibold mb-1">Sign in to view profile</p>
                <p className="text-white/60 text-sm">Create an account to start posting videos and building your Flovia presence.</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <i className="ph-bold ph-video-camera text-3xl text-white/40"></i>
                </div>
                <p className="text-white text-base font-semibold mb-1">No posts yet</p>
                <p className="text-white/60 text-sm">Tap the Studio button to post your first video.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => router.push(`/post?id=${post.id}`)}
                    className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer bg-black/40"
                  >
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <img src={post.media_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Post" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      {post.media_type === 'video' && (
                        <i className="ph-fill ph-play text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
    </div>

    {/* Bottom Tab Navigation (Floating Style) */}
        </div>
      <BottomNav />
      </>
    );
}
