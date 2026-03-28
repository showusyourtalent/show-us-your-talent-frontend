import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Fade,
  Slide,
  Paper,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FiberManualRecord as OnlineIcon,
  VolumeOff as MuteIcon,
  Pin as PinIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axios';
import { CHAT_PALETTE, CHAT_SETTINGS } from '../../constants/chat';
import './ChatModal.css';

// Composant Message Bubble
const MessageBubble = ({ message, isOwn, currentUser }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || message.message);
    handleMenuClose();
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm');
    } catch (error) {
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return '';
    }
  };

  const getMessageStatus = () => {
    if (!isOwn) return null;
    if (message.is_read) return { icon: <CheckCircleIcon />, color: CHAT_PALETTE.success };
    if (message.is_delivered) return { icon: <CheckCircleIcon />, color: CHAT_PALETTE.gray };
    return { icon: <ScheduleIcon />, color: CHAT_PALETTE.gray };
  };

  const messageStatus = getMessageStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`chat-message-container ${isOwn ? 'own' : 'other'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && (
        <Tooltip title={`${message.user?.prenoms} ${message.user?.nom}`}>
          <Avatar
            className="message-avatar"
            src={message.user?.photo_url}
            sx={{ bgcolor: CHAT_PALETTE.primary }}
          >
            {message.user?.prenoms?.[0]}{message.user?.nom?.[0]}
          </Avatar>
        </Tooltip>
      )}

      <Paper
        elevation={isHovered ? 3 : 1}
        className={`message-bubble ${isOwn ? 'own' : 'other'}`}
        sx={{
          bgcolor: isOwn ? CHAT_PALETTE.gradient : 'white',
          color: isOwn ? 'white' : CHAT_PALETTE.dark,
        }}
      >
        {!isOwn && (
          <Typography variant="caption" className="message-sender">
            {message.user?.prenoms} {message.user?.type_compte === 'promoteur' && '👑'}
          </Typography>
        )}

        <Typography variant="body1" className="message-content">
          {message.content || message.message}
        </Typography>

        <Box className="message-footer">
          <Typography variant="caption" className="message-time">
            {formatTime(message.created_at || message.timestamp)}
          </Typography>
          
          {isOwn && messageStatus && (
            <Box className="message-status">
              {React.cloneElement(messageStatus.icon, {
                sx: { fontSize: '0.8rem', color: messageStatus.color }
              })}
            </Box>
          )}
        </Box>

        {isHovered && (
          <IconButton
            size="small"
            className="message-actions"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleCopy}>
          Copier
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Répondre
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PinIcon fontSize="small" sx={{ mr: 1 }} />
          Épingler
        </MenuItem>
        <Divider />
        {isOwn ? (
          <MenuItem onClick={handleMenuClose} sx={{ color: CHAT_PALETTE.danger }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Supprimer
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={handleMenuClose}>
              <BlockIcon fontSize="small" sx={{ mr: 1 }} />
              Bloquer
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ color: CHAT_PALETTE.danger }}>
              <ReportIcon fontSize="small" sx={{ mr: 1 }} />
              Signaler
            </MenuItem>
          </>
        )}
      </Menu>
    </motion.div>
  );
};

// Composant ChatModal principal
const ChatModal = ({ open, onClose, currentUser }) => {
  // États
  const [activeRoom, setActiveRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    rooms: false,
    messages: false,
    sending: false
  });
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Références
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Responsive
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  // Charger les discussions
  const loadRooms = useCallback(async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, rooms: true }));
    setError(null);

    try {
      const response = await axios.get('/chat/rooms');
      
      if (response.data.success) {
        const sortedRooms = response.data.rooms.sort((a, b) => {
          const timeA = new Date(a.last_message?.created_at || 0).getTime();
          const timeB = new Date(b.last_message?.created_at || 0).getTime();
          return timeB - timeA;
        });
        
        setRooms(sortedRooms);
        
        // Sélectionner automatiquement la première room non lue ou la première
        if (!activeRoom && sortedRooms.length > 0) {
          const unreadRoom = sortedRooms.find(room => room.unread_count > 0);
          handleRoomSelect(unreadRoom || sortedRooms[0]);
        }
      }
    } catch (err) {
      console.error('Erreur chargement rooms:', err);
      setError('Impossible de charger les discussions');
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  }, [currentUser, activeRoom]);

  // Charger les messages
  const loadMessages = useCallback(async (roomId, page = 1) => {
    if (!roomId) return;

    setLoading(prev => ({ ...prev, messages: true }));
    
    try {
      const response = await axios.get(`/chat/room/${roomId}/messages?page=${page}&limit=50`);
      
      if (response.data.success) {
        const messagesData = response.data.messages.data || response.data.messages || [];
        const sortedMessages = messagesData.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        
        setMessages(sortedMessages);
        
        // Marquer comme lu
        await markAsRead(roomId);
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
      scrollToBottom();
    }
  }, []);

  // Marquer les messages comme lus
  const markAsRead = async (roomId) => {
    try {
      await axios.post(`/chat/room/${roomId}/mark-read`);
      
      // Mettre à jour localement
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, unread_count: 0 } : room
      ));
    } catch (err) {
      console.error('Erreur marquage lu:', err);
    }
  };

  // Charger les participants
  const loadParticipants = useCallback(async (roomId) => {
    if (!roomId) return;

    try {
      const response = await axios.get(`/chat/room/${roomId}/participants`);
      
      if (response.data.success) {
        setParticipants(response.data.participants);
      }
    } catch (err) {
      console.error('Erreur chargement participants:', err);
    }
  }, []);

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || loading.sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(prev => ({ ...prev, sending: true }));

    try {
      const formData = new FormData();
      formData.append('message', messageContent);
      formData.append('type', 'text');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await axios.post(
        `/chat/room/${activeRoom.id}/message`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setSelectedFile(null);
        
        // Mettre à jour la room
        loadRooms();
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
      setNewMessage(messageContent);
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
      scrollToBottom();
    }
  };

  // Gestionnaire de sélection de room
  const handleRoomSelect = async (room) => {
    setActiveRoom(room);
    setMessages([]);
    setShowParticipants(false);
    setError(null);
    
    await Promise.all([
      loadMessages(room.id),
      loadParticipants(room.id)
    ]);
  };

  // Scroll vers le bas
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Gestionnaire de saisie
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setIsTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  // Gestionnaire de fichier
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > CHAT_SETTINGS.maxFileSize) {
        setError('Fichier trop volumineux (max 5MB)');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Filtrer les rooms
  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      room.category?.nom?.toLowerCase().includes(searchLower) ||
      room.last_message?.message?.toLowerCase().includes(searchLower) ||
      room.participants?.some(p => 
        p.user?.prenoms?.toLowerCase().includes(searchLower) ||
        p.user?.nom?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Effets
  useEffect(() => {
    if (open && currentUser) {
      loadRooms();
      
      // Polling pour les nouveaux messages
      const interval = setInterval(() => {
        if (activeRoom) {
          loadMessages(activeRoom.id);
          loadRooms();
        }
      }, CHAT_SETTINGS.refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [open, currentUser, activeRoom, loadRooms, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Formatage de la date
  const formatRoomTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return format(date, 'HH:mm');
      } else if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays < 7) {
        return format(date, 'EEEE', { locale: fr });
      } else {
        return format(date, 'dd/MM');
      }
    } catch (error) {
      return '';
    }
  };

  // Calculer les participants en ligne
  const onlineParticipants = participants.filter(p => p.is_online).length;

  // Rendu conditionnel pour mobile/desktop
  const renderContent = () => {
    if (isMobile) {
      return renderMobileView();
    }
    return renderDesktopView();
  };

  const renderMobileView = () => {
    if (showParticipants) {
      return renderParticipantsView();
    }
    
    if (activeRoom) {
      return renderChatView();
    }
    
    return renderRoomsView();
  };

  const renderDesktopView = () => (
    <Box className="desktop-container">
      {/* Sidebar */}
      <Paper className="rooms-sidebar" elevation={3}>
        <Box className="sidebar-header">
          <Typography variant="h6" className="sidebar-title">
            Discussions
          </Typography>
          <IconButton onClick={loadRooms} disabled={loading.rooms}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {renderRoomsList()}
      </Paper>

      {/* Chat Area */}
      <Box className="chat-main-area">
        {activeRoom ? renderChatView() : renderWelcomeView()}
      </Box>

      {/* Participants Panel */}
      {showParticipants && (
        <Paper className="participants-panel" elevation={3}>
          {renderParticipantsView()}
        </Paper>
      )}
    </Box>
  );

  const renderRoomsView = () => (
    <Box className="rooms-view">
      <Box className="rooms-header">
        <Typography variant="h5" className="rooms-title">
          Discussions
        </Typography>
        <IconButton onClick={loadRooms} disabled={loading.rooms}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        size="medium"
        placeholder="Rechercher une discussion..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rooms-search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {renderRoomsList()}
    </Box>
  );

  const renderRoomsList = () => {
    if (loading.rooms) {
      return (
        <Box className="loading-container">
          <CircularProgress sx={{ color: CHAT_PALETTE.primary }} />
        </Box>
      );
    }

    if (filteredRooms.length === 0) {
      return (
        <Box className="empty-state">
          <ChatIcon sx={{ fontSize: 60, color: CHAT_PALETTE.gray, mb: 2 }} />
          <Typography color="text.secondary" align="center">
            {searchQuery ? 'Aucune discussion trouvée' : 'Aucune discussion'}
          </Typography>
        </Box>
      );
    }

    return (
      <List className="rooms-list">
        <AnimatePresence>
          {filteredRooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ListItem
                button
                selected={activeRoom?.id === room.id}
                onClick={() => handleRoomSelect(room)}
                className="room-item"
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={room.unread_count}
                    color="error"
                    invisible={!room.unread_count}
                  >
                    <Avatar
                      className="room-avatar"
                      sx={{ bgcolor: CHAT_PALETTE.primary }}
                    >
                      {room.category?.nom?.[0] || 'G'}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box className="room-primary">
                      <Typography variant="subtitle1" className="room-name">
                        {room.category?.nom || 'Groupe'}
                      </Typography>
                      {room.unread_count > 0 && (
                        <Chip
                          label={room.unread_count}
                          size="small"
                          color="error"
                          className="unread-badge"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" className="room-last-message" noWrap>
                        {room.last_message?.message || 'Aucun message'}
                      </Typography>
                      <Typography variant="caption" className="room-time">
                        {formatRoomTime(room.last_message?.created_at)}
                      </Typography>
                    </>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton size="small" edge="end">
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </motion.div>
          ))}
        </AnimatePresence>
      </List>
    );
  };

  const renderChatView = () => (
    <Box className="chat-view">
      {/* Chat Header */}
      <AppBar position="static" className="chat-header" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setActiveRoom(null)}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          
          <Avatar
            className="chat-header-avatar"
            sx={{ bgcolor: CHAT_PALETTE.primary, mr: 2 }}
          >
            {activeRoom?.category?.nom?.[0] || 'G'}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" className="chat-room-name">
              {activeRoom?.category?.nom || 'Discussion'}
            </Typography>
            <Typography variant="caption" className="chat-room-info">
              {participants.length} participant(s) • {onlineParticipants} en ligne
            </Typography>
          </Box>
          
          <IconButton
            color="inherit"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <PeopleIcon />
          </IconButton>
          
          <IconButton color="inherit">
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Messages Container */}
      <Box className="messages-container" ref={messagesContainerRef}>
        {loading.messages && messages.length === 0 ? (
          <Box className="loading-messages">
            <CircularProgress sx={{ color: CHAT_PALETTE.primary }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box className="no-messages">
            <ChatIcon sx={{ fontSize: 80, color: CHAT_PALETTE.gray, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun message
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Soyez le premier à envoyer un message !
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.user_id === currentUser?.id}
                currentUser={currentUser}
              />
            ))}
            
            {isTyping && (
              <Box className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <Typography variant="caption" color="text.secondary">
                  Quelqu'un tape...
                </Typography>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input Area */}
      <Paper className="input-container" elevation={3}>
        {selectedFile && (
          <Box className="file-preview">
            <Chip
              label={selectedFile.name}
              onDelete={() => setSelectedFile(null)}
              icon={<AttachFileIcon />}
            />
          </Box>
        )}
        
        <Box className="input-row">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            className="attach-button"
          >
            <AttachFileIcon />
          </IconButton>
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          
          <IconButton className="emoji-button">
            <EmojiEmotionsIcon />
          </IconButton>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="message-input"
            multiline
            maxRows={4}
            disabled={loading.sending}
          />
          
          <IconButton
            onClick={sendMessage}
            disabled={!newMessage.trim() && !selectedFile || loading.sending}
            className="send-button"
            sx={{
              bgcolor: CHAT_PALETTE.primary,
              color: 'white',
              '&:hover': { bgcolor: CHAT_PALETTE.primaryDark },
              '&.Mui-disabled': { bgcolor: CHAT_PALETTE.gray },
            }}
          >
            {loading.sending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );

  const renderParticipantsView = () => (
    <Box className="participants-view">
      <Box className="participants-header">
        {isMobile && (
          <IconButton
            edge="start"
            onClick={() => setShowParticipants(false)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" className="participants-title">
          Participants ({participants.length})
        </Typography>
        
        <IconButton edge="end">
          <SettingsIcon />
        </IconButton>
      </Box>
      
      <List className="participants-list">
        {participants.map((participant) => (
          <ListItem key={participant.id} className="participant-item">
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={participant.is_online ? 'success' : 'default'}
              >
                <Avatar
                  src={participant.user?.photo_url}
                  sx={{ bgcolor: CHAT_PALETTE.primary }}
                >
                  {participant.user?.prenoms?.[0]}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box className="participant-primary">
                  <Typography variant="subtitle1">
                    {participant.user?.prenoms} {participant.user?.nom}
                  </Typography>
                  {participant.user?.type_compte === 'promoteur' && (
                    <Chip label="Promoteur" size="small" color="warning" />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {participant.is_online ? 'En ligne' : 'Hors ligne'}
                </Typography>
              }
            />
            
            <ListItemSecondaryAction>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderWelcomeView = () => (
    <Box className="welcome-view">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ChatIcon sx={{ fontSize: 120, color: CHAT_PALETTE.gray, mb: 3 }} />
      </motion.div>
      
      <Typography variant="h4" gutterBottom className="welcome-title">
        Bienvenue sur le Chat
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph align="center">
        Sélectionnez une discussion pour commencer à chatter
      </Typography>
      
      <Button
        variant="contained"
        startIcon={<ChatIcon />}
        sx={{
          bgcolor: CHAT_PALETTE.primary,
          mt: 2,
          px: 4,
          py: 1.5,
          borderRadius: 50,
        }}
      >
        Nouvelle Discussion
      </Button>
    </Box>
  );

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      className="chat-modal"
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '90vh',
          maxHeight: '90vh',
          borderRadius: isMobile ? 0 : 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%' }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;