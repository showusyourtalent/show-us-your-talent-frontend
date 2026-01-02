// src/pages/PaymentSuccessPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  Fade,
  Avatar,
  Alert 
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { PALETTE } from '../components/PALETTE';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentData, userData, votesCount, candidat } = location.state || {};

  if (!paymentData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Données de paiement non disponibles
        </Typography>
        <Button onClick={() => navigate('/candidats')}>
          Retour aux candidats
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in={true}>
        <Box sx={{ textAlign: 'center' }}>
          {/* Icône de succès */}
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: PALETTE.WHITE }} />
          </Box>

          <Typography variant="h3" fontWeight="bold" gutterBottom color={PALETTE.RED_DARK}>
            Paiement Réussi !
          </Typography>

          <Typography variant="h6" color={PALETTE.BROWN} gutterBottom>
            Merci pour votre soutien à {candidat?.prenoms} {candidat?.nom}
          </Typography>

          {/* Détails du paiement */}
          <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Référence
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentData.payment?.reference}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Montant
                </Typography>
                <Typography variant="h5" color={PALETTE.RED_DARK} fontWeight="bold">
                  {paymentData.payment?.amount?.toLocaleString()} XOF
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre de votes
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {votesCount}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Candidat
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Avatar src={candidat?.photo_url} sx={{ width: 40, height: 40 }} />
                  <Typography variant="body1" fontWeight="bold">
                    {candidat?.prenoms} {candidat?.nom}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info" icon={<EmailIcon />}>
                  Un reçu a été envoyé à {userData?.email}
                </Alert>
              </Grid>
            </Grid>
          </Paper>

          {/* Actions */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/candidats')}
              sx={{ px: 4 }}
            >
              Retour aux candidats
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => {
                // Partager le succès
              }}
            >
              Partager
            </Button>
          </Box>

          {/* Informations supplémentaires */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Votre vote a été enregistré avec succès. Vous recevrez un email de confirmation dans quelques minutes.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Pour toute question, contactez support@votresite.com
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default PaymentSuccessPage;