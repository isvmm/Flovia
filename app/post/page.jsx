'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';
import BottomNav from '@/app/components/BottomNav';

function PostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPromptOverlay, setShowPromptOverlay] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        
        const data = await response.json();
        setPost(data.post);
        setAuthor(data.author);
      } catch (error) {
        console.error('❌ Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleMediaTap = () => {
    if (post?.prompt) {
      setShowPromptOverlay(true);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      // Use standard clipboard API (works on web and native)
      await navigator.clipboard.writeText(post.prompt);
      
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (error) {
      console.error('❌ Copy failed:', error);
    }
  };

  const handleRemix = () => {
    setShowPromptOverlay(false);
    router.push(`/creative-studio?prompt=${encodeURIComponent(post.prompt)}`);
  };

  if (loading) {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-3">
            <i className="ph-fill ph-spinner text-white text-3xl"></i>
          </div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post || !author) {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Post not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-black text-white overflow-hidden flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <i className="ph-fill ph-arrow-left text-xl"></i>
        </button>
        <h1 className="text-lg font-bold">Post</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Author Info */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <img
            src={author.profile_image_url}
            alt={author.display_name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-white">{author.display_name}</p>
            <p className="text-white/60 text-sm">@{author.username}</p>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors">
            Follow
          </button>
        </div>

        {/* Media with Tap Indicator */}
        <div className="relative bg-black/50">
          <div
            className="relative aspect-square bg-black cursor-pointer group"
            onClick={handleMediaTap}
          >
            {post.media_type === 'image' ? (
              <img
                src={post.media_url}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={post.media_url}
                className="w-full h-full object-cover"
                controls
              />
            )}

            {/* Tap Indicator Overlay (only for AI content) */}
            {post.prompt && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                  <i className="ph-fill ph-sparkle text-lg"></i>
                  <span>Tap for AI Prompt</span>
                </div>
              </div>
            )}
          </div>

          {/* Content Type Badge */}
          <div className="absolute top-3 right-3">
            {post.content_type === 'pure-ai' && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/20">
                <i className="ph-fill ph-robot-fill mr-1"></i> AI Generated
              </div>
            )}
            {post.content_type === 'ai-enhanced' && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/20">
                <i className="ph-fill ph-sparkle mr-1"></i> AI Enhanced
              </div>
            )}
            {post.content_type === 'pure-real' && (
              <div className="px-3 py-1.5 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/20">
                <i className="ph-fill ph-camera mr-1"></i> Real
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="p-4 border-b border-white/10">
            <p className="text-white text-base leading-relaxed">{post.caption}</p>
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 text-center">
          <div>
            <p className="text-lg font-bold text-white">{(post.likes_count / 1000).toFixed(0)}K</p>
            <p className="text-white/60 text-xs">Likes</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{(post.comments_count / 1000).toFixed(1)}K</p>
            <p className="text-white/60 text-xs">Comments</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{(post.saves_count / 1000).toFixed(1)}K</p>
            <p className="text-white/60 text-xs">Saves</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{(post.shares_count / 1000).toFixed(1)}K</p>
            <p className="text-white/60 text-xs">Shares</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around p-4 border-b border-white/10">
          <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
            <i className="ph-fill ph-heart text-2xl"></i>
            <span className="text-xs">Like</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
            <i className="ph-fill ph-chat-circle text-2xl"></i>
            <span className="text-xs">Comment</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
            <i className="ph-fill ph-bookmark text-2xl"></i>
            <span className="text-xs">Save</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
            <i className="ph-fill ph-share-network text-2xl"></i>
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>

      {/* Prompt Overlay — Glassmorphism Card */}
      {showPromptOverlay && post.prompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          {/* Close on background tap */}
          <div
            className="absolute inset-0"
            onClick={() => setShowPromptOverlay(false)}
          />

          {/* Glassmorphism Card */}
          <div className="relative w-full bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl border-t border-white/20 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowPromptOverlay(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-colors"
            >
              <i className="ph-fill ph-x text-lg"></i>
            </button>

            {/* Header */}
            <div className="mb-4 pr-8">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">
                <i className="ph-fill ph-sparkle mr-2"></i>Original AI Prompt
              </h3>
              <p className="text-base text-white leading-relaxed">{post.prompt}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {/* Copy Prompt Button */}
              <button
                onClick={handleCopyPrompt}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  promptCopied
                    ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <i className={`ph-fill ${promptCopied ? 'ph-check' : 'ph-copy'} text-lg`}></i>
                {promptCopied ? 'Copied!' : 'Copy Prompt'}
              </button>

              {/* Remix Button */}
              <button
                onClick={handleRemix}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white hover:from-fuchsia-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-fuchsia-500/50 flex items-center justify-center gap-2"
              >
                <i className="ph-fill ph-sparkle text-lg"></i>
                Remix
              </button>
            </div>

            {/* Hint Text */}
            <p className="text-xs text-white/50 mt-4 text-center">
              Remix will open AI Creative Studio with this prompt pre-filled
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="w-full h-[100dvh] bg-black flex items-center justify-center"><p className="text-white/60">Loading...</p></div>}>
      <PostContent />
    </Suspense>
  );
}
