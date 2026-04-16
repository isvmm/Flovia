'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/login', '/signup'];

export default function ProtectedLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't check routes while auth is loading
    if (loading) return;

    // If user is not authenticated and not on a public route, redirect to login
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-cyan-500 animate-spin"></div>
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
