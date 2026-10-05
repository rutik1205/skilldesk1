// Central API configuration for SkillDesk
// In development, Vite proxy handles /api → localhost:5000
// In production, we point directly to the Render backend

const API_BASE = import.meta.env.VITE_API_URL || '';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';

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
  return SOCKET_URL || window.location.origin;
}
