import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '../contexts/AuthContext';
import { LoadingIndicator } from '../components/Layout/Layout';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Badge,
  alpha,
  useTheme,
  useMediaQuery,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Slide,
  Fade,
  Zoom,
  Grow,
  CardActionArea,
  Fab,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  Person as PersonIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Category as CategoryIcon,
  EmojiEvents as TrophyIcon,
  Numbers as NumbersIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  ZoomIn as ZoomIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  VideoLibrary as VideoLibraryIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  MilitaryTech as MilitaryTechIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  ArrowUpward as ArrowUpwardIcon,
  PhotoCamera as PhotoCameraIcon,
  VolumeUp as VolumeUpIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import axios from '../api/axios';

// Import PaymentModal
import PaymentModal from './PaymentModal';

// Enhanced color palette
const PALETTE = {
  GOLD: {
    LIGHT: '#FFE55C',
    PRIMARY: '#D4AF37',
    DARK: '#B8860B',
    GRADIENT: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)'
  },
  RED: {
    LIGHT: '#FF6B6B',
    PRIMARY: '#C62828',
    DARK: '#8B0000',
    GRADIENT: 'linear-gradient(135deg, #FF5252 0%, #C62828 50%, #8B0000 100%)'
  },
  BROWN: {
    LIGHT: '#D7CCC8',
    PRIMARY: '#8B4513',
    DARK: '#5D4037',
    GRADIENT: 'linear-gradient(135deg, #BCAAA4 0%, #8B4513 50%, #5D4037 100%)'
  },
  NEUTRAL: {
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_LIGHT: '#F8F9FA',
    GRAY: '#6C757D',
    GRAY_DARK: '#343A40',
  },
  GRADIENT_BG: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
};

// Enhanced transitions
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ZoomTransition = React.forwardRef(function ZoomTransition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const ScaleTransition = React.forwardRef(function ScaleTransition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

// Enhanced CSS animations
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700&display=swap');
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
    }
    70% {
      box-shadow: 0 0 0 20px rgba(212, 175, 55, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate3d(0, 40px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translate3d(100px, 0, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes countdownTick {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .montserrat-font {
    font-family: 'Montserrat', sans-serif;
  }

  .orbitron-font {
    font-family: 'Orbitron', monospace;
  }

  .float-animation {
    animation: float 6s ease-in-out infinite;
  }

  .pulse-animation {
    animation: pulse 2s infinite;
  }

  .fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .scale-in {
    animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .slide-in-right {
    animation: slideInRight 0.8s ease-out forwards;
  }

  .gradient-shift {
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }

  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .candidate-card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .candidate-card-hover:hover {
    transform: translateY(-15px) scale(1.03);
    box-shadow: 0 25px 50px -12px rgba(139, 0, 0, 0.25);
  }

  .photo-container {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
  }

  .photo-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.1) 50%, transparent 70%);
    z-index: 1;
    pointer-events: none;
    transition: transform 0.6s;
  }

  .photo-container:hover::before {
    transform: translateX(100%);
  }

  .rank-badge {
    position: relative;
    overflow: hidden;
  }

  .rank-badge::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    transform: rotate(45deg);
  }

  .video-thumbnail {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    cursor: pointer;
  }

  .video-thumbnail::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(transparent 50%, rgba(0,0,0,0.7));
    opacity: 0;
    transition: opacity 0.3s;
  }

  .video-thumbnail:hover::after {
    opacity: 1;
  }

  .vote-button {
    position: relative;
    overflow: hidden;
  }

  .vote-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.6s;
  }

  .vote-button:hover::after {
    left: 100%;
  }

  .category-header {
    position: relative;
    overflow: hidden;
  }

  .category-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${PALETTE.GOLD.GRADIENT};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.6s;
  }

  .category-header:hover::before {
    transform: scaleX(1);
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${PALETTE.NEUTRAL.GRAY_LIGHT};
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${PALETTE.GOLD.GRADIENT};
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${PALETTE.RED.GRADIENT};
  }

  /* Selection color */
  ::selection {
    background: ${PALETTE.GOLD.PRIMARY};
    color: ${PALETTE.NEUTRAL.WHITE};
  }
`;

const CandidatsPage = () => {
  const { nomEdition } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [fullscreen, setFullscreen] = useState(false);

  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedCandidatInfo, setSelectedCandidatInfo] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCandidatForPayment, setSelectedCandidatForPayment] = useState(null);
  const [isHoveringCard, setIsHoveringCard] = useState(null);

  // Récupérer les données
  const fetchCandidats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/candidats');
      
      if (response.data.success) {
        setData(response.data);
        
        // Initialiser toutes les catégories comme ouvertes
        const expanded = {};
        response.data.categories?.forEach(cat => {
          expanded[cat.id] = true;
        });
        setExpandedCategories(expanded);
      } else {
        setError(response.data.message || 'Erreur lors du chargement des candidats');
      }
    } catch (err) {
      console.error('Erreur détaillée:', err.response?.data || err.message);
      setError('Vérifiez votre connexion internet...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidats();
    
    const interval = setInterval(() => {
      fetchCandidats();
    }, 3000000); // Refresh every 3000 seconds
    
    return () => clearInterval(interval);
  }, [fetchCandidats]);

  // Countdown timer
  useEffect(() => {
    if (!data?.edition?.temps_restant) return;

    const endTime = Date.now() + (data.edition.temps_restant.total_secondes * 1000);

    const updateCountdown = () => {
      const now = Date.now();
      const remainingTime = Math.max(0, endTime - now);
      
      if (remainingTime <= 0) {
        setTimeLeft({
          jours: 0,
          heures: 0,
          minutes: 0,
          secondes: 0,
          total_secondes: 0
        });
        return;
      }

      const totalSeconds = Math.floor(remainingTime / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      setTimeLeft({
        jours: days,
        heures: hours,
        minutes: minutes,
        secondes: seconds,
        total_secondes: totalSeconds
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, [data?.edition?.temps_restant]);

  // Gestion des clics
  const handleVoteClick = (candidat) => {
    if (!isVoteOpen()) {
      alert('Les votes ne sont pas ouverts actuellement');
      return;
    }
    
    navigate('/payment', {
      state: {
        candidat,
        edition: data.edition,
        category: data.categories?.find(c => 
          c.candidats?.some(cand => cand.id === candidat.id)
        )
      }
    });
  };

  const handlePhotoClick = (photo, candidat) => {
    setSelectedPhoto(photo);
    setSelectedCandidatInfo(candidat);
    setPhotoModalOpen(true);
  };

  const handleVideoClick = (videoUrl, candidat) => {
    if (videoUrl) {
      setSelectedVideo(videoUrl);
      setSelectedCandidatInfo(candidat);
      setVideoModalOpen(true);
    } else {
      alert('Aucune vidéo disponible pour ce candidat');
    }
  };

  const handleCloseModals = () => {
    setPhotoModalOpen(false);
    setVideoModalOpen(false);
    setSelectedPhoto('');
    setSelectedVideo('');
    setSelectedCandidatInfo(null);
    setPaymentModalOpen(false);
    setSelectedCandidatForPayment(null);
    setFullscreen(false);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Enhanced modal with fullscreen support
  const handleFullscreen = () => {
    const element = document.querySelector('.modal-content');
    if (!document.fullscreenElement) {
      element.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    fetchCandidats();
    setPaymentModalOpen(false);
    setSelectedCandidatForPayment(null);
    alert('Votre vote a été enregistré avec succès !');
  };

  const handlePaymentError = (error) => {
    alert(`Erreur de paiement: ${error.message || 'Une erreur est survenue'}`);
  };

  // Fonctions utilitaires
  const hasUserVotedForCandidat = (candidatId) => {
    return data?.user_votes?.[candidatId] || false;
  };

  const calculateVotePercentage = (candidatVotes, totalVotesCategorie) => {
    if (totalVotesCategorie === 0) return 0;
    return (candidatVotes / totalVotesCategorie) * 100;
  };

  const sortCandidatsByVotes = (candidats) => {
    return [...candidats].sort((a, b) => b.nombre_votes - a.nombre_votes);
  };

  const getCandidatRank = (candidats, candidatId) => {
    const sorted = sortCandidatsByVotes(candidats);
    return sorted.findIndex(c => c.id === candidatId) + 1;
  };

  const isVoteOpen = () => {
    return data?.edition?.statut_votes === 'en_cours';
  };

  const isVoteNotStarted = () => {
    return data?.edition?.statut_votes === 'en_attente';
  };

  const formatNomComplet = (candidat) => {
    return {
      nom: candidat?.nom || '',
      prenoms: candidat?.prenoms || '',
      nomComplet: `${candidat?.prenoms || ''} ${candidat?.nom || ''}`.trim()
    };
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };

  const getTikTokId = (url) => {
    if (!url) return null;
    try {
      const patterns = [
        /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
        /tiktok\.com\/video\/(\d+)/,
        /vm\.tiktok\.com\/[\w]+\/?/,
        /vt\.tiktok\.com\/[\w]+\/?/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
      }
      return null;
    } catch (err) {
      console.error('Erreur parsing TikTok URL:', err);
      return null;
    }
  };

  // Enhanced Countdown Component
  const renderCountdown = () => {
    if (!data?.edition?.temps_restant && !timeLeft) return null;

    const displayTime = timeLeft || data.edition.temps_restant;
    
    if (displayTime.total_secondes <= 0) {
      return (
        <Zoom in={true}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${PALETTE.GOLD.GRADIENT})`,
              border: `2px solid ${PALETTE.GOLD.PRIMARY}`,
              color: PALETTE.NEUTRAL.WHITE,
              animation: 'pulse 2s infinite'
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrophyIcon />
              Le vote est terminé - Découvrez les résultats !
            </Typography>
          </Alert>
        </Zoom>
      );
    }

    return (
      <Fade in={true}>
        <Box 
          className="gradient-shift"
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 },
            mb: 5,
            borderRadius: 4,
            color: PALETTE.NEUTRAL.WHITE,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${PALETTE.RED.DARK} 0%, ${PALETTE.BROWN.PRIMARY} 50%, ${PALETTE.GOLD.PRIMARY} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(139, 0, 0, 0.4)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 2,
              mb: 4,
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            <TimerIcon sx={{ fontSize: { xs: 36, sm: 48 }, animation: 'pulse 2s infinite' }} />
            {isVoteNotStarted() ? 'Début des votes dans :' : 'Fin des votes dans :'}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1.5, sm: 3, md: 4 },
            flexWrap: 'wrap',
            perspective: 1000
          }}>
            {[
              { value: displayTime.jours, label: 'Jours', key: 'jours' },
              { value: displayTime.heures, label: 'Heures', key: 'heures' },
              { value: displayTime.minutes, label: 'Minutes', key: 'minutes' },
              { value: displayTime.secondes, label: 'Secondes', key: 'secondes' },
            ].map((item, index) => (
              <Box 
                key={item.key}
                sx={{ 
                  textAlign: 'center',
                  minWidth: { xs: 75, sm: 100, md: 120 },
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  p: { xs: 2, sm: 3 },
                  border: `2px solid ${PALETTE.GOLD.LIGHT}80`,
                  position: 'relative',
                  overflow: 'hidden',
                  transformStyle: 'preserve-3d',
                  animation: `countdownTick 1s ease ${index * 0.2}s`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    pointerEvents: 'none'
                  }
                }}
              >
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  className="orbitron-font"
                  sx={{ 
                    fontSize: { xs: 36, sm: 48, md: 64 },
                    color: PALETTE.GOLD.LIGHT,
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.8)',
                    lineHeight: 1,
                    letterSpacing: 2,
                    mb: 1
                  }}
                >
                  {item.value.toString().padStart(2, '0')}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: { xs: 12, sm: 14 },
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    display: 'block'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>
    );
  };

  // Enhanced Statistics Component
  const renderStats = () => {
    if (!data) return null;

    const stats = [
      { 
        value: data.statistiques?.total_votes || 0, 
        label: 'Votes', 
        icon: <VoteIcon />,
        gradient: PALETTE.GOLD.GRADIENT,
        delay: 100
      },
      { 
        value: data.categories?.length || 0, 
        label: 'Catégories', 
        icon: <CategoryIcon />,
        gradient: PALETTE.BROWN.GRADIENT,
        delay: 200
      },
      { 
        value: data.statistiques?.total_votes_today || 0, 
        label: 'Votes Aujourd\'hui', 
        icon: <TrendingUpIcon />,
        gradient: `linear-gradient(135deg, ${PALETTE.GOLD.PRIMARY} 0%, ${PALETTE.RED.PRIMARY} 100%)`,
        delay: 300
      },
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <div style={{ animationDelay: `${stat.delay}ms` }} className="fade-in-up">
              <Card 
                sx={{ 
                  height: '100%',
                  background: stat.gradient,
                  color: PALETTE.NEUTRAL.WHITE,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: `0 30px 60px rgba(139, 0, 0, 0.4)`,
                    '& .stat-icon': {
                      transform: 'scale(1.2) rotate(15deg)'
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h2" fontWeight="bold" sx={{ 
                        fontSize: { xs: 40, sm: 48 }, 
                        textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
                        mb: 0.5
                      }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.95, 
                        fontSize: { xs: 13, sm: 14 },
                        fontWeight: 500
                      }}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Box className="stat-icon" sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      transition: 'transform 0.4s ease'
                    }}>
                      {React.cloneElement(stat.icon, { sx: { fontSize: 28 } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </div>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Enhanced Photo Modal
  const renderPhotoModal = () => (
    <Dialog
      open={photoModalOpen}
      onClose={handleCloseModals}
      TransitionComponent={ZoomTransition}
      maxWidth={fullscreen ? false : "lg"}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          margin: fullscreen ? 0 : 2,
          width: fullscreen ? '100vw' : 'auto',
          height: fullscreen ? '100vh' : 'auto',
          maxWidth: fullscreen ? '100vw' : 'lg',
          overflow: 'hidden',
          backgroundColor: PALETTE.NEUTRAL.BLACK
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${PALETTE.RED.DARK} 0%, ${PALETTE.BROWN.PRIMARY} 100%)`,
        color: PALETTE.NEUTRAL.WHITE,
        p: { xs: 2, sm: 3 },
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: `1px solid ${PALETTE.GOLD.PRIMARY}`
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
            {selectedPhoto && (
              <Avatar 
                src={selectedPhoto} 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  border: `2px solid ${PALETTE.GOLD.LIGHT}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {selectedCandidatInfo && formatNomComplet(selectedCandidatInfo).prenoms}
                <VerifiedIcon sx={{ fontSize: 16, color: PALETTE.GOLD.LIGHT }} />
              </Typography>
              <Typography variant="caption" sx={{ 
                opacity: 0.9, 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 11
              }}>
                <SchoolIcon sx={{ fontSize: 12 }} />
                {selectedCandidatInfo?.universite} • {selectedCandidatInfo?.categorie_nom}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Tooltip title={fullscreen ? "Quitter le plein écran" : "Plein écran"}>
              <IconButton 
                onClick={toggleFullscreen}
                sx={{ 
                  color: PALETTE.NEUTRAL.WHITE,
                  background: 'rgba(255,255,255,0.15)',
                  '&:hover': { 
                    background: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Fermer">
              <IconButton 
                onClick={handleCloseModals}
                sx={{ 
                  color: PALETTE.NEUTRAL.WHITE,
                  background: 'rgba(255,255,255,0.15)',
                  '&:hover': { 
                    background: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent className="modal-content" sx={{ 
        p: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: PALETTE.NEUTRAL.BLACK,
        overflow: 'hidden'
      }}>
        {selectedPhoto && (
          <Box sx={{ 
            width: '100%',
            height: fullscreen ? 'calc(100vh - 120px)' : { xs: '60vh', sm: '70vh', md: '80vh' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img
              src={selectedPhoto}
              alt="Photo du candidat"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                animation: 'scaleIn 0.6s ease-out'
              }}
            />
          </Box>
        )}
      </DialogContent>
      
      {selectedCandidatInfo && (
        <Box sx={{ 
          p: 3, 
          background: `linear-gradient(transparent, ${PALETTE.BLACK}E6)`,
          color: PALETTE.NEUTRAL.WHITE,
          borderTop: `1px solid ${PALETTE.GOLD.PRIMARY}40`
        }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            {formatNomComplet(selectedCandidatInfo).nomComplet}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Chip 
              icon={<SchoolIcon />}
              label={selectedCandidatInfo.universite}
              size="small"
              sx={{ 
                background: 'rgba(212, 175, 55, 0.2)', 
                color: PALETTE.GOLD.LIGHT,
                border: `1px solid ${PALETTE.GOLD.PRIMARY}`
              }}
            />
            <Chip 
              icon={<GroupsIcon />}
              label={selectedCandidatInfo.entite || selectedCandidatInfo.filiere}
              size="small"
              sx={{ 
                background: 'rgba(139, 0, 0, 0.2)', 
                color: PALETTE.RED.LIGHT,
                border: `1px solid ${PALETTE.RED.PRIMARY}`
              }}
            />
            <Chip 
              icon={<TrendingUpIcon />}
              label={`${selectedCandidatInfo.nombre_votes} votes`}
              size="small"
              sx={{ 
                background: 'rgba(139, 69, 19, 0.2)', 
                color: PALETTE.BROWN.LIGHT,
                border: `1px solid ${PALETTE.BROWN.PRIMARY}`
              }}
            />
          </Box>
        </Box>
      )}
    </Dialog>
  );

  // Enhanced Video Modal
  const renderVideoModal = () => {
    const isYouTube = selectedVideo?.includes('youtube.com') || selectedVideo?.includes('youtu.be');
    const isTikTok = selectedVideo?.includes('tiktok.com');
    const youTubeId = isYouTube ? getYouTubeId(selectedVideo) : null;
    const tiktokId = isTikTok ? getTikTokId(selectedVideo) : null;

    return (
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseModals}
        TransitionComponent={ScaleTransition}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            margin: 2,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: PALETTE.NEUTRAL.BLACK,
            animation: 'scaleIn 0.4s ease-out'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${PALETTE.RED.DARK} 0%, ${PALETTE.BROWN.PRIMARY} 100%)`,
          color: PALETTE.NEUTRAL.WHITE,
          p: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${PALETTE.GOLD.PRIMARY}`
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
              <VideoLibraryIcon sx={{ fontSize: 32, color: PALETTE.GOLD.LIGHT }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Talent en vidéo
                  <VolumeUpIcon sx={{ fontSize: 18 }} />
                </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9,
                  fontSize: 11
                }}>
                  Découvrez le talent de {selectedCandidatInfo && formatNomComplet(selectedCandidatInfo).prenoms}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Tooltip title="Plein écran">
                <IconButton 
                  onClick={handleFullscreen}
                  sx={{ 
                    color: PALETTE.NEUTRAL.WHITE,
                    background: 'rgba(255,255,255,0.15)',
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.25)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Fermer">
                <IconButton 
                  onClick={handleCloseModals}
                  sx={{ 
                    color: PALETTE.NEUTRAL.WHITE,
                    background: 'rgba(255,255,255,0.15)',
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.25)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: PALETTE.NEUTRAL.BLACK }}>
          {selectedCandidatInfo && (
            <Box sx={{ mb: 3, animation: 'fadeInUp 0.6s ease-out' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom color={PALETTE.GOLD.LIGHT}>
                {formatNomComplet(selectedCandidatInfo).nomComplet}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Présentation exceptionnelle de talent et de charisme
              </Typography>
            </Box>
          )}
          
          <Box sx={{ 
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            overflow: 'hidden',
            borderRadius: 3,
            background: PALETTE.NEUTRAL.GRAY_DARK,
            mb: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            {isYouTube && youTubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
                title="Vidéo du candidat"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '12px'
                }}
              />
            ) : isTikTok ? (
              tiktokId ? (
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
                  title="Vidéo TikTok du candidat"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '12px'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: PALETTE.NEUTRAL.WHITE,
                    textAlign: 'center',
                    p: 3,
                    background: `linear-gradient(135deg, ${PALETTE.BROWN.PRIMARY}80 0%, ${PALETTE.RED.DARK}80 100%)`,
                    borderRadius: '12px'
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 64, mb: 2, color: PALETTE.GOLD.LIGHT }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Vidéo TikTok
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: 500 }}>
                    Pour une expérience optimale, visionnez cette vidéo directement sur TikTok
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    href={selectedVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      background: PALETTE.GOLD.GRADIENT,
                      color: PALETTE.NEUTRAL.BLACK,
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${PALETTE.GOLD.DARK} 0%, ${PALETTE.RED.PRIMARY} 100%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 10px 30px ${PALETTE.GOLD.PRIMARY}40`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Regarder sur TikTok
                  </Button>
                </Box>
              )
            ) : selectedVideo && (selectedVideo.includes('.mp4') || selectedVideo.includes('.webm') || selectedVideo.includes('.mov')) ? (
              <video 
                controls 
                autoPlay
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              >
                <source src={selectedVideo} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            ) : (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: PALETTE.NEUTRAL.WHITE,
                textAlign: 'center',
                borderRadius: '12px',
                background: PALETTE.NEUTRAL.GRAY_DARK
              }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Aucune vidéo disponible
                  </Typography>
                  {selectedVideo && (
                    <Button
                      variant="outlined"
                      href={selectedVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: PALETTE.GOLD.LIGHT,
                        borderColor: PALETTE.GOLD.PRIMARY,
                        mt: 2,
                        '&:hover': {
                          borderColor: PALETTE.GOLD.LIGHT,
                          color: PALETTE.GOLD.LIGHT,
                          background: 'rgba(212, 175, 55, 0.1)'
                        }
                      }}
                    >
                      Accéder au lien
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
          
          {selectedCandidatInfo && (
            <Box sx={{ 
              p: 3, 
              background: `rgba(212, 175, 55, 0.05)`, 
              borderRadius: 3,
              border: `1px solid ${PALETTE.GOLD.PRIMARY}20`,
              animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
              opacity: 0
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CategoryIcon sx={{ color: PALETTE.GOLD.PRIMARY, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Catégorie
                      </Typography>
                      <Typography variant="body2" color={PALETTE.NEUTRAL.WHITE} fontWeight="medium">
                        {selectedCandidatInfo.categorie_nom}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SchoolIcon sx={{ color: PALETTE.GOLD.PRIMARY, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Université
                      </Typography>
                      <Typography variant="body2" color={PALETTE.NEUTRAL.WHITE} fontWeight="medium">
                        {selectedCandidatInfo.universite}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GroupsIcon sx={{ color: PALETTE.GOLD.PRIMARY, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Filière
                      </Typography>
                      <Typography variant="body2" color={PALETTE.NEUTRAL.WHITE} fontWeight="medium">
                        {selectedCandidatInfo.filiere}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TrendingUpIcon sx={{ color: PALETTE.GOLD.PRIMARY, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Votes
                      </Typography>
                      <Typography variant="body2" color={PALETTE.NEUTRAL.WHITE} fontWeight="medium">
                        {selectedCandidatInfo.nombre_votes.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          background: PALETTE.NEUTRAL.BLACK,
          borderTop: `1px solid ${PALETTE.GOLD.PRIMARY}20`
        }}>
          {selectedVideo && (
            <Button 
              startIcon={<OpenInNewIcon />}
              href={selectedVideo}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                background: PALETTE.GOLD.GRADIENT,
                color: PALETTE.NEUTRAL.BLACK,
                fontWeight: 'bold',
                borderRadius: 2,
                px: 3,
                '&:hover': { 
                  background: `linear-gradient(135deg, ${PALETTE.GOLD.DARK} 0%, ${PALETTE.RED.PRIMARY} 100%)`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Voir sur la plateforme
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  // Enhanced Candidate Card
  const renderCandidatCard = (candidat, category, index) => {
    if (!candidat) return null;
    
    const rank = getCandidatRank(category.candidats, candidat.id);
    const { nom, prenoms, nomComplet } = formatNomComplet(candidat);
    const percentage = calculateVotePercentage(candidat.nombre_votes, category.total_votes_categorie);
    
    const rankColors = {
      1: { 
        gradient: PALETTE.GOLD.GRADIENT,
        textColor: PALETTE.NEUTRAL.BLACK,
        shadow: `0 0 30px ${PALETTE.GOLD.PRIMARY}`
      },
      2: { 
        gradient: `linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)`,
        textColor: PALETTE.NEUTRAL.GRAY_DARK,
        shadow: `0 0 20px silver`
      },
      3: { 
        gradient: `linear-gradient(135deg, ${PALETTE.BROWN.PRIMARY} 0%, ${PALETTE.BROWN.LIGHT} 100%)`,
        textColor: PALETTE.NEUTRAL.WHITE,
        shadow: `0 0 20px ${PALETTE.BROWN.PRIMARY}`
      }
    };

    const rankColor = rank <= 3 ? rankColors[rank] : {
      gradient: `linear-gradient(135deg, ${PALETTE.NEUTRAL.GRAY} 0%, ${PALETTE.NEUTRAL.GRAY_DARK} 100%)`,
      textColor: PALETTE.NEUTRAL.WHITE,
      shadow: `0 0 10px rgba(108, 117, 125, 0.5)`
    };

    return (
      <Grid 
        item 
        xs={12} 
        sm={6} 
        md={4} 
        lg={3} 
        key={candidat.id}
      >
        <div 
          style={{ 
            animationDelay: `${index * 100}ms`,
            animationDuration: '0.6s'
          }} 
          className="fade-in-up"
          onMouseEnter={() => setIsHoveringCard(candidat.id)}
          onMouseLeave={() => setIsHoveringCard(null)}
        >
          <Card className="candidate-card-hover" sx={{ 
            height: '100%', 
            position: 'relative',
            borderRadius: 4,
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${PALETTE.GOLD.PRIMARY}30`,
            background: `linear-gradient(135deg, ${PALETTE.NEUTRAL.WHITE} 0%, ${PALETTE.NEUTRAL.GRAY_LIGHT} 100%)`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Rank Badge */}
            <Box sx={{ 
              position: 'absolute',
              top: -12,
              right: -12,
              zIndex: 10,
              animation: isHoveringCard === candidat.id ? 'pulse 2s infinite' : 'none'
            }}>
              <Box className="rank-badge" sx={{ 
                width: 60, 
                height: 60,
                borderRadius: '50%',
                background: rankColor.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: rankColor.textColor,
                boxShadow: rankColor.shadow,
                border: `3px solid ${PALETTE.NEUTRAL.WHITE}`,
                fontSize: 24,
                fontWeight: 'bold',
                fontFamily: 'Orbitron, monospace'
              }}>
                {rank}
              </Box>
            </Box>

            {/* Photo Section */}
            <Box className="photo-container" sx={{ 
              height: 320,
              position: 'relative',
              '&:hover .photo-overlay': {
                opacity: 1
              }
            }}>
              <CardMedia
                component="img"
                height="320"
                image={candidat.photo_url || candidat.photo}
                alt={nomComplet}
                sx={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              />
              <Box className="photo-overlay" sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%)',
                opacity: 0,
                transition: 'opacity 0.4s ease',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px',
                color: PALETTE.NEUTRAL.WHITE
              }}>
                <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
                  <Tooltip title="Agrandir la photo">
                    <IconButton 
                      sx={{ 
                        color: PALETTE.NEUTRAL.WHITE,
                        background: PALETTE.RED.GRADIENT,
                        '&:hover': { 
                          background: `linear-gradient(135deg, ${PALETTE.RED.PRIMARY} 0%, ${PALETTE.RED.DARK} 100%)`,
                          transform: 'scale(1.2) rotate(5deg)'
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(139, 0, 0, 0.4)'
                      }}
                      onClick={() => handlePhotoClick(candidat.photo_url || candidat.photo, candidat)}
                    >
                      <ZoomIcon />
                    </IconButton>
                  </Tooltip>
                  {candidat.video_url && (
                    <Tooltip title="Voir la vidéo">
                      <IconButton 
                        sx={{ 
                          color: PALETTE.NEUTRAL.WHITE,
                          background: PALETTE.GOLD.GRADIENT,
                          '&:hover': { 
                            background: `linear-gradient(135deg, ${PALETTE.GOLD.PRIMARY} 0%, ${PALETTE.GOLD.DARK} 100%)`,
                            transform: 'scale(1.2) rotate(-5deg)'
                          },
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                        }}
                        onClick={() => handleVideoClick(candidat.video_url, candidat)}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ 
              p: 3, 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Name Section */}
              <Box sx={{ textAlign: 'center', mb: 3, position: 'relative' }}>
                <Typography variant="h5" fontWeight="bold" color={PALETTE.RED.DARK} gutterBottom sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {prenoms}
                </Typography>
                <Typography variant="h6" color={PALETTE.BROWN.PRIMARY} sx={{ 
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif',
                  mb: 1
                }}>
                  {nom}
                </Typography>
                
                {/* Gender and Category */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={candidat.sexe === 'F' ? <FemaleIcon /> : <MaleIcon />}
                    label={candidat.sexe === 'F' ? 'Candidate' : 'Candidat'}
                    size="small"
                    sx={{ 
                      background: `rgba(212, 175, 55, 0.1)`,
                      color: PALETTE.GOLD.DARK,
                      border: `1px solid ${PALETTE.GOLD.PRIMARY}40`,
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: PALETTE.GOLD.PRIMARY
                      }
                    }}
                  />
                  <Chip 
                    label={`#${rank}`}
                    size="small"
                    sx={{ 
                      background: rankColor.gradient,
                      color: rankColor.textColor,
                      fontWeight: 'bold',
                      fontFamily: 'Orbitron, monospace',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ 
                my: 2, 
                borderColor: `${PALETTE.GOLD.PRIMARY}30`,
                '&::before, &::after': {
                  borderColor: `${PALETTE.GOLD.PRIMARY}30`
                }
              }} />

              {/* Detailed Information */}
              <Box sx={{ mb: 3 }}>
                {candidat.universite && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <SchoolIcon fontSize="small" sx={{ color: PALETTE.GOLD.PRIMARY, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: PALETTE.NEUTRAL.GRAY_DARK, lineHeight: 1.4 }}>
                      <Box component="span" sx={{ fontWeight: 600, color: PALETTE.NEUTRAL.BLACK }}>
                        Université:
                      </Box>{' '}
                      {candidat.universite}
                    </Typography>
                  </Box>
                )}
                
                {(candidat.entite || candidat.filiere) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <GroupsIcon fontSize="small" sx={{ color: PALETTE.GOLD.PRIMARY, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: PALETTE.NEUTRAL.GRAY_DARK, lineHeight: 1.4 }}>
                      <Box component="span" sx={{ fontWeight: 600, color: PALETTE.NEUTRAL.BLACK }}>
                        {candidat.entite ? 'Entité' : 'Filière'}:
                      </Box>{' '}
                      {candidat.entite || candidat.filiere}
                    </Typography>
                  </Box>
                )}
                
                {candidat.ethnie && (
                  <Chip 
                    label={candidat.ethnie}
                    size="small"
                    sx={{ 
                      background: `rgba(139, 69, 19, 0.1)`,
                      color: PALETTE.BROWN.PRIMARY,
                      border: `1px solid ${PALETTE.BROWN.PRIMARY}30`,
                      fontWeight: 500,
                      mt: 1
                    }}
                  />
                )}
              </Box>

              <Divider sx={{ 
                my: 2, 
                borderColor: `${PALETTE.GOLD.PRIMARY}30`,
                '&::before, &::after': {
                  borderColor: `${PALETTE.GOLD.PRIMARY}30`
                }
              }} />

              {/* Voting Statistics */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VoteIcon fontSize="small" sx={{ color: PALETTE.RED.PRIMARY }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: PALETTE.NEUTRAL.BLACK }}>
                      Votes:
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color={PALETTE.RED.DARK} sx={{ 
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {candidat.nombre_votes.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1.5 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      background: `${PALETTE.GOLD.PRIMARY}20`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${PALETTE.GOLD.LIGHT} 0%, ${PALETTE.GOLD.PRIMARY} 50%, ${PALETTE.RED.PRIMARY} 100%)`,
                        borderRadius: 6,
                        animation: 'shimmer 2s infinite'
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color={PALETTE.GOLD.DARK} sx={{ fontWeight: 500 }}>
                    Rang {rank}
                  </Typography>
                  <Typography variant="caption" color={PALETTE.RED.DARK} fontWeight="bold" sx={{ 
                    background: `linear-gradient(135deg, ${PALETTE.GOLD.PRIMARY} 0%, ${PALETTE.RED.PRIMARY} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                {candidat.video_url && (
                  <Tooltip title="Voir la vidéo de présentation">
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={() => handleVideoClick(candidat.video_url, candidat)}
                      sx={{ 
                        background: PALETTE.BROWN.GRADIENT,
                        color: PALETTE.NEUTRAL.WHITE,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        height: 44,
                        fontFamily: 'Montserrat, sans-serif',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${PALETTE.BROWN.DARK} 0%, ${PALETTE.BROWN.PRIMARY} 100%)`,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 10px 25px ${PALETTE.BROWN.PRIMARY}40`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Talent
                    </Button>
                  </Tooltip>
                )}
                
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VoteIcon />}
                  onClick={() => handleVoteClick(candidat)}
                  disabled={hasUserVotedForCandidat(candidat.id) || !isVoteOpen()}
                  className={isVoteOpen() && !hasUserVotedForCandidat(candidat.id) ? "vote-button pulse-animation" : ""}
                  sx={{
                    background: hasUserVotedForCandidat(candidat.id) 
                      ? `linear-gradient(135deg, ${PALETTE.NEUTRAL.GRAY} 0%, ${PALETTE.NEUTRAL.GRAY_DARK} 100%)`
                      : PALETTE.GOLD.GRADIENT,
                    color: hasUserVotedForCandidat(candidat.id) ? PALETTE.NEUTRAL.WHITE : PALETTE.NEUTRAL.BLACK,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    height: 44,
                    fontFamily: 'Montserrat, sans-serif',
                    '&:hover': {
                      background: hasUserVotedForCandidat(candidat.id)
                        ? `linear-gradient(135deg, #555 0%, #333 100%)`
                        : `linear-gradient(135deg, ${PALETTE.GOLD.DARK} 0%, ${PALETTE.GOLD.PRIMARY} 100%)`,
                      transform: hasUserVotedForCandidat(candidat.id) ? 'none' : 'translateY(-3px)',
                      boxShadow: hasUserVotedForCandidat(candidat.id) ? 'none' : `0 10px 25px ${PALETTE.GOLD.PRIMARY}40`
                    },
                    '&.Mui-disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e',
                      transform: 'none',
                      boxShadow: 'none'
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {hasUserVotedForCandidat(candidat.id) 
                    ? '✓ Voté' 
                    : !isVoteOpen() 
                      ? 'Vote Fermé' 
                      : 'Voter'
                  }
                </Button>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Grid>
    );
  };

  // Enhanced Categories Component
  const renderCategories = () => {
    if (!data?.categories) return null;

    return data.categories.map((category, catIndex) => (
      <Box 
        key={category.id} 
        className="fade-in-up"
        style={{ animationDelay: `${catIndex * 150}ms` }}
        sx={{ 
          mb: 8,
          opacity: 0,
          animationFillMode: 'forwards'
        }}
      >
        {/* Category Header */}
        <Paper 
          className="category-header"
          onClick={() => toggleCategory(category.id)}
          sx={{ 
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${PALETTE.GOLD.PRIMARY}05 0%, ${PALETTE.RED.PRIMARY}03 100%)`,
            border: `2px solid ${PALETTE.GOLD.PRIMARY}30`,
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              background: `linear-gradient(135deg, ${PALETTE.GOLD.PRIMARY}10 0%, ${PALETTE.RED.PRIMARY}08 100%)`,
              borderColor: PALETTE.GOLD.PRIMARY,
              boxShadow: `0 20px 40px ${PALETTE.GOLD.PRIMARY}15`,
              transform: 'translateY(-5px)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(212,175,55,0.05) 0%, transparent 50%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3, md: 4 }, flex: 1 }}>
              <Box sx={{ 
                width: { xs: 70, sm: 80, md: 90 }, 
                height: { xs: 70, sm: 80, md: 90 }, 
                borderRadius: '50%', 
                background: PALETTE.GOLD.GRADIENT,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: PALETTE.NEUTRAL.BLACK,
                fontWeight: 'bold',
                fontSize: { xs: 28, sm: 32, md: 36 },
                boxShadow: `0 15px 35px ${PALETTE.GOLD.PRIMARY}40`,
                border: `3px solid ${PALETTE.NEUTRAL.WHITE}`,
                flexShrink: 0,
                fontFamily: 'Orbitron, monospace',
                animation: 'float 6s ease-in-out infinite',
                animationDelay: `${catIndex * 0.5}s`
              }}>
                {catIndex + 1}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
                  color: PALETTE.RED.DARK,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  fontFamily: 'Montserrat, sans-serif',
                  mb: 1
                }}>
                  {category.nom}
                </Typography>
                {category.description && (
                  <Typography variant="body1" color={PALETTE.BROWN.PRIMARY} sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    lineHeight: 1.6
                  }}>
                    {category.description}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton sx={{ 
              background: PALETTE.GOLD.GRADIENT,
              color: PALETTE.NEUTRAL.BLACK,
              '&:hover': { 
                background: `linear-gradient(135deg, ${PALETTE.GOLD.DARK} 0%, ${PALETTE.GOLD.PRIMARY} 100%)`,
                transform: 'rotate(180deg)'
              },
              ml: 2,
              flexShrink: 0,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 }
            }}>
              {expandedCategories[category.id] ? 
                <ExpandLessIcon sx={{ fontSize: { xs: 24, sm: 28 } }} /> : 
                <ExpandMoreIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
              }
            </IconButton>
          </Box>
          
          {/* Category Stats */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2, md: 3 }, 
            mt: 3,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1
          }}>
            <Chip 
              icon={<PersonAddIcon />}
              label={`${category.candidats?.length || 0} Candidat${category.candidats?.length !== 1 ? 's' : ''}`}
              sx={{ 
                background: `rgba(212, 175, 55, 0.15)`,
                color: PALETTE.GOLD.DARK,
                fontWeight: 600,
                border: `1px solid ${PALETTE.GOLD.PRIMARY}40`,
                height: 36,
                '& .MuiChip-icon': {
                  color: PALETTE.GOLD.PRIMARY
                }
              }}
            />
            <Chip 
              icon={<VoteIcon />}
              label={`${category.total_votes_categorie?.toLocaleString() || 0} Vote${category.total_votes_categorie !== 1 ? 's' : ''}`}
              sx={{ 
                background: `rgba(198, 40, 40, 0.15)`,
                color: PALETTE.RED.PRIMARY,
                fontWeight: 600,
                border: `1px solid ${PALETTE.RED.PRIMARY}40`,
                height: 36,
                '& .MuiChip-icon': {
                  color: PALETTE.RED.PRIMARY
                }
              }}
            />
            <Chip 
              icon={<TrendingUpIcon />}
              label={`Top: ${category.candidats?.length > 0 ? 
                Math.max(...category.candidats.map(c => c.nombre_votes)).toLocaleString() : 0} votes`}
              sx={{ 
                background: `rgba(139, 69, 19, 0.15)`,
                color: PALETTE.BROWN.PRIMARY,
                fontWeight: 600,
                border: `1px solid ${PALETTE.BROWN.PRIMARY}40`,
                height: 36,
                '& .MuiChip-icon': {
                  color: PALETTE.BROWN.PRIMARY
                }
              }}
            />
          </Box>
        </Paper>

        {/* Candidates List */}
        <Collapse in={expandedCategories[category.id]} timeout={800}>
          <Grid container spacing={3}>
            {category.candidats && sortCandidatsByVotes(category.candidats).map((candidat, index) => 
              renderCandidatCard(candidat, category, index)
            )}
          </Grid>
        </Collapse>
      </Box>
    ));
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 4,
        background: `linear-gradient(135deg, ${PALETTE.NEUTRAL.WHITE} 0%, ${PALETTE.GOLD.PRIMARY}05 100%)`
      }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={120}
            thickness={4}
            sx={{ 
              color: PALETTE.GOLD.PRIMARY,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <VoteIcon sx={{ fontSize: 48, color: PALETTE.RED.PRIMARY }} />
          </Box>
        </Box>
        <Typography variant="h5" color={PALETTE.BROWN.PRIMARY} sx={{ 
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          Chargement des talents...
        </Typography>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Box className="scale-in" sx={{ width: '100%' }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 4,
              background: PALETTE.RED.GRADIENT,
              color: PALETTE.NEUTRAL.WHITE,
              boxShadow: `0 20px 40px rgba(139, 0, 0, 0.3)`,
              border: `2px solid ${PALETTE.GOLD.PRIMARY}`,
              animation: 'pulse 2s infinite'
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchCandidats}
                sx={{ 
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.2)',
                  border: `2px solid rgba(255,255,255,0.3)`,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Réessayer
              </Button>
            }
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Accès refusé
            </Typography>
            <Typography variant="body2">
              Vous devez vous déconnecter pour accéder à cette page
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  // No Data State
  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Box className="fade-in-up" sx={{ width: '100%' }}>
          <Alert severity="info" sx={{ 
            borderRadius: 4, 
            border: `2px solid ${PALETTE.GOLD.PRIMARY}`,
            background: `linear-gradient(135deg, ${PALETTE.NEUTRAL.WHITE} 0%, ${PALETTE.GOLD.PRIMARY}05 100%)`
          }}>
            <Typography variant="h5" fontWeight="bold" color={PALETTE.BROWN.PRIMARY} gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Aucune donnée disponible
            </Typography>
            <Typography variant="body2" color={PALETTE.BROWN.PRIMARY}>
              Aucune édition n'est actuellement en cours. Revenez bientôt !
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  // Main Render
  return (
    <>
      <style>{styles}</style>
      
      <Container maxWidth="xl" disableGutters sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${PALETTE.NEUTRAL.WHITE} 0%, ${PALETTE.NEUTRAL.GRAY_LIGHT} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: `linear-gradient(135deg, ${PALETTE.GOLD.PRIMARY}05 0%, ${PALETTE.RED.PRIMARY}03 50%, transparent 100%)`,
          zIndex: 0,
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Fade in={true}>
            <Box sx={{ 
              pt: { xs: 6, sm: 8, md: 10 },
              pb: { xs: 4, sm: 6 },
              px: { xs: 3, sm: 4, md: 6 },
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '10%',
                right: '10%',
                height: '2px',
                background: PALETTE.GOLD.GRADIENT,
                borderRadius: '1px'
              }
            }}>
              <Typography variant="h1" fontWeight="bold" gutterBottom sx={{ 
                color: PALETTE.RED.DARK,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontFamily: 'Montserrat, sans-serif',
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                background: `linear-gradient(135deg, ${PALETTE.RED.DARK} 0%, ${PALETTE.GOLD.PRIMARY} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {data.edition?.nom} {data.edition?.annee}
              </Typography>
              
              <Box sx={{ display: 'inline-flex', mb: 4 }}>
                <Chip
                  icon={data.edition?.statut_votes === 'en_cours' ? <VoteIcon /> : 
                        data.edition?.statut_votes === 'en_attente' ? <TimerIcon /> : 
                        <AccessTimeIcon />}
                  label={data.edition?.statut_votes === 'en_cours' ? 'Vote en cours' : 
                         data.edition?.statut_votes === 'en_attente' ? 'Vote en attente' : 'Vote terminé'}
                  sx={{ 
                    height: 48,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 'bold',
                    px: 4,
                    background: data.edition?.statut_votes === 'en_cours' 
                      ? PALETTE.GOLD.GRADIENT
                      : data.edition?.statut_votes === 'en_attente'
                        ? `linear-gradient(135deg, ${PALETTE.BROWN.LIGHT} 0%, ${PALETTE.BROWN.PRIMARY} 100%)`
                        : PALETTE.RED.GRADIENT,
                    color: PALETTE.NEUTRAL.BLACK,
                    fontFamily: 'Montserrat, sans-serif',
                    animation: data.edition?.statut_votes === 'en_cours' ? 'pulse 2s infinite' : 'none',
                    '& .MuiChip-icon': {
                      color: data.edition?.statut_votes === 'en_cours' ? PALETTE.NEUTRAL.BLACK : PALETTE.NEUTRAL.WHITE
                    }
                  }}
                />
              </Box>
              
              <Typography variant="h5" color={PALETTE.BROWN.PRIMARY} sx={{ 
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                lineHeight: 1.6,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400
              }}>
                {data.edition?.statut_votes === 'en_cours' 
                  ? 'Découvrez les talents exceptionnels et votez pour vos candidats préférés dans chaque catégorie. Chaque vote compte !' 
                  : data.edition?.statut_votes === 'en_attente' 
                    ? 'Les votes commenceront bientôt. En attendant, découvrez les candidats et leurs talents extraordinaires.' 
                    : 'Les votes sont terminés. Découvrez les résultats et les talents révélés lors de cette édition mémorable.'}
              </Typography>
            </Box>
          </Fade>

          {/* Main Content */}
          <Box sx={{ 
            px: { xs: 3, sm: 4, md: 6 },
            pb: { xs: 6, sm: 8, md: 10 }
          }}>
            {/* Countdown */}
            {(data.edition?.temps_restant || timeLeft) && renderCountdown()}

            {/* Statistics */}
            {renderStats()}

            {/* Categories */}
            {renderCategories()}
          </Box>
        </Box>

        {/* Payment Modal */}
        {selectedCandidatForPayment && (
          <PaymentModal
            open={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setSelectedCandidatForPayment(null);
            }}
            candidat={selectedCandidatForPayment}
            edition={data.edition}
            category={data.categories?.find(c => 
              c.candidats?.some(cand => cand.id === selectedCandidatForPayment.id)
            )}
            onSuccess={handlePaymentSuccess}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}

        {/* Photo and Video Modals */}
        {renderPhotoModal()}
        {renderVideoModal()}

        {/* Floating Action Buttons */}
        <Box sx={{ 
          position: 'fixed',
          bottom: 32,
          right: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 1000
        }}>
        </Box>
      </Container>
    </>
  );
};

export { PALETTE };
export default CandidatsPage;