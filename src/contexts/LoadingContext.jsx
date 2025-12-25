import React, { createContext, useState, useContext, useRef } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Chargement en cours...");
  const timeoutRef = useRef(null);

  // Fonction pour arrêter le loading avec sécurité
  const stopLoading = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLoading(false);
  };

  const showLoading = (message = "Chargement en cours...", maxDuration = 5000) => {
    // Arrêter tout loading précédent
    stopLoading();
    
    setLoadingMessage(message);
    setLoading(true);
    
    // Timeout de sécurité pour éviter les boucles infinies
    timeoutRef.current = setTimeout(() => {
      console.warn('Loading timeout after', maxDuration, 'ms');
      stopLoading();
    }, maxDuration);
  };

  const hideLoading = () => {
    stopLoading();
  };

  // Nettoyer le timeout lors du démontage
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ 
      loading, 
      loadingMessage, 
      showLoading, 
      hideLoading,
      stopLoading, // Ajouté pour un arrêt forcé
      setLoading,
      setLoadingMessage 
    }}>
      {children}
    </LoadingContext.Provider>
  );
};