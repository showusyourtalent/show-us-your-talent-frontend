import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Chip,
  Skeleton,
  IconButton,
  useMediaQuery,
  useTheme,
  Fade,
  Zoom,
  Slide,
  Container,
  Avatar,
  Stack,
  Dialog,
  DialogContent,
  Backdrop,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  VolumeUp as VolumeIcon,
  Restaurant as FoodIcon,
  Mic as MicIcon,
  FormatQuote as QuoteIcon,
  Close as CloseIcon,
  Pause as PauseIcon,
  PlayCircleOutline as PlayCircleIcon,
  Fullscreen as FullscreenIcon,
  Expand as ExpandIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  Replay as ReplayIcon,
  FastForward as FastForwardIcon,
  FastRewind as FastRewindIcon,
  FiberManualRecord as LiveIcon,
  Style as StyleIcon,
  PhotoLibrary as GalleryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  YouTube as YouTubeIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

// ==================== ANIMATIONS ====================
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const modalOpenAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  50% {
    opacity: 1;
    transform: scale(1.02) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const videoFadeIn = keyframes`
  from {
    opacity: 0;
    filter: blur(10px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
`;

const glowAnimation = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.5),
                0 0 40px rgba(212, 175, 55, 0.3),
                0 0 60px rgba(212, 175, 55, 0.1); 
  }
  50% { 
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.7),
                0 0 60px rgba(212, 175, 55, 0.5),
                0 0 90px rgba(212, 175, 55, 0.3); 
  }
`;

const youtubePulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  50% { 
    box-shadow: 0 0 0 20px rgba(255, 0, 0, 0);
  }
`;

// ==================== MODAL VIDÉO YouTube ====================
const VideoModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const modalRef = useRef(null);

  // ID YouTube extrait du lien
  const youtubeUrl = "https://youtu.be/5dXJHxRhv20?feature=shared";
  const getYouTubeId = (url) => {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const youtubeId = getYouTubeId(youtubeUrl);
  const embedUrl = youtubeId 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`
    : null;

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen();
      } else if (modalRef.current?.webkitRequestFullscreen) {
        modalRef.current.webkitRequestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setFullscreen(false);
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      setVideoError(false);
      
      // Précharger l'iframe
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleIframeError = () => {
    setVideoError(true);
    setLoading(false);
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          margin: 0,
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          animation: open ? `${modalOpenAnimation} 0.5s ease-out forwards` : 'none',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.98)',
          backdropFilter: 'blur(10px)',
          transition: 'opacity 0.5s ease',
        },
      }}
    >
      <DialogContent 
        ref={modalRef}
        sx={{ 
          p: 0, 
          position: 'relative',
          width: '100%',
          height: '100%',
          bgcolor: '#000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Overlay de chargement */}
        {loading && (
          <Backdrop
            open={loading}
            sx={{
              position: 'absolute',
              zIndex: 1000,
              bgcolor: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${fadeInUp} 0.3s ease-out`,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '4px solid rgba(255, 0, 0, 0.2)',
                  borderTopColor: '#FF0000',
                  animation: `${rotateAnimation} 1s linear infinite`,
                  mb: 3,
                  mx: 'auto',
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FF0000', 
                  fontWeight: 'bold',
                  animation: `${pulseAnimation} 2s infinite`,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Chargement de la vidéo YouTube...
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                La rétrospective Show Your Talent 2025
              </Typography>
            </Box>
          </Backdrop>
        )}

        {/* Message d'erreur */}
        {videoError && (
          <Backdrop
            open={videoError}
            sx={{
              position: 'absolute',
              zIndex: 1000,
              bgcolor: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${fadeInUp} 0.3s ease-out`,
            }}
          >
            <Box sx={{ textAlign: 'center', p: 3, maxWidth: '400px' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mx: 'auto',
                  animation: `${pulseAnimation} 2s infinite`,
                }}
              >
                <YouTubeIcon sx={{ fontSize: 40, color: '#FF0000' }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FF0000', 
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Impossible de charger la vidéo YouTube
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  mb: 3,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  textAlign: 'center'
                }}
              >
                La vidéo n'a pas pu être chargée. Vous pouvez essayer de :
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  1. Vérifier votre connexion internet
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  2. Ouvrir directement sur YouTube
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setVideoError(false);
                    setLoading(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
                    },
                  }}
                >
                  Réessayer
                </Button>
                {youtubeId && (
                  <Button
                    variant="outlined"
                    href={`https://www.youtube.com/watch?v=${youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderColor: '#FF0000',
                      color: '#FF0000',
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      },
                    }}
                  >
                    Ouvrir sur YouTube
                  </Button>
                )}
              </Box>
            </Box>
          </Backdrop>
        )}

        {/* Boutons de contrôle */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: 100,
            display: 'flex',
            gap: 1,
            opacity: 0.9,
            animation: open ? `${fadeInUp} 0.5s ease-out 0.3s forwards` : 'none',
            transform: 'translateY(-20px)',
            '&:hover': { opacity: 1 },
          }}
        >
          {embedUrl && (
            <IconButton
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: 'rgba(255, 0, 0, 0.7)',
                color: 'white',
                width: { xs: 36, sm: 48 },
                height: { xs: 36, sm: 48 },
                transition: 'all 0.3s ease',
                animation: `${youtubePulse} 2s infinite`,
                '&:hover': { 
                  bgcolor: 'rgba(255, 0, 0, 0.9)',
                  transform: 'scale(1.1)',
                  animation: 'none',
                },
              }}
            >
              <YouTubeIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          )}
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              width: { xs: 36, sm: 48 },
              height: { xs: 36, sm: 48 },
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: 'rgba(212, 175, 55, 0.9)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <FullscreenIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: 'rgba(139, 0, 0, 0.7)',
              color: 'white',
              width: { xs: 36, sm: 48 },
              height: { xs: 36, sm: 48 },
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: 'rgba(139, 0, 0, 0.9)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </Box>

        {/* Contenu principal - Iframe YouTube */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: open && !loading ? `${videoFadeIn} 0.8s ease-out forwards` : 'none',
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
        >
          {embedUrl ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                paddingTop: '56.25%', // Ratio 16:9
                overflow: 'hidden',
              }}
            >
              <iframe
                src={embedUrl}
                title="Show Your Talent 2025 - Rétrospective"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: fullscreen ? 0 : '8px',
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                loading="eager"
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
              <YouTubeIcon sx={{ fontSize: 60, color: '#FF0000', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Lien YouTube invalide
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Le lien de la vidéo YouTube n'est pas valide.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Message d'informations */}
        {!loading && !videoError && (
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 16, sm: 24 },
              left: { xs: 16, sm: 24 },
              right: { xs: 16, sm: 24 },
              zIndex: 50,
              animation: open ? `${fadeInUp} 0.5s ease-out 0.5s forwards` : 'none',
              opacity: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                }}
              >
                <YouTubeIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                Rétrospective Show Your Talent 2025
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                Utilisez les contrôles YouTube pour la lecture
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [animate, setAnimate] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Récupérer les éditions ouvertes
  const { 
    data: editionsData, 
    isLoading: editionsLoading, 
    isError: editionsError 
  } = useQuery({
    queryKey: ['editions-ouvertes'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/candidat/editions-ouvertes');
        console.log('Éditions ouvertes API response:', response.data);
        return response.data.data || response.data || [];
      } catch (error) {
        console.error('Error fetching editions:', error);
        // Fallback data pour le développement
        return [
          {
            id: 1,
            nom: "Show Your Talent Édition 2025",
            annee: 2025,
            numero_edition: 2,
            description: "La plus grande compétition de talents au Bénin. Venez montrer votre talent au monde entier.",
            date_fin_inscriptions: "2025-12-31T23:59:59",
            date_debut_inscriptions: "2025-01-01T00:00:00",
            statut: "active",
            inscriptions_ouvertes: true,
            categories_count: 5,
            candidatures_count: 45,
            categories: ["Chant", "Danse", "Cuisine", "Slam", "Mode"]
          }
        ];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Traitement des données des éditions
  const editions = React.useMemo(() => {
    if (!editionsData || !Array.isArray(editionsData)) return [];
    
    return editionsData.map(edition => {
      // Calculer les jours restants
      let joursRestants = 0;
      if (edition.date_fin_inscriptions) {
        const endDate = new Date(edition.date_fin_inscriptions);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        joursRestants = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        id: edition.id || edition._id,
        nom: edition.nom || 'Édition sans nom',
        annee: edition.annee || new Date().getFullYear(),
        numero_edition: edition.numero_edition || 1,
        description: edition.description || '',
        date_fin_inscriptions: edition.date_fin_inscriptions,
        date_debut_inscriptions: edition.date_debut_inscriptions,
        statut: edition.statut || 'active',
        inscriptions_ouvertes: edition.inscriptions_ouvertes !== false,
        categories_count: edition.categories_count || (Array.isArray(edition.categories) ? edition.categories.length : 0),
        candidatures_count: edition.candidatures_count || 0,
        categories: Array.isArray(edition.categories) ? edition.categories : [],
        jours_restants: joursRestants
      };
    }).filter(edition => edition.inscriptions_ouvertes && edition.statut === 'active');
  }, [editionsData]);

  const hasOpenEditions = editions.length > 0;
  const firstOpenEdition = editions[0] || null;

  // Données des gagnants 2025
  const winners2025 = [
    {
      id: 1,
      name: "Sabine Loréate GBETCHI",
      category: "Cuisine - Art Culinaire",
      position: "1ère Place",
      image: "/cuisine.png",
      icon: <FoodIcon />,
      color: "#D4AF37",
      quote: "La cuisine est l'art de transformer l'ordinaire en extraordinaire.",
      achievements: "Recette signature : 'Le Soufflé Doré'"
    },
    {
      id: 2,
      name: "Dhalia AWALA",
      category: "Voix - Chant",
      position: "1ère Place",
      image: "/voix.png",
      icon: <VolumeIcon />,
      color: "#8B0000",
      quote: "Ma voix est mon instrument, mon cœur est la partition.",
      achievements: "Performance : 'L'Ave Maria' revisité"
    },
    {
      id: 3,
      name: "Mahougnon BIGUEZOTON",
      category: "Slam - Poésie",
      position: "2ère Place",
      image: "/slam.png",
      icon: <MicIcon />,
      color: "#1a237e",
      quote: "Les mots sont des armes de construction massive.",
      achievements: "Poème : 'Les Rêves d'une Génération'"
    },
    {
      id: 4,
      name: "Perpétue AGASSOUNON",
      category: "Mode et Vêtements",
      position: "1ère Place",
      image: "/mode.png",
      icon: <StyleIcon />,
      color: "#9c27b0",
      quote: "La mode est le miroir de l'âme, chaque création raconte une histoire.",
      achievements: "Collection : 'Les Échos du Bénin'"
    }
  ];

  // Galerie photos des souvenirs
  const galleryPhotos = [
    {
      id: 1,
      image: "/image1.png",
      title: "Le DJ même en action",
      description: "Le début d'une aventure extraordinaire",
      date: "Juin 2025"
    },
    {
      id: 2,
      image: "/image2.png",
      title: "Le comité",
      description: "Des talents qui éblouissent le public",
      date: "Juin 2025"
    },
    {
      id: 3,
      image: "/image3.png",
      title: "Délibérations du jury",
      description: "Des moments de tension et d'émotion",
      date: "Juin 2025"
    },
    {
      id: 4,
      image: "/image4.png",
      title: "Cérémonie de clôture",
      description: "Remise des prix et célébration",
      date: "Juin 2025"
    }
  ];

  // Statistiques
  const stats = [
    { 
      icon: <TrophyIcon />, 
      value: '2', 
      label: 'Éditions',
      sublabel: 'Dont 1ère édition en Juin 2025',
      color: '#D4AF37',
    },
    { 
      icon: <PeopleIcon />, 
      value: '70', 
      label: 'Talents découverts',
      sublabel: '21 en 2025',
      color: '#8B0000',
    },
    { 
      icon: <TrendingIcon />, 
      value: '7,2K', 
      label: 'Votes enregistrés',
      sublabel: 'Record en 2025',
      color: '#D4AF37',
    },
    { 
      icon: <StarIcon />, 
      value: '3', 
      label: 'Partenaires',
      sublabel: 'Entreprises engagées',
      color: '#8B0000',
    },
  ];

  const openVideoModal = () => {
    setVideoModalOpen(true);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const nextGalleryImage = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevGalleryImage = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Composants Skeleton
  const StatSkeleton = () => (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width="40%" height={25} sx={{ mx: 'auto' }} />
      </CardContent>
    </Card>
  );

  const EditionCardSkeleton = () => (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent>
        <Skeleton variant="text" width="70%" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="text" width="50%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-scale-in {
            animation: scaleIn 0.6s ease-out forwards;
          }
          
          .animate-slide-left {
            animation: ${slideInLeft} 0.8s ease-out forwards;
          }
          
          .animate-slide-right {
            animation: ${slideInRight} 0.8s ease-out forwards;
          }
          
          .hero-gradient {
            background: linear-gradient(135deg, #8B0000 0%, #B22222 50%, #8B0000 100%);
          }
          
          .card-hover-effect {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover-effect:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(139, 0, 0, 0.15);
          }
          
          @media (max-width: 600px) {
            .mobile-padding {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            
            .mobile-text-center {
              text-align: center !important;
            }
            
            .mobile-stack {
              flex-direction: column !important;
              gap: 16px !important;
            }
          }
        `}
      </style>

      {/* Modal vidéo YouTube */}
      <VideoModal 
        open={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
      />

      {/* Modal d'image de la galerie */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onClose={closeImageModal}
          maxWidth={false}
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'hidden',
              m: 0,
              maxWidth: '100vw',
              maxHeight: '100vh',
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogContent sx={{ p: 0, position: 'relative', height: '100vh' }}>
            <IconButton
              onClick={closeImageModal}
              sx={{
                position: 'absolute',
                top: { xs: 8, sm: 16 },
                right: { xs: 8, sm: 16 },
                zIndex: 1000,
                bgcolor: 'rgba(139, 0, 0, 0.7)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(139, 0, 0, 0.9)' },
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* Navigation de la galerie */}
            <IconButton
              onClick={prevGalleryImage}
              sx={{
                position: 'absolute',
                top: '50%',
                left: { xs: 8, sm: 16 },
                transform: 'translateY(-50%)',
                zIndex: 1000,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.7)' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <IconButton
              onClick={nextGalleryImage}
              sx={{
                position: 'absolute',
                top: '50%',
                right: { xs: 8, sm: 16 },
                transform: 'translateY(-50%)',
                zIndex: 1000,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.7)' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            
            <Box
              component="img"
              src={selectedImage}
              alt="Photo de l'édition"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://source.unsplash.com/random/1200x800/?event,show,talent`;
              }}
            />
            
            {/* Info de la photo */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                p: 3,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                {galleryPhotos[galleryIndex]?.title || 'Souvenir Show Your Talent'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 0.5 }}>
                {galleryPhotos[galleryIndex]?.description || 'Moment inoubliable'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {galleryPhotos[galleryIndex]?.date || 'Juin 2025'}
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Hero Section */}
      <Fade in={animate} timeout={800}>
        <Box className="hero-gradient" sx={{ color: 'white', py: { xs: 6, md: 10 }, mb: { xs: 4, md: 8 } }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              {hasOpenEditions ? (
                <Chip
                  label={`Édition ${firstOpenEdition?.annee} - Inscriptions ouvertes`}
                  icon={<TrophyIcon />}
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: 0.5,
                    px: 2,
                    animation: `${pulseAnimation} 3s infinite`,
                  }}
                  className="animate-scale-in"
                />
              ) : (
                <Chip
                  label="Prochaine édition bientôt"
                  icon={<CalendarIcon />}
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: 0.5,
                    px: 2,
                  }}
                  className="animate-scale-in"
                />
              )}
              
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  lineHeight: 1.2,
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
                className="animate-fade-in-up"
              >
                Découvrez les <Box component="span" sx={{ color: '#FFD700' }}>talents</Box> de demain
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                  maxWidth: '800px',
                }}
                className="animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                La plus grande plateforme de compétition artistique au Bénin.
                Montrez votre talent et gagnez des prix exceptionnels.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mb: 4,
                }}
                className="animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
              >
                {hasOpenEditions ? (
                  <Link to="/postuler" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                        color: 'black',
                        fontWeight: 'bold',
                        py: 1.5,
                        px: { xs: 4, sm: 6 },
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)',
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: '100%', sm: '200px' },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 15px 30px rgba(212, 175, 55, 0.5)',
                        },
                      }}
                      endIcon={<ArrowIcon />}
                    >
                      Postuler maintenant
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    disabled
                    sx={{
                      background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      py: 1.5,
                      px: { xs: 4, sm: 6 },
                      borderRadius: '12px',
                      cursor: 'not-allowed',
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: '100%', sm: '200px' },
                    }}
                  >
                    Inscriptions fermées
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={openVideoModal}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    py: 1.5,
                    px: { xs: 4, sm: 6 },
                    borderRadius: '12px',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: '100%', sm: '200px' },
                    transition: 'all 0.3s ease',
                    animation: `${glowAnimation} 3s infinite`,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: '#FFD700',
                      color: '#FFD700',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 10px 20px rgba(212, 175, 55, 0.3)',
                      animation: 'none',
                    },
                  }}
                  startIcon={<YouTubeIcon sx={{ color: '#FF0000' }} />}
                >
                  Visionner la rétrospective 2025
                </Button>
              </Box>

              {hasOpenEditions && firstOpenEdition?.date_fin_inscriptions && (
                <Fade in={animate} timeout={1000} style={{ animationDelay: '0.6s' }}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      p: 3,
                      maxWidth: { xs: '100%', sm: '400px' },
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Inscriptions closes dans :
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(212, 175, 55, 0.3)',
                          borderRadius: '12px',
                          p: 2,
                          textAlign: 'center',
                          minWidth: '80px',
                          animation: `${pulseAnimation} 2s infinite`,
                        }}
                      >
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FFD700', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                          {firstOpenEdition.jours_restants}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          jours
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          Date limite : {formatDate(firstOpenEdition.date_fin_inscriptions)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Ne ratez pas cette opportunité !
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>
          </Container>
        </Box>
      </Fade>

      {/* Section Gagnants 2025 */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Fade in={animate} timeout={1000}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                label="Rétrospective 2025"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  py: 0.5,
                  px: 2,
                }}
                className="animate-scale-in"
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                className="animate-fade-in-up"
              >
                Nos Lauréats 2025
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  maxWidth: '700px',
                  mx: 'auto',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
                className="animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                Découvrez les talents qui ont marqué notre première édition historique
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {winners2025.map((winner, index) => (
                <Grid key={winner.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Slide direction="up" in={animate} timeout={600} style={{ transitionDelay: `${index * 0.1}s` }}>
                    <Card
                      className="card-hover-effect"
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        background: `linear-gradient(135deg, ${winner.color}15, #ffffff)`,
                        border: `1px solid ${winner.color}30`,
                        cursor: 'pointer',
                      }}
                      onClick={() => openImageModal(winner.image)}
                    >
                      <Box
                        sx={{
                          height: { xs: 200, sm: 250 },
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={winner.image}
                          alt={winner.name}
                          sx={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://source.unsplash.com/random/400x300/?${winner.category.toLowerCase()},winner`;
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(to bottom, transparent 60%, ${winner.color}90)`,
                          }}
                        />
                        <Chip
                          label={winner.position}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: winner.color,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 28 },
                          }}
                        />
                      </Box>
                      
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: winner.color,
                              mr: 2,
                              width: { xs: 40, sm: 50 },
                              height: { xs: 40, sm: 50 },
                            }}
                          >
                            {winner.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {winner.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {winner.category}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <QuoteIcon sx={{ color: winner.color, mr: 1, mt: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontStyle: 'italic',
                              color: 'text.secondary',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: 1.4,
                            }}
                          >
                            "{winner.quote}"
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={winner.achievements}
                          size="small"
                          sx={{
                            backgroundColor: `${winner.color}15`,
                            color: winner.color,
                            border: `1px solid ${winner.color}30`,
                            fontWeight: '500',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 28 },
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Slide>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Container>

      {/* Galerie des souvenirs */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Fade in={animate} timeout={1000}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                label="Quelques souvenirs"
                icon={<GalleryIcon />}
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #8B0000, #B22222)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  py: 0.5,
                  px: 2,
                }}
                className="animate-scale-in"
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                className="animate-fade-in-up"
              >
                Moments inoubliables
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  maxWidth: '700px',
                  mx: 'auto',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
                className="animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                Revivez les émotions et les temps forts de notre première édition
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {galleryPhotos.map((photo, index) => (
                <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Zoom in={animate} timeout={500} style={{ transitionDelay: `${index * 0.1}s` }}>
                    <Card
                      className="card-hover-effect"
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                      }}
                      onClick={() => {
                        setGalleryIndex(index);
                        openImageModal(photo.image);
                      }}
                    >
                      <Box
                        sx={{
                          height: { xs: 200, sm: 250 },
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 3,
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={photo.image}
                          alt={photo.title}
                          sx={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://source.unsplash.com/random/400x300/?event,show,talent`;
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            }}
                          >
                            {photo.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            }}
                          >
                            {photo.date}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            lineHeight: 1.4,
                          }}
                        >
                          {photo.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Container>

      {/* Statistiques */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid key={index} size={{ xs: 6, sm: 3 }}>
              <Zoom in={animate} timeout={500} style={{ transitionDelay: `${index * 0.1}s` }}>
                <Card
                  className="card-hover-effect"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fffaf0 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.1)',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 50, sm: 60 },
                        height: { xs: 50, sm: 60 },
                        borderRadius: '50%',
                        backgroundColor: `${stat.color}15`,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ color: stat.color, fontSize: { xs: 24, sm: 30 } }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        color: 'text.primary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      }}
                    >
                      {stat.sublabel}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section Vidéo YouTube */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Fade in={animate} timeout={1000}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 4,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              className="animate-fade-in-up"
            >
              Découvrez Show Us Your Talent
            </Typography>
            
            <Box
              className="card-hover-effect"
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                backgroundColor: '#000',
                mb: 4,
                height: { xs: 250, sm: 400, md: 500 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)',
                  '& .play-button': {
                    transform: 'scale(1.15)',
                    backgroundColor: '#FF0000',
                  },
                  '& .youtube-icon': {
                    transform: 'scale(1.1)',
                  },
                },
              }}
              onClick={openVideoModal}
            >
              {/* Image de prévisualisation */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, rgba(255, 0, 0, 0.7), rgba(139, 0, 0, 0.7))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(45deg, rgba(255, 0, 0, 0.8), rgba(139, 0, 0, 0.8))`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    className="play-button"
                    sx={{
                      width: { xs: 60, sm: 80, md: 100 },
                      height: { xs: 60, sm: 80, md: 100 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(255, 0, 0, 0.5)',
                      mx: 'auto',
                      mb: 3,
                      transition: 'all 0.3s ease',
                      animation: `${pulseAnimation} 2s infinite`,
                    }}
                  >
                    <YouTubeIcon 
                      className="youtube-icon"
                      sx={{ 
                        fontSize: { xs: 30, sm: 40, md: 50 }, 
                        color: 'white',
                        transition: 'transform 0.3s ease'
                      }} 
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                    }}
                  >
                    Cliquez pour visionner la rétrospective
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      mt: 1,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    Regardez notre vidéo YouTube officielle
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Les moments forts de l'édition 2025
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Revivez l'émotion, la passion et l'excellence qui ont marqué notre première édition.
                Des performances incroyables, des talents exceptionnels et des moments inoubliables.
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <YouTubeIcon sx={{ color: '#FF0000', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Disponible sur YouTube - Qualité optimale garantie
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Éditions ouvertes */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              className="animate-fade-in-up"
            >
              {hasOpenEditions ? 'Éditions en cours' : 'Prochaines éditions'}
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '1rem' } }}
              className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {hasOpenEditions 
                ? 'Postulez avant la fermeture des inscriptions' 
                : 'Les inscriptions pour les prochaines éditions ouvriront bientôt'}
            </Typography>
          </Box>

          {editionsLoading ? (
            <Grid container spacing={3}>
              {Array(isMobile ? 1 : isTablet ? 2 : 3).fill(0).map((_, idx) => (
                <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                  <EditionCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              {hasOpenEditions ? (
                <Grid container spacing={3}>
                  {editions
                    .slice(0, isMobile ? 1 : isTablet ? 2 : 3)
                    .map((edition, index) => (
                      <Grid key={edition.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Slide direction="up" in={animate} timeout={500} style={{ transitionDelay: `${index * 0.1}s` }}>
                          <Card
                            className="card-hover-effect"
                            sx={{
                              height: '100%',
                              borderRadius: 3,
                              overflow: 'hidden',
                              background: 'linear-gradient(135deg, #ffffff 0%, #fffaf0 100%)',
                              border: '2px solid transparent',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                right: -2,
                                bottom: -2,
                                background: 'linear-gradient(45deg, #D4AF37, #8B0000, #D4AF37)',
                                borderRadius: 20,
                                zIndex: -1,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                              },
                              '&:hover::before': {
                                opacity: 1,
                              },
                            }}
                          >
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                <Chip
                                  label={`${edition.annee} - ${edition.numero_edition}ème`}
                                  sx={{
                                    backgroundColor: '#8B0000',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    height: { xs: 24, sm: 28 },
                                  }}
                                />
                                <Chip
                                  label="Inscriptions ouvertes"
                                  color="success"
                                  size="small"
                                  icon={<CalendarIcon />}
                                  sx={{ height: { xs: 24, sm: 28 } }}
                                />
                              </Box>

                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 'bold',
                                  mb: 2,
                                  color: 'text.primary',
                                  fontSize: { xs: '1rem', sm: '1.25rem' },
                                  minHeight: { xs: '3rem', sm: '3.5rem' },
                                }}
                              >
                                {edition.nom}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  mb: 3,
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  minHeight: { xs: '4rem', sm: '4.5rem' },
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {edition.description}
                              </Typography>

                              <Box sx={{ mb: 3 }}>
                                <Stack spacing={1.5}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                      Clôture des inscriptions
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                      {formatDate(edition.date_fin_inscriptions)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                      Catégories
                                    </Typography>
                                    <Chip
                                      icon={<CategoryIcon />}
                                      label={edition.categories_count}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                        height: { xs: 24, sm: 28 },
                                      }}
                                    />
                                  </Box>
                                  {edition.jours_restants > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                        Jours restants
                                      </Typography>
                                      <Chip
                                        label={`${edition.jours_restants} jours`}
                                        size="small"
                                        color="warning"
                                        sx={{ 
                                          fontWeight: 'bold',
                                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                          height: { xs: 24, sm: 28 },
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Stack>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    {edition.categories?.slice(0, 2).join(', ')}
                                    {edition.categories_count > 2 ? '...' : ''}
                                  </Typography>
                                </Box>
                                <Link to={`/postuler?edition=${edition.id}`}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                      background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                                      color: 'black',
                                      fontWeight: 'bold',
                                      borderRadius: 2,
                                      px: 2,
                                      py: 0.5,
                                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                      animation: edition.jours_restants < 7 ? `${pulseAnimation} 2s infinite` : 'none',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
                                        animation: 'none',
                                      },
                                    }}
                                    endIcon={<ArrowIcon />}
                                  >
                                    Postuler
                                  </Button>
                                </Link>
                              </Box>
                            </CardContent>
                          </Card>
                        </Slide>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Card sx={{ textAlign: 'center', p: { xs: 4, md: 6 }, borderRadius: 3 }} className="animate-scale-in">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 40, color: '#D4AF37' }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Aucune édition ouverte actuellement
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Les inscriptions pour les prochaines éditions ouvriront bientôt.
                    Restez informé en vous inscrivant à notre newsletter.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: '#D4AF37',
                        color: '#D4AF37',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          borderColor: '#FFD700',
                          color: '#FFD700',
                        },
                      }}
                    >
                      S'inscrire à la newsletter
                    </Button>
                    <Link to="/editions">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                          color: 'black',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
                          },
                        }}
                      >
                        Voir les éditions passées
                      </Button>
                    </Link>
                  </Box>
                </Card>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;