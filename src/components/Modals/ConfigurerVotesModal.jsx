// src/components/Modals/ConfigurerVotesModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Grid,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const ConfigurerVotesModal = ({ open, onClose, edition, onSuccess, api }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    date_debut_votes: null,
    date_fin_votes: null,
  });

  // Initialiser les dates si l'édition a déjà des dates configurées
  useEffect(() => {
    if (edition && open) {
      const dateDebut = edition.date_debut_votes ? new Date(edition.date_debut_votes) : null;
      const dateFin = edition.date_fin_votes ? new Date(edition.date_fin_votes) : null;
      
      setFormData({
        date_debut_votes: dateDebut,
        date_fin_votes: dateFin,
      });
      setErrors({});
    }
  }, [edition, open]);

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();

    if (!formData.date_debut_votes) {
      newErrors.date_debut_votes = 'La date de début est requise';
    } else if (new Date(formData.date_debut_votes) < now) {
      newErrors.date_debut_votes = 'La date de début doit être dans le futur';
    }

    if (!formData.date_fin_votes) {
      newErrors.date_fin_votes = 'La date de fin est requise';
    } else if (formData.date_debut_votes && new Date(formData.date_fin_votes) <= new Date(formData.date_debut_votes)) {
      newErrors.date_fin_votes = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date_debut_votes: formData.date_debut_votes.toISOString(),
        date_fin_votes: formData.date_fin_votes.toISOString(),
      };

      const response = await api.post(`/promoteur/editions/${edition.id}/configurer-votes`, payload);
      
      toast.success('Dates de vote configurées avec succès');
      onSuccess(response.data.edition);
      onClose();
      
    } catch (error) {
      console.error('Erreur configuration votes:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la configuration des votes');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDate = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1); // Demain par défaut
    now.setHours(9, 0, 0, 0); // 9h du matin
    return now;
  };

  const getDefaultEndDate = () => {
    const startDate = formData.date_debut_votes || getDefaultDate();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // +7 jours par défaut
    endDate.setHours(18, 0, 0, 0); // 18h
    return endDate;
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
        color: 'white',
        textAlign: 'center',
        py: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {edition?.date_debut_votes ? 'Modifier les dates de vote' : 'Configurer les dates de vote'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          {edition?.nom || 'Édition'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Box sx={{ mt: 3 }}>
            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
            
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Définissez la période pendant laquelle les votes seront ouverts pour cette édition.
            </Alert>

            <Grid container spacing={3}>
              {/* Date de début */}
              <Grid item xs={12}>
                <DateTimePicker
                  label="Date et heure de début *"
                  value={formData.date_debut_votes || getDefaultDate()}
                  onChange={(date) => handleDateChange('date_debut_votes', date)}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date_debut_votes,
                      helperText: errors.date_debut_votes,
                      sx: { 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&.Mui-error': {
                            '& fieldset': { borderColor: '#d32f2f' }
                          }
                        }
                      }
                    }
                  }}
                />
              </Grid>

              {/* Date de fin */}
              <Grid item xs={12}>
                <DateTimePicker
                  label="Date et heure de fin *"
                  value={formData.date_fin_votes || getDefaultEndDate()}
                  onChange={(date) => handleDateChange('date_fin_votes', date)}
                  minDate={formData.date_debut_votes || new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date_fin_votes,
                      helperText: errors.date_fin_votes,
                      sx: { 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&.Mui-error': {
                            '& fieldset': { borderColor: '#d32f2f' }
                          }
                        }
                      }
                    }
                  }}
                />
              </Grid>

              {/* Information sur la période */}
              <Grid item xs={12}>
                {formData.date_debut_votes && formData.date_fin_votes && (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      borderRadius: 2,
                      animation: 'fadeIn 0.5s ease-in'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Période définie:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Début:</strong> {new Date(formData.date_debut_votes).toLocaleString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fin:</strong> {new Date(formData.date_fin_votes).toLocaleString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#666',
            borderRadius: 2,
            px: 3,
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
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 2,
            px: 4,
            py: 1,
            transition: 'all 0.3s',
            '&:hover': {
              background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
            },
            '&.Mui-disabled': {
              background: '#e5e7eb',
              color: '#999'
            }
          }}
        >
          {loading ? 'Configuration...' : edition?.date_debut_votes ? 'Modifier' : 'Configurer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigurerVotesModal;