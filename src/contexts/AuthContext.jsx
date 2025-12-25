// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      // Valider le token avec le serveur
      await axiosInstance.get('/auth/verify');
      
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token invalide:', error);
      logout(); // Déconnexion automatique
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password, deviceName = 'browser') => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
        device_name: deviceName,
      });

      const { token, user: userData } = response.data;
      
      // Normaliser les rôles
      const normalizedUser = {
        ...userData,
        roleNames: Array.isArray(userData.roles) 
          ? userData.roles.map(role => typeof role === 'object' ? role.name : role)
          : []
      };
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Définir le token par défaut pour axios
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      
      toast.success('Connexion réussie !');
      return { success: true, user: normalizedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      return { success: false, error: error.response?.data };
    }
  };

  const setPassword = async (email, password, deviceName = 'browser') => {
    try {
      const response = await axiosInstance.post('/auth/set-password', {
        email,
        password,
        device_name: deviceName,
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Mot de passe défini avec succès !');
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
      return { success: false, error: error.response?.data };
    }
  };

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('refresh_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Déconnexion réussie');
    }
  }, []);

  const updateProfile = async (data) => {
    try {
      const response = await axiosInstance.put('/candidat/mon-profil', data);
      const updatedUser = { ...user, ...data };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profil mis à jour avec succès');
      return { success: true, user: updatedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de mise à jour');
      return { success: false, error: error.response?.data };
    }
  };

  const hasRole = (role) => {
    if (!user?.roleNames) return false;
    return user.roleNames.includes(role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    setPassword,
    updateProfile,
    hasRole,
    isAdmin: hasRole('admin'),
    isPromoteur: hasRole('promoteur'),
    isCandidat: hasRole('candidat'),
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// SUPPRIMEZ LE RESTE DE L'IMPORT ICI