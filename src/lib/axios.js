import axios from 'axios';

// ✅ URL racine du backend (SANS /api) — pour le CSRF cookie
const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://show-us-your-talent-backend-main-qouoel.free.laravel.cloud/api')
  .replace(/\/api\/?$/, '');

// ✅ URL de base pour toutes les requêtes API (AVEC /api)
const API_URL = `${BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Flag pour éviter les appels CSRF répétés
let csrfInitialized = false;

const initCsrf = async () => {
  if (csrfInitialized) return;
  // ✅ L'endpoint CSRF est sur la RACINE, pas sous /api
  await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
  csrfInitialized = true;
};

// Intercepteur requêtes
axiosInstance.interceptors.request.use(
  async (config) => {
    // Initialiser le CSRF pour les requêtes mutantes
    const mutating = ['post', 'put', 'patch', 'delete'];
    if (mutating.includes(config.method?.toLowerCase())) {
      try {
        await initCsrf();
      } catch (e) {
        console.error('Erreur CSRF init:', e);
      }
    }

    // Ajouter le Bearer token si disponible
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response?.status === 419) {
      // CSRF expiré — réinitialiser et rejouer
      console.warn('CSRF expiré, renouvellement...');
      csrfInitialized = false;
      try {
        await initCsrf();
        return axiosInstance(error.config);
      } catch {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;