import React from 'react';
import { Alert, Slide, Box } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

const ToastAlert = ({ type = 'success', message, onClose }) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle />,
          color: '#10B981',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
      case 'error':
        return {
          icon: <Error />,
          color: '#EF4444',
          bgColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'warning':
        return {
          icon: <Warning />,
          color: '#F59E0B',
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
        };
      case 'info':
        return {
          icon: <Info />,
          color: '#3B82F6',
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
      default:
        return {
          icon: <CheckCircle />,
          color: '#10B981',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Slide direction="left" in mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          minWidth: '300px',
          maxWidth: '400px',
        }}
      >
        <Alert
          severity={type}
          icon={config.icon}
          onClose={onClose}
          sx={{
            borderRadius: '12px',
            backgroundColor: config.bgColor,
            border: `1px solid ${config.borderColor}`,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            animation: 'slideInRight 0.3s ease-out',
            '@keyframes slideInRight': {
              '0%': { transform: 'translateX(100%)', opacity: 0 },
              '100%': { transform: 'translateX(0)', opacity: 1 },
            },
            '& .MuiAlert-icon': {
              color: config.color,
            },
            '& .MuiAlert-message': {
              color: '#374151',
              fontWeight: 500,
            },
          }}
        >
          {message}
        </Alert>
      </Box>
    </Slide>
  );
};

export default ToastAlert;