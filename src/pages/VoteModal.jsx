import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  HowToVote as VoteIcon,
  Person as PersonIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from '../../api/axios';

const VoteModal = ({ open, onClose, candidat, edition }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVote = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/votes', {
        candidat_id: candidat.id,
        edition_id: edition.id,
        categorie_id: candidat.categorie_id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose(true); // Pass true to indicate successful vote
        }, 2000);
      } else {
        setError(response.data.message || 'Erreur lors du vote');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Confirmer votre vote
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => onClose(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Vote enregistré avec succès !
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Merci d'avoir participé au vote.
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                src={candidat.photo}
                alt={candidat.nom_complet}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto',
                  mb: 2,
                  border: `4px solid ${candidat.sexe === 'F' ? '#ff6b9d' : '#4dabf5'}`
                }}
              />
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {candidat.nom_complet}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                {candidat.sexe === 'F' ? (
                  <FemaleIcon sx={{ color: '#ff6b9d' }} />
                ) : (
                  <MaleIcon sx={{ color: '#4dabf5' }} />
                )}
                <Typography variant="body1" color="text.secondary">
                  {candidat.sexe === 'F' ? 'Candidate' : 'Candidat'}
                </Typography>
              </Box>
              
              <Chip 
                label={candidat.ethnie}
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="action" />
                  <Typography variant="body2">
                    {candidat.universite}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupsIcon color="action" />
                  <Typography variant="body2">
                    {candidat.entite}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Filière: {candidat.filiere}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Attention:</strong> Vous ne pouvez voter qu'une seule fois par catégorie.
                Cette action est définitive.
              </Typography>
            </Alert>
            
            <Typography variant="body2" color="text.secondary" align="center">
              Édition: {edition.nom} {edition.annee}
            </Typography>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        {!success && (
          <>
            <Button 
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleVote}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <VoteIcon />}
              sx={{
                background: 'linear-gradient(45deg, #d4af37 30%, #ff9f43 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c19b30 30%, #e68a2e 90%)',
                },
              }}
            >
              {loading ? 'En cours...' : 'Confirmer mon vote'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VoteModal;