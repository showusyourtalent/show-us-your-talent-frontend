import React, { lazy, Suspense } from 'react';
import { Alert } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext'; // Importez seulement le Provider
import { LoadingProvider } from './contexts/LoadingContext';
import { SocketProvider } from './contexts/SocketContext';
import { queryClient } from './lib/react-query';
import Layout from './components/Layout/Layout';

// Importez tous les composants qui utilisent useAuth séparément
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SetPassword from './pages/auth/SetPassword';
import Postuler from './pages/candidat/Postuler';
import Editions from './pages/Editions';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import PromoteurDashboard from './pages/dashboard/PromoteurDashboard';
import CandidatDashboard from './pages/dashboard/CandidatDashboard';
import Profile from './pages/Profile';
import EditionForm from './pages/promoteur/EditionForm';
import GestionEditions from './pages/promoteur/GestionEditions';
import ValidationCandidatures from './pages/promoteur/ValidationCandidatures';
import CandidatsPage from './pages/CandidatsPage';
import DiscussionsPage from './pages/DiscussionsPage';
const PaymentModal = lazy(() => import('./pages/PaymentModal'));
const VoteSuccessPage = lazy(() => import('./pages/VoteSuccessPage'));
const PaymentErrorPage = lazy(() => import('./pages/PaymentErrorPage'));
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';

// Créez un fichier séparé pour les composants qui utilisent useAuth
import DashboardSelection from './components/DashboardSelection';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';

// Créez un composant de chargement simple
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

const LoadingFallback = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <CircularProgress />
  </Box>
);

// Main App Content - sans providers ici
const AppContent = () => {
  return (
    <div className="App">
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/payment/:candidatId" element={<PaymentPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/candidats" element={<CandidatsPage />} />
          <Route path="/editions" element={<Editions />} />
          <Route path="/postuler" element={<Postuler />} />
          
          {/* Route de redirection après login */}
          <Route path="/auth-redirect" element={<AuthRedirect />} />

          {/* Routes admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
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
            path="/promoteur/editions"
            element={
              <ProtectedRoute roles={['promoteur']}>
                <GestionEditions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/discussions"
            element={
              <ProtectedRoute>
                <DiscussionsPage />
              </ProtectedRoute>
            }
          />
          
            <Route path="/vote/success" element={<VoteSuccessPage />} />
            <Route path="/vote/error" element={<PaymentErrorPage />} />
         
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
        </Suspense>
      </Layout>
    </div>
  );
};

// Main App avec tous les providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <LoadingProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </LoadingProvider>
        </AuthProvider>
      </Router>

    </QueryClientProvider>
  );
}

export default App;