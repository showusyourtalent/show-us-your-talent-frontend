// src/components/Chat/ChatMessage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PALETTE = {
  OR: '#D4AF37',
  OR_LIGHT: '#FFD700',
  OR_DARK: '#B8860B',
  RED_DARK: '#8B0000',
  BROWN: '#8B4513',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_DARK: '#333333',
  SUCCESS: '#4CAF50',
};

const ChatMessage = ({ message, isOwn }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.message);
    handleMenuClose();
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch (err) {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 2,
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && (
        <Tooltip 
          title={`${message.user?.prenoms} ${message.user?.nom}`}
          placement="left"
        >
          <Avatar
            src={message.user?.photo_url}
            sx={{
              width: 36,
              height: 36,
              mr: 1,
              mt: 0.5,
              bgcolor: message.user?.type_compte === 'promoteur' ? PALETTE.OR : PALETTE.BROWN,
              fontSize: 14
            }}
          >
            {getInitials(message.user?.prenoms)}
          </Avatar>
        </Tooltip>
      )}

      <Box sx={{ maxWidth: '70%' }}>
        {!isOwn && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.5,
              ml: 1,
              color: PALETTE.BROWN,
              fontWeight: 'medium'
            }}
          >
            {message.user?.prenoms} {message.user?.type_compte === 'promoteur' && '👑'}
          </Typography>
        )}

        <Paper
          elevation={isHovered ? 3 : 1}
          sx={{
            p: 1.5,
            borderRadius: 4,
            borderTopLeftRadius: isOwn ? 4 : 0,
            borderTopRightRadius: isOwn ? 0 : 4,
            background: isOwn
              ? `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.OR_DARK} 100%)`
              : PALETTE.WHITE,
            color: isOwn ? PALETTE.WHITE : PALETTE.BLACK,
            border: `1px solid ${isOwn ? PALETTE.OR_DARK : PALETTE.OR}20`,
            position: 'relative',
            transition: 'all 0.2s ease',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          <Typography variant="body2">
            {message.message}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              opacity: 0.7
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              <ScheduleIcon sx={{ fontSize: '0.7rem', mr: 0.5, verticalAlign: 'middle' }} />
              {formatTime(message.created_at)}
            </Typography>

            {isOwn && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {message.is_read ? (
                  <CheckCircleIcon sx={{ fontSize: '0.9rem', color: PALETTE.SUCCESS }} />
                ) : (
                  <CheckIcon sx={{ fontSize: '0.9rem' }} />
                )}
              </Box>
            )}
          </Box>

          {isHovered && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: isOwn 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'rgba(0,0,0,0.05)',
                color: isOwn ? PALETTE.WHITE : PALETTE.BLACK,
                '&:hover': {
                  background: isOwn 
                    ? 'rgba(255,255,255,0.3)' 
                    : 'rgba(0,0,0,0.1)',
                },
                width: 24,
                height: 24
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleCopyText}>
          Copier le texte
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Répondre
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Épingler
        </MenuItem>
        {isOwn && (
          <MenuItem onClick={handleMenuClose} sx={{ color: PALETTE.RED_DARK }}>
            Supprimer
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ChatMessage;



