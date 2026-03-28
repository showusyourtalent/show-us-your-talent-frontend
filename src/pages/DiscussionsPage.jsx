// src/pages/DiscussionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Message as MessageIcon,
  OnlinePrediction as OnlineIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from '../api/axios';
import ChatModal from '../components/Chat/ChatModal';
import { useAuth } from '../contexts/AuthContext';

const DiscussionsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const loadRooms = useCallback(async () => {
    if (!user) return;

    setLoading(true);
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
      } else {
        setError(response.data.message || 'Erreur lors du chargement des discussions');
      }
    } catch (err) {
      console.error('Erreur chargement discussions:', err);
      setError('Impossible de charger les discussions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRooms();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadRooms, 30000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setChatOpen(true);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch (err) {
      return '';
    }
  };

  const getLastMessagePreview = (room) => {
    if (!room.last_message) return 'Aucun message';
    
    const sender = room.last_message.user?.prenoms || 'Quelqu\'un';
    const message = room.last_message.message;
    
    if (message.length > 50) {
      return `${sender}: ${message.substring(0, 50)}...`;
    }
    return `${sender}: ${message}`;
  };

  const filteredRooms = rooms.filter(room =>
    room.category?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    room.last_message?.message?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChatIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  Vos Discussions
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Communiquez avec les participants de vos catégories
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadRooms}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Actualiser
            </Button>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher une discussion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Statistiques */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              flex: 1,
              minWidth: 150,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#667eea' }}>
              <ChatIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{rooms.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Discussions
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              flex: 1,
              minWidth: 150,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#48bb78' }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {rooms.reduce((sum, room) => sum + (room.participants?.length || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Participants totaux
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              flex: 1,
              minWidth: 150,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#ed8936' }}>
              <MessageIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {rooms.reduce((sum, room) => sum + (room.unread_count || 0), 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Messages non lus
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Liste des discussions */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
              <Button variant="contained" onClick={loadRooms}>
                Réessayer
              </Button>
            </Box>
          ) : filteredRooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <ChatIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {search ? 'Aucune discussion trouvée' : 'Aucune discussion'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {search ? 'Essayez avec d\'autres termes' : 'Rejoignez une catégorie pour participer aux discussions'}
              </Typography>
              {!search && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/candidats')}
                  startIcon={<PeopleIcon />}
                >
                  Voir les catégories
                </Button>
              )}
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredRooms.map((room, index) => (
                <React.Fragment key={room.id}>
                  <ListItem
                    button
                    onClick={() => handleRoomClick(room)}
                    sx={{
                      p: { xs: 2, md: 3 },
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={room.unread_count}
                        color="error"
                        invisible={!room.unread_count}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            height: 20,
                            minWidth: 20,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          <ChatIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {room.category?.nom || 'Discussion'}
                          </Typography>
                          {room.participants?.some(p => p.user?.type_compte === 'promoteur') && (
                            <Chip
                              label="Promoteur présent"
                              size="small"
                              color="warning"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {room.participants?.length || 0} participant(s)
                            </Typography>
                            {room.participants?.some(p => p.is_online) && (
                              <>
                                <OnlineIcon fontSize="small" sx={{ color: '#48bb78', ml: 1 }} />
                                <Typography variant="caption" color="success.main">
                                  En ligne
                                </Typography>
                              </>
                            )}
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              color: room.unread_count > 0 ? 'text.primary' : 'text.secondary',
                              fontWeight: room.unread_count > 0 ? 'medium' : 'normal',
                              mb: 0.5,
                            }}
                          >
                            {getLastMessagePreview(room)}
                          </Typography>

                          {room.last_message?.created_at && (
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(room.last_message.created_at)}
                            </Typography>
                          )}
                        </>
                      }
                    />

                    <IconButton
                      edge="end"
                      sx={{
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' },
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </ListItem>
                  {index < filteredRooms.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Aide */}
        {filteredRooms.length > 0 && (
          <Paper
            elevation={2}
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              bgcolor: '#f8f9fa',
              borderLeft: '4px solid #667eea',
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              💡 Comment utiliser les discussions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Cliquez sur une discussion pour ouvrir le chat<br />
              • Écrivez votre message et appuyez sur Entrée pour envoyer<br />
              • Les messages non lus sont indiqués par un badge rouge<br />
              • Le promoteur est indiqué par une badge "Promoteur présent"<br />
              • Les participants en ligne sont indiqués par un point vert
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Modal de chat */}
      {selectedRoom && (
        <ChatModal
          open={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedRoom(null);
          }}
          initialRoom={selectedRoom}
          currentUser={user}
        />
      )}
    </Box>
  );
};

export default DiscussionsPage;