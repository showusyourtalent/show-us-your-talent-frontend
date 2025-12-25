import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useSocket } from '../../contexts/SocketContext';
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
  Modal,
  Backdrop,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Chip,
  ListItemAvatar,
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
  Send as SendIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  FiberManualRecord as OnlineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant Chat Modal
const ChatModal = ({ open, onClose, user }) => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    if (open && user) {
      loadRooms();
      loadNotifications();
      
      window.addEventListener('new-chat-message', handleNewMessage);
      window.addEventListener('new-notification', handleNewNotification);
      
      return () => {
        window.removeEventListener('new-chat-message', handleNewMessage);
        window.removeEventListener('new-notification', handleNewNotification);
      };
    }
  }, [open, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms || []);
        if (data.rooms?.length > 0 && !activeRoom) {
          setActiveRoom(data.rooms[0]);
          loadMessages(data.rooms[0].id);
          loadParticipants(data.rooms[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/chat/room/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages?.data || data.messages || []);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const loadParticipants = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/chat/room/${roomId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Erreur chargement participants:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/chat/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const handleNewMessage = (event) => {
    const message = event.detail;
    if (message.chat_room_id === activeRoom?.id) {
      setMessages(prev => [...prev, message]);
    }
    loadRooms();
  };

  const handleNewNotification = (event) => {
    const notification = event.detail;
    setNotifications(prev => [notification, ...prev]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/chat/room/${activeRoom.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
          type: 'text'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    loadMessages(room.id);
    loadParticipants(room.id);
    markNotificationsAsRead(room.id);
  };

  const markNotificationsAsRead = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/chat/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
    }
  };

  const getOnlineCount = () => {
    return participants.filter(p => p.is_online).length;
  };

  const isUserOnline = (userId) => {
    const participant = participants.find(p => p.user_id === userId);
    return participant?.is_online || false;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Fade in={open}>
        <Box sx={{
          width: { xs: '95vw', sm: '90vw', md: '80vw' },
          height: { xs: '85vh', md: '80vh' },
          maxWidth: '1200px',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header du chat */}
          <Box sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChatIcon />
              <Typography variant="h6">
                {activeRoom?.name || 'Discussions'}
              </Typography>
              {activeRoom && (
                <Chip
                  label={`${getOnlineCount()} en ligne`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar - Rooms */}
            <Box sx={{
              width: { xs: '100%', md: 300 },
              borderRight: { md: 1 },
              borderColor: { md: 'divider' },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'grey.50',
            }}>
              {/* Tabs */}
              <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ 
                    borderRadius: 0,
                    borderBottom: 2,
                    borderColor: 'primary.main',
                  }}
                >
                  <ChatIcon sx={{ mr: 1 }} />
                  Discussions
                </Button>
              </Box>

              {/* Liste des rooms */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : rooms.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
                    Aucune discussion disponible
                  </Typography>
                ) : (
                  rooms.map((room, index) => (
                    <Box
                      key={room.id || index}
                      onClick={() => handleRoomSelect(room)}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: activeRoom?.id === room.id ? 'primary.light' : 'transparent',
                        color: activeRoom?.id === room.id ? 'white' : 'inherit',
                        '&:hover': {
                          bgcolor: activeRoom?.id === room.id ? 'primary.light' : 'grey.100',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                          <PeopleIcon />
                        </Avatar>
                        {room.unread_count > 0 && (
                          <Badge
                            badgeContent={room.unread_count}
                            color="error"
                            sx={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {room.name || 'Sans nom'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {room.last_message?.message || 'Aucun message'}
                        </Typography>
                      </Box>
                      {room.last_message?.created_at && (
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(room.last_message.created_at), 'HH:mm')}
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </Box>

            {/* Zone de chat principale */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {activeRoom ? (
                <>
                  {/* Header de la room */}
                  <Box sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PeopleIcon />
                        </Avatar>
                        <OnlineIcon
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            fontSize: 12,
                            color: 'success.main',
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="h6">
                          {activeRoom.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {participants.length} participants • {getOnlineCount()} en ligne
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      startIcon={<InfoIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => loadParticipants(activeRoom.id)}
                    >
                      Détails
                    </Button>
                  </Box>

                  {/* Messages */}
                  <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: 2,
                    bgcolor: 'grey.50',
                  }}>
                    {messages.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.secondary',
                      }}>
                        <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6" gutterBottom>
                          Aucun message
                        </Typography>
                        <Typography variant="body2">
                          Soyez le premier à envoyer un message !
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((message, index) => (
                        <Box
                          key={message.id || index}
                          sx={{
                            mb: 2,
                            display: 'flex',
                            flexDirection: message.user_id === user?.id ? 'row-reverse' : 'row',
                            alignItems: 'flex-start',
                            gap: 1,
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={message.user?.photo_url}
                              sx={{ width: 36, height: 36 }}
                            >
                              {message.user?.prenoms?.[0] || 'U'}
                            </Avatar>
                            {isUserOnline(message.user_id) && (
                              <OnlineIcon
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  right: 0,
                                  fontSize: 10,
                                  color: 'success.main',
                                  bgcolor: 'white',
                                  borderRadius: '50%',
                                }}
                              />
                            )}
                          </Box>
                          <Box sx={{
                            maxWidth: '70%',
                            bgcolor: message.user_id === user?.id ? 'primary.main' : 'white',
                            color: message.user_id === user?.id ? 'white' : 'text.primary',
                            p: 1.5,
                            borderRadius: 2,
                            borderTopLeftRadius: message.user_id === user?.id ? 12 : 2,
                            borderTopRightRadius: message.user_id === user?.id ? 2 : 12,
                            boxShadow: 1,
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="caption" fontWeight="bold">
                                {message.user?.prenoms || 'Utilisateur'} {message.user?.nom || ''}
                              </Typography>
                              {message.created_at && (
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {format(new Date(message.created_at), 'HH:mm')}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="body2">
                              {message.message}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Input message */}
                  <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    bgcolor: 'white',
                  }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <IconButton size="small">
                        <AttachFileIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EmojiIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                          },
                        }}
                      />
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        sx={{ 
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '&.Mui-disabled': { bgcolor: 'grey.300' },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  p: 3,
                  textAlign: 'center',
                }}>
                  <ChatIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Sélectionnez une discussion
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choisissez une conversation dans la liste pour commencer à discuter
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Composant Header principal
const Header = () => {
  const { user, logout } = useAuth();
  const { showLoading } = useLoading();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatNotifications, setChatNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Simulation d'utilisateurs en ligne
      const simulatedOnlineUsers = [user.id];
      for (let i = 0; i < 3; i++) {
        simulatedOnlineUsers.push(Math.floor(Math.random() * 100));
      }
      setOnlineUsers(simulatedOnlineUsers);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/chat/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setChatNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const handleNavigation = (path) => {
    showLoading("Chargement en cours...", 3000);
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
    showLoading("Déconnexion en cours...", 3000);
    try {
      await logout();
      handleNavigation('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
    return `${user.prenoms?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!user) return '';
    return `${user.prenoms || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
  };

  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Accueil', icon: <HomeIcon />, show: true },
      { path: '/candidats', label: 'Candidats', icon: <VoteIcon />, show: true },
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

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/chat/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/chat/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setChatNotifications([]);
      setNotificationsAnchor(null);
      if (socket && socket.setNotificationsCount) {
        socket.setNotificationsCount(0);
      }
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
    }
  };

  const unreadNotificationsCount = chatNotifications.filter(n => !n.is_read).length;

  const navLinks = getNavLinks();

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
            <div className="flex items-center space-x-2 lg:space-x-4">
              {user ? (
                <>
                  {/* Bouton Chat */}
                  <Tooltip title="Discussions">
                    <IconButton
                      onClick={() => setChatOpen(true)}
                      className="relative text-gray-600 hover:text-yellow-600 transition-colors"
                      size="small"
                    >
                      <Badge badgeContent={socket?.notificationsCount || 0} color="error">
                        <ChatIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* Notifications */}
                  <Tooltip title="Notifications">
                    <IconButton
                      onClick={(e) => setNotificationsAnchor(e.currentTarget)}
                      className="relative text-gray-600 hover:text-yellow-600 transition-colors"
                      size="small"
                    >
                      <Badge badgeContent={unreadNotificationsCount} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Box sx={{ position: 'relative' }}>
                      <Tooltip title={getDisplayName()}>
                        <Avatar
                          sx={{ 
                            width: { xs: 32, sm: 40, md: 44 }, 
                            height: { xs: 32, sm: 40, md: 44 },
                            cursor: 'pointer',
                            border: '2px solid #D97706',
                            '&:hover': { transform: 'scale(1.05)' }
                          }}
                          onClick={handleMenu}
                        >
                          {getInitials()}
                        </Avatar>
                      </Tooltip>
                      {/* Point vert pour statut en ligne */}
                      {onlineUsers.includes(user?.id) && (
                        <OnlineIcon
                          sx={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            fontSize: 12,
                            color: 'success.main',
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>
                    
                    {!isMobile && (
                      <div className="hidden lg:block">
                        <p className="font-semibold text-sm text-gray-800 truncate max-w-[120px]">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getRoleLabel()}
                        </p>
                      </div>
                    )}
                    
                    <IconButton 
                      onClick={handleMenu} 
                      className="text-gray-600 hover:text-yellow-600 transition-colors"
                      size="small"
                    >
                      {anchorEl ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </IconButton>
                  </div>

                  {/* User Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{
                      '& .MuiPaper-root': {
                        minWidth: '200px',
                        borderRadius: '12px',
                        marginTop: '8px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(217, 119, 6, 0.2)',
                      },
                    }}
                  >
                    <MenuItem 
                      onClick={() => handleNavigation('/profile')}
                      sx={{ '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' } }}
                    >
                      <ListItemIcon>
                        <PersonIcon sx={{ color: '#D97706' }} fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Mon Profil" />
                    </MenuItem>
                    
                    {/* Bouton Chat dans le menu */}
                    <MenuItem 
                      onClick={() => {
                        setChatOpen(true);
                        handleClose();
                      }}
                      sx={{ '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' } }}
                    >
                      <ListItemIcon>
                        <ChatIcon sx={{ color: '#D97706' }} fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Discussions" />
                      {socket?.notificationsCount > 0 && (
                        <Chip
                          label={socket.notificationsCount}
                          size="small"
                          color="error"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </MenuItem>
                    
                    {getRoleNames().includes('admin') && (
                      <MenuItem 
                        onClick={() => handleNavigation('/admin')}
                        sx={{ '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' } }}
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
                        sx={{ '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' } }}
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
                        sx={{ '&:hover': { backgroundColor: 'rgba(253, 230, 138, 0.3)' } }}
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

                  {/* Notifications Menu */}
                  <Menu
                    anchorEl={notificationsAnchor}
                    open={Boolean(notificationsAnchor)}
                    onClose={() => setNotificationsAnchor(null)}
                    TransitionComponent={Slide}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        width: { xs: '300px', sm: '380px' },
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
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Tout marquer comme lu
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {chatNotifications.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <NotificationsIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                            <Typography color="text.secondary">
                              Aucune notification
                            </Typography>
                          </Box>
                        ) : (
                          chatNotifications.map((notification, idx) => (
                            <ListItem
                              key={notification.id || idx}
                              onClick={() => notification.id && markNotificationAsRead(notification.id)}
                              sx={{
                                py: 1.5,
                                px: 2,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: !notification.is_read ? 'grey.50' : 'transparent',
                                borderLeft: !notification.is_read ? '4px solid' : 'none',
                                borderColor: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                                alignItems: 'flex-start',
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  <ChatIcon fontSize="small" />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight={!notification.is_read ? 600 : 400}>
                                    {notification.message || 'Nouvelle notification'}
                                  </Typography>
                                }
                                secondary={
                                  notification.created_at ? (
                                    <Typography variant="caption" color="text.secondary">
                                      {format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                                    </Typography>
                                  ) : null
                                }
                              />
                              {!notification.is_read && (
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />
                              )}
                            </ListItem>
                          ))
                        )}
                      </div>
                      <Button 
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setNotificationsAnchor(null)}
                      >
                        Voir toutes les notifications
                      </Button>
                    </Box>
                  </Menu>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-all duration-300"
                  >
                    Connexion
                  </button>
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
                        sx={{ width: 40, height: 40, border: '2px solid #D97706' }}
                      >
                        {getInitials()}
                      </Avatar>
                      {onlineUsers.includes(user?.id) && (
                        <OnlineIcon
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            fontSize: 10,
                            color: 'success.main',
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      )}
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
                      {link.icon}
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
              
              {/* Bouton Chat dans le drawer mobile */}
              {user && (
                <ListItem
                  onClick={() => {
                    setChatOpen(true);
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: '8px',
                    marginBottom: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(243, 244, 246, 0.5)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '40px', color: '#6B7280' }}>
                    <ChatIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Discussions"
                    primaryTypographyProps={{ sx: { fontWeight: 500, color: '#374151' } }}
                  />
                  {socket?.notificationsCount > 0 && (
                    <Chip
                      label={socket.notificationsCount}
                      size="small"
                      color="error"
                      sx={{ height: 20 }}
                    />
                  )}
                </ListItem>
              )}
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

      {/* Modal de Chat */}
      {user && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          user={user}
        />
      )}
    </>
  );
};

export default Header;