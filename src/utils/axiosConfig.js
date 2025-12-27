import axios from 'axios';

// Définir l'URL de base
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('Current hostname:', hostname, 'Port:', port);
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Si vous utilisez React sur un port différent
    return 'https://show-us-your-talent-backend-1.onrender.com/api';
  }
  
  // En production
  return `${window.location.protocol}//${hostname}${port ? ':' + port : ''}/api`;
};

const API_BASE_URL = getBaseURL();
console.log('API Base URL:', API_BASE_URL);

// Création d'une instance axios avec configuration de base
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // IMPORTANT pour Sanctum
});

// Intercepteur pour ajouter le token automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      hasToken: !!token,
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
      config: error.config
    });
    
    // Log des headers pour debug
    if (error.response?.headers) {
      console.log('Response Headers:', {
        'content-type': error.response.headers['content-type'],
        'access-control-allow-origin': error.response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': error.response.headers['access-control-allow-credentials']
      });
    }
    
    // Si erreur 401 et pas de retry
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest) {
        originalRequest._retry = true;
      }
      
      console.log('⚠️ 401 Unauthorized error detected');
      
      // Ne pas rediriger si on est déjà sur login
      const isLoginPage = window.location.pathname.includes('/login');
      const isAuthRequest = originalRequest?.url?.includes('/auth/');
      
      if (!isLoginPage && !isAuthRequest) {
        console.log('Redirecting to login...');
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour tester la connexion API
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await axiosInstance.get('/test');
    console.log('API connection test success:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error };
  }
};

export default axiosInstance;