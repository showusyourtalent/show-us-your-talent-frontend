import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import { Box, keyframes, Typography } from '@mui/material';
import { useLoading } from '../../contexts/LoadingContext';

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
`;

// ==================== LOADING INDICATOR COMPONENT ====================
export const LoadingIndicator = ({ size = 'medium', color = '#D97706' }) => {
  const sizes = {
    small: { width: 24, height: 24, borderWidth: 2 },
    medium: { width: 32, height: 32, borderWidth: 2 },
    large: { width: 40, height: 40, borderWidth: 2 }
  };

  const { width, height, borderWidth } = sizes[size];

  return (
    <Box
      sx={{
        display: 'inline-block',
        position: 'relative',
        width,
        height,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `${borderWidth}px solid rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`,
          borderRadius: '50%',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `${borderWidth}px solid transparent`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: `${rotateAnimation} 0.8s linear infinite`,
        }}
      />
    </Box>
  );
};

// ==================== LOADING OVERLAY COMPONENT ====================
export const LoadingOverlay = ({ message = "Chargement en cours..." }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <Box sx={{ position: 'relative', width: 64, height: 64 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '50%',
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid transparent',
              borderTopColor: '#D97706',
              borderRadius: '50%',
              animation: `${rotateAnimation} 1s linear infinite`,
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 4,
              height: 4,
              backgroundColor: '#D97706',
              borderRadius: '50%',
              animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
            }}
          />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 500,
              letterSpacing: '0.5px',
              marginBottom: 1,
              fontSize: '1.125rem',
            }}
          >
            {message}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.3px',
              fontSize: '0.875rem',
            }}
          >
            Veuillez patienter quelques instants
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 6,
                height: 6,
                backgroundColor: '#D97706',
                borderRadius: '50%',
                opacity: 0.7,
                animation: `${pulseAnimation} 1s ease-in-out infinite`,
                animationDelay: `${dot * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// ==================== MAIN LAYOUT COMPONENT ====================
const Layout = ({ children, isModalOpen = false }) => {
  const { loading, loadingMessage } = useLoading();
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInternalLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const showLoading = loading || internalLoading;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showLoading && <LoadingOverlay message={loadingMessage} />}
      
      <Header />
      
      <main 
        className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 transition-all duration-300 ${
          isModalOpen || showLoading ? 'opacity-50' : ''
        }`}
        style={{ pointerEvents: isModalOpen || showLoading ? 'none' : 'auto' }}
      >
        {internalLoading ? <LoadingScreen /> : children}
      </main>
      
      <Footer />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            color: '#fff',
            border: '1px solid #D97706',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: { primary: '#D97706', secondary: '#fff' },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;