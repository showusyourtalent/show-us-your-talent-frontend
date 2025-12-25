import React, { createContext, useContext, useEffect, useState } from 'react';

const SimplifiedSocketContext = createContext();

export const useSimplifiedSocket = () => useContext(SimplifiedSocketContext);

export const SimplifiedSocketProvider = ({ children }) => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    // Démarrer le polling pour les notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Toutes les 30 secondes

    setPollingInterval(interval);

    // Charger les notifications immédiatement
    fetchNotifications();

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/chat/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const unreadCount = data.notifications.filter(n => !n.is_read).length;
          setNotificationsCount(unreadCount);
        }
      }
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
    }
  };

  const value = {
    notificationsCount,
    setNotificationsCount,
    fetchNotifications,
  };

  return (
    <SimplifiedSocketContext.Provider value={value}>
      {children}
    </SimplifiedSocketContext.Provider>
  );
};