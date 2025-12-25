import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { SocketProvider } from './contexts/SocketContext';
import { queryClient } from './lib/react-query';
import Header from './components/Layout/Header';
import Layout from './components/Layout/Layout';
import CandidatsPage from './pages/CandidatsPage';
import { 
  Dashboard as DashboardIcon, 
  Group as GroupIcon, 
  Person as PersonIcon, 
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';

// Pages publiques
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SetPassword from './pages/auth/SetPassword';
import Postuler from './pages/candidat/Postuler';
import Editions from './pages/Editions';

// Pages protégées
import AdminDashboard from './pages/dashboard/AdminDashboard';
import PromoteurDashboard from './pages/dashboard/PromoteurDashboard';
import CandidatDashboard from './pages/dashboard/CandidatDashboard';
import Profile from './pages/Profile';

// Pages promoteur
import EditionForm from './pages/promoteur/EditionForm';
import GestionEditions from './pages/promoteur/GestionEditions';
import ValidationCandidatures from './pages/promoteur/ValidationCandidatures';

// Composant de protection de route
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    return <Navigate to="/" />;
  }

  return children;
};

// Composant Dashboard de sélection
const DashboardSelection = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <DashboardIcon className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-red-800 bg-clip-text text-transparent mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600 mb-8">
            Sélectionnez votre espace selon votre rôle
          </p>
        </div>

        <div className="space-y-4">
          {user?.roles?.includes('admin') && (
            <button
              onClick={() => window.location.href = '/admin'}
              className="w-full p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left group transition-all"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center mr-4">
                  <DashboardIcon className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-red-800">
                    Espace Administrateur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gestion complète de la plateforme
                  </p>
                </div>
                <ArrowForwardIcon className="ml-auto text-gray-400 group-hover:text-red-800" />
              </div>
            </button>
          )}

          {user?.roles?.includes('promoteur') && (
            <button
              onClick={() => window.location.href = '/promoteur'}
              className="w-full p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left group transition-all"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mr-4">
                  <GroupIcon className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-yellow-600">
                    Espace Promoteur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gérez vos éditions et candidatures
                  </p>
                </div>
                <ArrowForwardIcon className="ml-auto text-gray-400 group-hover:text-yellow-600" />
              </div>
            </button>
          )}

          {user?.roles?.includes('candidat') && (
            <button
              onClick={() => window.location.href = '/candidat'}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left group transition-all"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <PersonIcon className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600">
                    Espace Candidat
                  </h3>
                  <p className="text-sm text-gray-600">
                    Suivez vos candidatures et votes
                  </p>
                </div>
                <ArrowForwardIcon className="ml-auto text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
          )}

          <button
            onClick={() => window.location.href = '/profile'}
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left group transition-all"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                <PersonIcon className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Mon Profil
                </h3>
                <p className="text-sm text-gray-600">
                  Gérez vos informations personnelles
                </p>
              </div>
              <ArrowForwardIcon className="ml-auto text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Home />} />
      <Route path="/candidats" element={<CandidatsPage />} />
      <Route path="/editions" element={<Editions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/postuler" element={<Postuler />} />

      {/* Routes admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/promoteur/editions"
        element={
          <ProtectedRoute roles={['promoteur']}>
            <GestionEditions />
          </ProtectedRoute>
        }
      />

      {/* Routes promoteur */}
      <Route
        path="/promoteur"
        element={
          <ProtectedRoute roles={['promoteur']}>
            <PromoteurDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promoteur/editions/nouvelle"
        element={
          <ProtectedRoute roles={['promoteur']}>
            <EditionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promoteur/editions/:id/modifier"
        element={
          <ProtectedRoute roles={['promoteur']}>
            <EditionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promoteur/editions/:editionId/candidatures"
        element={
          <ProtectedRoute roles={['promoteur']}>
            <ValidationCandidatures />
          </ProtectedRoute>
        }
      />

      {/* Routes candidat */}
      <Route
        path="/candidat"
        element={
          <ProtectedRoute roles={['candidat']}>
            <CandidatDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Routes communes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardSelection />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Route 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <LoadingProvider>
            <SocketProvider>
              <div className="App">
                <Layout>
                  <AppRoutes />
                </Layout>
              </div>
            </SocketProvider>
          </LoadingProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;