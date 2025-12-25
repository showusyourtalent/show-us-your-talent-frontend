// src/components/Chat/ChatModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Avatar,
  Badge,
  CircularProgress,
  Chip,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  MoreVert as MoreVertIcon,
  OnlinePrediction as OnlineIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from '../../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import ChatMessage from './ChatMessage';
import ChatNotificationBell from './ChatNotificationBell';

const PALETTE = {
  OR: '#D4AF37',
  OR_LIGHT: '#FFD700',
  OR_DARK: '#B8860B',
  RED_DARK: '#8B0000',
  BROWN: '#8B4513',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
};

const ChatModal = ({ open, onClose, categoryId, categoryName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Charger la salle de chat
  const loadChatRoom = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/chat/room/${categoryId}`);
      
      if (response.data.success) {
        setRoom(response.data.room);
        setMessages(response.data.room.messages || []);
        
        // Charger les participants
        loadParticipants(response.data.room.id);
        
        // Démarrer le polling pour les nouveaux messages
        startPolling(response.data.room.id);
      }
    } catch (err) {
      console.error('Erreur chargement chat:', err);
      showNotification('Erreur de chargement du chat', 'error');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Charger les participants
  const loadParticipants = async (roomId) => {
    try {
      const response = await axios.get(`/chat/room/${roomId}/participants`);
      if (response.data.success) {
        setParticipants(response.data.participants);
      }
    } catch (err) {
      console.error('Erreur chargement participants:', err);
    }
  };

  // Démarrer le polling pour les nouveaux messages
  const startPolling = (roomId) => {
    if (pollingInterval) clearInterval(pollingInterval);
    
    const interval = setInterval(async () => {
      if (!roomId || !open) return;
      
      try {
        const response = await axios.get(`/chat/room/${roomId}/messages`);
        if (response.data.success && response.data.messages.data) {
          setMessages(prev => {
            const newMessages = response.data.messages.data;
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
            
            if (uniqueNewMessages.length > 0) {
              // Trier par date
              const allMessages = [...prev, ...uniqueNewMessages];
              return allMessages.sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
              );
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Erreur polling:', err);
      }
    }, 3000); // Poll toutes les 3 secondes
    
    setPollingInterval(interval);
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !room || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/chat/room/${room.id}/message`, {
        message: newMessage,
        type: 'text'
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
      showNotification('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Afficher notification
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Gestionnaire de touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Menu contextuel
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Effets
  useEffect(() => {
    if (open && categoryId) {
      loadChatRoom();
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [open, categoryId, loadChatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '80vh',
          maxHeight: '80vh',
          borderRadius: isMobile ? 0 : 4,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${PALETTE.BROWN}05 0%, ${PALETTE.RED_DARK}02 100%)`,
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        p: 2,
        background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
        color: PALETTE.WHITE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showParticipants && isMobile && (
            <IconButton onClick={() => setShowParticipants(false)} sx={{ color: PALETTE.WHITE }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {showParticipants ? 'Participants' : categoryName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {showParticipants 
                ? `${participants.length} participant${participants.length > 1 ? 's' : ''}` 
                : room?.description || 'Discussion en cours'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!showParticipants && (
            <Tooltip title="Participants">
              <IconButton 
                onClick={() => setShowParticipants(true)}
                sx={{ color: PALETTE.WHITE }}
              >
                <Badge 
                  badgeContent={participants.length} 
                  color="secondary"
                  max={99}
                >
                  <PeopleIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          <IconButton 
            onClick={handleMenuOpen}
            sx={{ color: PALETTE.WHITE }}
          >
            <MoreVertIcon />
          </IconButton>
          
          <IconButton 
            onClick={onClose}
            sx={{ color: PALETTE.WHITE }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(room?.id);
          showNotification('ID du chat copié', 'success');
          handleMenuClose();
        }}>
          Copier l'ID du chat
        </MenuItem>
        <MenuItem onClick={() => {
          // Muter les notifications
          handleMenuClose();
        }}>
          Muter les notifications
        </MenuItem>
        <MenuItem onClick={() => {
          // Exporter l'historique
          handleMenuClose();
        }}>
          Exporter l'historique
        </MenuItem>
      </Menu>

      {/* Contenu principal */}
      <DialogContent sx={{ 
        p: 0, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress sx={{ color: PALETTE.OR }} />
          </Box>
        ) : showParticipants ? (
          // Vue participants
          <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: PALETTE.RED_DARK }}>
              Promoteurs ({participants.filter(p => p.role === 'promoteur').length})
            </Typography>
            <List>
              {participants
                .filter(p => p.role === 'promoteur')
                .map((participant) => (
                  <ListItem key={participant.id}>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={participant.is_online ? 'success' : 'default'}
                      >
                        <Avatar 
                          src={participant.user?.photo_url} 
                          sx={{ 
                            bgcolor: PALETTE.OR,
                            width: 40,
                            height: 40
                          }}
                        >
                          {participant.user?.prenoms?.[0]}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {participant.user?.prenoms} {participant.user?.nom}
                          </Typography>
                          {participant.is_current_user && (
                            <Chip label="Vous" size="small" sx={{ 
                              bgcolor: PALETTE.OR, 
                              color: PALETTE.WHITE,
                              height: 20 
                            }} />
                          )}
                        </Box>
                      }
                      secondary="Promoteur"
                    />
                  </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: PALETTE.RED_DARK }}>
              Candidats ({participants.filter(p => p.role === 'candidat').length})
            </Typography>
            <List>
              {participants
                .filter(p => p.role === 'candidat')
                .map((participant) => (
                  <ListItem key={participant.id}>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={participant.is_online ? 'success' : 'default'}
                      >
                        <Avatar 
                          src={participant.user?.photo_url} 
                          sx={{ 
                            bgcolor: PALETTE.BROWN,
                            width: 40,
                            height: 40
                          }}
                        >
                          {participant.user?.prenoms?.[0]}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {participant.user?.prenoms} {participant.user?.nom}
                          </Typography>
                          {participant.is_current_user && (
                            <Chip label="Vous" size="small" sx={{ 
                              bgcolor: PALETTE.OR, 
                              color: PALETTE.WHITE,
                              height: 20 
                            }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <SchoolIcon fontSize="small" sx={{ fontSize: 14 }} />
                          <Typography variant="caption">
                            {participant.user?.universite || 'Étudiant'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        ) : (
          // Vue messages
          <>
            {/* Zone des messages */}
            <Box 
              ref={messagesContainerRef}
              sx={{ 
                flex: 1, 
                overflowY: 'auto',
                p: 2,
                background: `linear-gradient(180deg, ${PALETTE.WHITE} 0%, ${PALETTE.BROWN}02 100%)`
              }}
            >
              {messages.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  color: PALETTE.BROWN,
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" gutterBottom>
                    🎉 Bienvenue dans le chat !
                  </Typography>
                  <Typography variant="body2" sx={{ maxWidth: 400, mb: 3 }}>
                    Soyez le premier à envoyer un message dans cette conversation.
                    Échangez avec les autres candidats et le promoteur.
                  </Typography>
                  <Chip 
                    icon={<PeopleIcon />}
                    label={`${participants.length} participant${participants.length > 1 ? 's' : ''} en ligne`}
                    sx={{ bgcolor: PALETTE.OR, color: PALETTE.WHITE }}
                  />
                </Box>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                      isOwn={message.user_id === user?.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Zone de saisie */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderTop: `1px solid ${PALETTE.OR}20`,
                background: PALETTE.WHITE
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <IconButton size="small" sx={{ color: PALETTE.BROWN }}>
                  <AttachFileIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: PALETTE.BROWN }}>
                  <EmojiIcon />
                </IconButton>
                
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  variant="outlined"
                  size="small"
                  disabled={isSubmitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: PALETTE.WHITE,
                      '&:hover': {
                        borderColor: PALETTE.OR,
                      }
                    }
                  }}
                />
                
                <Tooltip title="Envoyer (Entrée)">
                  <span>
                    <IconButton
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSubmitting}
                      sx={{
                        bgcolor: PALETTE.OR,
                        color: PALETTE.WHITE,
                        '&:hover': {
                          bgcolor: PALETTE.OR_DARK,
                        },
                        '&.Mui-disabled': {
                          bgcolor: `${PALETTE.OR}50`,
                          color: `${PALETTE.WHITE}80`
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: PALETTE.WHITE }} />
                      ) : (
                        <SendIcon />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{ color: PALETTE.BROWN, mt: 1, display: 'block', textAlign: 'center' }}>
                Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
              </Typography>
            </Paper>
          </>
        )}
      </DialogContent>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          sx={{ 
            bgcolor: notification.severity === 'success' ? PALETTE.SUCCESS : 
                    notification.severity === 'error' ? PALETTE.RED_DARK : PALETTE.INFO,
            color: PALETTE.WHITE
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ChatModal;