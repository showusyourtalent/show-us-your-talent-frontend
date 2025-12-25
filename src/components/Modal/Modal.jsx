import React, { useEffect, useState } from 'react';
import {
  Backdrop,
  Fade,
  Box,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const paperUnfold = keyframes`
  0% { 
    transform: scale(0.3) rotate(-5deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1.05) rotate(1deg);
  }
  100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const Modal = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  backdropClose = true,
  animation = 'unfold',
  showLogo = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleBackdropClick = (event) => {
    if (backdropClose && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: { maxWidth: '500px', width: '95%' },
    md: { maxWidth: '700px', width: '95%' },
    lg: { maxWidth: '900px', width: '95%' },
    xl: { maxWidth: '1100px', width: '95%' },
    full: { maxWidth: '1400px', width: '95%' },
  };

  if (!open) return null;

  return (
    <Backdrop
      open={open}
      onClick={handleBackdropClick}
      sx={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        overflow: 'auto',
        py: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={isVisible} timeout={500}>
        <Box
          sx={{
            position: 'relative',
            ...sizeClasses[size],
            animation: `${paperUnfold} 0.6s ease-out`,
            margin: 'auto',
          }}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                padding: '20px 30px',
                position: 'relative',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Logo */}
              {showLogo && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 30,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <img 
                      src="/logo.png" 
                      alt="Logo" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <span style="color: white; font-size: 1.2rem; font-weight: bold; text-align: center">
                            SYT
                          </span>
                        `;
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Titre */}
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                {title}
              </Typography>

              {/* Bouton fermer */}
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  sx={{
                    position: 'absolute',
                    right: 15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-50%) rotate(90deg)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Content */}
            <Box
              sx={{
                padding: '30px',
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
                },
              }}
            >
              <Fade in={isVisible} timeout={700}>
                <Box>{children}</Box>
              </Fade>
            </Box>
          </Paper>

          {/* Instructions */}
          {backdropClose && (
            <Fade in={isVisible} timeout={1000}>
              <Typography
                sx={{
                  textAlign: 'center',
                  mt: 2,
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                }}
              >
                Cliquez en dehors pour fermer
              </Typography>
            </Fade>
          )}
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default Modal;