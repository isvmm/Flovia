'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';
import { apiUrl } from '@/lib/apiUrl';

// Custom Remix Sparkle Icon Component
function RemixSparkleIcon({ isGlowing }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${isGlowing ? 'scale-125' : 'scale-100'}`}
      style={{
        opacity: 0.7,
        filter: isGlowing 
          ? 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))' 
          : 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.3))',
      }}
    >
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
      <circle cx="12" cy="4" r="1.5" fill="#FFFFFF" />
      <circle cx="17" cy="7" r="1.5" fill="#FFFFFF" />
      <circle cx="20" cy="12" r="1.5" fill="#FFFFFF" />
      <circle cx="17" cy="17" r="1.5" fill="#FFFFFF" />
      <circle cx="12" cy="20" r="1.5" fill="#FFFFFF" />
      <circle cx="7" cy="17" r="1.5" fill="#FFFFFF" />
      <circle cx="4" cy="12" r="1.5" fill="#FFFFFF" />
      <circle cx="7" cy="7" r="1.5" fill="#FFFFFF" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedEmpty, setFeedEmpty] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [remixGlow, setRemixGlow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);



  const showNotification = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-[100]';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const toggleShareMenu = () => {
    setShareMenuOpen(!shareMenuOpen);
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://example.com/video/123');
    showNotification('Link copied to clipboard!');
    setShareMenuOpen(false);
  };

  const shareToWhatsApp = () => {
    window.open('https://wa.me/?text=Check out this video: https://example.com/video/123', '_blank');
    setShareMenuOpen(false);
  };

  const shareToInstagram = () => {
    showNotification('Open Instagram app to share');
    setShareMenuOpen(false);
  };

  const shareToTikTok = () => {
    showNotification('Open TikTok app to share');
    setShareMenuOpen(false);
  };

  // Load trending searches and posts on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trending searches
        const trendingResponse = await fetch(apiUrl(`/search`));
        const trendingData = await trendingResponse.json();
        setTrendingSearches(trendingData.trendingSearches || []);

        // Fetch posts
        const postsResponse = await fetch(apiUrl(`/posts`));
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
        setFeedEmpty((postsData.posts || []).length === 0);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setFeedEmpty(true);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced search function
  const performSearch = async (query) => {
    if (query.length === 0) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(apiUrl(`/search?q=${encodeURIComponent(query)}`));
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ users: [], content: [], aiAssets: [], error: 'Search failed' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (300ms delay)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSearchOpen = () => {
    setSearchOpen(true);
    setSearchResults(null);
    // Navigate to search page after brief delay to show animation
    setTimeout(() => {
      router.push('/search');
    }, 350);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  const handleTrendingClick = (trendingText) => {
    setSearchQuery(trendingText);
    performSearch(trendingText);
  };

  const handleRemixClick = async () => {
    // Haptic feedback
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        console.log('Haptics not available');
      }
    }

    // Show glow effect
    setRemixGlow(true);
    setTimeout(() => setRemixGlow(false), 600);

    // Redirect to creative studio
    router.push('/creative-studio?remix=true');
  };

    return (
      <>
        <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
          {/* Search Bar (Full-width Glassmorphism) */}
          <div className={`absolute top-0 left-0 right-0 z-40 pt-3 px-4 transition-all duration-300 ease-out ${searchOpen ? 'h-auto bg-gradient-to-b from-black/40 to-transparent backdrop-blur-xl py-4' : 'h-auto'}`}>
            <div className="flex items-center gap-3 max-w-full">
              {/* Search Icon (Minimalist with Liquid Glass Reflection) */}
              {!searchOpen && (
                <button
                  onClick={handleSearchOpen}
                  className="relative group ml-auto mr-3 hover:scale-110 transition-transform w-12 h-12 flex items-center justify-center"
                >
                  {/* Liquid Glass Reflection Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-white/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg">
                    <i className="ph-fill ph-magnifying-glass text-lg text-white drop-shadow-md"></i>
                  </div>
                </button>
              )}

              {/* Expandable Search Bar */}
              {searchOpen && (
                <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative group">
                      {/* Frosted Glass Container */}
                      <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-lg border border-white/20"></div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Search creators, music, or AI prompts..."
                          className="relative w-full px-4 py-3 bg-transparent text-white placeholder-white/50 outline-none text-[14px] font-light tracking-wide"
                        />
                        {/* Subtle glow on focus */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/0 to-indigo-500/0 pointer-events-none opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <button
                      onClick={handleSearchClose}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-[13px] font-medium transition-colors hover:scale-105 active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Search Results or Trending Searches */}
                  {searchQuery.length === 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      <h3 className="text-white/50 text-[12px] font-bold uppercase tracking-widest px-3 py-2 mb-2">Trending Searches</h3>
                      <div className="space-y-1">
                        {trendingSearches.map((search) => (
                          <button
                            key={search.id}
                            onClick={() => handleTrendingClick(search.text)}
                            className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors border border-white/10 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <i className="ph-fill ph-trend-up text-fuchsia-400 text-xs"></i>
                                <span className="text-white text-[13px]">{search.text}</span>
                              </div>
                              <span className="text-white/40 text-[11px]">{search.count.toLocaleString()}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      {searchLoading && (
                        <div className="px-3 py-4 text-center">
                          <div className="inline-block animate-spin">
                            <i className="ph-fill ph-spinner text-white/60 text-lg"></i>
                          </div>
                          <p className="text-white/50 text-[12px] mt-2">Searching...</p>
                        </div>
                      )}

                      {!searchLoading && searchResults && (
                        <div className="space-y-4">
                          {/* Users Section */}
                          {searchResults.users && searchResults.users.length > 0 && (
                            <div>
                              <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest px-3 mb-2">Creators</h3>
                              <div className="space-y-1">
                                {searchResults.users.map((user) => (
                                  <div
                                    key={user.id}
                                    onClick={() => user?.id && router.push(`/profile?id=${user.id}`)}
                                    className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors border border-white/10 cursor-pointer flex items-center gap-3"
                                  >
                                    <img src={user.profile_image_url} alt={user.display_name} className="w-8 h-8 rounded-full object-cover" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-[13px] font-medium truncate">{user.display_name}</p>
                                      <p className="text-white/50 text-[11px] truncate">@{user.username}</p>
                                    </div>
                                    <span className="text-white/40 text-[10px] whitespace-nowrap">{user.followers_count.toLocaleString()} followers</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Content Section */}
                          {searchResults.content && searchResults.content.length > 0 && (
                            <div>
                              <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest px-3 mb-2">Content</h3>
                              <div className="space-y-1">
                                {searchResults.content.map((post) => (
                                  <div
                                    key={post.id}
                                    onClick={() => router.push(`/post?id=${post.id}`)}
                                    className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors border border-white/10 cursor-pointer"
                                  >
                                    <p className="text-white text-[12px] line-clamp-2">{post.caption}</p>
                                    <div className="flex items-center gap-4 mt-2 text-white/40 text-[10px]">
                                      <span className="flex items-center gap-1">
                                        <i className="ph-fill ph-heart text-pink-400"></i>{post.likes_count}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <i className="ph-fill ph-chat-circle-dots text-blue-400"></i>{post.comments_count}
                                      </span>
                                      <span className="text-white/30">@{post.username}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Assets Section */}
                          {searchResults.aiAssets && searchResults.aiAssets.length > 0 && (
                            <div>
                              <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest px-3 mb-2">AI Assets</h3>
                              <div className="space-y-1">
                                {searchResults.aiAssets.map((asset) => (
                                  <div
                                    key={asset.id}
                                    className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors border border-white/10 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="px-1.5 py-0.5 bg-purple-500/30 rounded text-white/70 text-[9px] font-bold uppercase">{asset.asset_type}</span>
                                      <p className="text-white text-[12px] font-medium flex-1 truncate">{asset.title}</p>
                                    </div>
                                    <p className="text-white/50 text-[11px] line-clamp-1 mt-1">{asset.prompt}</p>
                                    <div className="flex items-center gap-4 mt-2 text-white/40 text-[10px]">
                                      <span className="flex items-center gap-1">
                                        <i className="ph-fill ph-download text-cyan-400"></i>{asset.downloads_count}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <i className="ph-fill ph-heart text-pink-400"></i>{asset.likes_count}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.totalResults === 0 && (
                            <div className="px-3 py-8 text-center">
                              <i className="ph-fill ph-magnifying-glass text-white/20 text-3xl block mb-2"></i>
                              <p className="text-white/50 text-[12px]">No results found for "{searchQuery}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Absolute Background Video/Image (Covers full screen under safe area padding) */}
    <div className="absolute inset-0 w-full h-[100dvh] bg-black z-0" />
    {/* Background can be replaced with user-generated content when available */}
    
    {/* Ambient Blur Globs (For depth) */}
    <div className="absolute top-[20%] left-[-10%] w-80 h-80 bg-fuchsia-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-blob z-10"></div>
    <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-blob z-10" style={{ animationDelay: '2s' }}></div>

    {/* Vignette Gradients for Legibility */}
    <div className={`absolute top-0 inset-x-0 pointer-events-none z-10 transition-all duration-300 ${searchOpen ? 'h-80 bg-gradient-to-b from-black/60 via-black/20 to-transparent' : 'h-48 bg-gradient-to-b from-black/80 via-black/30 to-transparent'}`}></div>
    <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10"></div>

    {/* Flow Content (Starts below the 55px safe area padding) */}
    <main className="relative z-20 w-full flex-shrink-0 h-full">
      {feedEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pt-20">
          <div className="text-center">
            {authLoading || postsLoading ? (
              <>
                <p className="text-white text-base font-semibold mb-1">Loading...</p>
              </>
            ) : !user ? (
              <>
                <p className="text-white text-base font-semibold mb-1">No posts yet</p>
                <p className="text-white/60 text-sm mb-6">Sign in to view posts from creators you follow</p>
                <button onClick={() => router.push('/login')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-all">Sign In</button>
              </>
            ) : (
              <>
                <p className="text-white text-base font-semibold mb-1">Welcome to Flovia.</p>
                <p className="text-white/60 text-sm">Tap the Studio button to post your first video.</p>
              </>
            )}
          </div>
        </div>
      )}

      {!feedEmpty && (
        <div className="w-full h-full snap-y snap-mandatory overflow-y-scroll no-scrollbar">
          {posts.map((post, index) => (
            <div key={post.id} className="w-full h-[100dvh] snap-start relative flex flex-col items-center justify-center bg-black">
              {/* Post Media */}
              <div className="absolute inset-0 w-full h-full">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={post.media_url} className="w-full h-full object-cover" alt="Post" />
                )}
              </div>

              {/* Overlay gradient for legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>

              {/* Post Info at bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-32 pt-16 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-start gap-3 mb-4">
                  <img src={post.profile_image_url || 'https://via.placeholder.com/48'} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" alt={post.display_name} />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{post.display_name}</p>
                    <p className="text-white/60 text-xs">@{post.username}</p>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:opacity-90 transition-opacity">Follow</button>
                </div>
                {post.caption && <p className="text-white text-sm leading-relaxed mb-3">{post.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>

    {/* Right Side Action Buttons */}
    <div className="absolute right-3 bottom-[140px] z-20 flex flex-col items-center gap-5 pointer-events-auto">

        {/* Like */}
        <button className="flex flex-col items-center gap-1 group hover:scale-110 transition-transform cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-active:bg-fuchsia-500/30 transition-colors shadow-lg">
                <i className="ph-fill ph-heart text-2xl group-active:text-fuchsia-500 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all"></i>
            </div>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 group hover:scale-110 transition-transform cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-active:bg-white/30 transition-colors shadow-lg">
                <i className="ph-fill ph-chat-circle-dots text-2xl group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all"></i>
            </div>
        </button>

        {/* Remix */}
        <button onClick={handleRemixClick} className="flex flex-col items-center gap-1 group hover:scale-110 transition-transform cursor-pointer relative">
            <style>{`
              @keyframes sparkle-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.15); }
                100% { transform: scale(1); }
              }
              .sparkle-pulse {
                animation: sparkle-pulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
            `}</style>
            <div className={`w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all shadow-lg ${remixGlow ? 'bg-cyan-500/40 border-cyan-400/60 shadow-[0_0_20px_rgba(0,255,255,0.5)]' : 'group-hover:bg-white/5 group-active:bg-cyan-500/30'}`}>
                <div className={remixGlow ? 'sparkle-pulse' : ''}>
                  <RemixSparkleIcon isGlowing={remixGlow} />
                </div>
            </div>
            {remixGlow && (
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none" style={{ animationDuration: '0.6s' }}></div>
            )}
            <span className="text-[11px] font-semibold text-white drop-shadow-md tracking-wide">Remix</span>
        </button>

        {/* Share */}
        <div className="relative group" ref={shareMenuRef}>
            <button className="flex flex-col items-center gap-1 hover:scale-110 transition-transform cursor-pointer" onClick={toggleShareMenu}>
                <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-blue-500/30 transition-colors shadow-lg">
                    <i className="ph-fill ph-share-fat text-2xl hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all"></i>
                </div>
            </button>

            {/* Share Menu (Hidden by default) */}
            <div id="shareMenu" className={`absolute -left-32 bottom-16 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] ${shareMenuOpen ? '' : 'hidden'} z-50 flex flex-col gap-2`}>
                {/* Copy Link */}
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors text-white text-[13px] font-medium border border-white/10" onClick={copyLink}>
                    <i className="ph-fill ph-link text-lg text-blue-400"></i>
                    <span>Copy Link</span>
                </button>

                {/* WhatsApp */}
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors text-white text-[13px] font-medium border border-white/10" onClick={shareToWhatsApp}>
                    <i className="ph-fill ph-whatsapp-logo text-lg text-green-400"></i>
                    <span>WhatsApp</span>
                </button>

                {/* Instagram */}
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors text-white text-[13px] font-medium border border-white/10" onClick={shareToInstagram}>
                    <i className="ph-fill ph-instagram-logo text-lg text-pink-400"></i>
                    <span>Instagram</span>
                </button>

                {/* TikTok */}
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors text-white text-[13px] font-medium border border-white/10" onClick={shareToTikTok}>
                    <i className="ph-fill ph-tiktok-logo text-lg text-white"></i>
                    <span>TikTok</span>
                </button>
            </div>
        </div>

        
    </div>



    {/* Bottom Tab Navigation (Floating Style) */}
    {/* Requirement: padding-bottom: 20px, and starts at least 25px from bottom edge */}
        </div>
      <BottomNav />
      </>
    );
}
