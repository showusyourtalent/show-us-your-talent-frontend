// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://show-us-your-talent-backend-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token - CORRECTION ICI
axiosInstance.interceptors.request.use(
  (config) => {
    // Utiliser 'token' au lieu de 'access_token' pour correspondre à AuthContext
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Supprimer les deux tokens possibles
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;