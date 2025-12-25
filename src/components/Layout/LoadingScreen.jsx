import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: '#D4AF37',
            animationDuration: '1.5s',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <EmojiEvents sx={{ fontSize: 40, color: '#D4AF37' }} />
        </Box>
      </Box>
      <Typography variant="h6" color="textSecondary">
        Chargement...
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        Nous préparons votre expérience
      </Typography>
    </Box>
  );
};

export default LoadingScreen;