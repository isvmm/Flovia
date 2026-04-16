export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getApiUrl = () => API_URL;

export const apiUrl = (path) => {
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export default apiUrl;
