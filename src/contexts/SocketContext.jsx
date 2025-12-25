import React, { createContext, useContext, useState, useEffect } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Simulation de connexion socket - à remplacer par une vraie connexion si nécessaire
  useEffect(() => {
    // Simuler une connexion
    const timer = setTimeout(() => {
      setIsConnected(true);
      console.log('Socket simulé connecté');
    }, 1000);

    // Charger les notifications initiales
    const loadInitialNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/chat/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const unreadCount = data.notifications?.filter(n => !n.is_read).length || 0;
            setNotificationsCount(unreadCount);
          }
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      }
    };

    loadInitialNotifications();

    return () => {
      clearTimeout(timer);
      setIsConnected(false);
    };
  }, []);

  const value = {
    notificationsCount,
    setNotificationsCount,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};