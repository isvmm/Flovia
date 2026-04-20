const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flovia.vercel.app';

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 1. If we are in a regular web browser, use relative paths hitting our own backend.
  // This solves ALL CORS errors for any Vercel domain (Preview or Production).
  // BUT: In Capacitor/Mobile, we MUST use the absolute URL because relative paths won't work on the device.
  if (typeof window !== 'undefined' && !window.Capacitor) {
    return `/api${normalizedPath}`;
  }

  // 2. If we are on Mobile/Capacitor or Server-side, use the absolute URL.
  const base = DEFAULT_API_URL.endsWith('/') ? DEFAULT_API_URL.slice(0, -1) : DEFAULT_API_URL;
  return `${base}/api${normalizedPath}`;
};

export const getApiUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return DEFAULT_API_URL;
};

export default apiUrl;
