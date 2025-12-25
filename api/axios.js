import axios from 'axios';

// Configuration de base - utiliser window.APP_CONFIG si défini, sinon valeurs par défaut
const getBaseURL = () => {
  // Si vous avez une config globale définie dans votre index.html
  if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  
  // Par défaut, utiliser l'URL de développement
  return 'http://localhost:8000/api';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 secondes timeout
});

// Intercepteur pour ajouter le token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
instance.interceptors.response.use(
  (response) => {
    // Vous pouvez traiter la réponse ici si nécessaire
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Non autorisé - déconnexion
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Rediriger vers la page de login seulement si on n'est pas déjà dessus
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Accès interdit
          console.error('Accès interdit:', data.message || 'Vous n\'avez pas les permissions nécessaires');
          break;
          
        case 404:
          // Ressource non trouvée
          console.error('Ressource non trouvée:', data.message || 'La ressource demandée n\'existe pas');
          break;
          
        case 422:
          // Erreur de validation
          console.error('Erreur de validation:', data.errors || data.message);
          break;
          
        case 500:
          // Erreur serveur
          console.error('Erreur serveur:', data.message || 'Une erreur est survenue sur le serveur');
          break;
          
        default:
          console.error('Erreur inconnue:', data.message || 'Une erreur est survenue');
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Pas de réponse du serveur:', error.message);
      
      // Afficher une notification à l'utilisateur
      if (!window.location.pathname.includes('/login')) {
        // Vous pouvez afficher une notification ici
        const event = new CustomEvent('showNotification', {
          detail: {
            type: 'error',
            message: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.'
          }
        });
        window.dispatchEvent(event);
      }
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Méthodes utilitaires
instance.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete instance.defaults.headers.common['Authorization'];
  }
};

instance.removeAuthToken = () => {
  localStorage.removeItem('token');
  delete instance.defaults.headers.common['Authorization'];
};

// Vérifier si un token existe déjà au chargement
const existingToken = localStorage.getItem('token');
if (existingToken) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
}

export default instance;