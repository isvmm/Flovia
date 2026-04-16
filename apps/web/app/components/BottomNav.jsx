'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (!loading && user?.id) {
      fetchUnreadCount();
      
      // Poll for new notifications every 3 seconds (real-time feeling)
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [loading, user?.id]);

  const fetchUnreadCount = async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count?userId=${user.id}`
      );
      
      if (!response.ok) {
        setUnreadCount(0);
        return;
      }
      
      const data = await response.json();
      if (data && typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      setUnreadCount(0);
    }
  };

  const isActive = (path) => pathname === path;

  const handleNotificationClick = async () => {
    // Mark all notifications as read when clicking the notification tab
    if (user?.id && unreadCount > 0) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        if (response.ok) {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error instanceof Error ? error.message : String(error));
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 pointer-events-none">
      <style>{`
        @keyframes sparkle-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.8)); }
        }
        .sparkle-glow {
          animation: sparkle-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="w-full bg-[#121214]/85 backdrop-blur-2xl border border-white/10 rounded-[32px] px-6 py-3 relative pointer-events-auto shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between w-full relative">
          
          {/* Home */}
          <Link href="/" className="flex items-center justify-center w-12 h-12 min-w-12 text-white transition-all hover:scale-110 active:scale-95 relative rounded-lg">
            {isActive('/') && <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-lg -z-10"></div>}
            <i className={`${isActive('/') ? 'ph-fill' : 'ph'} ph-house text-[24px] ${isActive('/') ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'text-white/60'}`}></i>
          </Link>

          {/* Search */}
          <Link href="/search" className={`flex items-center justify-center w-12 h-12 min-w-12 transition-all hover:scale-110 active:scale-95 relative rounded-lg ${isActive('/search') ? 'text-white' : 'text-white/60'}`} style={{ marginLeft: '16px' }}>
            {isActive('/search') && <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-lg -z-10"></div>}
            <i className={`${isActive('/search') ? 'ph-fill' : 'ph'} ph-magnifying-glass text-[24px] ${isActive('/search') ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]' : ''}`}></i>
          </Link>

          {/* Center Creative Studio Button */}
          <Link href="/creative-studio" className="absolute left-1/2 -translate-x-1/2 -top-8 w-[80px] h-[80px] rounded-full bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-[0_8px_32px_rgba(217,70,239,0.5)] group border-[6px] border-black/90 backdrop-blur-xl hover:scale-110 active:scale-95 transition-all duration-300">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30 group-hover:opacity-60 transition-opacity"></div>
            <i className="ph-bold ph-magic-wand text-[36px] relative z-10 group-hover:rotate-12 transition-all duration-300 drop-shadow-md"></i>
          </Link>

          {/* Notifications */}
          <div className="flex-1"></div>
          <Link href="/notifications" onClick={handleNotificationClick} className={`flex items-center justify-center w-12 h-12 min-w-12 transition-all hover:scale-110 active:scale-95 relative rounded-lg ${isActive('/notifications') ? 'text-white' : 'text-white/60'}`} style={{ marginRight: '16px' }}>
            {isActive('/notifications') && <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-lg -z-10"></div>}
            <div className="relative">
              <i className={`${isActive('/notifications') ? 'ph-fill' : 'ph'} ph-bell text-[24px] ${isActive('/notifications') ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]' : ''}`}></i>
              
              {/* Notification Badge - Red Dot with Liquid Glow */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF3B30] rounded-full border border-white/80 shadow-[0_0_12px_rgba(255,59,48,0.8),inset_0_0_4px_rgba(255,255,255,0.3)] animate-pulse"></div>
              )}
            </div>
          </Link>

          {/* Profile */}
          <Link href="/profile" className="flex items-center justify-center w-12 h-12 min-w-12 text-white transition-all hover:scale-110 active:scale-95 relative rounded-lg" style={{ marginLeft: '16px' }}>
            {isActive('/profile') && <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-lg -z-10"></div>}
            <i className={`${isActive('/profile') ? 'ph-fill' : 'ph'} ph-user text-[24px] ${isActive('/profile') ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'text-white/60'}`}></i>
          </Link>
        </div>
      </div>
    </nav>
  );
}
