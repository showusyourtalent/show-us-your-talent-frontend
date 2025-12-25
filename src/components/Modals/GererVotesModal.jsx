// src/components/Modals/GererVotesModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  HowToVote as VoteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const GererVotesModal = ({ open, onClose, edition, onManageVotes, isLoading }) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  // Calculer le temps restant
  useEffect(() => {
    if (!edition?.date_fin_votes) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(edition.date_fin_votes);
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('Terminé');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}j ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Mettre à jour chaque minute

    return () => clearInterval(interval);
  }, [edition]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_cours': return 'success';
      case 'suspendu': return 'warning';
      case 'en_attente': return 'info';
      case 'termine': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_cours': return <PlayIcon />;
      case 'suspendu': return <PauseIcon />;
      case 'en_attente': return <ScheduleIcon />;
      case 'termine': return <CheckCircleIcon />;
      default: return <VoteIcon />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'suspendu': return 'Suspendu';
      case 'en_attente': return 'En attente';
      case 'termine': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const getAvailableActions = () => {
    if (!edition?.statut_votes) return [];

    switch (edition.statut_votes) {
      case 'en_attente':
        return [
          { action: 'demarrer', label: 'Démarrer les votes', color: 'success', icon: <PlayIcon /> },
        ];
      case 'en_cours':
        return [
          { action: 'suspendre', label: 'Suspendre les votes', color: 'warning', icon: <PauseIcon /> },
          { action: 'terminer', label: 'Terminer les votes', color: 'error', icon: <StopIcon /> },
        ];
      case 'suspendu':
        return [
          { action: 'relancer', label: 'Relancer les votes', color: 'success', icon: <RestartIcon /> },
          { action: 'terminer', label: 'Terminer les votes', color: 'error', icon: <StopIcon /> },
        ];
      default:
        return [];
    }
  };

  const handleAction = (action) => {
    onManageVotes(action);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  if (!edition) return null;

  const availableActions = getAvailableActions();

  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
        color: 'white',
        textAlign: 'center',
        py: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Gestion des Votes
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          {edition.nom}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 3 }}>
          {isLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}
          
          {/* Statut des votes */}
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: `${getStatusColor(edition.statut_votes)}.light`,
                      color: `${getStatusColor(edition.statut_votes)}.main`,
                    }}>
                      {getStatusIcon(edition.statut_votes)}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Statut des votes
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {getStatusText(edition.statut_votes)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Votes enregistrés
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {edition.nombre_votes || 0}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Informations sur les dates */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" />
                      Début des votes
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatDate(edition.date_debut_votes)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" />
                      Fin des votes
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatDate(edition.date_fin_votes)}
                    </Typography>
                    {edition.statut_votes === 'en_cours' && timeRemaining && (
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                        Temps restant: {timeRemaining}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Actions disponibles */}
          {availableActions.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Actions disponibles
              </Typography>
              <Grid container spacing={2}>
                {availableActions.map((action) => (
                  <Grid item xs={12} sm={6} key={action.action}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={action.icon}
                      onClick={() => handleAction(action.action)}
                      disabled={isLoading}
                      sx={{
                        height: 56,
                        background: action.color === 'success' 
                          ? 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)'
                          : action.color === 'warning'
                          ? 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)'
                          : 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                        },
                        '&.Mui-disabled': {
                          background: '#e5e7eb',
                          color: '#9ca3af',
                        },
                      }}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-icon': { alignItems: 'center' }
              }}
            >
              Aucune action disponible pour le statut actuel des votes.
            </Alert>
          )}

          {/* Informations importantes */}
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Important:
            </Typography>
            <Typography variant="body2">
              • La suspension des votes arrête temporairement les votes
              <br />
              • La relance reprend les votes là où ils se sont arrêtés
              <br />
              • La terminaison met fin définitivement aux votes
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{
            color: '#666',
            borderRadius: 2,
            px: 4,
            py: 1,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            },
            '&.Mui-disabled': {
              color: '#999'
            }
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GererVotesModal;