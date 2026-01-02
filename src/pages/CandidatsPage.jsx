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
} from '@mui/icons-material';
import axios from '../api/axios';

// Importer PaymentModal depuis le fichier corrigé
import PaymentModal from './PaymentModal';

// Couleurs de la palette
const PALETTE = {
  OR: '#D4AF37',
  OR_LIGHT: '#FFD700',
  OR_DARK: '#B8860B',
  RED_DARK: '#8B0000',
  RED_DARK_LIGHT: '#B22222',
  BROWN: '#8B4513',
  BROWN_LIGHT: '#A0522D',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_DARK: '#333333',
};

// Transition pour les modals
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ZoomTransition = React.forwardRef(function ZoomTransition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const ScaleTransition = React.forwardRef(function ScaleTransition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

// Styles CSS
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulseGold {
    0%, 100% {
      box-shadow: 0 0 20px ${PALETTE.OR}80;
    }
    50% {
      box-shadow: 0 0 40px ${PALETTE.OR};
    }
  }

  @keyframes countdownDigit {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateY(-10px);
      opacity: 0.5;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes gradientGold {
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

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes photoZoomIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes videoModalOpen {
    0% {
      transform: scale(0.7) translateY(100px);
      opacity: 0;
    }
    70% {
      transform: scale(1.05) translateY(0);
      opacity: 1;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  .digital-font {
    font-family: 'Orbitron', monospace !important;
  }

  .candidat-card {
    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    animation-delay: calc(var(--card-index) * 0.1s);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .candidat-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(139, 0, 0, 0.15);
  }

  .vote-button-glow {
    animation: pulseGold 2s infinite;
  }

  .countdown-digit {
    animation: countdownDigit 1s ease;
  }

  .gradient-bg {
    background: linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 25%, ${PALETTE.OR} 50%, ${PALETTE.BROWN_LIGHT} 75%, ${PALETTE.RED_DARK_LIGHT} 100%);
    background-size: 400% 400%;
    animation: gradientGold 15s ease infinite;
  }

  .floating-card {
    animation: float 6s ease-in-out infinite;
  }

  .photo-shine::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(212, 175, 55, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: skewX(-25deg);
    transition: left 0.75s;
  }

  .photo-shine:hover::after {
    left: 150%;
  }
`;

const CandidatsPage = () => {
  const { nomEdition } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
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
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidats();
    
    const interval = setInterval(() => {
      fetchCandidats();
    }, 1800000);
    
    return () => clearInterval(interval);
  }, [fetchCandidats]);

  // Mettre à jour le décompte en temps réel
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
    
    // Vérifier si le vote est ouvert
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
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handlePaymentSuccess = (paymentData) => {
    // Rafraîchir les données sans recharger la page
    fetchCandidats();
    
    // Fermer le modal
    setPaymentModalOpen(false);
    setSelectedCandidatForPayment(null);
    
    // Afficher un message de succès
    alert('Votre vote a été enregistré avec succès !');
  };

  const handlePaymentError = (error) => {
    // Afficher l'erreur
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

  // Rendu du décompte
  const renderCountdown = () => {
    if (!data?.edition?.temps_restant && !timeLeft) return null;

    const displayTime = timeLeft || data.edition.temps_restant;
    
    if (displayTime.total_secondes <= 0) {
      return (
        <Grow in={true}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${PALETTE.OR}20 0%, ${PALETTE.RED_DARK}20 100%)`,
              border: `2px solid ${PALETTE.RED_DARK}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon />
              Le vote est terminé
            </Typography>
          </Alert>
        </Grow>
      );
    }

    return (
      <Fade in={true}>
        <Paper 
          className="gradient-bg"
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            mb: 4,
            borderRadius: 4,
            color: PALETTE.WHITE,
            textAlign: 'center',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(139, 0, 0, 0.3)',
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 2,
            mb: 3,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            <TimerIcon sx={{ fontSize: 32, animation: 'pulseGold 2s infinite' }} />
            {isVoteNotStarted() ? 'Début des votes dans :' : 'Fin des votes dans :'}
          </Typography>
          
          <Box className="countdown-container" sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1, sm: 2, md: 3 },
            flexWrap: 'wrap'
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
                  minWidth: { xs: 70, sm: 90, md: 100 },
                  background: 'rgba(139, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2 },
                  border: `2px solid ${PALETTE.OR}40`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  className="digital-font"
                  sx={{ 
                    fontSize: { xs: 28, sm: 36, md: 42 },
                    color: PALETTE.OR_LIGHT,
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                    lineHeight: 1,
                    letterSpacing: 2
                  }}
                >
                  {item.value.toString().padStart(2, '0')}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: 10, sm: 12 },
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Fade>
    );
  };

  // Rendu des statistiques
  const renderStats = () => {
    if (!data) return null;

    const stats = [
      { 
        value: data.statistiques?.total_candidats || 0, 
        label: 'Candidats', 
        icon: <PersonAddIcon />,
        gradient: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`
      },
      { 
        value: data.statistiques?.total_votes || 0, 
        label: 'Votes Totaux', 
        icon: <VoteIcon />,
        gradient: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.OR_DARK} 100%)`
      },
      { 
        value: data.categories?.length || 0, 
        label: 'Catégories', 
        icon: <CategoryIcon />,
        gradient: `linear-gradient(135deg, ${PALETTE.RED_DARK} 0%, ${PALETTE.BROWN_LIGHT} 100%)`
      },
      { 
        value: data.statistiques?.total_votes_today || 0, 
        label: 'Votes Aujourd\'hui', 
        icon: <TrendingUpIcon />,
        gradient: `linear-gradient(135deg, ${PALETTE.BROWN_LIGHT} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`
      },
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card 
                className="floating-card"
                sx={{ 
                  height: '100%',
                  background: stat.gradient,
                  color: PALETTE.WHITE,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: `0 20px 40px ${PALETTE.RED_DARK}40`
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h2" fontWeight="bold" sx={{ fontSize: { xs: 36, sm: 42 }, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontSize: { xs: 12, sm: 14 } }}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(5px)'
                    }}>
                      {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Modal photo
  const renderPhotoModal = () => (
    <Dialog
      open={photoModalOpen}
      onClose={handleCloseModals}
      TransitionComponent={ZoomTransition}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
        color: PALETTE.WHITE,
        borderBottom: `1px solid ${PALETTE.OR}40`,
        p: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedPhoto && (
              <Avatar 
                src={selectedPhoto} 
                sx={{ width: 40, height: 40, border: `2px solid ${PALETTE.WHITE}` }}
              />
            )}
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {selectedCandidatInfo && formatNomComplet(selectedCandidatInfo).prenoms}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                {selectedCandidatInfo?.categorie_nom}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseModals} 
            sx={{ 
              color: PALETTE.WHITE,
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative', bgcolor: PALETTE.BLACK }}>
        <Box sx={{ 
          position: 'relative', 
          paddingTop: '75%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Photo du candidat"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
        
        {selectedCandidatInfo && (
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(transparent, ${PALETTE.BLACK}E6)`,
            color: PALETTE.WHITE,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {formatNomComplet(selectedCandidatInfo).nomComplet}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Chip 
                icon={<SchoolIcon />}
                label={selectedCandidatInfo.universite}
                size="small"
                sx={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  color: PALETTE.WHITE,
                }}
              />
              <Chip 
                icon={<GroupsIcon />}
                label={selectedCandidatInfo.entite || selectedCandidatInfo.filiere}
                size="small"
                sx={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  color: PALETTE.WHITE,
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  // Modal vidéo corrigé avec gestion TikTok
  const renderVideoModal = () => {
    const isYouTube = selectedVideo?.includes('youtube.com') || selectedVideo?.includes('youtu.be');
    const isTikTok = selectedVideo?.includes('tiktok.com');
    const youTubeId = isYouTube ? getYouTubeId(selectedVideo) : null;

    // Nouvelle fonction pour extraire l'ID TikTok depuis l'URL
    const getTikTokId = (url) => {
      if (!url) return null;
      try {
        // Extraction de l'ID depuis différentes formes d'URL TikTok
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
        
        // Si c'est une URL courte, on la garde telle quelle
        return null;
      } catch (err) {
        console.error('Erreur parsing TikTok URL:', err);
        return null;
      }
    };

    const tiktokId = isTikTok ? getTikTokId(selectedVideo) : null;

    return (
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseModals}
        TransitionComponent={ScaleTransition}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            animation: videoModalOpen ? 'videoModalOpen 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${PALETTE.RED_DARK} 0%, ${PALETTE.BROWN} 100%)`,
          color: PALETTE.WHITE,
          borderBottom: `1px solid ${PALETTE.OR}40`,
          p: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VideoLibraryIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Vidéo du talent
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                  {selectedCandidatInfo && formatNomComplet(selectedCandidatInfo).nomComplet}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleCloseModals} 
              sx={{ 
                color: PALETTE.WHITE,
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: PALETTE.BLACK }}>
          {selectedCandidatInfo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom color={PALETTE.WHITE}>
                {formatNomComplet(selectedCandidatInfo).nomComplet}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Découvrez le talent exceptionnel de ce candidat
              </Typography>
            </Box>
          )}
          
          <Box sx={{ 
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: 3,
            background: PALETTE.BLACK,
            mb: 3
          }}>
            {isYouTube && youTubeId ? (
              // Player YouTube
              <iframe
                src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0&modestbranding=1`}
                title="Vidéo du candidat"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            ) : isTikTok ? (
              // Player TikTok - Solution optimisée
              (() => {
                // Solution 1: Utiliser l'API officielle TikTok si l'ID est disponible
                if (tiktokId) {
                  return (
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
                        borderRadius: '15px'
                      }}
                    />
                  );
                }
                
                // Solution 2: Fallback - Afficher une image avec un lien
                return (
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
                      color: PALETTE.WHITE,
                      textAlign: 'center',
                      p: 3,
                      background: `linear-gradient(135deg, ${PALETTE.BROWN}80 0%, ${PALETTE.RED_DARK}80 100%)`
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Vidéo TikTok
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                      Pour des raisons techniques, les vidéos TikTok doivent être visionnées directement sur leur plateforme.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      href={selectedVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                        color: PALETTE.WHITE,
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${PALETTE.OR_DARK} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Voir la vidéo sur TikTok
                    </Button>
                    <Typography variant="caption" sx={{ mt: 2, opacity: 0.7 }}>
                      (Ouvre dans un nouvel onglet)
                    </Typography>
                  </Box>
                );
              })()
            ) : selectedVideo && (selectedVideo.includes('.mp4') || selectedVideo.includes('.webm') || selectedVideo.includes('.mov')) ? (
              // Player pour vidéos directes (MP4, WebM, etc.)
              <video 
                controls 
                autoPlay
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              >
                <source src={selectedVideo} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            ) : (
              // Aucune vidéo disponible
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: PALETTE.WHITE,
                textAlign: 'center'
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
                        color: PALETTE.OR,
                        borderColor: PALETTE.OR,
                        mt: 2,
                        '&:hover': {
                          borderColor: PALETTE.OR_LIGHT,
                          color: PALETTE.OR_LIGHT
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
              border: `1px solid ${PALETTE.OR}20`
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" />
                    <strong>Catégorie:</strong> {selectedCandidatInfo.categorie_nom}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon fontSize="small" />
                    <strong>Université:</strong> {selectedCandidatInfo.universite}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupsIcon fontSize="small" />
                    <strong>Filière:</strong> {selectedCandidatInfo.filiere}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" />
                    <strong>Votes:</strong> {selectedCandidatInfo.nombre_votes}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          background: PALETTE.BLACK,
          borderTop: `1px solid ${PALETTE.OR}20`
        }}>
          {selectedVideo && (
            <Button 
              startIcon={<OpenInNewIcon />}
              href={selectedVideo}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: PALETTE.OR,
                '&:hover': { 
                  background: 'rgba(212, 175, 55, 0.1)',
                  color: PALETTE.OR_LIGHT
                }
              }}
            >
              Voir sur la plateforme
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  // Rendu d'un candidat individuel
  const renderCandidatCard = (candidat, category, index) => {
    if (!candidat) return null;
    
    const rank = getCandidatRank(category.candidats, candidat.id);
    const { nom, prenoms, nomComplet } = formatNomComplet(candidat);
    const percentage = calculateVotePercentage(candidat.nombre_votes, category.total_votes_categorie);
    
    const rankColors = {
      1: { 
        bg: `linear-gradient(135deg, ${PALETTE.OR_LIGHT} 0%, ${PALETTE.OR} 100%)`, 
        textColor: PALETTE.BROWN
      },
      2: { 
        bg: `linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)`, 
        textColor: PALETTE.GRAY_DARK
      },
      3: { 
        bg: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.BROWN_LIGHT} 100%)`, 
        textColor: PALETTE.WHITE
      }
    };

    return (
      <Grid 
        item 
        xs={12} 
        sm={6} 
        md={4} 
        lg={3} 
        key={candidat.id}
        style={{ '--card-index': index }}
      >
        <Card className="candidat-card" sx={{ 
          height: '100%', 
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${PALETTE.OR}20`,
          '&:hover': {
            borderColor: PALETTE.OR,
            boxShadow: `0 20px 40px ${PALETTE.RED_DARK}15`
          }
        }}>
          {/* Badge de rang */}
          {rank <= 3 && (
            <Box sx={{ 
              position: 'absolute',
              top: 15,
              right: 15,
              zIndex: 2,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.2) rotate(15deg)'
              }
            }}>
              <Badge
                badgeContent={
                  <Box sx={{ 
                    width: 50, 
                    height: 50,
                    borderRadius: '50%',
                    background: rankColors[rank].bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: rankColors[rank].textColor,
                    boxShadow: `0 4px 20px ${PALETTE.RED_DARK}30`,
                    border: `2px solid ${PALETTE.WHITE}`,
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}>
                    {rank}
                  </Box>
                }
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              />
            </Box>
          )}

          {/* Photo du candidat */}
          <Box sx={{ 
            height: 250, 
            position: 'relative',
            overflow: 'hidden',
            '&:hover::after': {
              left: '150%'
            }
          }} className="photo-shine">
            <CardMedia
              component="img"
              height="250"
              image={candidat.photo_url || candidat.photo}
              alt={nomComplet}
              sx={{ 
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => handlePhotoClick(candidat.photo_url || candidat.photo, candidat)}
            />
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '20px',
              color: 'white',
              '&:hover': {
                opacity: 1
              }
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Agrandir la photo">
                  <IconButton 
                    sx={{ 
                      color: PALETTE.WHITE,
                      background: 'rgba(139, 0, 0, 0.5)',
                      '&:hover': { 
                        background: 'rgba(139, 0, 0, 0.7)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoClick(candidat.photo_url || candidat.photo, candidat);
                    }}
                  >
                    <ZoomIcon />
                  </IconButton>
                </Tooltip>
                {candidat.video_url && (
                  <Tooltip title="Voir la vidéo">
                    <IconButton 
                      sx={{ 
                        color: PALETTE.WHITE,
                        background: 'rgba(212, 175, 55, 0.6)',
                        '&:hover': { 
                          background: 'rgba(212, 175, 55, 0.8)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick(candidat.video_url, candidat);
                      }}
                    >
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Nom et prénom séparés */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" color={PALETTE.RED_DARK} gutterBottom>
                {prenoms}
              </Typography>
              <Typography variant="h6" color={PALETTE.BROWN} sx={{ fontWeight: 'medium' }}>
                {nom}
              </Typography>
              
              {/* Sexe et rang */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption" color={PALETTE.BROWN}>
                  {candidat.sexe === 'F' ? 'Candidate' : 'Candidat'}
                </Typography>
                <Chip 
                  label={`Rang ${rank}`}
                  size="small"
                  sx={{ 
                    ml: 1,
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: rank <= 3 ? rankColors[rank].bg : `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
                    color: rank <= 3 ? rankColors[rank].textColor : PALETTE.WHITE
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: `${PALETTE.OR}40` }} />

            {/* Informations détaillées */}
            <Box sx={{ mb: 3 }}>
              {candidat.universite && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <SchoolIcon fontSize="small" sx={{ color: PALETTE.BROWN }} />
                  <Typography variant="body2" sx={{ flex: 1, color: PALETTE.GRAY_DARK }}>
                    <strong>Université:</strong> {candidat.universite}
                  </Typography>
                </Box>
              )}
              
              {(candidat.entite || candidat.filiere) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <GroupsIcon fontSize="small" sx={{ color: PALETTE.BROWN }} />
                  <Typography variant="body2" sx={{ flex: 1, color: PALETTE.GRAY_DARK }}>
                    <strong>Entité:</strong> {candidat.entite || candidat.filiere}
                  </Typography>
                </Box>
              )}
              
              {candidat.ethnie && (
                <Chip 
                  label={candidat.ethnie}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: PALETTE.OR,
                    color: PALETTE.BROWN,
                    '& .MuiChip-label': {
                      fontWeight: 'medium'
                    }
                  }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2, borderColor: `${PALETTE.OR}40` }} />

            {/* Statistiques de vote */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VoteIcon fontSize="small" sx={{ color: PALETTE.RED_DARK }} />
                  <Typography variant="body2" color={PALETTE.GRAY_DARK}>
                    <strong>Votes:</strong>
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold" color={PALETTE.RED_DARK}>
                  {candidat.nombre_votes}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={percentage}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  mb: 1,
                  background: `${PALETTE.OR}20`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                    borderRadius: 5
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color={PALETTE.BROWN}>
                  Classement: {rank}
                </Typography>
                <Typography variant="caption" color={PALETTE.RED_DARK} fontWeight="bold">
                  {percentage.toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
              {candidat.video_url && (
                <Tooltip title="Voir la vidéo du talent">
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => handleVideoClick(candidat.video_url, candidat)}
                    sx={{ 
                      background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
                      color: PALETTE.WHITE,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${PALETTE.BROWN_LIGHT} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Vidéo
                  </Button>
                </Tooltip>
              )}
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<VoteIcon />}
                onClick={() => handleVoteClick(candidat)}
                disabled={hasUserVotedForCandidat(candidat.id) || !isVoteOpen()}
                className={isVoteOpen() && !hasUserVotedForCandidat(candidat.id) ? "vote-button-glow" : ""}
                sx={{
                  background: hasUserVotedForCandidat(candidat.id) 
                    ? `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.GRAY_DARK} 100%)`
                    : `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                  color: PALETTE.WHITE,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: hasUserVotedForCandidat(candidat.id)
                      ? `linear-gradient(135deg, ${PALETTE.BROWN_LIGHT} 0%, #555 100%)`
                      : `linear-gradient(135deg, ${PALETTE.OR_DARK} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`,
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-disabled': {
                    background: '#ddd',
                    color: '#888'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {hasUserVotedForCandidat(candidat.id) 
                  ? 'Déjà voté ✓' 
                  : !isVoteOpen() 
                    ? 'Vote fermé' 
                    : 'Voter'
                }
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Rendu des catégories
  const renderCategories = () => {
    if (!data?.categories) return null;

    return data.categories.map((category, catIndex) => (
      <Box 
        key={category.id} 
        sx={{ 
          mb: 6,
          animation: 'fadeInUp 0.5s ease-out forwards',
          animationDelay: `${catIndex * 0.1}s`
        }}
      >
        {/* Header de la catégorie */}
        <Paper 
          onClick={() => toggleCategory(category.id)}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${PALETTE.OR}10 0%, ${PALETTE.RED_DARK}05 100%)`,
            border: `2px solid ${PALETTE.OR}40`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `linear-gradient(135deg, ${PALETTE.OR}15 0%, ${PALETTE.RED_DARK}10 100%)`,
              borderColor: PALETTE.OR,
              boxShadow: `0 10px 30px ${PALETTE.OR}20`
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flex: 1 }}>
              <Box sx={{ 
                width: { xs: 50, sm: 60 }, 
                height: { xs: 50, sm: 60 }, 
                borderRadius: '50%', 
                background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: PALETTE.WHITE,
                fontWeight: 'bold',
                fontSize: { xs: 20, sm: 24 },
                boxShadow: `0 8px 25px ${PALETTE.RED_DARK}30`,
                flexShrink: 0
              }}>
                {catIndex + 1}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                  color: PALETTE.RED_DARK,
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                  {category.nom}
                </Typography>
                {category.description && (
                  <Typography variant="body1" color={PALETTE.BROWN} sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {category.description}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton sx={{ 
              background: `${PALETTE.OR}20`,
              '&:hover': { background: `${PALETTE.OR}40` },
              ml: 2,
              flexShrink: 0
            }}>
              {expandedCategories[category.id] ? 
                <ExpandLessIcon sx={{ color: PALETTE.RED_DARK }} /> : 
                <ExpandMoreIcon sx={{ color: PALETTE.RED_DARK }} />
              }
            </IconButton>
          </Box>
          
          {/* Stats de la catégorie */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2, md: 3 }, 
            mt: 2,
            flexWrap: 'wrap'
          }}>
            <Chip 
              icon={<PersonAddIcon />}
              label={`${category.candidats?.length || 0} candidat${category.candidats?.length !== 1 ? 's' : ''}`}
              sx={{ 
                background: `${PALETTE.OR}15`,
                color: PALETTE.BROWN,
                fontWeight: 'medium',
                border: `1px solid ${PALETTE.OR}40`
              }}
            />
            <Chip 
              icon={<VoteIcon />}
              label={`${category.total_votes_categorie || 0} vote${category.total_votes_categorie !== 1 ? 's' : ''}`}
              sx={{ 
                background: `${PALETTE.RED_DARK}15`,
                color: PALETTE.RED_DARK,
                fontWeight: 'medium',
                border: `1px solid ${PALETTE.RED_DARK}40`
              }}
            />
            <Chip 
              icon={<TrendingUpIcon />}
              label={`Top: ${category.candidats?.length > 0 ? 
                Math.max(...category.candidats.map(c => c.nombre_votes)) : 0} votes`}
              sx={{ 
                background: `${PALETTE.BROWN}15`,
                color: PALETTE.BROWN,
                fontWeight: 'medium',
                border: `1px solid ${PALETTE.BROWN}40`
              }}
            />
          </Box>
        </Paper>

        {/* Liste des candidats */}
        <Collapse in={expandedCategories[category.id]} timeout="auto">
          <Grid container spacing={3}>
            {category.candidats && sortCandidatsByVotes(category.candidats).map((candidat, index) => 
              renderCandidatCard(candidat, category, index)
            )}
          </Grid>
        </Collapse>
      </Box>
    ));
  };

  // Rendu principal
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh',
        flexDirection: 'column',
        gap: 3,
        background: `linear-gradient(135deg, ${PALETTE.WHITE} 0%, ${PALETTE.OR}10 100%)`
      }}>
        <CircularProgress 
          size={80}
          thickness={4}
          sx={{ 
            color: PALETTE.OR,
          }}
        />
        <Typography variant="h6" color={PALETTE.BROWN}>
          Chargement des candidats...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${PALETTE.RED_DARK} 0%, ${PALETTE.BROWN} 100%)`,
            color: PALETTE.WHITE,
            boxShadow: `0 10px 30px ${PALETTE.RED_DARK}30`
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchCandidats}
              sx={{ 
                fontWeight: 'bold',
                border: `1px solid ${PALETTE.OR}60`,
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Réessayer
            </Button>
          }
        >
          <Typography variant="h6" fontWeight="bold">
            Erreur de chargement
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 3, border: `1px solid ${PALETTE.OR}` }}>
          <Typography variant="h6" fontWeight="bold" color={PALETTE.BROWN}>
            Aucune donnée disponible
          </Typography>
          <Typography variant="body2" color={PALETTE.BROWN}>
            Aucune édition n'est actuellement en cours.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <style>{styles}</style>
      
      <Container maxWidth="xl" sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: 6, 
        px: { xs: 2, sm: 3 },
        minHeight: '100vh'
      }}>
        {/* Header de l'édition */}
        <Fade in={true}>
          <Box sx={{ 
            mb: { xs: 4, sm: 5 }, 
            textAlign: 'center',
            background: `linear-gradient(135deg, ${PALETTE.OR}10 0%, ${PALETTE.RED_DARK}05 100%)`,
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            border: `2px solid ${PALETTE.OR}40`,
            boxShadow: `0 10px 40px ${PALETTE.OR}10`
          }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ 
              color: PALETTE.RED_DARK,
              fontSize: { xs: 28, sm: 36, md: 48 },
              mb: 1,
            }}>
              {data.edition?.nom} {data.edition?.annee}
            </Typography>
            
            <Chip
              icon={data.edition?.statut_votes === 'en_cours' ? <VoteIcon /> : 
                    data.edition?.statut_votes === 'en_attente' ? <TimerIcon /> : 
                    <AccessTimeIcon />}
              label={data.edition?.statut_votes === 'en_cours' ? 'Vote en cours' : 
                     data.edition?.statut_votes === 'en_attente' ? 'Vote en attente' : 'Vote terminé'}
              sx={{ 
                mb: 2,
                height: 40,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 'bold',
                px: 2,
                background: data.edition?.statut_votes === 'en_cours' 
                  ? `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.OR_DARK} 100%)`
                  : data.edition?.statut_votes === 'en_attente'
                    ? `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.BROWN_LIGHT} 100%)`
                    : `linear-gradient(135deg, ${PALETTE.RED_DARK} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`,
                color: PALETTE.WHITE
              }}
            />
            
            <Typography variant="h6" color={PALETTE.BROWN} paragraph sx={{ 
              maxWidth: 800,
              mx: 'auto',
              mb: 3,
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              lineHeight: 1.6
            }}>
              {data.edition?.statut_votes === 'en_cours' 
                ? 'Découvrez les talents exceptionnels et votez pour vos candidats préférés dans chaque catégorie.' 
                : data.edition?.statut_votes === 'en_attente' 
                  ? 'Les votes commenceront bientôt. En attendant, découvrez les candidats et leurs talents.' 
                  : 'Les votes sont terminés. Découvrez les résultats et les talents révélés lors de cette édition.'}
            </Typography>
          </Box>
        </Fade>

        {/* Décompte */}
        {(data.edition?.temps_restant || timeLeft) && renderCountdown()}

        {/* Statistiques */}
        {renderStats()}

        {/* Catégories et candidats */}
        {renderCategories()}
      </Container>

      {/* Modal de paiement */}
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

      {/* Modals photo et vidéo */}
      {renderPhotoModal()}
      {renderVideoModal()}

      {/* Bouton flottant */}
      {typeof window !== 'undefined' && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${PALETTE.BROWN_LIGHT} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`,
              transform: 'scale(1.1)'
            },
            zIndex: 1000,
            transition: 'all 0.3s ease',
            boxShadow: `0 8px 25px ${PALETTE.RED_DARK}50`,
            display: window.scrollY > 300 ? 'flex' : 'none'
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ExpandLessIcon />
        </Fab>
      )}
    </>
  );
};
export { PALETTE };

export default CandidatsPage;