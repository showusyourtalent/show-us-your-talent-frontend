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
  Container,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  RocketLaunch as RocketIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis'),
});

// Animations personnalisées
const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(2deg); }
  50% { transform: translateY(0px) rotate(0deg); }
  75% { transform: translateY(-5px) rotate(-2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const paperUnfold = keyframes`
  0% { 
    transform: scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1.05) rotate(2deg);
    opacity: 0.8;
  }
  100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Animation d'entrée
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
    const result = await login(data.email, data.password);
    setLoading(false);
    
    if (result.success) {
      const user = result.user;
      
      // Redirection automatique selon le rôle
      if (user.roles && user.roles.includes('admin')) {
        navigate('/admin');
      } else if (user.roles && user.roles.includes('promoteur')) {
        navigate('/promoteur');
      } else if (user.roles && user.roles.includes('candidat')) {
        navigate('/candidat');
      } else {
        navigate('/dashboard');
      }
      
      toast.success('Connexion réussie !');
    }
  };

  return (
    <Backdrop
      open={showBackdrop}
      onClick={handleBackdropClick}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        overflow: 'auto',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, sm: 4 },
        }}
      >
        <Fade in={isVisible} timeout={500}>
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '90%', md: '800px' },
              margin: 'auto',
              animation: `${paperUnfold} 0.8s ease-out`,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(230, 184, 0, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                minHeight: { xs: 'auto', md: '600px' },
              }}
            >
              {/* Colonne gauche avec logo et informations */}
              <Box
                sx={{
                  width: { xs: '100%', md: '45%' },
                  background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                  padding: { xs: '30px 20px', sm: '40px 30px', md: '60px 40px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Bouton fermer */}
                <IconButton
                  onClick={handleClose}
                  sx={{
                    position: 'absolute',
                    top: { xs: 10, sm: 15 },
                    right: { xs: 10, sm: 15 },
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    zIndex: 10,
                  }}
                >
                  <CloseIcon />
                </IconButton>

                {/* Effet de vague */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 20,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderTopLeftRadius: { xs: '16px', md: '0' },
                    borderTopRightRadius: { xs: '16px', md: '0' },
                    borderBottomRightRadius: { md: '50%' },
                    transform: { md: 'rotate(-90deg) translateX(-50%)' },
                    transformOrigin: '0 0',
                    display: { xs: 'block', md: 'block' },
                  }}
                />

                <Slide in={isVisible} direction="down" timeout={700}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      width: '100%',
                      zIndex: 2,
                    }}
                  >
                    {/* Logo avec image */}
                    <Box
                      sx={{
                        width: { xs: 80, sm: 100, md: 120 },
                        height: { xs: 80, sm: 100, md: 120 },
                        background: 'linear-gradient(135deg, #e6b800 0%, #ffd700 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        border: '4px solid white',
                        overflow: 'hidden',
                        padding: { xs: '8px', sm: '10px' },
                      }}
                    >
                      <img 
                        src="/logo.png" 
                        alt="SYT Logo"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = 
                            `<span style="color: white; font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: bold">SYT</span>`;
                        }}
                      />
                    </Box>
                    
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      SHOW US YOUR TALENT
                    </Typography>
                    
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#ffd700',
                        mb: 3,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        fontWeight: 600,
                      }}
                    >
                      Montre nous ton talent
                    </Typography>
                    
                    <Box
                      sx={{
                        mt: { xs: 2, sm: 4 },
                        p: { xs: 2, sm: 3 },
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          mb: 2,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        <strong>Rejoignez la communauté</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        Connectez-vous pour accéder à votre espace personnel, suivre vos candidatures et découvrir de nouvelles opportunités.
                      </Typography>
                    </Box>
                  </Box>
                </Slide>
              </Box>

              {/* Colonne droite avec formulaire */}
              <Box
                sx={{
                  width: { xs: '100%', md: '55%' },
                  padding: { xs: '30px 20px', sm: '40px 30px', md: '60px 40px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: '#8B0000',
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    Connexion
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    Accédez à votre espace personnel
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Grow in={isVisible} timeout={900}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: '#e6b800' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            transition: 'all 0.3s',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e6b800',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B0000',
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          },
                        }}
                      />
                    </Grow>
                  </Box>

                  <Box sx={{ mb: { xs: 4, sm: 6 } }}>
                    <Grow in={isVisible} timeout={1100}>
                      <TextField
                        fullWidth
                        label="Mot de passe"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#e6b800' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ 
                                  color: '#666',
                                  padding: { xs: '4px', sm: '8px' }
                                }}
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
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e6b800',
                              },
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B0000',
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          },
                        }}
                      />
                    </Grow>
                  </Box>

                  <Box sx={{ 
                    textAlign: 'right', 
                    mb: { xs: 3, sm: 4 } 
                  }}>
                    <Zoom in={isVisible} timeout={1300}>
                      <Link
                        to="/forgot-password"
                        style={{
                          color: '#8B0000',
                          textDecoration: 'none',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s',
                          display: 'inline-block',
                          '&:hover': {
                            color: '#e6b800',
                            textDecoration: 'underline',
                            transform: 'translateX(2px)',
                          },
                        }}
                      >
                        Mot de passe oublié ?
                      </Link>
                    </Zoom>
                  </Box>

                  <Zoom in={isVisible} timeout={1500}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #e6b800 0%, #ffd700 100%)',
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: { xs: '14px', sm: '16px' },
                        textTransform: 'none',
                        boxShadow: '0 6px 20px rgba(230, 184, 0, 0.4)',
                        transition: 'all 0.3s',
                        minHeight: { xs: '48px', sm: '56px' },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
                          boxShadow: '0 8px 25px rgba(230, 184, 0, 0.6)',
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&.Mui-disabled': {
                          background: '#e0e0e0',
                        },
                      }}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RocketIcon />}
                    >
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </Zoom>

                  <Box sx={{ 
                    mt: { xs: 3, sm: 4 }, 
                    textAlign: 'center' 
                  }}>
                    <Fade in={isVisible} timeout={1700}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666', 
                          mb: 2,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Première connexion ?{' '}
                        <Link
                          to="/set-password"
                          style={{
                            color: '#8B0000',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: 'inherit',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Définir mon mot de passe
                        </Link>
                      </Typography>
                    </Fade>
                  </Box>

                  <Box sx={{ 
                    mt: { xs: 4, sm: 6 }, 
                    pt: { xs: 3, sm: 4 }, 
                    borderTop: '1px solid #eee' 
                  }}>
                    <Fade in={isVisible} timeout={1900}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666', 
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          Vous n'avez pas de compte ?
                        </Typography>
                        <Link to="/postuler" style={{ textDecoration: 'none' }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                              py: { xs: 1, sm: 1.5 },
                              borderRadius: '12px',
                              borderColor: '#8B0000',
                              color: '#8B0000',
                              fontWeight: 'bold',
                              textTransform: 'none',
                              fontSize: { xs: '13px', sm: '14px' },
                              transition: 'all 0.3s',
                              minHeight: { xs: '42px', sm: '48px' },
                              '&:hover': {
                                borderColor: '#e6b800',
                                color: '#e6b800',
                                backgroundColor: 'rgba(230, 184, 0, 0.05)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                            startIcon={<PersonIcon />}
                          >
                            Postuler à une édition
                          </Button>
                        </Link>
                      </Box>
                    </Fade>
                  </Box>
                </form>

                {/* Support responsive */}
                <Box sx={{ 
                  mt: { xs: 3, sm: 4 }, 
                  display: { xs: 'block', md: 'none' } 
                }}>
                  <Fade in={isVisible} timeout={2000}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: '12px',
                      }}
                    >
                      Besoin d'aide ? Contactez-nous à support@syt.com
                    </Typography>
                  </Fade>
                </Box>
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
                  borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                  zIndex: -1,
                }}
              >
                {/* Particules flottantes */}
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      width: Math.random() * 10 + 5,
                      height: Math.random() * 10 + 5,
                      background: i % 2 === 0 ? '#e6b800' : '#8B0000',
                      borderRadius: '50%',
                      opacity: 0.3,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `${floatAnimation} ${Math.random() * 10 + 10}s infinite ease-in-out`,
                      animationDelay: `${Math.random() * 5}s`,
                      display: { xs: 'none', sm: 'block' },
                    }}
                  />
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
                  fontSize: { xs: '11px', sm: '12px' },
                }}
              >
                {isMobile ? 'Touchez en dehors pour fermer' : 'Cliquez en dehors du formulaire pour fermer'}
              </Typography>
            </Fade>
          </Box>
        </Fade>
      </Container>
    </Backdrop>
  );
};

export default Login;