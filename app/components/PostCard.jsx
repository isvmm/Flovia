'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function PostCard({ post, currentUser }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [remixGlow, setRemixGlow] = useState(false);
  const audioRef = useRef(null);

  const isAIGenerated = post.content_type !== 'pure-real';
  const hasMusic = post.music_url && (post.media_type === 'video' || post.media_type === 'carousel');

  // Auto-play music when post is in view
  useEffect(() => {
    if (!hasMusic) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && audioRef.current) {
          audioRef.current.play();
          setMusicPlaying(true);
        } else if (audioRef.current) {
          audioRef.current.pause();
          setMusicPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.querySelector(`[data-post-id="${post.id}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [post.id, hasMusic]);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setMusicPlaying(!audioRef.current.muted);
    }
  };

  const handleRemix = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        console.log('Haptics not available');
      }
    }

    setRemixGlow(true);
    setTimeout(() => setRemixGlow(false), 600);

    localStorage.setItem('remixPrompt', post.prompt || post.caption);
    router.push('/creative-studio?remix=true');
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    // TODO: Call API to update like count
  };

  return (
    <div
      data-post-id={post.id}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group"
    >
      {/* Media */}
      <img
        src={post.media_url}
        alt={post.caption}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Audio Element (Hidden) */}
      {hasMusic && (
        <audio ref={audioRef} src={post.music_url} preload="none" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

      {/* AI/Real Tag (Top-Left) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-lg border border-white/20">
        {isAIGenerated ? (
          <>
            <div className="w-3 h-3 rounded-full bg-cyan-400/70 blur-sm"></div>
            <span className="text-[11px] font-semibold text-cyan-300">AI Generated</span>
          </>
        ) : (
          <>
            <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[11px] font-semibold text-white/70">Real</span>
          </>
        )}
      </div>

      {/* Music Mute Button (Bottom-Right) */}
      {hasMusic && (
        <button
          onClick={toggleMute}
          className="absolute bottom-24 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
        >
          {musicPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 5v14a2 2 0 002 2h4l7 5v-5h4a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.527 3.527A1 1 0 015 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a1 1 0 01.527-.473zM18.364 5.636a1 1 0 011.414 1.414l-12.728 12.728a1 1 0 01-1.414-1.414l12.728-12.728z" />
            </svg>
          )}
        </button>
      )}

      {/* Right Side Action Buttons */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group/like"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
            <svg
              className={`w-6 h-6 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white/70'}`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-white/60">{post.likes_count.toLocaleString()}</span>
        </button>

        {/* Comment Button */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-white/60">{post.comments_count.toLocaleString()}</span>
        </button>

        {/* Share Button */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-white/60">{post.shares_count.toLocaleString()}</span>
        </button>

        {/* Remix Button */}
        <button
          onClick={handleRemix}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 ${
              remixGlow ? 'scale-110' : 'scale-100'
            }`}
            style={
              remixGlow
                ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }
                : {}
            }
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                opacity: 0.7,
                filter: remixGlow
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
          </div>
          <span className="text-[10px] font-medium text-white/60">Remix</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-6 z-10">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={post.profile_image_url}
            alt={post.display_name}
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">{post.display_name}</p>
            <p className="text-white/60 text-xs">@{post.username}</p>
          </div>
        </div>
        {post.caption && (
          <p className="text-white/90 text-sm line-clamp-3">{post.caption}</p>
        )}
      </div>
    </div>
  );
}
