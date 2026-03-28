import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import axios from '../../api/axios';
import {
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Chip,
  ListItemAvatar,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  EmojiEvents as EmojiEventsIcon,
  Group as GroupIcon,
  PostAdd as PostAddIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  HowToVote as VoteIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  FiberManualRecord as OnlineIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Header = () => {
  const { user, logout } = useAuth();
  const { showLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les notifications et le compteur non lu
  const loadNotifications = async () => {
    if (!user) return;
    
    setNotificationsLoading(true);
    try {
      // Charger les notifications
      const notificationsResponse = await axios.get('/chat/notifications');
      if (notificationsResponse.data.success) {
        setNotifications(notificationsResponse.data.notifications);
      }

      // Charger le compteur de messages non lus
      const roomsResponse = await axios.get('/chat/rooms');
      if (roomsResponse.data.success) {
        const totalUnread = roomsResponse.data.rooms.reduce(
          (sum, room) => sum + (room.unread_count || 0), 
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err.response || err);
      
      // Fallback pour le développement
      if (err.response?.status !== 401) {
        const demoNotifications = [
          {
            id: 1,
            message: 'Bienvenue sur Show Your Talent!',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            is_read: true,
            chat_room_id: 1
          },
          {
            id: 2,
            message: 'Nouveau message dans la catégorie Chant',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            is_read: false,
            chat_room_id: 1
          }
        ];
        setNotifications(demoNotifications);
        setUnreadCount(3); // Valeur de démonstration
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNavigation = async (path) => {
    showLoading("Chargement en cours...", 500);
    setMobileOpen(false);
    setAnchorEl(null);
    setNotificationsAnchor(null);
    
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    showLoading("Déconnexion en cours...", 1500);
    try {
      await logout();
      handleNavigation('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      showSnackbar('Erreur lors de la déconnexion', 'error');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getRoleNames = () => {
    if (!user?.roles) return [];
    
    if (Array.isArray(user.roles)) {
      if (user.roles.length > 0 && typeof user.roles[0] === 'object') {
        return user.roles.map(role => role.name);
      }
      return user.roles;
    }
    
    return [];
  };

  const getRoleLabel = () => {
    const roles = getRoleNames();
    if (roles.includes('admin')) return 'Administrateur';
    if (roles.includes('promoteur')) return 'Promoteur';
    if (roles.includes('candidat')) return 'Candidat';
    return 'Utilisateur';
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.prenoms?.[0] || '';
    const lastInitial = user.nom?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!user) return '';
    return `${user.prenoms || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
  };

  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Accueil', icon: <HomeIcon />, show: true },
      { path: '/candidats', label: 'Candidats', icon: <VoteIcon />, show: true },
      { path: '/discussions', label: 'Discussions', icon: <ChatIcon />, show: true },
    ];

    const roleLinks = [];
    
    if (user) {
      const roles = getRoleNames();
      
      if (roles.includes('admin')) {
        roleLinks.push(
          { path: '/admin', label: 'Administration', icon: <DashboardIcon />, show: true }
        );
      }
      
      if (roles.includes('promoteur')) {
        roleLinks.push(
          { path: '/promoteur', label: 'Espace Promoteur', icon: <GroupIcon />, show: true },
          { path: '/promoteur/editions', label: 'Mes Éditions', icon: <EmojiEventsIcon />, show: true }
        );
      }
      
      if (roles.includes('candidat')) {
        roleLinks.push(
          { path: '/candidat', label: 'Mon Espace', icon: <PersonIcon />, show: true },
          { path: '/postuler', label: 'Postuler', icon: <PostAddIcon />, show: true }
        );
      }
    }

    return [...baseLinks, ...roleLinks];
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await axios.post('/chat/notifications/read-all');

      if (response.data.success) {
        showSnackbar(response.data.message || 'Toutes les notifications ont été marquées comme lues', 'success');
        loadNotifications();
      }
    } catch (err) {
      console.error('Erreur marquage notifications:', err.response || err);
      if (err.response?.status !== 401) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        showSnackbar('Toutes les notifications ont été marquées comme lues', 'success');
      }
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await axios.post(`/chat/notifications/${notificationId}/read`);

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Erreur marquage notification:', err.response || err);
      if (err.response?.status !== 401) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    }
  };

  const navLinks = getNavLinks();
  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <header 
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'shadow-lg py-2' : 'shadow-md py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <button
                onClick={handleDrawerToggle}
                className="lg:hidden mr-2 text-gray-700 hover:text-yellow-600 transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
              
              <Link 
                to="/" 
                className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity"
                onClick={() => handleNavigation('/')}
              >
                <img 
                  src="/logo.png"
                  alt="Logo Show Us Your Talent" 
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-10 h-10 bg-gradient-to-br from-yellow-600 to-red-800 rounded-full flex items-center justify-center';
                      fallback.innerHTML = '<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/></svg>';
                      parent.insertBefore(fallback, e.target);
                    }
                  }}
                />
                <div className="hidden sm:block">
                  <h1 className="text-sm lg:text-xl font-bold bg-gradient-to-r from-yellow-600 to-red-800 bg-clip-text text-transparent">
                    SHOW YOUR TALENT
                  </h1>
                  <p className="text-xs text-gray-600">Montre nous ton talent</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex-1 flex justify-center">
                <div className="flex items-center space-x-1 lg:space-x-2">
                  {navLinks
                    .filter((link) => link.show)
                    .map((link) => (
                      <button
                        key={link.path}
                        onClick={() => handleNavigation(link.path)}
                        className={`relative px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          location.pathname === link.path
                            ? 'text-yellow-600 bg-gradient-to-r from-amber-50 to-transparent'
                            : 'text-gray-700 hover:text-yellow-600 hover:bg-amber-50'
                        }`}
                      >
                        {link.label}
                        {location.pathname === link.path && (
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-yellow-600 to-red-800 rounded-full"></span>
                        )}
                      </button>
                    ))}
                </div>
              </nav>
            )}

            {/* User Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {user ? (
                <>
                  {/* Bouton Discussions avec badge */}
                  <Tooltip title="Discussions">
                    <IconButton
                      onClick={() => handleNavigation('/discussions')}
                      sx={{
                        position: 'relative',
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Badge 
                        badgeContent={unreadCount} 
                        color="error"
                        max={99}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: '18px',
                            minWidth: '18px',
                            top: 5,
                            right: 5,
                            border: '2px solid white',
                          }
                        }}
                      >
                        <ChatIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* Bouton Notifications avec badge */}
                  <Tooltip title="Notifications">
                    <IconButton
                      onClick={(e) => {
                        setNotificationsAnchor(e.currentTarget);
                        loadNotifications();
                      }}
                      sx={{
                        position: 'relative',
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Badge 
                        badgeContent={unreadNotificationsCount} 
                        color="error"
                        max={99}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: '18px',
                            minWidth: '18px',
                            top: 5,
                            right: 5,
                            border: '2px solid white',
                          }
                        }}
                      >
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* Avatar utilisateur avec point vert */}
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Box sx={{ position: 'relative' }}>
                      <Tooltip title={getDisplayName()}>
                        <IconButton
                          onClick={handleMenu}
                          sx={{ 
                            p: 0,
                            '&:hover': { 
                              transform: 'scale(1.05)',
                              transition: 'transform 0.2s ease'
                            }
                          }}
                        >
                          <Avatar
                            src={user.photo_url || ''}
                            sx={{ 
                              width: { xs: 36, sm: 40, md: 44 }, 
                              height: { xs: 36, sm: 40, md: 44 },
                              border: '3px solid #D97706',
                              bgcolor: user.photo_url ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                            }}
                          >
                            {!user.photo_url && getInitials()}
                          </Avatar>
                        </IconButton>
                      </Tooltip>
                      
                      {/* Point vert indiquant l'état en ligne */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 3,
                          right: 3,
                          width: 12,
                          height: 12,
                          bgcolor: '#48bb78',
                          border: '2px solid white',
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </Box>
                    
                    {/* Infos utilisateur (desktop seulement) */}
                    {!isMobile && (
                      <div className="hidden lg:block">
                        <p className="font-semibold text-sm text-gray-800 truncate max-w-[140px]">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getRoleLabel()}
                        </p>
                      </div>
                    )}
                    
                    {/* Flèche menu */}
                    <IconButton 
                      onClick={handleMenu} 
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { 
                          color: 'primary.main',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                      size="small"
                    >
                      {anchorEl ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </IconButton>
                  </div>

                  {/* Menu utilisateur */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        minWidth: '220px',
                        borderRadius: '12px',
                        marginTop: '8px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(217, 119, 6, 0.2)',
                        maxHeight: '400px',
                      },
                    }}
                  >
                    {/* En-tête du menu */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.photo_url || ''}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            border: '2px solid #D97706',
                            bgcolor: user.photo_url ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          {!user.photo_url && getInitials()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {getDisplayName()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getRoleLabel()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <MenuItem 
                      onClick={() => handleNavigation('/profile')}
                      sx={{ 
                        py: 1.5,
                        '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' }
                      }}
                    >
                      <ListItemIcon>
                        <PersonIcon sx={{ color: '#D97706' }} fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Mon Profil" />
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => handleNavigation('/discussions')}
                      sx={{ 
                        py: 1.5,
                        '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' }
                      }}
                    >
                      <ListItemIcon>
                        <Badge badgeContent={unreadCount} color="error" size="small">
                          <ChatIcon sx={{ color: '#D97706' }} fontSize="small" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary="Discussions" 
                        secondary={unreadCount > 0 ? `${unreadCount} non lu(s)` : null}
                      />
                    </MenuItem>
                    
                    {getRoleNames().includes('admin') && (
                      <MenuItem 
                        onClick={() => handleNavigation('/admin')}
                        sx={{ 
                          py: 1.5,
                          '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' }
                        }}
                      >
                        <ListItemIcon>
                          <DashboardIcon sx={{ color: '#D97706' }} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Administration" />
                      </MenuItem>
                    )}
                    
                    {getRoleNames().includes('promoteur') && (
                      <MenuItem 
                        onClick={() => handleNavigation('/promoteur')}
                        sx={{ 
                          py: 1.5,
                          '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' }
                        }}
                      >
                        <ListItemIcon>
                          <GroupIcon sx={{ color: '#D97706' }} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Espace Promoteur" />
                      </MenuItem>
                    )}
                    
                    {getRoleNames().includes('candidat') && (
                      <MenuItem 
                        onClick={() => handleNavigation('/candidat')}
                        sx={{ 
                          py: 1.5,
                          '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' }
                        }}
                      >
                        <ListItemIcon>
                          <PersonIcon sx={{ color: '#D97706' }} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Espace Candidat" />
                      </MenuItem>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ 
                        py: 1.5,
                        color: '#DC2626',
                        '&:hover': { backgroundColor: 'rgba(252, 165, 165, 0.3)' }
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon sx={{ color: '#DC2626' }} fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Déconnexion" />
                    </MenuItem>
                  </Menu>

                  {/* Menu Notifications */}
                  <Menu
                    anchorEl={notificationsAnchor}
                    open={Boolean(notificationsAnchor)}
                    onClose={() => setNotificationsAnchor(null)}
                    TransitionComponent={Slide}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        width: { xs: '320px', sm: '380px' },
                        maxHeight: '500px',
                        borderRadius: '12px',
                      }
                    }}
                  >
                    <Box className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Typography variant="h6" component="p" className="font-semibold">
                          Notifications
                        </Typography>
                        {unreadNotificationsCount > 0 && (
                          <Button 
                            size="small"
                            onClick={markAllNotificationsAsRead}
                            disabled={notificationsLoading}
                            startIcon={notificationsLoading ? <CircularProgress size={16} /> : null}
                          >
                            {notificationsLoading ? '' : 'Tout marquer comme lu'}
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {notificationsLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : notifications.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <NotificationsIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                            <Typography color="text.secondary">
                              Aucune notification
                            </Typography>
                          </Box>
                        ) : (
                          notifications.map((notification) => (
                            <Box
                              key={notification.id}
                              sx={{
                                p: 2,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor: notification.is_read ? 'transparent' : 'grey.50',
                                borderLeft: notification.is_read ? 'none' : '3px solid #D97706',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'grey.100' }
                              }}
                              onClick={() => {
                                if (!notification.is_read) {
                                  markNotificationAsRead(notification.id);
                                }
                                if (notification.chat_room_id) {
                                  handleNavigation('/discussions');
                                  setNotificationsAnchor(null);
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                {!notification.is_read && (
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    bgcolor: '#D97706', 
                                    borderRadius: '50%' 
                                  }} />
                                )}
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight={notification.is_read ? 'normal' : 'bold'}
                                  sx={{ flex: 1 }}
                                >
                                  {notification.message}
                                </Typography>
                              </Box>
                              {notification.created_at && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                                </Typography>
                              )}
                            </Box>
                          ))
                        )}
                      </div>
                      <Button 
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => setNotificationsAnchor(null)}
                      >
                        Fermer
                      </Button>
                    </Box>
                  </Menu>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Button
                    onClick={() => handleNavigation('/login')}
                    variant="outlined"
                    sx={{
                      borderColor: '#D97706',
                      color: '#D97706',
                      '&:hover': {
                        backgroundColor: '#D97706',
                        color: 'white',
                        borderColor: '#D97706',
                      },
                    }}
                  >
                    Connexion
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: '280px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)',
            },
          }}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/logo.png"
                    alt="Logo Show Us Your Talent" 
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-10 h-10 bg-gradient-to-br from-yellow-600 to-red-800 rounded-full flex items-center justify-center';
                        fallback.innerHTML = '<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/></svg>';
                        parent.insertBefore(fallback, e.target);
                      }
                    }}
                  />
                  <div>
                    <h2 className="font-bold text-base bg-gradient-to-r from-yellow-600 to-red-800 bg-clip-text text-transparent">
                      SHOW YOUR TALENT
                    </h2>
                    <p className="text-xs text-gray-600">Montre nous ton talent</p>
                  </div>
                </div>
                <IconButton onClick={handleDrawerToggle} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
              
              {user && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-transparent">
                  <div className="flex items-center space-x-3">
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={user.photo_url || ''}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          border: '2px solid #D97706',
                          bgcolor: user.photo_url ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                        }}
                      >
                        {!user.photo_url && getInitials()}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          bgcolor: '#48bb78',
                          border: '2px solid white',
                          borderRadius: '50%',
                        }}
                      />
                    </Box>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {getRoleLabel()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <List className="flex-grow p-2">
              {navLinks
                .filter((link) => link.show)
                .map((link) => (
                  <ListItem
                    key={link.path}
                    onClick={() => handleNavigation(link.path)}
                    sx={{
                      borderRadius: '8px',
                      marginBottom: '4px',
                      backgroundColor: location.pathname === link.path 
                        ? 'rgba(253, 230, 138, 0.3)' 
                        : 'transparent',
                      borderLeft: location.pathname === link.path 
                        ? '4px solid #D97706' 
                        : 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(243, 244, 246, 0.5)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === link.path ? '#D97706' : '#6B7280',
                        minWidth: '40px',
                      }}
                    >
                      {link.label === 'Discussions' ? (
                        <Badge badgeContent={unreadCount} color="error" size="small">
                          {link.icon}
                        </Badge>
                      ) : (
                        link.icon
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={link.label}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: 500,
                          color: location.pathname === link.path ? '#D97706' : '#374151',
                        }
                      }}
                    />
                  </ListItem>
                ))}
            </List>

            {user && (
              <div className="p-4 border-t border-gray-200 space-y-2">
                <ListItem 
                  onClick={() => handleNavigation('/profile')}
                  sx={{
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(243, 244, 246, 0.5)' },
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon sx={{ color: '#6B7280' }} />
                  </ListItemIcon>
                  <ListItemText primary="Mon Profil" />
                </ListItem>
                <ListItem 
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#DC2626',
                    '&:hover': { backgroundColor: 'rgba(252, 165, 165, 0.3)' },
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon sx={{ color: '#DC2626' }} />
                  </ListItemIcon>
                  <ListItemText primary="Déconnexion" />
                </ListItem>
              </div>
            )}
          </div>
        </Drawer>
      </header>

      {/* Snackbar pour les messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;