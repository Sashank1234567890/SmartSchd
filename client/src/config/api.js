import axios from 'axios';

/**
 * Resolves the Backend API Base URL with prioritized fallback:
 * 1. User manual override stored in localStorage (allows runtime configuration on Vercel)
 * 2. import.meta.env.VITE_API_URL
 * 3. import.meta.env.VITEAPIURL (support for Vercel env variable without underscore)
 * 4. import.meta.env.VITE_BACKEND_URL
 * 5. In production: '' (relative root if hosted together or proxied)
 * 6. In development: 'http://localhost:3001'
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('VITE_API_URL') || 
                  localStorage.getItem('VITEAPIURL') || 
                  localStorage.getItem('BACKEND_URL');
    if (local && local.trim()) {
      return local.trim().replace(/\/+$/, '');
    }
  }

  const envUrl = import.meta.env.VITE_API_URL || 
                 import.meta.env.VITEAPIURL || 
                 import.meta.env.VITE_BACKEND_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (import.meta.env.PROD) {
    return 'https://smartschd-server.vercel.app';
  }

  return 'http://localhost:3001';
}

export function setApiBaseUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('VITE_API_URL');
    localStorage.removeItem('VITEAPIURL');
    localStorage.removeItem('BACKEND_URL');
  } else {
    const clean = url.trim().replace(/\/+$/, '');
    localStorage.setItem('VITE_API_URL', clean);
    localStorage.setItem('VITEAPIURL', clean);
    localStorage.setItem('BACKEND_URL', clean);
  }
  const updated = getApiBaseUrl();
  axios.defaults.baseURL = updated;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smartsched:api_url_changed', { detail: updated }));
  }
  return updated;
}

export const API = getApiBaseUrl();

// Set default baseURL for all Axios HTTP requests across the app
axios.defaults.baseURL = API;

export default API;
