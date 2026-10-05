// Central API configuration for SkillDesk
// In development (localhost), Vite proxy handles /api → localhost:5000
// In production (Vercel), we point directly to the Render backend

const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const API_BASE = import.meta.env.VITE_API_URL || (isProduction ? 'https://skilldesk1.onrender.com' : '');
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isProduction ? 'https://skilldesk1.onrender.com' : 'http://localhost:5000');

/**
 * Returns the full API URL for a given path.
 * @param {string} path - API path starting with /api/...
 * @returns {string} Full URL in production, relative path in development
 */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

/**
 * Returns the Socket.IO server URL.
 */
export function getSocketUrl() {
  return SOCKET_URL;
}
