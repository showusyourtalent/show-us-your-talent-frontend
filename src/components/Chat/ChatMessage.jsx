// src/components/Chat/ChatModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Badge,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Tooltip,
  Fade,
  Slide,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FiberManualRecord as OnlineIcon,
  VolumeOff as VolumeOffIcon,
  Pin as PinIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axios';

// Composant Message Bubble
const MessageBubble = ({ message, isOwn, showSender }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm');
    } catch (error) {
      return '--:--';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && (
        <Tooltip title={`${message.user?.prenoms} ${message.user?.nom}`}>
          <Avatar
            src={message.user?.photo_url}
            sx={{
              width: 32,
              height: 32,
              mr: 1,
              mt: 0.5,
              bgcolor: message.user?.type_compte === 'promoteur' ? '#D4AF37' : '#8B4513',
              fontSize: 12,
            }}
          >
            {message.user?.prenoms?.[0] || '?'}
          </Avatar>
        </Tooltip>
      )}

      <Box sx={{ maxWidth: '70%' }}>
        {!isOwn && showSender && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.5,
              ml: 1,
              color: '#8B4513',
              fontWeight: 'medium',
            }}
          >
            {message.user?.prenoms} {message.user?.type_compte === 'promoteur' && '👑'}
          </Typography>
        )}

        <Paper
          elevation={isHovered ? 3 : 1}
          sx={{
            p: 1.5,
            borderRadius: 3,
            borderTopLeftRadius: isOwn ? 12 : 3,
            borderTopRightRadius: isOwn ? 3 : 12,
            background: isOwn
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#ffffff',
            color: isOwn ? '#ffffff' : '#000000',
            border: `1px solid ${isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
            transition: 'all 0.2s ease',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            position: 'relative',
          }}
        >
          <Typography variant="body2">{message.message}</Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              opacity: 0.7,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              <ScheduleIcon
                sx={{ fontSize: '0.7rem', mr: 0.5, verticalAlign: 'middle' }}
              />
              {formatTime(message.created_at)}
            </Typography>

            {isOwn && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon
                  sx={{ fontSize: '0.9rem', color: '#4CAF50' }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

// Composant ChatModal principal
const ChatModal = ({ open, onClose, initialRoom, currentUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // États
  const [activeRoom, setActiveRoom] = useState(initialRoom);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState({
    rooms: false,
    messages: false,
    sending: false,
    participants: false,
  });
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Références
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charger les messages
  const loadMessages = useCallback(async (roomId) => {
    if (!roomId) return;

    setLoading(prev => ({ ...prev, messages: true }));
    setError(null);

    try {
      const response = await axios.get(`/chat/room/${roomId}/messages`);
      
      if (response.data.success) {
        const messagesData = response.data.messages?.data || response.data.messages || [];
        setMessages(messagesData);
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        setError('Erreur lors du chargement des messages');
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, []);

  // Charger les participants
  const loadParticipants = useCallback(async (roomId) => {
    if (!roomId) return;

    setLoading(prev => ({ ...prev, participants: true }));
    
    try {
      const response = await axios.get(`/chat/room/${roomId}/participants`);
      
      if (response.data.success) {
        setParticipants(response.data.participants || []);
      }
    } catch (err) {
      console.error('Erreur chargement participants:', err);
    } finally {
      setLoading(prev => ({ ...prev, participants: false }));
    }
  }, []);

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || loading.sending) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');
    setLoading(prev => ({ ...prev, sending: true }));

    try {
      const response = await axios.post(`/chat/room/${activeRoom.id}/message`, {
        message: messageToSend,
        type: 'text',
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
      setNewMessage(messageToSend);
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
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

  // Mettre à jour last seen
  const updateLastSeen = async (roomId) => {
    try {
      await axios.post(`/chat/room/${roomId}/last-seen`);
    } catch (err) {
      console.error('Erreur mise à jour last seen:', err);
    }
  };

  // Effets
  useEffect(() => {
    if (open && activeRoom) {
      Promise.all([
        loadMessages(activeRoom.id),
        loadParticipants(activeRoom.id),
      ]);
      
      updateLastSeen(activeRoom.id);
      
      const interval = setInterval(() => {
        loadMessages(activeRoom.id);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [open, activeRoom, loadMessages, loadParticipants]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Calculer les participants en ligne
  const onlineParticipants = participants.filter(p => p.is_online).length;

  // Gestionnaire de touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '80vh',
          maxHeight: '90vh',
          borderRadius: isMobile ? 0 : 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white',
          position: 'relative',
        }}
      >
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            <ChatIcon />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {activeRoom?.category?.nom || 'Discussion'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {participants.length} participant(s) • {onlineParticipants} en ligne
            </Typography>
          </Box>

          {!isMobile && (
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      <DialogContent sx={{ p: 0, height: '100%' }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Zone principale (messages + input) */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages */}
            <Box
              ref={messagesContainerRef}
              sx={{
                flex: 1,
                overflow: 'auto',
                p: { xs: 2, sm: 3 },
                bgcolor: 'grey.50',
                backgroundImage: 'radial-gradient(#c3cfe2 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {loading.messages && messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                    textAlign: 'center',
                  }}
                >
                  <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    Aucun message
                  </Typography>
                  <Typography variant="body2">
                    Soyez le premier à envoyer un message !
                  </Typography>
                </Box>
              ) : (
                <>
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const showSender = index === 0 || 
                        messages[index - 1]?.user_id !== message.user_id;
                      
                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={message.user_id === currentUser?.id}
                          showSender={showSender}
                        />
                      );
                    })}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: 3,
                        maxWidth: 'fit-content',
                        boxShadow: 1,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              animation: 'typing 1.4s infinite both',
                              animationDelay: `${i * 0.2}s`,
                              '@keyframes typing': {
                                '0%, 60%, 100%': {
                                  transform: 'translateY(0)',
                                  opacity: 0.6,
                                },
                                '30%': {
                                  transform: 'translateY(-10px)',
                                  opacity: 1,
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Quelqu'un écrit...
                      </Typography>
                    </Box>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Input */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'white',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Joindre un fichier">
                  <IconButton size="small" disabled={loading.sending}>
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Émojis">
                  <IconButton size="small" disabled={loading.sending}>
                    <EmojiEmotionsIcon />
                  </IconButton>
                </Tooltip>
                
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  multiline
                  maxRows={3}
                  disabled={loading.sending}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                    },
                  }}
                />
                
                <Tooltip title="Envoyer">
                  <IconButton
                    size="small"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading.sending}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' },
                      transition: 'all 0.2s',
                    }}
                  >
                    {loading.sending ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Box>

          {/* Panel participants (desktop only) */}
          {!isMobile && (
            <Paper
              elevation={0}
              sx={{
                width: 280,
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Participants ({participants.length})
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {loading.participants ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <List>
                    {participants.map((participant) => (
                      <ListItem
                        key={participant.id}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': { bgcolor: 'grey.50' },
                        }}
                      >
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
                                width: 36,
                                height: 36,
                                bgcolor: participant.user?.type_compte === 'promoteur' ? '#D4AF37' : '#667eea',
                              }}
                            >
                              {participant.user?.prenoms?.[0]}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" noWrap>
                                {participant.user?.prenoms} {participant.user?.nom}
                              </Typography>
                              {participant.user?.type_compte === 'promoteur' && (
                                <Chip
                                  label="Promoteur"
                                  size="small"
                                  color="warning"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {participant.is_online ? 'En ligne' : 'Hors ligne'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;