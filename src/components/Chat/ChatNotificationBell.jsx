// src/components/Chat/ChatNotificationBell.jsx
import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
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

const ChatNotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/chat/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/chat/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur marquage notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/chat/notifications/read-all');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur marquage notifications:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Redirection vers le chat
    if (notification.chat_room_id) {
      navigate(`/candidats?chat=${notification.chat_room_id}`);
    }
    
    handleClose();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatTime = (dateString) => {
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
    // Charger initialement
    loadNotifications();
    
    // Polling toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: PALETTE.WHITE,
          position: 'relative'
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          invisible={unreadCount === 0}
        >
          {unreadCount > 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            mt: 1,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color={PALETTE.BROWN}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                startIcon={<CheckCircleIcon />}
                sx={{
                  color: PALETTE.SUCCESS,
                  fontSize: '0.75rem'
                }}
              >
                Tout marquer comme lu
              </Button>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Discussions et activités
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Chargement...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsNoneIcon sx={{ fontSize: 48, color: PALETTE.BROWN, opacity: 0.5, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Aucune notification
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  borderLeft: notification.is_read ? 'none' : `3px solid ${PALETTE.OR}`,
                  backgroundColor: notification.is_read ? 'transparent' : `${PALETTE.OR}08`
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: notification.type === 'promoteur_message' ? PALETTE.OR : PALETTE.BROWN,
                      width: 40,
                      height: 40
                    }}
                  >
                    {notification.type === 'promoteur_message' ? '👑' : <ChatIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {notification.room?.category?.nom || 'Chat'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.created_at)}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.is_read && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PALETTE.OR, ml: 1 }} />
                )}
              </MenuItem>
            ))
          )}
        </Box>

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  navigate('/candidats?tab=chats');
                  handleClose();
                }}
                sx={{ color: PALETTE.BROWN }}
              >
                Voir tous les chats
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default ChatNotificationBell;