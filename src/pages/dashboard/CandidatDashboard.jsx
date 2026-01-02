import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import ChatModal from '../../components/Chat/ChatModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import VotesStatsModal from '../../components/Candidat/VotesStatsModal';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  HowToVote as VoteIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
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
  Insights as InsightsIcon,
  Notifications as NotificationsIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

// Palette de couleurs améliorée
const PALETTE = {
  PRIMARY: '#8B0000',
  SECONDARY: '#D4AF37',
  ACCENT: '#B8860B',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
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
  GRAY_MEDIUM: '#E5E7EB',
  GRAY_DARK: '#6B7280',
  CHAT_PRIMARY: '#6366F1',
  CHAT_SECONDARY: '#8B5CF6',
};

// Animation pour les cartes
const cardHoverAnimation = {
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
  }
};

const CandidatDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { user, loading: authLoading, hasRole, logout } = useAuth();
  
  // États
  const [activeTab, setActiveTab] = useState(0);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [votesStatsOpen, setVotesStatsOpen] = useState(false);
  const [selectedStatsEdition, setSelectedStatsEdition] = useState(null);
  const [selectedStatsCategory, setSelectedStatsCategory] = useState(null);
  const [selectedVote, setSelectedVote] = useState(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    editionId: '',
    categoryId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    status: 'all',
    page: 1,
  });

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format heure
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Calculer le nombre de votes (montant / 100)
  const calculateVotesCount = (amount) => {
    const numAmount = Number(amount) || 0;
    return Math.floor(numAmount / 100);
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Utilisateur non authentifié, redirection vers login');
      navigate('/login');
      return;
    }
    
    // Vérifier si l'utilisateur a le rôle candidat
    if (user && !hasRole('candidat')) {
      console.log('Utilisateur n\'a pas le rôle candidat, redirection...');
      toast.error('Accès réservé aux candidats');
      
      // Rediriger selon le rôle
      if (hasRole('admin')) {
        navigate('/admin/dashboard');
      } else if (hasRole('promoteur')) {
        navigate('/promoteur/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, hasRole]);

  // Récupérer les données du dashboard
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useQuery({
    queryKey: ['candidat-dashboard', user?.id],
    queryFn: async () => {
      try {
        console.log('Fetching dashboard data for user:', user?.id);
        
        // Vérifier si l'utilisateur est authentifié
        if (!user) {
          throw new Error('Utilisateur non authentifié');
        }
        
        const response = await axiosInstance.get('/candidat/dashboard/stats');
        console.log('Dashboard response:', response.data);
        return response.data.data;
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        
        // Si erreur 401, déconnecter
        if (error.response?.status === 401) {
          console.log('Token expiré ou invalide, déconnexion...');
          logout();
          toast.error('Session expirée, veuillez vous reconnecter');
          navigate('/login');
        }
        
        throw error;
      }
    },
    enabled: !!user && hasRole('candidat'),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Récupérer les votes avec filtres
  const { 
    data: votesData, 
    isLoading: votesLoading,
    refetch: refetchVotes 
  } = useQuery({
    queryKey: ['candidat-votes', filters, user?.id],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.editionId) params.append('edition_id', filters.editionId);
        if (filters.categoryId) params.append('category_id', filters.categoryId);
        if (filters.dateFrom) params.append('date_from', filters.dateFrom);
        if (filters.dateTo) params.append('date_to', filters.dateTo);
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.page && filters.page > 1) params.append('page', filters.page);
        
        const response = await axiosInstance.get(`/candidat/dashboard/votes?${params}`);
        return response.data.data;
      } catch (error) {
        console.error('Erreur chargement votes:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
        return { votes: { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 }, stats: {} };
      }
    },
    enabled: !!user && activeTab === 1,
  });

  // Récupérer l'évolution des votes
  const { 
    data: evolutionData, 
    isLoading: evolutionLoading 
  } = useQuery({
    queryKey: ['votes-evolution', selectedStatsEdition, selectedStatsCategory, user?.id],
    queryFn: async () => {
      if (!selectedStatsEdition) return null;
      
      try {
        const params = new URLSearchParams();
        params.append('edition_id', selectedStatsEdition);
        if (selectedStatsCategory) params.append('category_id', selectedStatsCategory);
        
        const response = await axiosInstance.get(`/candidat/dashboard/votes/evolution?${params}`);
        return response.data.data;
      } catch (error) {
        console.error('Erreur chargement évolution:', error);
        return null;
      }
    },
    enabled: !!user && !!selectedStatsEdition,
  });

  // Fonction pour obtenir les infos de statut
  const getStatutInfo = (statut) => {
    const statusMap = {
      'en_attente': { 
        label: 'En attente', 
        color: 'warning', 
        icon: <PendingIcon />, 
        bgColor: PALETTE.WARNING,
      },
      'validee': { 
        label: 'Validée', 
        color: 'success', 
        icon: <CheckIcon />, 
        bgColor: PALETTE.SUCCESS,
      },
      'refusee': { 
        label: 'Refusée', 
        color: 'error', 
        icon: <CancelIcon />, 
        bgColor: PALETTE.ERROR,
      },
      'preselectionne': { 
        label: 'Présélectionné', 
        color: 'info', 
        icon: <TrendingIcon />, 
        bgColor: PALETTE.INFO,
      },
      'elimine': { 
        label: 'Éliminé', 
        color: 'default', 
        icon: <CancelIcon />, 
        bgColor: PALETTE.GRAY_DARK,
      },
      'finaliste': { 
        label: 'Finaliste', 
        color: 'secondary', 
        icon: <TrophyIcon />, 
        bgColor: PALETTE.GOLD,
      },
      'gagnant': { 
        label: 'Gagnant', 
        color: 'success', 
        icon: <TrophyIcon />, 
        bgColor: PALETTE.SUCCESS,
      },
    };
    return statusMap[statut] || { 
      label: statut, 
      color: 'default', 
      icon: <WarningIcon />, 
      bgColor: PALETTE.GRAY_DARK,
    };
  };

  // Fonction pour obtenir le statut du paiement
  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      'approved': { label: 'Payé', color: PALETTE.SUCCESS, bgColor: `${PALETTE.SUCCESS}15` },
      'completed': { label: 'Complété', color: PALETTE.SUCCESS, bgColor: `${PALETTE.SUCCESS}15` },
      'paid': { label: 'Payé', color: PALETTE.SUCCESS, bgColor: `${PALETTE.SUCCESS}15` },
      'success': { label: 'Succès', color: PALETTE.SUCCESS, bgColor: `${PALETTE.SUCCESS}15` },
      'pending': { label: 'En attente', color: PALETTE.WARNING, bgColor: `${PALETTE.WARNING}15` },
      'cancelled': { label: 'Annulé', color: PALETTE.ERROR, bgColor: `${PALETTE.ERROR}15` },
      'failed': { label: 'Échoué', color: PALETTE.ERROR, bgColor: `${PALETTE.ERROR}15` },
    };
    return statusMap[status] || { label: status, color: PALETTE.GRAY_DARK, bgColor: `${PALETTE.GRAY_DARK}15` };
  };

  // Gestion du chat
  const handleOpenChat = (categoryId, categoryName, candidature = null) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour accéder au chat');
      navigate('/login');
      return;
    }
    
    if (!categoryId) {
      toast.error('Catégorie non disponible pour le chat');
      return;
    }
    
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setSelectedCandidature(candidature);
    setChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setChatModalOpen(false);
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setSelectedCandidature(null);
  };

  // Gestion des statistiques de votes
  const handleOpenVotesStats = (editionId, categoryId = null) => {
    setSelectedStatsEdition(editionId);
    setSelectedStatsCategory(categoryId);
    setVotesStatsOpen(true);
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

  // Gestion des votes
  const handleViewVote = (vote) => {
    setSelectedVote(vote);
  };

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    refetchDashboard();
    if (activeTab === 1) refetchVotes();
    toast.success('Données rafraîchies !');
  };

  // Gestion de la pagination
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actions pour le SpeedDial
  const actions = [
    { 
      icon: <RefreshIcon />, 
      name: 'Rafraîchir', 
      onClick: handleRefresh 
    },
    { 
      icon: <DownloadIcon />, 
      name: 'Exporter', 
      onClick: () => {
        if (dashboardData?.candidatures?.[0]) {
          window.open(`/candidat/dashboard/export/votes?edition_id=${dashboardData.candidatures[0].edition_id}`, '_blank');
        } else {
          toast.error('Aucune donnée à exporter');
        }
      } 
    },
    { 
      icon: <ShareIcon />, 
      name: 'Partager', 
      onClick: () => {
        if (dashboardData?.candidatures?.[0]) {
          handleShare(dashboardData.candidatures[0]);
        } else {
          toast.error('Aucune candidature active à partager');
        }
      } 
    },
  ];

  // Données de statistiques
  const statsCards = [
    {
      title: 'Total des votes',
      value: dashboardData?.global_stats?.total_votes || 0,
      icon: <VoteIcon />,
      color: PALETTE.SUCCESS,
      label: 'Votes reçus',
      subValue: formatCurrency(dashboardData?.global_stats?.total_amount || 0),
      subLabel: 'Montant total',
      onClick: () => setActiveTab(1),
    },
    {
      title: 'Candidatures actives',
      value: dashboardData?.global_stats?.active_candidatures || 0,
      icon: <PersonIcon />,
      color: PALETTE.INFO,
      label: 'En compétition',
      subValue: dashboardData?.global_stats?.total_candidatures || 0,
      subLabel: 'Total',
      onClick: () => setActiveTab(0),
    },
    {
      title: 'Votants uniques',
      value: dashboardData?.global_stats?.unique_voters || 0,
      icon: <GroupsIcon />,
      color: PALETTE.GOLD,
      label: 'Personnes',
      subValue: formatCurrency(dashboardData?.global_stats?.vote_avg || 0),
      subLabel: 'Moyenne/vote',
    },
    {
      title: 'Classement moyen',
      value: `#${dashboardData?.global_stats?.average_ranking || '-'}`,
      icon: <TrophyIcon />,
      color: PALETTE.RED_DARK,
      label: 'Position',
      subValue: `${dashboardData?.ranking?.percentage || 0}%`,
      subLabel: 'Top',
      onClick: () => dashboardData?.ranking && handleOpenVotesStats(
        dashboardData.candidatures[0]?.edition_id,
        dashboardData.candidatures[0]?.category_id
      ),
    },
  ];

  // État de chargement de l'authentification
  if (authLoading) {
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
          <CircularProgress size={60} sx={{ color: PALETTE.GOLD }} />
          <Typography variant="h6" color={PALETTE.BROWN}>
            Vérification de l'authentification...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Vérifier si l'utilisateur est authentifié
  if (!user) {
    return null;
  }

  // Loading state du dashboard
  if (dashboardLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 3, height: 120 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Skeleton variant="text" width={80} height={40} />
                      <Skeleton variant="text" width={120} height={20} />
                    </Box>
                    <Skeleton variant="circular" width={40} height={40} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${PALETTE.ERROR} 0%, ${PALETTE.RED_DARK} 100%)`,
            color: PALETTE.WHITE,
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
            {dashboardError.message || 'Impossible de charger vos données.'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      mt: { xs: 1, sm: 2, md: 3 }, 
      mb: 6, 
      px: { xs: 1, sm: 2, md: 3 },
      position: 'relative',
    }}>
      {/* Header avec bienvenue */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${PALETTE.RED_DARK} 0%, ${PALETTE.BROWN} 100%)`,
          color: PALETTE.WHITE,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ position: 'relative' }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  background: 'linear-gradient(45deg, #FFD700, #FFFFFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Bonjour, {user?.prenoms} !
              </Typography>
              
              <Typography variant="body1" sx={{ 
                opacity: 0.9, 
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.5,
              }}>
                Bienvenue dans votre espace candidat. Suivez vos votes, 
                votre classement et gérez vos candidatures.
              </Typography>
              
              {dashboardData?.candidatures?.[0] ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Chip
                    label={`${dashboardData.candidatures[0].edition?.nom} - ${dashboardData.candidatures[0].category?.nom}`}
                    size="small"
                    sx={{
                      bgcolor: PALETTE.GOLD,
                      color: PALETTE.BLACK,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {dashboardData.global_stats?.total_votes || 0} votes reçus
                  </Typography>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  endIcon={<ArrowIcon />}
                  href="/postuler"
                  sx={{
                    background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                    color: PALETTE.BLACK,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    mt: 1,
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
                  width: { xs: 60, sm: 80, md: 100 },
                  height: { xs: 60, sm: 80, md: 100 },
                  border: `3px solid ${PALETTE.GOLD}`,
                }}
              >
                {user?.prenoms?.[0]}{user?.nom?.[0]}
              </Avatar>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <ChatNotificationBell />
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                Connecté en tant que {user?.prenoms}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Cartes de statistiques */}
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.9)} 0%, ${alpha(stat.color, 0.7)} 100%)`,
                color: PALETTE.WHITE,
                borderRadius: 2,
                ...cardHoverAnimation,
                cursor: stat.onClick ? 'pointer' : 'default',
              }}
              onClick={stat.onClick}
            >
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      fontWeight="bold" 
                      sx={{ 
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: isMobile ? 30 : 36,
                    height: isMobile ? 30 : 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {React.cloneElement(stat.icon, { 
                      sx: { fontSize: isMobile ? 16 : 20 } 
                    })}
                  </Box>
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={stat.label}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: PALETTE.WHITE,
                      fontWeight: 'medium',
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                  {stat.subValue && (
                    <Typography variant="caption" sx={{ 
                      opacity: 0.8, 
                      display: 'block',
                      fontSize: '0.7rem',
                      mt: 0.5
                    }}>
                      {stat.subValue} {stat.subLabel}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs principales */}
      <Card sx={{ 
        borderRadius: { xs: 2, sm: 3 }, 
        overflow: 'hidden', 
        mb: 4,
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${PALETTE.BROWN}05 0%, ${PALETTE.RED_DARK}02 100%)`,
          }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  fontWeight: 'bold',
                  color: PALETTE.BROWN,
                  minHeight: 48,
                  py: 1,
                  px: { xs: 1, sm: 2 },
                  '&.Mui-selected': {
                    color: PALETTE.RED_DARK,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: PALETTE.GOLD,
                  height: 3,
                }
              }}
            >
              <Tab 
                label={isMobile ? "Candidatures" : "Mes Candidatures"} 
                icon={isMobile ? <PersonIcon /> : undefined}
                iconPosition={isMobile ? "top" : "start"}
              />
              <Tab 
                label={isMobile ? "Votes" : "Votes & Statistiques"} 
                icon={isMobile ? <VoteIcon /> : undefined}
                iconPosition={isMobile ? "top" : "start"}
              />
              <Tab 
                label="Classement" 
                icon={isMobile ? <TrophyIcon /> : undefined}
                iconPosition={isMobile ? "top" : "start"}
              />
              {!isMobile && (
                <Tab 
                  label="Paiements" 
                  iconPosition="start"
                />
              )}
            </Tabs>
          </Box>

          {/* Contenu des tabs */}
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            
            {/* Tab 1: Mes Candidatures */}
            {activeTab === 0 && (
              <Box>
                {dashboardData?.candidatures?.length > 0 ? (
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    {dashboardData.candidatures.map((candidature) => {
                      const statutInfo = getStatutInfo(candidature.statut);
                      return (
                        <Grid item xs={12} md={6} key={candidature.id}>
                          <Card sx={{ height: '100%', borderRadius: 2 }}>
                            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                              <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box>
                                    <Typography variant={isMobile ? "subtitle2" : "h6"} fontWeight="bold">
                                      {candidature.edition?.nom}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {candidature.category?.nom}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    icon={statutInfo.icon}
                                    label={statutInfo.label}
                                    size="small"
                                    sx={{
                                      background: statutInfo.bgColor,
                                      color: PALETTE.WHITE,
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                </Stack>
                                
                                <Divider />
                                
                                <Stack spacing={1}>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">
                                      Votes
                                    </Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                      {candidature.nombre_votes || 0}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">
                                      Date d'inscription
                                    </Typography>
                                    <Typography variant="caption">
                                      {formatDate(candidature.created_at)}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth={isMobile}
                                    startIcon={<InsightsIcon />}
                                    onClick={() => handleOpenVotesStats(candidature.edition_id, candidature.category_id)}
                                  >
                                    {isMobile ? 'Stats' : 'Voir les stats'}
                                  </Button>
                                  {candidature.category_id && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      fullWidth={isMobile}
                                      startIcon={<ChatIcon />}
                                      onClick={() => handleOpenChat(candidature.category_id, candidature.category?.nom, candidature)}
                                    >
                                      {isMobile ? 'Chat' : 'Chat'}
                                    </Button>
                                  )}
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Card sx={{ textAlign: 'center', py: 6, borderRadius: 2 }}>
                    <PersonIcon sx={{ fontSize: 48, color: `${PALETTE.GOLD}30`, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucune candidature active
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      href="/postuler"
                      sx={{
                        background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                        color: PALETTE.BLACK,
                        fontWeight: 'bold',
                        mt: 2
                      }}
                    >
                      Postuler maintenant
                    </Button>
                  </Card>
                )}
              </Box>
            )}

            {/* Tab 2: Votes & Statistiques */}
            {activeTab === 1 && (
              <Box>
                {/* Filtres */}
                <Card sx={{ mb: 2, p: 1.5, borderRadius: 2 }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={6} sm={4} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel shrink size="small">Statut</InputLabel>
                        <Select
                          value={filters.status}
                          label="Statut"
                          size="small"
                          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                        >
                          <MenuItem value="all">Tous</MenuItem>
                          <MenuItem value="approved">Payé</MenuItem>
                          <MenuItem value="pending">En attente</MenuItem>
                          <MenuItem value="cancelled">Annulé</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel shrink size="small">Édition</InputLabel>
                        <Select
                          value={filters.editionId}
                          label="Édition"
                          size="small"
                          onChange={(e) => setFilters({...filters, editionId: e.target.value, page: 1})}
                        >
                          <MenuItem value="">Toutes</MenuItem>
                          {dashboardData?.candidatures?.map((c) => (
                            <MenuItem key={c.edition_id} value={c.edition_id}>
                              {c.edition?.nom}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {!isMobile && (
                      <Grid item sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel shrink size="small">Catégorie</InputLabel>
                          <Select
                            value={filters.categoryId}
                            label="Catégorie"
                            size="small"
                            onChange={(e) => setFilters({...filters, categoryId: e.target.value, page: 1})}
                          >
                            <MenuItem value="">Toutes</MenuItem>
                            {dashboardData?.candidatures?.map((c) => (
                              <MenuItem key={c.category_id} value={c.category_id}>
                                {c.category?.nom}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Du"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value, page: 1})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Au"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value, page: 1})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<FilterIcon />}
                        onClick={() => setFilters({
                          editionId: '',
                          categoryId: '',
                          dateFrom: '',
                          dateTo: '',
                          search: '',
                          status: 'all',
                          page: 1
                        })}
                      >
                        {isMobile ? 'Reset' : 'Réinitialiser'}
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Rechercher..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                        }}
                        placeholder="Nom, email, téléphone..."
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* Statistiques de la période */}
                {votesData?.stats && (
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      { label: 'Votes totaux', value: votesData.stats.total_votes, color: PALETTE.SUCCESS },
                      { label: 'Montant total', value: formatCurrency(votesData.stats.total_amount), color: PALETTE.GOLD },
                      { label: 'Votants uniques', value: votesData.stats.unique_voters, color: PALETTE.INFO },
                      { label: 'Paiements', value: votesData.stats.total_payments, color: PALETTE.PRIMARY },
                    ].map((stat, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant={isMobile ? "body2" : "h6"} fontWeight="bold" color={stat.color}>
                              {stat.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stat.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Tableau des votes */}
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold">
                        Liste des paiements
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {votesData?.votes?.total || 0} paiements
                      </Typography>
                    </Stack>
                    
                    {votesLoading ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : votesData?.votes?.data?.length > 0 ? (
                      <>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {!isMobile && <TableCell sx={{ fontWeight: 'bold', width: '50px' }}>N°</TableCell>}
                                <TableCell sx={{ fontWeight: 'bold', width: isMobile ? '80px' : '100px' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Votant</TableCell>
                                {!isMobile && <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Montant</TableCell>}
                                <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>Votes</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: isMobile ? '70px' : '80px' }}>Statut</TableCell>
                                {!isMobile && <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Méthode</TableCell>}
                                <TableCell sx={{ fontWeight: 'bold', width: '40px' }}></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {votesData.votes.data.map((vote, index) => {
                                const orderNumber = (votesData.votes.current_page - 1) * votesData.votes.per_page + index + 1;
                                const votesCount = calculateVotesCount(vote.amount);
                                const statusInfo = getPaymentStatusInfo(vote.status);
                                
                                return (
                                  <TableRow key={vote.id} hover>
                                    {!isMobile && (
                                      <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                          {orderNumber}
                                        </Typography>
                                      </TableCell>
                                    )}
                                    
                                    <TableCell>
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          {formatDate(vote.created_at)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatTime(vote.created_at)}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                      <Stack spacing={0.5}>
                                        <Typography variant="body2" fontWeight="medium" noWrap>
                                          {vote.votant?.fullname || 'Non spécifié'}
                                        </Typography>
                                        <Stack direction={isMobile ? "column" : "row"} spacing={0.5}>
                                          <Typography variant="caption" color="text.secondary" noWrap>
                                            {vote.votant?.phone || vote.customer_phone || ''}
                                          </Typography>
                                          {!isMobile && vote.votant?.phone && vote.votant?.email && (
                                            <Typography variant="caption" color="text.secondary">•</Typography>
                                          )}
                                          <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            noWrap
                                            sx={{ 
                                              maxWidth: isMobile ? '120px' : '150px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {vote.votant?.email || vote.email_votant}
                                          </Typography>
                                        </Stack>
                                      </Stack>
                                    </TableCell>
                                    
                                    {!isMobile && (
                                      <TableCell>
                                        <Typography fontWeight="bold" color={PALETTE.GOLD}>
                                          {formatCurrency(vote.amount)}
                                        </Typography>
                                      </TableCell>
                                    )}
                                    
                                    <TableCell>
                                      <Chip
                                        label={votesCount}
                                        size="small"
                                        sx={{
                                          bgcolor: `${PALETTE.INFO}15`,
                                          color: PALETTE.INFO,
                                          fontWeight: 'bold',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                    </TableCell>
                                    
                                    <TableCell>
                                      <Chip
                                        label={statusInfo.label}
                                        size="small"
                                        sx={{
                                          bgcolor: statusInfo.bgColor,
                                          color: statusInfo.color,
                                          fontWeight: 500,
                                          fontSize: '0.7rem',
                                        }}
                                      />
                                    </TableCell>
                                    
                                    {!isMobile && (
                                      <TableCell>
                                        <Chip
                                          label={vote.payment_method === 'mobile_money' ? 'Mobile' : 'Carte'}
                                          size="small"
                                          sx={{
                                            bgcolor: vote.payment_method === 'mobile_money' 
                                              ? `${PALETTE.SUCCESS}15` 
                                              : `${PALETTE.INFO}15`,
                                            color: vote.payment_method === 'mobile_money'
                                              ? PALETTE.SUCCESS
                                              : PALETTE.INFO,
                                            fontSize: '0.7rem',
                                          }}
                                        />
                                      </TableCell>
                                    )}
                                    
                                    <TableCell>
                                      <Tooltip title="Voir détails">
                                        <IconButton 
                                          size="small"
                                          onClick={() => handleViewVote(vote)}
                                        >
                                          <ViewIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        {/* Pagination */}
                        {votesData.votes.last_page > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Button
                                size="small"
                                disabled={votesData.votes.current_page === 1}
                                onClick={() => handlePageChange(votesData.votes.current_page - 1)}
                              >
                                Précédent
                              </Button>
                              <Typography variant="body2" color="text.secondary">
                                Page {votesData.votes.current_page} sur {votesData.votes.last_page}
                              </Typography>
                              <Button
                                size="small"
                                disabled={votesData.votes.current_page === votesData.votes.last_page}
                                onClick={() => handlePageChange(votesData.votes.current_page + 1)}
                              >
                                Suivant
                              </Button>
                            </Stack>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <VoteIcon sx={{ fontSize: 48, color: `${PALETTE.GOLD}30`, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Aucun paiement trouvé
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Aucun paiement ne correspond à vos filtres
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Tab 3: Classement */}
            {activeTab === 2 && (
              <Box>
                {dashboardData?.ranking ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Votre position dans le classement
                          </Typography>
                          
                          <Box sx={{ textAlign: 'center', py: isMobile ? 2 : 3 }}>
                            <Box sx={{
                              width: isMobile ? 120 : 150,
                              height: isMobile ? 120 : 150,
                              borderRadius: '50%',
                              background: `conic-gradient(${PALETTE.GOLD} 0% ${dashboardData.ranking.percentage}%, ${PALETTE.GRAY_LIGHT} ${dashboardData.ranking.percentage}% 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 16px',
                              position: 'relative',
                            }}>
                              <Box sx={{
                                width: isMobile ? 90 : 110,
                                height: isMobile ? 90 : 110,
                                borderRadius: '50%',
                                background: PALETTE.WHITE,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                              }}>
                                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" color={PALETTE.GOLD}>
                                  #{dashboardData.ranking.position}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  sur {dashboardData.ranking.total_participants}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="h6" color={PALETTE.GOLD} gutterBottom>
                              Top {dashboardData.ranking.percentage}%
                            </Typography>
                            
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {dashboardData.ranking.ahead}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Devant vous
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {dashboardData.ranking.behind}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Derrière vous
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top 5 du classement
                          </Typography>
                          <List dense>
                            {dashboardData.ranking.top_10?.slice(0, 5).map((candidature, index) => (
                              <ListItem 
                                key={candidature.id}
                                sx={{
                                  bgcolor: candidature.candidat_id === user?.id ? `${PALETTE.GOLD}10` : 'transparent',
                                  borderRadius: 1,
                                  mb: 0.5,
                                  py: 0.5,
                                }}
                              >
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 28, 
                                      height: 28, 
                                      fontSize: '0.8rem',
                                      bgcolor: index < 3 ? PALETTE.GOLD : PALETTE.GRAY_DARK 
                                    }}
                                  >
                                    {index + 1}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" fontWeight={candidature.candidat_id === user?.id ? 'bold' : 'normal'}>
                                      {candidature.candidat?.nom_complet || 'Candidat'}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="caption" color="text.secondary">
                                      {candidature.nombre_votes} votes
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Card sx={{ textAlign: 'center', py: 6, borderRadius: 2 }}>
                    <TrophyIcon sx={{ fontSize: 48, color: `${PALETTE.GOLD}30`, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucun classement disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Vous devez participer à une édition pour apparaître dans le classement
                    </Typography>
                  </Card>
                )}
              </Box>
            )}

            {/* Tab 4: Paiements (visible seulement sur desktop) */}
            {activeTab === 3 && !isMobile && (
              <Box>
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Tous vos paiements sont disponibles dans l'onglet "Votes & Statistiques"
                  </Typography>
                </Alert>
                
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Résumé des paiements
                    </Typography>
                    {votesData?.stats && (
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h4" fontWeight="bold" color={PALETTE.SUCCESS}>
                                {votesData.stats.approved_payments}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Paiements réussis
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h4" fontWeight="bold" color={PALETTE.WARNING}>
                                {votesData.stats.pending_payments}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                En attente
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h4" fontWeight="bold" color={PALETTE.ERROR}>
                                {votesData.stats.cancelled_payments}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Annulés
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h4" fontWeight="bold" color={PALETTE.INFO}>
                                {formatCurrency(votesData.stats.avg_vote_amount)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Moyenne/vote
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de détails du vote */}
      <Dialog 
        open={!!selectedVote} 
        onClose={() => setSelectedVote(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedVote && (
          <>
            <DialogTitle sx={{ 
              bgcolor: PALETTE.GOLD, 
              color: PALETTE.WHITE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VoteIcon fontSize="small" />
                <Typography variant="h6" fontWeight="bold">
                  Détails du paiement
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedVote(null)} sx={{ color: PALETTE.WHITE, p: 0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Informations du votant
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Nom complet</Typography>
                          <Typography variant="body2">
                            {selectedVote.votant?.fullname || 'Non spécifié'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body2">
                            {selectedVote.votant?.email || selectedVote.email_votant || 'Non spécifié'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                          <Typography variant="body2">
                            {selectedVote.votant?.phone || selectedVote.customer_phone || 'Non spécifié'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Détails du paiement
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Référence</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedVote.reference}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Montant</Typography>
                          <Typography variant="body2" fontWeight="bold" color={PALETTE.GOLD}>
                            {formatCurrency(selectedVote.amount)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Nombre de votes</Typography>
                          <Typography variant="body2">
                            {calculateVotesCount(selectedVote.amount)} votes (1 vote = 100 XOF)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">Statut</Typography>
                          <Chip
                            label={getPaymentStatusInfo(selectedVote.status).label}
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Méthode de paiement</Typography>
                          <Typography variant="body2">
                            {selectedVote.payment_method === 'mobile_money' ? 'Mobile Money' : 'Carte Bancaire'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date</Typography>
                          <Typography variant="body2">
                            {formatDate(selectedVote.created_at)} à {formatTime(selectedVote.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Informations de compétition
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Édition</Typography>
                          <Typography variant="body2">
                            {selectedVote.edition?.nom || selectedVote.edition_name || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Catégorie</Typography>
                          <Typography variant="body2">
                            {selectedVote.category?.nom || selectedVote.category_name || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Dialog de partage */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: PALETTE.GOLD, 
          color: PALETTE.WHITE,
          py: 1.5,
        }}>
          <Typography variant="h6" fontWeight="bold">
            Partager votre candidature
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedCandidature && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {selectedCandidature.edition?.nom || 'Édition'} - {selectedCandidature.category?.nom || 'Catégorie'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Lien de partage
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 1,
                    bgcolor: `${PALETTE.GOLD}05`,
                    wordBreak: 'break-all'
                  }}
                >
                  <Typography variant="caption">
                    {`${window.location.origin}/candidat/${selectedCandidature.id}`}
                  </Typography>
                </Paper>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
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
                          width: 40,
                          height: 40,
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
        <DialogActions sx={{ p: 1.5, borderTop: `1px solid ${PALETTE.GRAY_LIGHT}` }}>
          <Button 
            size="small" 
            onClick={() => setShareDialogOpen(false)}
          >
            Annuler
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={copyShareLink}
            startIcon={<ContentCopyIcon />}
            sx={{
              bgcolor: PALETTE.GOLD,
              color: PALETTE.BLACK,
            }}
          >
            Copier le lien
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de statistiques de votes */}
      <VotesStatsModal
        open={votesStatsOpen}
        onClose={() => setVotesStatsOpen(false)}
        editionId={selectedStatsEdition}
        categoryId={selectedStatsCategory}
        evolutionData={evolutionData}
      />

      {/* SpeedDial pour actions rapides */}
      {!isMobile && (
        <SpeedDial
          ariaLabel="Actions rapides"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            '& .MuiSpeedDial-fab': {
              bgcolor: PALETTE.GOLD,
              color: PALETTE.BLACK,
              width: 56,
              height: 56,
              '&:hover': {
                bgcolor: PALETTE.GOLD_DARK,
              },
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
                  width: 40,
                  height: 40,
                }
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Bouton de rafraîchissement mobile */}
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
          <Tooltip title="Rafraîchir">
            <Button
              variant="contained"
              sx={{
                bgcolor: PALETTE.GOLD,
                color: PALETTE.BLACK,
                minWidth: 'auto',
                width: 56,
                height: 56,
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: PALETTE.GOLD_DARK,
                }
              }}
              onClick={handleRefresh}
            >
              <RefreshIcon />
            </Button>
          </Tooltip>
        </Box>
      )}

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