import axios from 'axios';

// URL de l'API, peut être configurée via VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'https://show-us-your-talent-backend-main-qouoel.free.laravel.cloud/api';

// Crée une instance axios avec des paramètres par défaut
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Pour envoyer les cookies (CSRF, session, etc.)
});

// Fonction pour récupérer le token CSRF avant toute requête
const getCsrfToken = async () => {
  try {
    await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true }); // On récupère le CSRF token
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF', error);
    throw error;  // Renvoyer l'erreur pour que l'appel API ne soit pas effectué sans CSRF
  }
};

// Intercepteur pour ajouter le token CSRF et le token d'authentification dans les en-têtes
axiosInstance.interceptors.request.use(
  async (config) => {
    // Assurez-vous que le CSRF token est disponible avant de faire une requête authentifiée
    if (!config.headers['X-XSRF-TOKEN']) {
      await getCsrfToken();  // Attendre que le token CSRF soit récupéré
    }

    // Ajouter le token d'accès dans le header Authorization si il existe
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Retourner la configuration modifiée de la requête
  },
  (error) => {
    return Promise.reject(error); // Retourner l'erreur en cas de problème
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,  // Si la réponse est correcte, on la retourne
  (error) => {
    if (error.response?.status === 401) {
      // Si une erreur 401 se produit, supprimer les tokens et rediriger vers la page de connexion
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Rediriger vers la page de login
    }

    if (error.response?.status === 419) {
      // Erreur 419 : Token CSRF invalide ou expiré
      console.error('Erreur CSRF : Il y a un problème avec le token CSRF.');
      window.location.href = '/login';  // Rediriger si le CSRF échoue
    }

    return Promise.reject(error);  // Retourner l'erreur si ce n'est pas géré ci-dessus
  }
);

export default axiosInstance;