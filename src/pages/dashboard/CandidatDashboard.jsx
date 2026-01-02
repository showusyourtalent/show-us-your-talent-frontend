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
  Tooltip,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Skeleton,
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
  OpenInNew as OpenInNewIcon,
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
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
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

const CandidatDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    editionId: '',
    categoryId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  
  // États pour les graphiques
  const [chartPeriod, setChartPeriod] = useState('7days');
  const [chartType, setChartType] = useState('line');

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
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

  // Récupérer les données du dashboard avec gestion d'erreur d'authentification
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
    enabled: !!user && hasRole('candidat'), // N'exécuter que si l'utilisateur est authentifié et a le rôle
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
        
        const response = await axiosInstance.get(`/candidat/dashboard/votes?${params}`);
        return response.data.data;
      } catch (error) {
        console.error('Erreur chargement votes:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
        return { votes: { data: [] }, stats: {} };
      }
    },
    enabled: !!user && activeTab === 1, // Ne charger que si authentifié et quand l'onglet est actif
  });

  // Récupérer l'évolution des votes
  const { 
    data: evolutionData, 
    isLoading: evolutionLoading 
  } = useQuery({
    queryKey: ['votes-evolution', selectedStatsEdition, selectedStatsCategory, chartPeriod, user?.id],
    queryFn: async () => {
      if (!selectedStatsEdition) return null;
      
      try {
        const params = new URLSearchParams();
        params.append('edition_id', selectedStatsEdition);
        if (selectedStatsCategory) params.append('category_id', selectedStatsCategory);
        params.append('period', chartPeriod === '7days' ? 'day' : 'month');
        params.append('days', chartPeriod === '7days' ? 7 : 30);
        
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

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    refetchDashboard();
    if (activeTab === 1) refetchVotes();
    toast.success('Données rafraîchies !');
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
      icon: <PeopleIcon />,
      color: PALETTE.GOLD,
      label: 'Personnes',
      subValue: dashboardData?.global_stats?.vote_avg || 0,
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

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    if (!evolutionData?.evolution) return [];
    
    return evolutionData.evolution.map(item => ({
      name: item.label,
      votes: item.votes,
      amount: item.amount,
      date: item.date,
    }));
  };

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
    return null; // La redirection est gérée par useEffect
  }

  // Loading state du dashboard
  if (dashboardLoading) {
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
            Chargement de votre dashboard...
          </Typography>
        </Box>
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
      mt: { xs: 2, sm: 4 }, 
      mb: 6, 
      px: { xs: 1, sm: 2, md: 3 }, 
      position: 'relative',
      minHeight: '100vh',
    }}>
      {/* Header avec bienvenue */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
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
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="h2" fontWeight="bold" sx={{ 
                fontSize: { xs: 24, sm: 32, md: 40, lg: 48 },
                mb: 2,
                background: 'linear-gradient(45deg, #FFD700, #FFFFFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Bonjour, {user?.prenoms} !
              </Typography>
              
              <Typography variant="h6" sx={{ 
                opacity: 0.9, 
                mb: 4,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}>
                Bienvenue dans votre espace candidat. Suivez vos votes, 
                votre classement et gérez vos candidatures.
              </Typography>
              
              {dashboardData?.candidatures?.[0] ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Chip
                    label={`${dashboardData.candidatures[0].edition?.nom} - ${dashboardData.candidatures[0].category?.nom}`}
                    sx={{
                      bgcolor: PALETTE.GOLD,
                      color: PALETTE.BLACK,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      height: { xs: 32, sm: 36 },
                      '& .MuiChip-label': { px: 2 },
                    }}
                  />
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {dashboardData.global_stats?.total_votes || 0} votes reçus
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
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  border: `4px solid ${PALETTE.GOLD}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              >
                {user?.prenoms?.[0]}{user?.nom?.[0]}
              </Avatar>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <ChatNotificationBell />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Connecté en tant que {user?.prenoms}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Cartes de statistiques */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
                color: PALETTE.WHITE,
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                ...cardHoverAnimation,
                cursor: stat.onClick ? 'pointer' : 'default',
              }}
              onClick={stat.onClick}
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
          </Grid>
        ))}
      </Grid>

      {/* Tabs principales */}
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
                label="Votes & Statistiques" 
                icon={<VoteIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label="Classement" 
                icon={<TrophyIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label="Paiements" 
                icon={<MoneyIcon />} 
                iconPosition="start" 
              />
            </Tabs>
          </Box>

          {/* Contenu des tabs */}
          <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
            
            {/* Tab 1: Mes Candidatures */}
            {activeTab === 0 && (
              <Box>
                {dashboardData?.candidatures?.length > 0 ? (
                  <Grid container spacing={3}>
                    {dashboardData.candidatures.map((candidature) => {
                      const statutInfo = getStatutInfo(candidature.statut);
                      return (
                        <Grid item xs={12} md={6} key={candidature.id}>
                          <Card sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                      {candidature.edition?.nom}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {candidature.category?.nom}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    icon={statutInfo.icon}
                                    label={statutInfo.label}
                                    sx={{
                                      background: statutInfo.bgColor,
                                      color: PALETTE.WHITE,
                                      fontWeight: 'bold',
                                    }}
                                  />
                                </Stack>
                                
                                <Divider />
                                
                                <Stack spacing={1}>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Votes
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {candidature.nombre_votes || 0}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Date d'inscription
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatDate(candidature.created_at)}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<InsightsIcon />}
                                    onClick={() => handleOpenVotesStats(candidature.edition_id, candidature.category_id)}
                                    sx={{ flex: 1 }}
                                  >
                                    Voir les stats
                                  </Button>
                                  {candidature.category_id && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<ChatIcon />}
                                      onClick={() => handleOpenChat(candidature.category_id, candidature.category?.nom, candidature)}
                                      sx={{ flex: 1 }}
                                    >
                                      Chat
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
                  <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                    <PersonIcon sx={{ fontSize: 64, color: `${PALETTE.GOLD}30`, mb: 3 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucune candidature active
                    </Typography>
                    <Button 
                      variant="contained" 
                      href="/postuler"
                      sx={{
                        background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`,
                        color: PALETTE.BLACK,
                        fontWeight: 'bold',
                        px: 4,
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
                <Card sx={{ mb: 3, p: 2, borderRadius: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Édition</InputLabel>
                        <Select
                          value={filters.editionId}
                          label="Édition"
                          onChange={(e) => setFilters({...filters, editionId: e.target.value})}
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
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                          value={filters.categoryId}
                          label="Catégorie"
                          onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
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
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Du"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Au"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          fullWidth
                          size="small"
                          label="Rechercher..."
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                          InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<FilterIcon />}
                          onClick={() => setFilters({
                            editionId: '',
                            categoryId: '',
                            dateFrom: '',
                            dateTo: '',
                            search: '',
                          })}
                        >
                          Réinitialiser
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Card>

                {/* Statistiques de la période */}
                {votesData?.stats && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color={PALETTE.SUCCESS}>
                            {votesData.stats.total_votes}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Votes totaux
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color={PALETTE.GOLD}>
                            {formatCurrency(votesData.stats.total_amount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Montant total
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color={PALETTE.INFO}>
                            {votesData.stats.unique_voters}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Votants uniques
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color={PALETTE.RED_DARK}>
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

                {/* Tableau des votes */}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Liste des votes
                    </Typography>
                    {votesLoading ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : votesData?.votes?.data?.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Votant</TableCell>
                              <TableCell>Montant</TableCell>
                              <TableCell>Méthode</TableCell>
                              <TableCell>Édition</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {votesData.votes.data.map((vote) => (
                              <TableRow key={vote.id} hover>
                                <TableCell>{formatDate(vote.created_at)}</TableCell>
                                <TableCell>
                                  <Stack spacing={0.5}>
                                    <Typography variant="body2">
                                      {vote.email_votant}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {vote.customer_phone}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight="bold" color={PALETTE.GOLD}>
                                    {formatCurrency(vote.amount)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={vote.payment?.payment_method || 'N/A'}
                                    size="small"
                                    sx={{
                                      bgcolor: vote.payment?.payment_method === 'mobile_money' 
                                        ? `${PALETTE.SUCCESS}20` 
                                        : `${PALETTE.INFO}20`,
                                      color: vote.payment?.payment_method === 'mobile_money'
                                        ? PALETTE.SUCCESS
                                        : PALETTE.INFO,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {vote.edition?.nom}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {vote.category?.nom}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <IconButton size="small">
                                    <ViewIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <VoteIcon sx={{ fontSize: 64, color: `${PALETTE.GOLD}30`, mb: 3 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Aucun vote trouvé
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Aucun vote ne correspond à vos filtres
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
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Votre position dans le classement
                          </Typography>
                          
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Box sx={{
                              width: 200,
                              height: 200,
                              borderRadius: '50%',
                              background: `conic-gradient(${PALETTE.GOLD} 0% ${dashboardData.ranking.percentage}%, ${PALETTE.GRAY_LIGHT} ${dashboardData.ranking.percentage}% 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 20px',
                              position: 'relative',
                            }}>
                              <Box sx={{
                                width: 160,
                                height: 160,
                                borderRadius: '50%',
                                background: PALETTE.WHITE,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                              }}>
                                <Typography variant="h1" fontWeight="bold" color={PALETTE.GOLD}>
                                  #{dashboardData.ranking.position}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  sur {dashboardData.ranking.total_participants}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="h6" color={PALETTE.GOLD} gutterBottom>
                              Top {dashboardData.ranking.percentage}%
                            </Typography>
                            
                            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 3 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="bold">
                                  {dashboardData.ranking.ahead}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Devant vous
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="bold">
                                  {dashboardData.ranking.behind}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Derrière vous
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top 10 du classement
                          </Typography>
                          <List>
                            {dashboardData.ranking.top_10?.map((candidature, index) => (
                              <ListItem 
                                key={candidature.id}
                                sx={{
                                  bgcolor: candidature.candidat_id === user?.id ? `${PALETTE.GOLD}10` : 'transparent',
                                  borderRadius: 2,
                                  mb: 1,
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: index < 3 ? PALETTE.GOLD : PALETTE.GRAY_DARK }}>
                                    {index + 1}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography fontWeight={candidature.candidat_id === user?.id ? 'bold' : 'normal'}>
                                      {candidature.candidat?.nom_complet || 'Candidat'}
                                    </Typography>
                                  }
                                  secondary={`${candidature.nombre_votes} votes`}
                                />
                                <ListItemSecondaryAction>
                                  <Chip
                                    label={`#${index + 1}`}
                                    size="small"
                                    sx={{
                                      bgcolor: index === 0 ? PALETTE.GOLD : 
                                              index === 1 ? PALETTE.SILVER : 
                                              index === 2 ? PALETTE.BRONZE : 
                                              PALETTE.GRAY_LIGHT,
                                      color: index < 3 ? PALETTE.WHITE : PALETTE.GRAY_DARK,
                                    }}
                                  />
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                    <TrophyIcon sx={{ fontSize: 64, color: `${PALETTE.GOLD}30`, mb: 3 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucun classement disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Vous devez participer à une édition pour apparaître dans le classement
                    </Typography>
                  </Card>
                )}
              </Box>
            )}

            {/* Tab 4: Paiements */}
            {activeTab === 3 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
                  <Typography variant="body2">
                    Les paiements sont automatiquement enregistrés lors des votes. 
                    Vous pouvez consulter l'historique complet de vos transactions.
                  </Typography>
                </Alert>
                
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Historique des paiements
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <MoneyIcon sx={{ fontSize: 64, color: `${PALETTE.GOLD}30`, mb: 3 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Fonctionnalité à venir
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        L'historique détaillé des paiements sera disponible prochainement
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Section "Derniers votes" */}
      {dashboardData?.last_votes?.length > 0 && (
        <Card sx={{ borderRadius: 4, mb: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color={PALETTE.RED_DARK}>
                  Derniers votes reçus
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Les 10 votes les plus récents
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowIcon />}
                onClick={() => setActiveTab(1)}
              >
                Voir tous les votes
              </Button>
            </Stack>
            
            <Grid container spacing={2}>
              {dashboardData.last_votes.map((vote) => (
                <Grid item xs={12} sm={6} md={4} key={vote.id}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {vote.email_votant}
                          </Typography>
                          <Chip
                            label={formatCurrency(vote.amount)}
                            size="small"
                            sx={{
                              bgcolor: `${PALETTE.GOLD}20`,
                              color: PALETTE.GOLD_DARK,
                              fontWeight: 'bold',
                            }}
                          />
                        </Stack>
                        
                        <Typography variant="caption" color="text.secondary">
                          {vote.customer_phone}
                        </Typography>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">
                            {formatDate(vote.created_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vote.edition?.nom}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Dialog de partage */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
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
        chartPeriod={chartPeriod}
        onChartPeriodChange={setChartPeriod}
        chartType={chartType}
        onChartTypeChange={setChartType}
        evolutionData={evolutionData}
        chartData={prepareChartData()}
      />

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