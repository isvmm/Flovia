'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { apiUrl } from '@/lib/apiUrl';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [fetching, setFetching] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id && !initialized) {
      setInitialized(true);
      fetchNotifications('All');
      markAllAsRead();
    }
  }, [user?.id, loading, isAuthenticated, router, initialized]);

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await fetch(apiUrl(`/notifications/mark-all-read`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const fetchNotifications = async (category) => {
    try {
      setFetching(true);
      const response = await fetch(
        apiUrl(`/notifications?userId=${user.id}&category=${category}`)
      );
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setFetching(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await fetch(apiUrl(`/notifications`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id, isRead: true })
        });

        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const timeAgo = (created_at) => {
    const now = new Date();
    const date = new Date(created_at);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-black text-white w-full h-screen flex items-center justify-center overflow-hidden relative font-sans">
        <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0"></div>
        <div className="absolute bottom-[15%] right-[-15%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0"></div>
        <div className="text-white/60">Loading notifications...</div>
      </div>
    );
  }

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const filteredNotifications = selectedCategory === 'All' 
    ? safeNotifications 
    : safeNotifications.filter(n => n.category === selectedCategory);

  const unreadCount = safeNotifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-black text-white w-full min-h-screen relative font-sans pt-6 pb-32">
      {/* Ambient Blur Globs */}
      <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute bottom-[15%] right-[-15%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none mix-blend-screen z-0"></div>

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="px-4 mb-6">
          <h1 className="text-3xl font-bold drop-shadow-lg">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-cyan-400 text-sm mt-2">{unreadCount} unread</p>
          )}
        </div>

        {/* Category Chips */}
        <div className="px-4 mb-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Activity', 'System'].map((category) => (
            <button
              key={category}
              onClick={() => fetchNotifications(category)}
              className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-cyan-500/30 border border-cyan-500/80 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.4)]'
                  : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/15'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="px-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full glass-effect flex items-center justify-center mb-4 text-yellow-400">
                <i className="ph-bold ph-lightbulb text-4xl"></i>
              </div>
              <p className="text-white/60 text-base">Nothing here yet.</p>
              <p className="text-white/40 text-sm mt-1">Go create something viral!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 rounded-2xl transition-all group ${
                  notification.is_read
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                    {notification.image_url ? (
                      <img
                        src={notification.image_url}
                        alt={notification.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full glass-effect flex items-center justify-center text-white/40">
                        <i className="ph-bold ph-user text-lg"></i>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {notification.title}
                    </p>
                    <p className="text-sm text-white/60 mt-1">{notification.message}</p>
                    <p className="text-xs text-white/40 mt-2">{timeAgo(notification.created_at)}</p>

                    {/* Remix Image Thumbnail */}
                    {notification.remix_image_url && (
                      <div className="mt-3 w-full h-24 rounded-lg overflow-hidden border border-white/20">
                        <img
                          src={notification.remix_image_url}
                          alt="Remix"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {notification.type === 'remix' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notification.action_url) {
                            router.push(notification.action_url);
                          }
                        }}
                        className="mt-3 px-4 py-2 bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded-lg text-sm font-medium hover:bg-cyan-500/40 transition-colors"
                      >
                        View Remix
                      </button>
                    )}

                    {notification.type === 'credits' && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40">
                        <p className="text-amber-300 text-xs font-semibold">✨ Creative energy restored!</p>
                      </div>
                    )}
                  </div>

                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
