import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

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
  const [initialized, setInitialized] = useState(false);
  
  // Fonction pour vérifier l'authentification
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const response = await axios.get('/user');
      
      if (response.data.success && response.data.user) {
        // NORMALISER LA STRUCTURE DE L'UTILISATEUR
        const normalizedUser = normalizeUserData(response.data.user);
        setUser(normalizedUser);
        console.log('User authenticated:', normalizedUser);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Normaliser les données utilisateur
  const normalizeUserData = (userData) => {
    if (!userData) return null;
    
    let roles = [];
    
    // Si les rôles existent déjà sous forme d'array
    if (userData.roles && Array.isArray(userData.roles)) {
      roles = userData.roles.map(role => {
        if (typeof role === 'object' && role.name) {
          return role.name;
        }
        return role;
      });
    }
    
    // Si pas de rôles, utiliser type_compte
    if (roles.length === 0 && userData.type_compte) {
      roles = [userData.type_compte];
    }
    
    return {
      ...userData,
      roles: roles
    };
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email: email.trim(),
        password: password
      });

      if (response.data.success && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        // Normaliser les données utilisateur
        const normalizedUser = normalizeUserData(response.data.user);
        setUser(normalizedUser);
        
        console.log('Login successful, user:', normalizedUser);
        
        return { 
          success: true, 
          user: normalizedUser,
          message: 'Connexion réussie'
        };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Identifiants incorrects' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erreur de connexion';
      
      if (error.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.response?.status === 422) {
        errorMessage = 'Données de connexion invalides';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur';
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('/auth/logout');
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  // Fonction améliorée pour vérifier les rôles
  const hasRole = (role) => {
    if (!user) return false;
    
    console.log('Checking role:', {
      requiredRole: role,
      userRoles: user.roles,
      type_compte: user.type_compte,
      user: user
    });
    
    // Vérifier dans les rôles
    if (user.roles && Array.isArray(user.roles)) {
      const hasRole = user.roles.includes(role);
      console.log('Role check result from roles array:', hasRole);
      if (hasRole) return true;
    }
    
    // Vérifier type_compte
    if (user.type_compte === role) {
      console.log('Role matched from type_compte');
      return true;
    }
    
    // Vérifier les alias de rôles
    const roleAliases = {
      'admin': ['administrator', 'superadmin'],
      'promoteur': ['organizer', 'promoter'],
      'candidat': ['candidate', 'participant']
    };
    
    if (roleAliases[role]) {
      const hasAlias = roleAliases[role].some(alias => {
        if (user.roles && user.roles.includes(alias)) return true;
        if (user.type_compte === alias) return true;
        return false;
      });
      
      if (hasAlias) {
        console.log('Role matched from alias');
        return true;
      }
    }
    
    console.log('Role not found');
    return false;
  };

  // Vérifier si l'utilisateur a au moins un rôle parmi une liste
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(role => hasRole(role));
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('/user');
      if (response.data.success && response.data.user) {
        const normalizedUser = normalizeUserData(response.data.user);
        setUser(normalizedUser);
        return normalizedUser;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    logout,
    getToken,
    hasRole,
    hasAnyRole,
    refreshUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};