import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '/api/axios';
import { useAuth } from '../../contexts/AuthContext';
import ChatModal from '../../components/Chat/ChatModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import ChatNotificationBell from '../../components/Chat/ChatNotificationBell';
import { toast } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Alert,
  Container,
  Divider,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
  CardActionArea,
  Fade,
  Grow,
  Zoom,
  Tooltip,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slide,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  HowToVote as VoteIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Videocam as VideocamIcon,
  Insights as InsightsIcon,
  Notifications as NotificationsIcon,
  OpenInNew as OpenInNewIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Message as MessageIcon,
  Forum as ForumIcon,
  Comment as CommentIcon,
  Sms as SmsIcon,
  ThumbUp as ThumbUpIcon,
  Email as EmailIcon,
  Launch as LaunchIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  Close as CloseIcon, // AJOUTÉ
  ContentCopy as ContentCopyIcon, // AJOUTÉ
} from '@mui/icons-material';

// Palette de couleurs
const PALETTE = {
  GOLD: '#D4AF37',
  GOLD_LIGHT: '#FFD700',
  GOLD_DARK: '#B8860B',
  RED_DARK: '#8B0000',
  RED_LIGHT: '#C53030',
  BROWN: '#8B4513',
  BROWN_LIGHT: '#A0522D',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_DARK: '#333333',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  CHAT_PRIMARY: '#6366F1',
  CHAT_SECONDARY: '#8B5CF6',
};

// Animation pour les cartes
const cardHoverAnimation = {
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  }
};

// Animation pour les boutons
const pulseAnimation = {
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)',
    },
  },
  animation: 'pulse 2s infinite',
};

const CandidatDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // États
  const [activeTab, setActiveTab] = useState(0);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Récupérer les données avec gestion d'erreur améliorée
  const { 
    data: candidatures, 
    isLoading: candidaturesLoading, 
    error: candidaturesError,
    refetch: refetchCandidatures 
  } = useQuery({
    queryKey: ['mes-candidatures'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/candidat/mes-candidatures');
        return response.data.data || [];
      } catch (error) {
        console.error('Erreur chargement candidatures:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fonction pour obtenir les éditions ouvertes (route fictive - à adapter)
  const fetchEditionsOuvertes = async () => {
    try {
      // Si cette route n'existe pas, utilisez une alternative
      const response = await axiosInstance.get('/editions?status=ouvert');
      return response.data.data || [];
    } catch (error) {
      console.log('Route editions-ouvertes non disponible, utilisation de données fictives');
      // Données fictives pour démonstration
      return [
        {
          id: 1,
          nom: "Talents 2024",
          annee: "2024",
          numero_edition: "5",
          description: "Concours annuel de talents",
          date_fin_inscriptions: "2024-12-31",
          categories: [
            { id: 1, nom: "Musique" },
            { id: 2, nom: "Danse" }
          ]
        }
      ];
    }
  };

  const { 
    data: editionsOuvertes = [], 
    isLoading: editionsLoading,
    refetch: refetchEditions 
  } = useQuery({
    queryKey: ['editions-suggestions'],
    queryFn: fetchEditionsOuvertes,
  });

  // Fonction pour obtenir les statistiques (route fictive - à adapter)
  const fetchStats = async () => {
    try {
      // Essayez différentes routes possibles
      const routes = ['/candidat/stats', '/candidat/statistiques', '/stats/candidat'];
      
      for (const route of routes) {
        try {
          const response = await axiosInstance.get(route);
          if (response.data) {
            return response.data.data || {};
          }
        } catch (e) {
          continue;
        }
      }
      
      // Si aucune route ne fonctionne, calculez les stats localement
      return calculateLocalStats(candidatures || []);
    } catch (error) {
      console.log('Calcul des stats locales');
      return calculateLocalStats(candidatures || []);
    }
  };

  // Fonction pour calculer les stats localement
  const calculateLocalStats = (candidaturesData) => {
    const activeCandidatures = candidaturesData?.filter(c => 
      ['validee', 'preselectionne', 'finaliste'].includes(c.statut)
    ).length || 0;
    
    const totalVotes = candidaturesData?.reduce((sum, c) => sum + (c.nombre_votes || 0), 0) || 0;
    
    const activeCandidature = candidaturesData?.find(c => c.statut === 'validee');
    
    return {
      candidatures_actives: activeCandidatures,
      total_votes: totalVotes,
      phase_actuelle: activeCandidature?.phase_actuelle || 1,
      editions_ouvertes: editionsOuvertes?.length || 0,
      total_candidatures: candidaturesData?.length || 0,
    };
  };

  const { 
    data: statsData = {}, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['candidat-stats', candidatures],
    queryFn: fetchStats,
    enabled: !!candidatures, // Ne s'exécute que si candidatures est chargé
  });

  // Fonctions utilitaires
  const getStatutInfo = (statut) => {
    const statusMap = {
      'en_attente': { 
        label: 'En attente', 
        color: 'warning', 
        icon: <PendingIcon />, 
        bgColor: PALETTE.WARNING,
        gradient: `linear-gradient(135deg, ${PALETTE.WARNING} 0%, #D97706 100%)`
      },
      'validee': { 
        label: 'Validée', 
        color: 'success', 
        icon: <CheckIcon />, 
        bgColor: PALETTE.SUCCESS,
        gradient: `linear-gradient(135deg, ${PALETTE.SUCCESS} 0%, #047857 100%)`
      },
      'refusee': { 
        label: 'Refusée', 
        color: 'error', 
        icon: <CancelIcon />, 
        bgColor: PALETTE.ERROR,
        gradient: `linear-gradient(135deg, ${PALETTE.ERROR} 0%, #DC2626 100%)`
      },
      'preselectionne': { 
        label: 'Présélectionné', 
        color: 'info', 
        icon: <TrendingIcon />, 
        bgColor: PALETTE.INFO,
        gradient: `linear-gradient(135deg, ${PALETTE.INFO} 0%, #1D4ED8 100%)`
      },
      'elimine': { 
        label: 'Éliminé', 
        color: 'default', 
        icon: <CancelIcon />, 
        bgColor: PALETTE.GRAY_DARK,
        gradient: `linear-gradient(135deg, ${PALETTE.GRAY_DARK} 0%, #4B5563 100%)`
      },
      'finaliste': { 
        label: 'Finaliste', 
        color: 'secondary', 
        icon: <TrophyIcon />, 
        bgColor: PALETTE.GOLD,
        gradient: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`
      },
      'gagnant': { 
        label: 'Gagnant', 
        color: 'success', 
        icon: <TrophyIcon />, 
        bgColor: PALETTE.SUCCESS,
        gradient: `linear-gradient(135deg, ${PALETTE.SUCCESS} 0%, #065F46 100%)`
      },
    };
    return statusMap[statut] || { 
      label: statut, 
      color: 'default', 
      icon: <WarningIcon />, 
      bgColor: PALETTE.GRAY_DARK,
      gradient: `linear-gradient(135deg, ${PALETTE.GRAY_DARK} 0%, #6B7280 100%)`
    };
  };

  const getPhaseLabel = (phase) => {
    const phases = {
      1: 'Présélection',
      2: 'Demi-finale',
      3: 'Phase finale',
      4: 'Grande finale',
    };
    return phases[phase] || `Phase ${phase}`;
  };

  // Gestion du chat améliorée
  const handleOpenChat = (categoryId, categoryName, candidature = null) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour accéder au chat');
      navigate('/login', { 
        state: { 
          from: '/dashboard',
          message: 'Connectez-vous pour accéder aux discussions'
        } 
      });
      return;
    }
    
    // Vérifier si le chat est disponible pour cette catégorie
    if (!categoryId) {
      toast.error('Catégorie non disponible pour le chat');
      return;
    }
    
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setSelectedCandidature(candidature);
    setChatModalOpen(true);
    
    // Animation feedback
    toast.success(`Ouverture du chat: ${categoryName}`);
  };

  const handleCloseChat = () => {
    setChatModalOpen(false);
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setSelectedCandidature(null);
  };

  // Gestion du partage
  const handleShare = (candidature) => {
    if (!candidature) {
      toast.error('Aucune candidature sélectionnée');
      return;
    }
    setSelectedCandidature(candidature);
    setShareDialogOpen(true);
  };

  const copyShareLink = () => {
    if (selectedCandidature) {
      const shareUrl = `${window.location.origin}/candidat/${selectedCandidature.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Lien copié dans le presse-papier !');
      setShareDialogOpen(false);
    }
  };

  // Données de statistiques améliorées
  const stats = [
    {
      title: 'Candidatures actives',
      value: statsData.candidatures_actives || 0,
      icon: <PersonIcon />,
      color: PALETTE.INFO,
      gradient: `linear-gradient(135deg, ${PALETTE.INFO} 0%, #1D4ED8 100%)`,
      label: 'En compétition',
      subValue: statsData.total_candidatures || 0,
      subLabel: 'Total',
    },
    {
      title: 'Total des votes',
      value: statsData.total_votes || 0,
      icon: <VoteIcon />,
      color: PALETTE.SUCCESS,
      gradient: `linear-gradient(135deg, ${PALETTE.SUCCESS} 0%, #047857 100%)`,
      label: 'Votes reçus',
      subValue: 'Top 10%',
      subLabel: 'Classement',
    },
    {
      title: 'Phase actuelle',
      value: getPhaseLabel(statsData.phase_actuelle || 1),
      icon: <TrendingIcon />,
      color: PALETTE.GOLD,
      gradient: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
      label: 'Avancement',
      subValue: `${Math.round(((statsData.phase_actuelle || 1) / 4) * 100)}%`,
      subLabel: 'Progression',
    },
    {
      title: 'Éditions ouvertes',
      value: statsData.editions_ouvertes || 0,
      icon: <TrophyIcon />,
      color: PALETTE.WARNING,
      gradient: `linear-gradient(135deg, ${PALETTE.WARNING} 0%, #D97706 100%)`,
      label: 'Opportunités',
      subValue: statsData.candidatures_actives || 0,
      subLabel: 'Actives',
    },
  ];

  // Candidature active principale
  const activeCandidature = candidatures?.find(c => c.statut === 'validee');

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    refetchCandidatures();
    refetchEditions();
    refetchStats();
    toast.success('Données rafraîchies !');
  };

  // Actions pour le SpeedDial
  const actions = [
    { 
      icon: <ChatIcon />, 
      name: 'Chat principal', 
      onClick: () => {
        if (activeCandidature) {
          handleOpenChat(activeCandidature.category_id, activeCandidature.category?.nom, activeCandidature);
        } else {
          toast.error('Aucune candidature active');
        }
      } 
    },
    { 
      icon: <ShareIcon />, 
      name: 'Partager profil', 
      onClick: () => {
        if (activeCandidature) {
          handleShare(activeCandidature);
        } else {
          toast.error('Aucune candidature active à partager');
        }
      } 
    },
    { 
      icon: <RefreshIcon />, 
      name: 'Rafraîchir', 
      onClick: handleRefresh 
    },
    { 
      icon: <DownloadIcon />, 
      name: 'Exporter', 
      onClick: () => toast.info('Fonctionnalité à venir') 
    },
  ];

  // Loading state amélioré
  if (candidaturesLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh', 
          flexDirection: 'column', 
          gap: 3 
        }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Skeleton variant="rounded" height={200} sx={{ mb: 3, borderRadius: 4 }} />
            <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
            <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          </Box>
          <Typography variant="h6" color={PALETTE.BROWN}>
            Chargement de vos candidatures...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state amélioré
  if (candidaturesError && !candidatures) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${PALETTE.ERROR} 0%, ${PALETTE.RED_DARK} 100%)`,
            color: PALETTE.WHITE,
            animation: 'shake 0.5s ease-in-out',
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '25%': { transform: 'translateX(-5px)' },
              '75%': { transform: 'translateX(5px)' },
            }
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
              sx={{ fontWeight: 'bold' }}
            >
              Réessayer
            </Button>
          }
        >
          <Typography variant="h6" fontWeight="bold">
            Erreur de chargement
          </Typography>
          <Typography variant="body2">
            {candidaturesError.message || 'Impossible de charger vos candidatures.'}
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/postuler')}
          sx={{
            background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
            color: PALETTE.BLACK,
            fontWeight: 'bold',
          }}
        >
          Postuler à une nouvelle édition
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      mt: { xs: 2, sm: 4 }, 
      mb: 6, 
      px: { xs: 1, sm: 2, md: 3 }, 
      position: 'relative',
      minHeight: '100vh',
    }}>
      {/* Header avec bienvenue amélioré */}
      <Fade in={true} timeout={800}>
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4, lg: 6 },
            mb: 4,
            borderRadius: { xs: 3, md: 4 },
            background: `linear-gradient(135deg, ${PALETTE.RED_DARK} 0%, ${PALETTE.BROWN} 100%)`,
            color: PALETTE.WHITE,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(139, 0, 0, 0.3)',
            ...cardHoverAnimation,
          }}
        >
          {/* Éléments décoratifs animés */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle at center, ${alpha(PALETTE.GOLD, 0.2)} 0%, transparent 70%)`,
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            }
          }} />
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ position: 'relative' }}>
                <Typography variant="h2" fontWeight="bold" sx={{ 
                  fontSize: { xs: 24, sm: 32, md: 40, lg: 48 },
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #FFD700, #FFFFFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Bonjour, {user?.prenoms} ! 👋
                </Typography>
                
                <Typography variant="h6" sx={{ 
                  opacity: 0.9, 
                  mb: 4,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  lineHeight: 1.6,
                }}>
                  Bienvenue dans votre espace candidat. Suivez l'avancement de vos candidatures, 
                  recevez des votes et montez sur le podium !
                </Typography>
                
                {activeCandidature ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Chip
                      label={getPhaseLabel(activeCandidature.phase_actuelle)}
                      sx={{
                        bgcolor: PALETTE.GOLD,
                        color: PALETTE.BLACK,
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        height: { xs: 32, sm: 36 },
                        '& .MuiChip-label': { px: 2 },
                        ...pulseAnimation,
                      }}
                    />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      En compétition dans <strong>{activeCandidature.edition?.nom}</strong>
                    </Typography>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    href="/postuler"
                    sx={{
                      background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                      color: PALETTE.BLACK,
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      mt: 2,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${PALETTE.GOLD_LIGHT} 0%, ${PALETTE.GOLD} 100%)`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Postuler à une édition
                  </Button>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={user?.photo_url}
                  sx={{
                    width: { xs: 80, sm: 100, md: 120, lg: 140 },
                    height: { xs: 80, sm: 100, md: 120, lg: 140 },
                    border: `4px solid ${PALETTE.GOLD}`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  {user?.prenoms?.[0]}{user?.nom?.[0]}
                </Avatar>
                <Box sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: PALETTE.SUCCESS,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${PALETTE.WHITE}`,
                  animation: 'pulse 2s infinite',
                }} />
              </Box>
              
              {/* Notifications et bouton chat */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <ChatNotificationBell />
                
                {/* Bouton Chat principal */}
                {activeCandidature && (
                  <Tooltip title="Ouvrir le chat de votre catégorie">
                    <IconButton
                      onClick={() => handleOpenChat(
                        activeCandidature.category_id, 
                        activeCandidature.category?.nom, 
                        activeCandidature
                      )}
                      sx={{
                        bgcolor: PALETTE.CHAT_PRIMARY,
                        color: PALETTE.WHITE,
                        '&:hover': {
                          bgcolor: PALETTE.CHAT_SECONDARY,
                          transform: 'rotate(15deg)',
                        },
                        transition: 'all 0.3s ease',
                        ...pulseAnimation,
                      }}
                    >
                      <ChatIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Connecté en tant que {user?.prenoms}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Statistiques améliorées */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in={true} timeout={index * 200}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: stat.gradient,
                  color: PALETTE.WHITE,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  ...cardHoverAnimation,
                  cursor: 'pointer',
                  '&:hover .stat-icon': {
                    transform: 'scale(1.2) rotate(10deg)',
                  }
                }}
              >
                <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="h2" fontWeight="bold" sx={{ 
                        fontSize: { xs: 28, sm: 32, md: 36 }, 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                        lineHeight: 1,
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: { xs: 36, sm: 40, md: 44 },
                      height: { xs: 36, sm: 40, md: 44 },
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(5px)',
                      transition: 'transform 0.3s ease',
                      className: 'stat-icon'
                    }}>
                      {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 20, sm: 22, md: 24 } } })}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      label={stat.label}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: PALETTE.WHITE,
                        fontWeight: 'medium',
                        mb: 0.5
                      }}
                    />
                    {stat.subValue && (
                      <Typography variant="caption" sx={{ 
                        opacity: 0.8, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        fontSize: '0.7rem'
                      }}>
                        <span style={{ fontWeight: 'bold' }}>{stat.subValue}</span>
                        <span>•</span>
                        <span>{stat.subLabel}</span>
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Tabs principales améliorées */}
      <Card sx={{ 
        borderRadius: { xs: 2, sm: 3, md: 4 }, 
        overflow: 'hidden', 
        mb: 4,
        ...cardHoverAnimation 
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${PALETTE.BROWN}05 0%, ${PALETTE.RED_DARK}02 100%)`,
            backdropFilter: 'blur(10px)',
          }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              sx={{
                minHeight: 64,
                '& .MuiTab-root': {
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  fontWeight: 'bold',
                  color: PALETTE.BROWN,
                  minHeight: 64,
                  py: 1.5,
                  '&.Mui-selected': {
                    color: PALETTE.RED_DARK,
                  },
                  '&:hover': {
                    color: PALETTE.GOLD,
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: PALETTE.GOLD,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                }
              }}
            >
              <Tab 
                label="Mes Candidatures" 
                icon={<PersonIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label="Votes & Classement" 
                icon={<VoteIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label="Prochaines étapes" 
                icon={<TrendingIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label="Éditions suggérées" 
                icon={<TrophyIcon />} 
                iconPosition="start" 
              />
            </Tabs>
          </Box>

          {/* Contenu des tabs amélioré */}
          <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
            {/* Tab 1: Mes Candidatures - Amélioré */}
            {activeTab === 0 && (
              <Zoom in={true} timeout={500}>
                <Box>
                  {candidatures?.length > 0 ? (
                    <TableContainer 
                      component={Paper} 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 3,
                        overflow: 'auto',
                        maxHeight: { xs: 500, md: 600 },
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: `${PALETTE.GRAY_LIGHT}`,
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: `${PALETTE.GOLD}`,
                          borderRadius: '4px',
                          '&:hover': {
                            background: `${PALETTE.GOLD_DARK}`,
                          }
                        }
                      }}
                    >
                      <Table stickyHeader>
                        <TableHead sx={{ bgcolor: `${PALETTE.GOLD}10` }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 150 }}>Édition</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 120 }}>Catégorie</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 100 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 120 }}>Phase</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 120 }}>Statut</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 100 }}>Votes</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: PALETTE.BROWN, minWidth: 150 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidatures.map((candidature) => {
                            const statutInfo = getStatutInfo(candidature.statut);
                            return (
                              <TableRow 
                                key={candidature.id} 
                                hover
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: `${PALETTE.GOLD}05`,
                                    transform: 'scale(1.002)',
                                  },
                                  '&:last-child td, &:last-child th': { border: 0 },
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                }}
                              >
                                <TableCell onClick={() => navigate(`/candidature/${candidature.id}`)}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {candidature.edition?.nom}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {candidature.edition?.annee}
                                  </Typography>
                                </TableCell>
                                
                                <TableCell>
                                  <Chip
                                    label={candidature.category?.nom || 'Non spécifiée'}
                                    size="small"
                                    sx={{ 
                                      bgcolor: `${PALETTE.INFO}20`,
                                      color: PALETTE.INFO,
                                      fontWeight: 'medium',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        bgcolor: `${PALETTE.INFO}30`,
                                        transform: 'translateY(-2px)',
                                      },
                                      transition: 'all 0.2s ease',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (candidature.category_id) {
                                        handleOpenChat(candidature.category?.id, candidature.category?.nom, candidature);
                                      } else {
                                        toast.error('Catégorie non disponible pour le chat');
                                      }
                                    }}
                                    icon={<ChatIcon fontSize="small" />}
                                  />
                                </TableCell>
                                
                                <TableCell>
                                  {candidature.created_at ? 
                                    new Date(candidature.created_at).toLocaleDateString('fr-FR') : 
                                    'Non définie'
                                  }
                                </TableCell>
                                
                                <TableCell>
                                  <Chip
                                    label={getPhaseLabel(candidature.phase_actuelle)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: PALETTE.GOLD,
                                      color: PALETTE.BROWN,
                                      '&:hover': {
                                        bgcolor: `${PALETTE.GOLD}10`,
                                      }
                                    }}
                                  />
                                </TableCell>
                                
                                <TableCell>
                                  <Chip
                                    icon={statutInfo.icon}
                                    label={statutInfo.label}
                                    size="small"
                                    sx={{
                                      background: statutInfo.gradient,
                                      color: PALETTE.WHITE,
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                  />
                                </TableCell>
                                
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <VoteIcon sx={{ fontSize: 16, color: PALETTE.GOLD }} />
                                    <Typography variant="body2" fontWeight="bold">
                                      {candidature.nombre_votes || 0}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                
                                <TableCell>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {/* Bouton Chat amélioré */}
                                    {candidature.category_id && (
                                      <Tooltip title="Ouvrir le chat">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenChat(candidature.category?.id, candidature.category?.nom, candidature);
                                          }}
                                          sx={{ 
                                            color: PALETTE.CHAT_PRIMARY,
                                            bgcolor: `${PALETTE.CHAT_PRIMARY}10`,
                                            '&:hover': {
                                              bgcolor: `${PALETTE.CHAT_PRIMARY}20`,
                                              transform: 'rotate(15deg) scale(1.1)',
                                            },
                                            transition: 'all 0.3s ease',
                                          }}
                                        >
                                          <ChatIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    
                                    {candidature.video_url && (
                                      <Tooltip title="Voir la vidéo">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(candidature.video_url, '_blank');
                                          }}
                                          sx={{ 
                                            color: PALETTE.GOLD,
                                            bgcolor: `${PALETTE.GOLD}10`,
                                            '&:hover': {
                                              bgcolor: `${PALETTE.GOLD}20`,
                                              transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.3s ease',
                                          }}
                                        >
                                          <PlayIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    
                                    <Tooltip title="Partager">
                                      <IconButton
                                        size="small"
                                        sx={{ 
                                          color: PALETTE.INFO,
                                          bgcolor: `${PALETTE.INFO}10`,
                                          '&:hover': {
                                            bgcolor: `${PALETTE.INFO}20`,
                                            transform: 'scale(1.1)',
                                          },
                                          transition: 'all 0.3s ease',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShare(candidature);
                                        }}
                                      >
                                        <ShareIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    
                                    {candidature.statut === 'refusee' && candidature.motif_refus && (
                                      <Tooltip title="Voir le motif de refus">
                                        <IconButton
                                          size="small"
                                          sx={{ 
                                            color: PALETTE.ERROR,
                                            bgcolor: `${PALETTE.ERROR}10`,
                                            '&:hover': {
                                              bgcolor: `${PALETTE.ERROR}20`,
                                              transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.3s ease',
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            alert(`Motif de refus: ${candidature.motif_refus}`);
                                          }}
                                        >
                                          <ViewIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Card sx={{ 
                      textAlign: 'center', 
                      py: { xs: 6, md: 8 }, 
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(PALETTE.GOLD, 0.05)} 0%, ${alpha(PALETTE.WHITE, 0.1)} 100%)`,
                    }}>
                      <TrophyIcon sx={{ 
                        fontSize: { xs: 48, md: 64 }, 
                        color: `${PALETTE.GOLD}30`, 
                        mb: 3,
                        animation: 'bounce 2s infinite',
                        '@keyframes bounce': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-10px)' },
                        }
                      }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucune candidature pour le moment
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 4, 
                        maxWidth: 400, 
                        mx: 'auto',
                        px: 2 
                      }}>
                        Postulez à une édition pour commencer votre aventure et accéder aux discussions
                      </Typography>
                      <Button 
                        variant="contained" 
                        href="/postuler"
                        sx={{
                          background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                          color: PALETTE.BLACK,
                          fontWeight: 'bold',
                          px: 4,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 10px 20px ${alpha(PALETTE.GOLD, 0.3)}`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Postuler maintenant
                      </Button>
                    </Card>
                  )}
                </Box>
              </Zoom>
            )}

            {/* Tab 2: Votes & Classement */}
            {activeTab === 1 && (
              <Zoom in={true} timeout={500}>
                <Box>
                  {activeCandidature ? (
                    <>
                      <Card sx={{ mb: 3, borderRadius: 3 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" color={PALETTE.RED_DARK} gutterBottom>
                            Votre progression dans {activeCandidature.edition?.nom}
                          </Typography>
                          
                          {/* Barre de progression */}
                          <Box sx={{ mb: 4 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Phase actuelle: {getPhaseLabel(activeCandidature.phase_actuelle)}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {Math.round((activeCandidature.phase_actuelle / 4) * 100)}%
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={(activeCandidature.phase_actuelle / 4) * 100} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                bgcolor: `${PALETTE.GOLD}20`,
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(90deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                                  borderRadius: 5
                                }
                              }}
                            />
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                              {[1, 2, 3, 4].map((phase) => (
                                <Typography 
                                  key={phase} 
                                  variant="caption" 
                                  color={phase <= activeCandidature.phase_actuelle ? PALETTE.GOLD : 'text.secondary'}
                                  fontWeight={phase === activeCandidature.phase_actuelle ? 'bold' : 'normal'}
                                >
                                  {getPhaseLabel(phase)}
                                </Typography>
                              ))}
                            </Stack>
                          </Box>
                          
                          {/* Votes et classement */}
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                  <Typography variant="h2" fontWeight="bold" sx={{ 
                                    background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                  }}>
                                    {activeCandidature.nombre_votes || 0}
                                  </Typography>
                                  <Typography variant="body1" color="text.secondary" gutterBottom>
                                    Votes reçus
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ShareIcon />}
                                    sx={{ 
                                      borderColor: PALETTE.GOLD,
                                      color: PALETTE.GOLD,
                                      mt: 1,
                                      '&:hover': {
                                        borderColor: PALETTE.GOLD_DARK,
                                        bgcolor: `${PALETTE.GOLD}10`
                                      }
                                    }}
                                    onClick={() => handleShare(activeCandidature)}
                                  >
                                    Partager pour plus de votes
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={3}>
                              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                  <Typography variant="h2" fontWeight="bold" sx={{ 
                                    background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                  }}>
                                    #-
                                  </Typography>
                                  <Typography variant="body1" color="text.secondary" gutterBottom>
                                    Classement dans votre catégorie
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                      borderColor: PALETTE.GOLD,
                                      color: PALETTE.GOLD,
                                      mt: 1,
                                      '&:hover': {
                                        borderColor: PALETTE.GOLD_DARK,
                                        bgcolor: `${PALETTE.GOLD}10`
                                      }
                                    }}
                                    onClick={() => navigate(`/classement/${activeCandidature.category_id}`)}
                                  >
                                    Voir le classement complet
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                      
                      <Alert 
                        severity="info" 
                        sx={{ 
                          borderRadius: 3,
                          bgcolor: `${PALETTE.INFO}10`,
                          border: `1px solid ${PALETTE.INFO}30`
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Astuce :</strong> Partagez votre profil sur les réseaux sociaux 
                          pour recevoir plus de votes et augmenter vos chances de gagner !
                        </Typography>
                      </Alert>
                    </>
                  ) : (
                    <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                      <VoteIcon sx={{ fontSize: 64, color: `${PALETTE.GOLD}30`, mb: 3 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucune candidature active
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Vous devez avoir une candidature validée pour voir les votes et le classement
                      </Typography>
                      <Button 
                        variant="contained" 
                        href="/postuler"
                        sx={{
                          background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                          color: PALETTE.BLACK,
                          fontWeight: 'bold',
                          px: 4
                        }}
                      >
                        Postuler maintenant
                      </Button>
                    </Card>
                  )}
                </Box>
              </Zoom>
            )}

            {/* Tab 3: Prochaines étapes */}
            {activeTab === 2 && (
              <Zoom in={true} timeout={500}>
                <Box>
                  {activeCandidature ? (
                    <Grid container spacing={3}>
                      {[
                        {
                          phase: 1,
                          title: 'Présélection',
                          description: 'Votre candidature a été validée. Attendez les résultats de la présélection.',
                          date: '15-30 Nov 2024',
                          status: 'completed',
                        },
                        {
                          phase: 2,
                          title: 'Demi-finale',
                          description: 'Préparez votre deuxième performance. Les votes du public seront ouverts.',
                          date: '1-15 Déc 2024',
                          status: 'current',
                        },
                        {
                          phase: 3,
                          title: 'Phase finale',
                          description: 'Performance spéciale devant le jury. Les votes comptent double.',
                          date: '16-31 Déc 2024',
                          status: 'upcoming',
                        },
                        {
                          phase: 4,
                          title: 'Grande finale',
                          description: 'Grande finale avec spectacle live. Les gagnants seront annoncés.',
                          date: '10 Janv 2025',
                          status: 'upcoming',
                        },
                      ].map((etape, index) => (
                        <Grid item xs={12} md={3} key={etape.phase}>
                          <Card 
                            sx={{ 
                              height: '100%',
                              border: etape.status === 'current' ? `2px solid ${PALETTE.GOLD}` : '1px solid',
                              borderColor: 'divider',
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 10px 30px ${alpha(PALETTE.GOLD, 0.2)}`,
                              }
                            }}
                          >
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: etape.status === 'completed' ? `${PALETTE.SUCCESS}20` :
                                            etape.status === 'current' ? `${PALETTE.GOLD}20` :
                                            `${PALETTE.GRAY_LIGHT}`,
                                    color: etape.status === 'completed' ? PALETTE.SUCCESS :
                                          etape.status === 'current' ? PALETTE.GOLD :
                                          'text.secondary',
                                  }}>
                                    {etape.status === 'completed' ? (
                                      <CheckIcon />
                                    ) : (
                                      <Typography variant="h6" fontWeight="bold">
                                        {etape.phase}
                                      </Typography>
                                    )}
                                  </Box>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {etape.title}
                                    </Typography>
                                    <Chip
                                      label={
                                        etape.status === 'completed' ? 'Terminé' :
                                        etape.status === 'current' ? 'En cours' : 'À venir'
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: etape.status === 'completed' ? `${PALETTE.SUCCESS}20` :
                                                etape.status === 'current' ? `${PALETTE.WARNING}20` :
                                                `${PALETTE.GRAY_LIGHT}`,
                                        color: etape.status === 'completed' ? PALETTE.SUCCESS :
                                              etape.status === 'current' ? PALETTE.WARNING :
                                              'text.secondary',
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  </Box>
                                </Stack>
                                
                                <Typography variant="body2" color="text.secondary">
                                  {etape.description}
                                </Typography>
                                
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CalendarIcon sx={{ fontSize: 16, color: PALETTE.GOLD }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {etape.date}
                                  </Typography>
                                </Stack>
                                
                                {etape.status === 'current' && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                      borderColor: PALETTE.GOLD,
                                      color: PALETTE.GOLD,
                                      '&:hover': {
                                        borderColor: PALETTE.GOLD_DARK,
                                        bgcolor: `${PALETTE.GOLD}10`
                                      }
                                    }}
                                  >
                                    Préparer ma performance
                                  </Button>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        borderRadius: 3,
                        bgcolor: `${PALETTE.WARNING}10`,
                        border: `1px solid ${PALETTE.WARNING}30`
                      }}
                    >
                      <Typography variant="body2">
                        Vous n'avez pas de candidature active. Postulez à une édition pour voir 
                        les prochaines étapes de la compétition.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Zoom>
            )}

            {/* Tab 4: Éditions suggérées */}
            {activeTab === 3 && (
              <Zoom in={true} timeout={500}>
                <Box>
                  {editionsOuvertes?.length > 0 ? (
                    <>
                      <Grid container spacing={3}>
                        {editionsOuvertes.map((edition) => (
                          <Grid item xs={12} md={4} key={edition.id}>
                            <Card 
                              sx={{ 
                                height: '100%',
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: `0 15px 40px ${alpha(PALETTE.GOLD, 0.15)}`,
                                }
                              }}
                            >
                              <CardContent>
                                <Stack spacing={2}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                      <Typography variant="h6" fontWeight="bold">
                                        {edition.nom}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {edition.annee} - {edition.numero_edition}ème édition
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label="Inscriptions ouvertes"
                                      size="small"
                                      sx={{ 
                                        bgcolor: `${PALETTE.SUCCESS}20`,
                                        color: PALETTE.SUCCESS,
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  </Stack>
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}>
                                    {edition.description}
                                  </Typography>
                                  
                                  <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography variant="body2" color="text.secondary">
                                        Clôture des inscriptions
                                      </Typography>
                                      <Typography variant="body2" fontWeight="medium">
                                        {edition.date_fin_inscriptions ? 
                                          new Date(edition.date_fin_inscriptions).toLocaleDateString('fr-FR') : 
                                          'Non définie'
                                        }
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography variant="body2" color="text.secondary">
                                        Catégories disponibles
                                      </Typography>
                                      <Typography variant="body2">
                                        {edition.categories?.length || 0}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                  
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1}>
                                      {edition.categories?.slice(0, 2).map((category) => (
                                        <Chip
                                          key={category.id}
                                          label={category.nom}
                                          size="small"
                                          variant="outlined"
                                          sx={{ 
                                            borderColor: PALETTE.GOLD,
                                            color: PALETTE.BROWN
                                          }}
                                        />
                                      ))}
                                      {edition.categories?.length > 2 && (
                                        <Chip
                                          label={`+${edition.categories.length - 2}`}
                                          size="small"
                                        />
                                      )}
                                    </Stack>
                                    
                                    <Button
                                      variant="contained"
                                      size="small"
                                      href={`/postuler?edition=${edition.id}`}
                                      sx={{
                                        background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                                        color: PALETTE.BLACK,
                                        fontWeight: 'bold',
                                        '&:hover': {
                                          background: `linear-gradient(135deg, ${PALETTE.GOLD_LIGHT} 0%, ${PALETTE.GOLD} 100%)`,
                                        }
                                      }}
                                    >
                                      Postuler
                                    </Button>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                      
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mt: 3,
                          borderRadius: 3,
                          bgcolor: `${PALETTE.INFO}10`,
                          border: `1px solid ${PALETTE.INFO}30`
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Conseil :</strong> Vous pouvez postuler à plusieurs éditions simultanément, 
                          mais pas à plusieurs catégories dans la même édition.
                        </Typography>
                      </Alert>
                    </>
                  ) : (
                    <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                      <CalendarIcon sx={{ fontSize: 64, color: `${PALETTE.GOLD}30`, mb: 3 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucune édition ouverte actuellement
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Les prochaines éditions seront annoncées bientôt
                      </Typography>
                    </Card>
                  )}
                </Box>
              </Zoom>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Section "Chats disponibles" - NOUVELLE SECTION */}
      <Slide direction="up" in={true} timeout={800}>
        <Card sx={{ 
          borderRadius: 4, 
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(PALETTE.CHAT_PRIMARY, 0.05)} 0%, ${alpha(PALETTE.CHAT_SECONDARY, 0.05)} 100%)`,
          border: `1px solid ${alpha(PALETTE.CHAT_PRIMARY, 0.1)}`,
          ...cardHoverAnimation,
        }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ 
                  color: PALETTE.CHAT_PRIMARY,
                  background: `linear-gradient(45deg, ${PALETTE.CHAT_PRIMARY}, ${PALETTE.CHAT_SECONDARY})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Discussions disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Communiquez avec les autres candidats et le promoteur
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatNotificationBell />
                <Tooltip title="Rafraîchir les discussions">
                  <IconButton 
                    size="small" 
                    onClick={handleRefresh}
                    sx={{ color: PALETTE.CHAT_PRIMARY }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
            
            {candidatures?.filter(c => ['validee', 'preselectionne', 'finaliste'].includes(c.statut)).length > 0 ? (
              <Grid container spacing={2}>
                {candidatures
                  .filter(c => ['validee', 'preselectionne', 'finaliste'].includes(c.statut))
                  .map((candidature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={candidature.id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          borderRadius: 3,
                          cursor: 'pointer',
                          border: `1px solid ${alpha(PALETTE.CHAT_PRIMARY, 0.2)}`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: PALETTE.CHAT_PRIMARY,
                            bgcolor: `${PALETTE.CHAT_PRIMARY}04`,
                            transform: 'translateY(-4px) scale(1.02)',
                            boxShadow: `0 8px 25px ${alpha(PALETTE.CHAT_PRIMARY, 0.15)}`,
                          }
                        }}
                        onClick={() => {
                          if (candidature.category_id) {
                            handleOpenChat(candidature.category_id, candidature.category?.nom, candidature);
                          } else {
                            toast.error('Catégorie non disponible pour le chat');
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                bgcolor: PALETTE.CHAT_PRIMARY,
                                width: 50,
                                height: 50,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'rotate(10deg)',
                                }
                              }}
                            >
                              <ChatIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {candidature.category?.nom || 'Général'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {candidature.edition?.nom}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip
                                  label="Ouvrir la discussion"
                                  size="small"
                                  icon={<ForumIcon />}
                                  sx={{ 
                                    bgcolor: `${PALETTE.CHAT_PRIMARY}15`,
                                    color: PALETTE.CHAT_PRIMARY,
                                    fontWeight: 'medium',
                                    fontSize: '0.75rem',
                                  }}
                                />
                                <Chip
                                  label={`${candidature.nombre_votes || 0} votes`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderColor: PALETTE.GOLD,
                                    color: PALETTE.GOLD_DARK,
                                    fontSize: '0.75rem',
                                  }}
                                />
                              </Stack>
                            </Box>
                            <ArrowIcon sx={{ 
                              color: PALETTE.CHAT_PRIMARY,
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                              }
                            }} />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <Paper sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(PALETTE.GRAY_LIGHT, 0.5)} 0%, ${alpha(PALETTE.WHITE, 0.5)} 100%)`,
              }}>
                <ChatIcon sx={{ 
                  fontSize: 64, 
                  color: `${PALETTE.CHAT_PRIMARY}30`, 
                  mb: 3,
                  animation: 'float 3s ease-in-out infinite',
                }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune discussion disponible
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Rejoignez une catégorie validée pour participer aux discussions
                </Typography>
                <Button
                  variant="outlined"
                  href="/postuler"
                  startIcon={<CommentIcon />}
                  sx={{ 
                    borderColor: PALETTE.CHAT_PRIMARY,
                    color: PALETTE.CHAT_PRIMARY,
                    '&:hover': {
                      borderColor: PALETTE.CHAT_SECONDARY,
                      bgcolor: `${PALETTE.CHAT_PRIMARY}10`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Postuler pour discuter
                </Button>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Slide>

      {/* Dialog de partage */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          bgcolor: PALETTE.GOLD, 
          color: PALETTE.WHITE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShareIcon />
            <Typography variant="h6" fontWeight="bold">
              Partager votre candidature
            </Typography>
          </Box>
          <IconButton onClick={() => setShareDialogOpen(false)} sx={{ color: PALETTE.WHITE }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedCandidature && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {selectedCandidature.edition?.nom || 'Édition'} - {selectedCandidature.category?.nom || 'Catégorie'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Partagez votre profil pour recevoir plus de votes
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Lien de partage
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: `${PALETTE.GOLD}05`,
                    wordBreak: 'break-all'
                  }}
                >
                  <Typography variant="body2">
                    {`${window.location.origin}/candidat/${selectedCandidature.id}`}
                  </Typography>
                </Paper>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Partager sur
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center">
                  {[
                    { icon: <FacebookIcon />, color: '#1877F2', name: 'Facebook' },
                    { icon: <InstagramIcon />, color: '#E4405F', name: 'Instagram' },
                    { icon: <TwitterIcon />, color: '#1DA1F2', name: 'Twitter' },
                    { icon: <WhatsAppIcon />, color: '#25D366', name: 'WhatsApp' },
                  ].map((social) => (
                    <Tooltip key={social.name} title={social.name}>
                      <IconButton
                        sx={{
                          bgcolor: `${social.color}10`,
                          color: social.color,
                          width: 48,
                          height: 48,
                          '&:hover': {
                            bgcolor: `${social.color}20`,
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${PALETTE.GRAY_LIGHT}` }}>
          <Button onClick={() => setShareDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={copyShareLink}
            startIcon={<ContentCopyIcon />}
            sx={{
              bgcolor: PALETTE.GOLD,
              color: PALETTE.BLACK,
              '&:hover': {
                bgcolor: PALETTE.GOLD_DARK,
              }
            }}
          >
            Copier le lien
          </Button>
        </DialogActions>
      </Dialog>

      {/* SpeedDial pour actions rapides */}
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 16, sm: 24 }, 
          right: { xs: 16, sm: 24 },
          '& .MuiSpeedDial-fab': {
            bgcolor: PALETTE.GOLD,
            color: PALETTE.BLACK,
            '&:hover': {
              bgcolor: PALETTE.GOLD_DARK,
            },
            ...pulseAnimation,
          }
        }}
        icon={<SpeedDialIcon />}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
        open={speedDialOpen}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                bgcolor: PALETTE.CHAT_PRIMARY,
                color: PALETTE.WHITE,
                '&:hover': {
                  bgcolor: PALETTE.CHAT_SECONDARY,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }
            }}
          />
        ))}
      </SpeedDial>

      {/* Modal Chat */}
      <ChatModal
        open={chatModalOpen}
        onClose={handleCloseChat}
        categoryId={selectedCategoryId}
        categoryName={selectedCategoryName}
      />
    </Container>
  );
};

export default function ProtectedCandidatDashboard() {
  return (
    <ProtectedRoute roles={['candidat']}>
      <CandidatDashboard />
    </ProtectedRoute>
  );
}