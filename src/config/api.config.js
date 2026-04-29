const cleanUrl = (url) => url ? url.replace(/\/+$/, '') : '';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const API_BASE = cleanUrl(rawApiUrl);
export const SOCKET_URL = cleanUrl(API_BASE.replace('/api', ''));
