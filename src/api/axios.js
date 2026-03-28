
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://show-us-your-talent-backend-main-qouoel.free.laravel.cloud/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // SPA cross-domaine : Bearer token uniquement
});

// ── Requêtes : injecter le Bearer token ────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Réponses : gérer 401 ───────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || '';
    const isLoginPage = window.location.pathname.includes('/login');
    const isAuthCall  = url.includes('/auth/');

    if (import.meta.env.DEV) {
      console.error(`[API Error] ${status} ${url}`, error.response?.data);
    }

    if (status === 401 && !isLoginPage && !isAuthCall) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;