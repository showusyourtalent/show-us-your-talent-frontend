import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Fade,
  Slide,
  Grow,
  Zoom,
  Backdrop,
  Paper,
  Box,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
  Key as KeyIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string()
    .min(8, 'Minimum 8 caractères')
    .required('Mot de passe requis'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation requise'),
});

// Animation de rotation de clé
const keyRotation = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
`;

const SetPassword = () => {
  const { setPassword } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setShowBackdrop(false);
    setTimeout(() => navigate('/'), 300);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    const result = await setPassword(data.email, data.password);
    setLoading(false);
    
    if (result.success) {
      const user = result.user;
      
      if (user.roles && user.roles.includes('candidat')) {
        navigate('/candidat');
      } else if (user.roles && user.roles.includes('promoteur')) {
        navigate('/promoteur');
      } else if (user.roles && user.roles.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
      toast.success('Mot de passe défini avec succès !');
    } else {
      setError(result.error?.message || 'Erreur lors de la définition du mot de passe');
    }
  };

  return (
    <Backdrop
      open={showBackdrop}
      onClick={handleBackdropClick}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
      }}
    >
      <Fade in={isVisible} timeout={500}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '450px',
            margin: 'auto',
            animation: 'paperUnfold 0.8s ease-out',
            '@keyframes paperUnfold': {
              '0%': { 
                transform: 'scale(0.3) rotate(-10deg)',
                opacity: 0,
              },
              '50%': { 
                transform: 'scale(1.05) rotate(2deg)',
                opacity: 0.8,
              },
              '100%': { 
                transform: 'scale(1) rotate(0deg)',
                opacity: 1,
              },
            },
          }}
        >
          {/* Animation de clé qui tourne */}
          <Box
            sx={{
              position: 'absolute',
              top: -80,
              left: '50%',
              transform: 'translateX(-50%)',
              animation: `${keyRotation} 4s linear infinite`,
              zIndex: 1,
            }}
          >
            <SecurityIcon
              sx={{
                fontSize: 80,
                color: '#e6b800',
                filter: 'drop-shadow(0 5px 15px rgba(230, 184, 0, 0.5))',
              }}
            />
          </Box>

          <Paper
            elevation={24}
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(139, 0, 0, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                padding: '30px 20px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: 0,
                  right: 0,
                  height: 20,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderTopLeftRadius: '50%',
                  borderTopRightRadius: '50%',
                }}
              />
              
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>

              <Slide in={isVisible} direction="down" timeout={700}>
                <Box>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                      border: '4px solid white',
                    }}
                  >
                    <KeyIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      mb: 1,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    Définir mon mot de passe
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      maxWidth: '300px',
                      margin: '0 auto',
                    }}
                  >
                    Première connexion ? Définissez votre mot de passe
                  </Typography>
                </Box>
              </Slide>
            </Box>

            <Box sx={{ padding: '40px 30px' }}>
              {error && (
                <Slide in={!!error} direction="down">
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: '12px',
                      animation: 'shake 0.5s',
                      '@keyframes shake': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '25%': { transform: 'translateX(-5px)' },
                        '75%': { transform: 'translateX(5px)' },
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Slide>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ mb: 4 }}>
                  <Grow in={isVisible} timeout={900}>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#8B0000' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.3s',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B0000',
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8B0000',
                        },
                      }}
                    />
                  </Grow>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Grow in={isVisible} timeout={1100}>
                    <TextField
                      fullWidth
                      label="Nouveau mot de passe *"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#8B0000' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: '#666' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.3s',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B0000',
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8B0000',
                        },
                      }}
                    />
                  </Grow>
                </Box>

                <Box sx={{ mb: 6 }}>
                  <Grow in={isVisible} timeout={1300}>
                    <TextField
                      fullWidth
                      label="Confirmer le mot de passe *"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('password_confirmation')}
                      error={!!errors.password_confirmation}
                      helperText={errors.password_confirmation?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#8B0000' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: '#666' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.3s',
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B0000',
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8B0000',
                        },
                      }}
                    />
                  </Grow>
                </Box>

                <Zoom in={isVisible} timeout={1500}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      textTransform: 'none',
                      boxShadow: '0 6px 20px rgba(139, 0, 0, 0.4)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7a0000 0%, #b42828 100%)',
                        boxShadow: '0 8px 25px rgba(139, 0, 0, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        background: '#e0e0e0',
                      },
                    }}
                  >
                    {loading ? 'En cours...' : 'Définir le mot de passe'}
                  </Button>
                </Zoom>

                <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #eee' }}>
                  <Fade in={isVisible} timeout={1700}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Vous avez déjà un mot de passe ?{' '}
                        <Link
                          to="/login"
                          style={{
                            color: '#e6b800',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Se connecter
                        </Link>
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              </form>
            </Box>

            {/* Effets décoratifs */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: '20px',
                zIndex: -1,
              }}
            >
              {/* Effet de sécurité (cadenas animés) */}
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    fontSize: 20,
                    color: i % 2 === 0 ? '#e6b800' : '#8B0000',
                    opacity: 0.2,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 8 + 8}s infinite ease-in-out`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                >
                  🔒
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Instructions visuelles */}
          <Fade in={isVisible} timeout={2000}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 2,
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
              }}
            >
              Cliquez en dehors du formulaire pour fermer
            </Typography>
          </Fade>
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default SetPassword;