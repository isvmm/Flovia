'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';
import { apiUrl } from '@/lib/apiUrl';

function SearchContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPromptOverlay, setShowPromptOverlay] = useState(null);
  const [ghostPosts, setGhostPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedCreators, setSuggestedCreators] = useState([]);
  const [followingStates, setFollowingStates] = useState({});
  const [landingLoading, setLandingLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingOffset, setTrendingOffset] = useState(0);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const trendingContainerRef = useRef(null);

  // Load landing data on mount
  useEffect(() => {
    const loadLandingData = async () => {
      try {
        const [auraRes, creatorsRes] = await Promise.all([
          fetch(apiUrl(`/aura-inspirations?limit=6`)),
          fetch(apiUrl(`/suggested-creators?${user ? `userId=${user.id}&` : ''}limit=8`)),
        ]);

        const auraData = await auraRes.json();
        const creatorsData = await creatorsRes.json();

        setGhostPosts(auraData.ghostPosts || []);
        setSuggestedCreators(creatorsData.creators || []);

        // Check following status for each creator
        if (user && creatorsData.creators) {
          const followStatus = {};
          for (const creator of creatorsData.creators) {
            const checkRes = await fetch(
              apiUrl(`/follows/check?followerId=${user.id}&followingId=${creator.id}`)
            );
            const checkData = await checkRes.json();
            followStatus[creator.id] = checkData.isFollowing;
          }
          setFollowingStates(followStatus);
        }
      } catch (error) {
        console.error('Failed to load landing data:', error);
      } finally {
        setLandingLoading(false);
      }
    };
    loadLandingData();
  }, [user]);

  // Load trending posts on mount
  useEffect(() => {
    const loadTrendingPosts = async () => {
      setTrendingLoading(true);
      try {
        const response = await fetch(
          apiUrl(`/trending-posts?offset=0&limit=12`)
        );
        const data = await response.json();
        setTrendingPosts(data.posts || []);
        setTrendingOffset(0);
      } catch (error) {
        console.error('Failed to load trending posts:', error);
      } finally {
        setTrendingLoading(false);
      }
    };
    loadTrendingPosts();
  }, []);

  // Infinite scroll for trending posts
  useEffect(() => {
    const container = trendingContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 500 && !trendingLoading && trendingPosts.length > 0) {
        loadMoreTrendingPosts();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [trendingLoading, trendingOffset, trendingPosts]);

  const loadMoreTrendingPosts = async () => {
    setTrendingLoading(true);
    try {
      const newOffset = trendingOffset + 12;
      const response = await fetch(
        apiUrl(`/trending-posts?offset=${newOffset}&limit=12`)
      );
      const data = await response.json();
      setTrendingPosts([...trendingPosts, ...(data.posts || [])]);
      setTrendingOffset(newOffset);
    } catch (error) {
      console.error('Failed to load more trending posts:', error);
    } finally {
      setTrendingLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: 'ph-fill ph-grid' },
    { id: 'ai-videos', label: 'AI Videos', icon: 'ph-fill ph-video', filter: { content_type: ['pure-ai', 'ai-enhanced'], media_type: 'video' } },
    { id: 'ai-images', label: 'AI Images', icon: 'ph-fill ph-image', filter: { content_type: ['pure-ai', 'ai-enhanced'], media_type: 'image' } },
    { id: 'real-clips', label: 'Real Clips', icon: 'ph-fill ph-film-strip', filter: { content_type: 'pure-real', media_type: 'video' } },
    { id: 'real-moments', label: 'Real Moments', icon: 'ph-fill ph-image-square', filter: { content_type: 'pure-real', media_type: 'image' } },
  ];

  const performSearch = async (query, tabId) => {
    if (query.length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/discover?q=${encodeURIComponent(query)}&tab=${tabId}`)
      );
      const data = await response.json();
      setResults(data.posts || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(value, activeTab);
    }, 300);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (searchQuery.length > 0) {
      performSearch(searchQuery, tabId);
    }
  };

  const openPromptOverlay = (post) => {
    setShowPromptOverlay(post);
  };

  const closePromptOverlay = () => {
    setShowPromptOverlay(null);
  };

  const copyPrompt = async (prompt) => {
    try {
      // Native clipboard on mobile
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(prompt);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = prompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showNotification('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const remixPrompt = (prompt) => {
    router.push(`/creative-studio?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleFollowToggle = async (creatorId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Trigger haptic feedback using navigator.vibrate
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      const response = await fetch(
        apiUrl(`/follows/toggle`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followerId: user.id,
            followingId: creatorId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setFollowingStates({
          ...followingStates,
          [creatorId]: data.following,
        });
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    }
  };

  const showNotification = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-[100]';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const isAIContent = (post) => {
    return post.content_type === 'pure-ai' || post.content_type === 'ai-enhanced';
  };

  const getPromptSnippet = (prompt) => {
    return prompt ? prompt.substring(0, 60) + (prompt.length > 60 ? '...' : '') : '';
  };

  return (
    <div ref={trendingContainerRef} className="w-full bg-black text-white min-h-screen pb-24 pt-20 overflow-y-auto">
      {/* Glassmorphism Search Bar */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-black/80 via-black/60 to-black/40 backdrop-blur-lg px-4 py-4 mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"></div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search creators, content, and AI prompts..."
            className="relative w-full px-5 py-4 bg-transparent text-white placeholder-white/50 outline-none text-sm font-light tracking-wide rounded-2xl"
          />
          <i className="ph-fill ph-magnifying-glass absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-lg"></i>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/0 to-indigo-500/0 pointer-events-none opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>



      {/* Content */}
      <div className="px-3 py-4 pb-32">
        {searchQuery.length === 0 ? (
          <div className="space-y-10">
            {/* SECTION 1: Flovia Inspirations - Ghost Posts */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <i className="ph-fill ph-sparkles text-cyan-400 text-lg"></i>
                <h2 className="text-white font-bold text-lg">Flovia Inspirations</h2>
              </div>
              {landingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <i className="ph-fill ph-spinner text-4xl text-cyan-500"></i>
                  </div>
                </div>
              ) : ghostPosts.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {ghostPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex-shrink-0 w-48 h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-cyan-500/50 transition-all duration-300 relative group cursor-pointer"
                      onClick={() => router.push(`/post?id=${post.id}`)}
                    >
                      {/* Media */}
                      <div className="relative w-full h-full">
                        {post.media_type === 'image' ? (
                          <img
                            src={post.media_url}
                            alt={post.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <video
                            src={post.media_url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                        {/* Glass Overlay Card with Prompt */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 backdrop-blur-md bg-black/40 border-t border-white/20">
                          <p className="text-white text-xs font-light line-clamp-2 leading-relaxed">
                            {post.prompt ? post.prompt.substring(0, 80) + (post.prompt.length > 80 ? '...' : '') : post.caption}
                          </p>
                        </div>

                        {/* Remix Button (Free) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            remixPrompt(post.prompt);
                          }}
                          className="absolute top-3 right-3 px-3 py-1.5 bg-cyan-500/80 hover:bg-cyan-500 text-black text-xs font-bold rounded-lg transition-all active:scale-95"
                        >
                          Remix
                        </button>

                        {/* Flovia Badge */}
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full px-2 py-1 text-white text-[10px] font-semibold">
                          @FloviaOfficial
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">No Flovia Inspirations available</div>
              )}
            </div>

            {/* SECTION 2: Trending Now - Masonry Grid */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <i className="ph-fill ph-trend-up text-fuchsia-400 text-lg"></i>
                <h2 className="text-white font-bold text-lg">Trending Now</h2>
              </div>
              {trendingPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 auto-rows-max">
                  {trendingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="relative group cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300"
                      onClick={() => router.push(`/post?id=${post.id}`)}
                    >
                      {/* Media Container */}
                      <div className="relative w-full aspect-square bg-black/50 overflow-hidden">
                        {post.media_type === 'image' ? (
                          <img
                            src={post.media_url}
                            alt={post.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <video
                            src={post.media_url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}

                        {/* Play Icon for Videos */}
                        {post.media_type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/40 transition-all">
                              <i className="ph-fill ph-play text-white text-lg ml-1"></i>
                            </div>
                          </div>
                        )}

                        {/* AI Badge */}
                        {(post.content_type === 'pure-ai' || post.content_type === 'ai-enhanced') && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full p-2 shadow-lg">
                            <i className="ph-fill ph-spark text-white text-xs"></i>
                          </div>
                        )}

                        {/* Username & Prompt Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-white text-xs font-semibold text-fuchsia-400 mb-1">@{post.username}</p>
                          {post.prompt && (
                            <p className="text-white text-xs text-white/70 line-clamp-2 mb-2">{post.prompt.substring(0, 60)}...</p>
                          )}
                          {(post.content_type === 'pure-ai' || post.content_type === 'ai-enhanced') && post.prompt && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPromptOverlay(post);
                              }}
                              className="py-1.5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-lg text-white text-xs font-semibold hover:shadow-lg transition-all"
                            >
                              View Prompt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">No trending content available</div>
              )}
              {trendingLoading && (
                <div className="flex justify-center py-6 col-span-2">
                  <div className="animate-spin">
                    <i className="ph-fill ph-spinner text-3xl text-fuchsia-500"></i>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Rising Creators - Horizontal List */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <i className="ph-fill ph-crown text-indigo-400 text-lg"></i>
                <h2 className="text-white font-bold text-lg">Rising Creators</h2>
              </div>
              {landingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <i className="ph-fill ph-spinner text-4xl text-indigo-500"></i>
                  </div>
                </div>
              ) : suggestedCreators.length > 0 ? (
                <div className="space-y-3">
                  {suggestedCreators.map((creator) => (
                    <div
                      key={creator.id}
                      onClick={() => router.push(`/profile?id=${creator.id}`)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/2 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group backdrop-blur-sm"
                    >
                      {/* Avatar */}
                      <img
                        src={creator.profile_image_url}
                        alt={creator.display_name}
                        className="w-14 h-14 rounded-full object-cover border border-white/20 flex-shrink-0"
                      />

                      {/* Creator Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{creator.display_name}</p>
                        <p className="text-white/50 text-xs truncate">@{creator.username}</p>
                        <p className="text-white/40 text-xs mt-1">{creator.followers_count.toLocaleString()} followers • {creator.post_count} posts</p>
                      </div>

                      {/* Follow Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(creator.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                          followingStates[creator.id]
                            ? 'bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-500/50 text-cyan-300'
                            : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                        }`}
                      >
                        {followingStates[creator.id] ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">No suggested creators available</div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin">
              <i className="ph-fill ph-spinner text-3xl text-fuchsia-500"></i>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-white/50">
            <i className="ph-fill ph-magnifying-glass text-5xl"></i>
            <p className="text-center">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 auto-rows-max">
            {results.map((post) => (
              <div
                key={post.id}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300"
                onClick={() => router.push(`/post?id=${post.id}`)}
              >
                {/* Media Container */}
                <div className="relative w-full aspect-square bg-black/50 overflow-hidden">
                  {/* Media Image/Video */}
                  {post.media_type === 'image' ? (
                    <img
                      src={post.media_url}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <video
                      src={post.media_url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}

                  {/* AI Badge (Spark Icon) */}
                  {isAIContent(post) && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full p-2 shadow-lg">
                      <i className="ph-fill ph-spark text-white text-xs"></i>
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    {/* Username and Prompt Snippet */}
                    <div className="text-white">
                      <p className="text-xs font-semibold text-fuchsia-400 mb-1">{post.username}</p>
                      {post.prompt && (
                        <p className="text-xs text-white/70 line-clamp-2">{getPromptSnippet(post.prompt)}</p>
                      )}
                      {post.caption && !post.prompt && (
                        <p className="text-xs text-white/70 line-clamp-2">{post.caption}</p>
                      )}
                    </div>

                    {/* Prompt Overlay Trigger for AI Content */}
                    {isAIContent(post) && post.prompt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPromptOverlay(post);
                        }}
                        className="mt-2 w-full py-1.5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-lg text-white text-xs font-semibold hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all active:scale-95"
                      >
                        View Prompt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt Overlay - Glassmorphism Card */}
      {showPromptOverlay && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
          onClick={closePromptOverlay}
        >
          <div
            className="w-full bg-gradient-to-t from-black to-black/80 backdrop-blur-xl border-t border-white/20 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closePromptOverlay}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <i className="ph-fill ph-x text-white"></i>
            </button>

            {/* Header */}
            <div className="pt-2">
              <h3 className="text-white font-semibold text-sm mb-1">Original AI Prompt</h3>
              <p className="text-white/50 text-xs">From {showPromptOverlay.username}'s creation</p>
            </div>

            {/* Prompt Text - Glassmorphism Box */}
            <div className="relative group p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <p className="text-white text-sm leading-relaxed font-light">
                {showPromptOverlay.prompt}
              </p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/0 to-indigo-500/0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => copyPrompt(showPromptOverlay.prompt)}
                className="py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <i className="ph-fill ph-copy text-base"></i>
                Copy Prompt
              </button>
              <button
                onClick={() => {
                  remixPrompt(showPromptOverlay.prompt);
                  closePromptOverlay();
                }}
                className="py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:shadow-lg hover:shadow-fuchsia-500/50 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="ph-fill ph-lightning text-base"></i>
                Remix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
