// src/components/Chat/ChatRoomList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  OnlinePrediction as OnlineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PALETTE = {
  OR: '#D4AF37',
  RED_DARK: '#8B0000',
  BROWN: '#8B4513',
  WHITE: '#FFFFFF',
  SUCCESS: '#4CAF50',
};

const ChatRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/chat/rooms');
      
      if (response.data.success) {
        setRooms(response.data.rooms);
      }
    } catch (err) {
      console.error('Erreur chargement rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    navigate(`/candidats?chat=${room.id}&category=${room.category_id}`);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Aucun message';
    
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

  useEffect(() => {
    loadRooms();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: PALETTE.OR }} />
      </Box>
    );
  }

  if (rooms.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <ChatIcon sx={{ fontSize: 48, color: PALETTE.BROWN, opacity: 0.5, mb: 2 }} />
        <Typography variant="h6" color={PALETTE.BROWN} gutterBottom>
          Aucun chat disponible
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rejoignez une catégorie pour participer aux discussions
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
        color: PALETTE.WHITE
      }}>
        <Typography variant="h6" fontWeight="bold">
          Vos discussions
        </Typography>
        <Typography variant="caption">
          {rooms.length} chat{rooms.length > 1 ? 's' : ''} actif{rooms.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {rooms.map((room) => (
          <ListItem
            key={room.id}
            button
            onClick={() => handleRoomClick(room)}
            sx={{
              borderBottom: `1px solid ${PALETTE.BROWN}20`,
              '&:hover': {
                backgroundColor: `${PALETTE.OR}08`
              }
            }}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  room.unread_count > 0 ? (
                    <Chip
                      label={room.unread_count}
                      size="small"
                      sx={{
                        bgcolor: PALETTE.RED_DARK,
                        color: PALETTE.WHITE,
                        height: 20,
                        minWidth: 20,
                        fontSize: '0.7rem'
                      }}
                    />
                  ) : null
                }
              >
                <Avatar
                  sx={{
                    bgcolor: PALETTE.BROWN,
                    width: 50,
                    height: 50
                  }}
                >
                  <ChatIcon />
                </Avatar>
              </Badge>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {room.category?.nom}
                  </Typography>
                  {room.participants?.some(p => p.user?.type_compte === 'promoteur') && (
                    <Chip
                      label="Promoteur"
                      size="small"
                      sx={{
                        bgcolor: PALETTE.OR,
                        color: PALETTE.WHITE,
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <PeopleIcon fontSize="small" sx={{ fontSize: 14 }} />
                    <Typography variant="caption" color="text.secondary">
                      {room.participants?.length || 0} participant{room.participants?.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  {room.last_message && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: PALETTE.BROWN,
                        fontWeight: room.unread_count > 0 ? 'bold' : 'normal',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {room.last_message.user?.prenoms}: {room.last_message.message}
                    </Typography>
                  )}
                  
                  {room.last_message?.created_at && (
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(room.last_message.created_at)}
                    </Typography>
                  )}
                </Box>
              }
            />

            <IconButton size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ChatRoomList;