import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  Chip,
  TextField,
  Grid,
  Divider,
  Fade,
  Zoom,
  Slide,
  useTheme,
  useMediaQuery,
  Badge,
  LinearProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Select
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  PhoneAndroid as MobileIcon,
  CreditCard as CardIcon,
  Timer as TimerIcon,
  HowToVote as VoteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Numbers as NumbersIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import { PALETTE } from './CandidatsPage';

const steps = ['Informations', 'Paiement', 'Confirmation'];
const VOTE_PRICE = 100; // Prix par vote en XOF

const PaymentModal = ({ 
  open, 
  onClose, 
  candidat, 
  edition, 
  category,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes en secondes
  const [votesCount, setVotesCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  
  // Données utilisateur
  const [userData, setUserData] = useState({
    email: '',
    phone: '',
    firstname: '',
    lastname: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Options de votes
  const voteOptions = [
    { value: 1, label: '1 vote - 100 XOF' },
    { value: 5, label: '5 votes - 500 XOF' },
    { value: 10, label: '10 votes - 1,000 XOF' },
    { value: 20, label: '20 votes - 2,000 XOF' },
    { value: 50, label: '50 votes - 5,000 XOF' },
    { value: 100, label: '100 votes - 10,000 XOF' }
  ];

  // Timer de décompte
  useEffect(() => {
    if (!open || !paymentData || activeStep !== 1) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handlePaymentTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, paymentData, activeStep]);

  const handleClose = () => {
    if (loading) return;
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setActiveStep(0);
    setLoading(false);
    setError('');
    setSuccess(false);
    setPaymentData(null);
    setPaymentStatus('pending');
    setTimeLeft(1800);
    setVotesCount(1);
    setUserData({
      email: '',
      phone: '',
      firstname: '',
      lastname: ''
    });
    setFormErrors({});
  };

  const handlePaymentTimeout = () => {
    setError('Le paiement a expiré. Veuillez recommencer.');
    setPaymentStatus('expired');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotal = () => {
    return VOTE_PRICE * votesCount;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email invalide';
    }
    
    if (!userData.phone || !/^(229|0)[0-9]{8,9}$/.test(userData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Numéro de téléphone invalide (format béninois)';
    }
    
    if (!userData.firstname || userData.firstname.length < 2) {
      errors.firstname = 'Prénom requis';
    }
    
    if (!userData.lastname || userData.lastname.length < 2) {
      errors.lastname = 'Nom requis';
    }
    
    if (votesCount < 1 || votesCount > 100) {
      errors.votesCount = 'Nombre de votes invalide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateForm()) {
        initiatePayment();
      }
    } else if (activeStep === 1) {
      processPayment();
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/payments/initiate', {
        candidat_id: candidat.id,
        edition_id: edition.id,
        category_id: category?.id,
        votes_count: votesCount,
        ...userData
      });

      if (response.data.success) {
        setPaymentData(response.data.data);
        setActiveStep(1);
      } else {
        setError(response.data.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || err.response?.data?.errors || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/payments/process', {
        payment_token: paymentData.payment_token,
        payment_method: paymentMethod
      });

      if (response.data.success) {
        // Rediriger vers FedaPay dans une nouvelle fenêtre
        const fedapayWindow = window.open(
          response.data.data.redirect_url,
          'fedapay_payment',
          'width=500,height=700,scrollbars=yes'
        );
        
        if (fedapayWindow) {
          // Commencer à vérifier le statut
          startPaymentStatusCheck(response.data.data.payment_token);
        } else {
          setError('Veuillez autoriser les popups pour procéder au paiement');
        }
      } else {
        setError(response.data.message || 'Erreur lors du traitement du paiement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusCheck = async (paymentToken) => {
  const checkInterval = setInterval(async () => {
    try {
      const response = await axios.get(`/payments/${paymentToken}/status`);
      
      if (response.data.success) {
        const { status, is_successful } = response.data.data;
        setPaymentStatus(status);

        if (is_successful) {
          clearInterval(checkInterval);
          handlePaymentSuccess(paymentToken);
        } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
          clearInterval(checkInterval);
          setError(`Le paiement a échoué (${status}). Veuillez réessayer.`);
          onPaymentError?.({ message: `Paiement ${status}` });
        }
      }
    } catch (err) {
      console.error('Erreur vérification statut:', err);
    }
  }, 3000); // Vérifier toutes les 3 secondes

  // Arrêter après 15 minutes
  setTimeout(() => {
    clearInterval(checkInterval);
    if (paymentStatus === 'pending' || paymentStatus === 'processing') {
      setError('Le paiement est en attente depuis trop longtemps. Veuillez vérifier manuellement.');
    }
  }, 900000);
};

  const handlePaymentSuccess = async (paymentToken) => {
    try {
      const response = await axios.get(`/payments/${paymentToken}/success`);
      
      if (response.data.success) {
        setSuccess(true);
        setActiveStep(2);
        onPaymentSuccess?.(response.data.data);
        
        // Fermer automatiquement après 5 secondes
        setTimeout(() => {
          handleClose();
        }, 5000);
      }
    } catch (err) {
      console.error('Erreur succès paiement:', err);
      setError('Erreur lors de la confirmation du paiement');
    }
  };

  const formatNomComplet = (candidat) => {
    return `${candidat?.prenoms || ''} ${candidat?.nom || ''}`.trim();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Zoom in={true}>
            <Box>
              <Typography variant="h6" color={PALETTE.RED_DARK} gutterBottom fontWeight="bold">
                Informations pour le vote
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mb: 3, 
                    border: `1px solid ${PALETTE.OR}30`,
                    borderRadius: 2,
                    background: `${PALETTE.OR}08`,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar 
                        src={candidat.photo_url}
                        sx={{ 
                          width: 80, 
                          height: 80,
                          border: `3px solid ${PALETTE.OR}`
                        }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color={PALETTE.RED_DARK}>
                          {formatNomComplet(candidat)}
                        </Typography>
                        <Chip 
                          label={category?.nom || 'Catégorie'}
                          size="small"
                          sx={{ 
                            background: PALETTE.BROWN,
                            color: PALETTE.WHITE,
                            mt: 1
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color={PALETTE.BROWN} gutterBottom>
                        Détails du vote
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="votes-count-label">Nombre de votes</InputLabel>
                        <Select
                          labelId="votes-count-label"
                          value={votesCount}
                          label="Nombre de votes"
                          onChange={(e) => setVotesCount(e.target.value)}
                          error={!!formErrors.votesCount}
                        >
                          {voteOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                          <MenuItem value="custom">
                            <em>Personnalisé...</em>
                          </MenuItem>
                        </Select>
                        {formErrors.votesCount && (
                          <Typography variant="caption" color="error">
                            {formErrors.votesCount}
                          </Typography>
                        )}
                      </FormControl>
                      
                      {votesCount === 'custom' && (
                        <TextField
                          fullWidth
                          type="number"
                          label="Nombre de votes personnalisé"
                          value={votesCount === 'custom' ? '' : votesCount}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setVotesCount(Math.max(1, Math.min(100, value)));
                          }}
                          inputProps={{ min: 1, max: 100 }}
                          sx={{ mb: 2 }}
                        />
                      )}
                      
                      <Box sx={{ 
                        p: 2, 
                        background: `${PALETTE.OR}10`, 
                        borderRadius: 1,
                        border: `1px solid ${PALETTE.OR}30`
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Prix par vote:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {VOTE_PRICE.toLocaleString()} XOF
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Nombre de votes:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {votesCount}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1" fontWeight="bold">Total à payer:</Typography>
                          <Typography variant="h6" fontWeight="bold" color={PALETTE.RED_DARK}>
                            {calculateTotal().toLocaleString()} XOF
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    border: `1px solid ${PALETTE.OR}30`,
                    borderRadius: 2,
                    background: `${PALETTE.OR}08`,
                    height: '100%'
                  }}>
                    <Typography variant="subtitle2" color={PALETTE.BROWN} gutterBottom>
                      Vos informations
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Ces informations seront utilisées pour la confirmation du paiement
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          value={userData.firstname}
                          onChange={(e) => setUserData({...userData, firstname: e.target.value})}
                          error={!!formErrors.firstname}
                          helperText={formErrors.firstname}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonAddIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          value={userData.lastname}
                          onChange={(e) => setUserData({...userData, lastname: e.target.value})}
                          error={!!formErrors.lastname}
                          helperText={formErrors.lastname}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                          error={!!formErrors.email}
                          helperText={formErrors.email || "Nous enverrons la confirmation à cette adresse"}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Téléphone"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                          error={!!formErrors.phone}
                          helperText={formErrors.phone || "Format: 0XXXXXXXXX ou 229XXXXXXXX"}
                          placeholder="0XXXXXXXXX"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: 3,
                        background: `${PALETTE.BROWN}08`,
                        border: `1px solid ${PALETTE.BROWN}30`
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Important:</strong> Assurez-vous que vos informations sont correctes avant de continuer.
                      </Typography>
                    </Alert>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Zoom>
        );

      case 1:
        return (
          <Fade in={true}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                <Typography variant="h6" color={PALETTE.RED_DARK} fontWeight="bold">
                  Procéder au paiement
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimerIcon sx={{ color: timeLeft < 300 ? PALETTE.RED_DARK : PALETTE.BROWN }} />
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    sx={{ 
                      color: timeLeft < 300 ? PALETTE.RED_DARK : PALETTE.BROWN,
                      fontFamily: 'monospace'
                    }}
                  >
                    {formatTime(timeLeft)}
                  </Typography>
                </Box>
              </Box>

              {paymentStatus === 'pending' ? (
                <>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mb: 3, 
                    border: `1px solid ${PALETTE.OR}30`,
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle2" color={PALETTE.BROWN} gutterBottom>
                      Choisissez votre méthode de paiement
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={paymentMethod === 'mobile_money' ? 3 : 0}
                          onClick={() => setPaymentMethod('mobile_money')}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: `2px solid ${paymentMethod === 'mobile_money' ? PALETTE.OR : 'transparent'}`,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: PALETTE.OR,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${PALETTE.OR}20`
                            }
                          }}
                        >
                          <MobileIcon sx={{ 
                            fontSize: 48, 
                            color: paymentMethod === 'mobile_money' ? PALETTE.OR : PALETTE.BROWN,
                            mb: 2 
                          }} />
                          <Typography variant="body1" fontWeight="medium">
                            Mobile Money
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            MTN & Moov Money
                          </Typography>
                          <Chip 
                            label="Recommandé"
                            size="small"
                            sx={{ 
                              mt: 1,
                              background: PALETTE.OR,
                              color: PALETTE.WHITE,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={paymentMethod === 'card' ? 3 : 0}
                          onClick={() => setPaymentMethod('card')}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: `2px solid ${paymentMethod === 'card' ? PALETTE.OR : 'transparent'}`,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: PALETTE.OR,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${PALETTE.OR}20`
                            }
                          }}
                        >
                          <CardIcon sx={{ 
                            fontSize: 48, 
                            color: paymentMethod === 'card' ? PALETTE.OR : PALETTE.BROWN,
                            mb: 2 
                          }} />
                          <Typography variant="body1" fontWeight="medium">
                            Carte Bancaire
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visa & Mastercard
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box sx={{ 
                      p: 3, 
                      background: `${PALETTE.RED_DARK}08`,
                      borderRadius: 2,
                      border: `1px solid ${PALETTE.RED_DARK}30`,
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" color={PALETTE.RED_DARK} gutterBottom fontWeight="bold">
                        Récapitulatif de la commande
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">Candidat:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatNomComplet(candidat)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2">Nombre de votes:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {votesCount}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2">Montant total:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="h6" fontWeight="bold" color={PALETTE.RED_DARK}>
                            {calculateTotal().toLocaleString()} XOF
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Alert 
                      severity="info" 
                      sx={{ 
                        mb: 2,
                        background: `${PALETTE.OR}10`,
                        border: `1px solid ${PALETTE.OR}30`
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Information:</strong> Vous serez redirigé vers la plateforme sécurisée de FedaPay pour finaliser le paiement.
                      </Typography>
                    </Alert>
                    
                    <Alert 
                      severity="warning"
                      sx={{ 
                        background: `${PALETTE.RED_DARK}10`,
                        border: `1px solid ${PALETTE.RED_DARK}30`
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Important:</strong> Ne fermez pas cette fenêtre pendant le paiement. Vous serez redirigé automatiquement après paiement.
                      </Typography>
                    </Alert>
                  </Paper>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ mb: 2 }}
                      action={
                        <Button 
                          color="inherit" 
                          size="small"
                          onClick={() => setError('')}
                        >
                          Fermer
                        </Button>
                      }
                    >
                      <Typography variant="body2">
                        {error}
                      </Typography>
                    </Alert>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress 
                    size={60}
                    sx={{ 
                      color: PALETTE.OR,
                      mb: 3
                    }}
                  />
                  <Typography variant="h6" gutterBottom color={PALETTE.RED_DARK}>
                    Vérification du paiement en cours...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Veuillez patienter pendant que nous vérifions le statut de votre paiement.
                    Cette opération peut prendre quelques instants.
                  </Typography>
                  
                  <LinearProgress 
                    sx={{ 
                      mt: 3,
                      height: 8,
                      borderRadius: 4,
                      background: `${PALETTE.OR}20`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                        borderRadius: 4,
                        animation: 'pulseGold 2s infinite'
                      }
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Statut: {paymentStatus}
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Slide direction="up" in={true}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                animation: 'pulseGold 2s infinite'
              }}>
                <CheckCircleIcon sx={{ fontSize: 60, color: PALETTE.WHITE }} />
              </Box>
              
              <Typography variant="h4" fontWeight="bold" gutterBottom color={PALETTE.RED_DARK}>
                Paiement Réussi !
              </Typography>
              
              <Typography variant="h6" color={PALETTE.BROWN} gutterBottom>
                Merci pour votre soutien !
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                Vous avez voté <strong>{votesCount} fois</strong> pour <strong>{formatNomComplet(candidat)}</strong>.
                Votre vote a été enregistré avec succès.
              </Typography>
              
              <Paper elevation={0} sx={{ 
                p: 3, 
                mt: 3,
                mx: 'auto',
                maxWidth: 400,
                border: `1px solid ${PALETTE.OR}30`,
                borderRadius: 2,
                background: `${PALETTE.OR}08`
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Référence
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
                      {paymentData?.payment_token}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Montant
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color={PALETTE.RED_DARK}>
                      {calculateTotal().toLocaleString()} XOF
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Méthode
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip 
                      label="Confirmé"
                      size="small"
                      sx={{ 
                        background: '#4CAF50',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Un email de confirmation a été envoyé à <strong>{userData.email}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Cette fenêtre se fermera automatiquement dans 5 secondes...
                </Typography>
              </Box>
            </Box>
          </Slide>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0:
        return <PersonAddIcon />;
      case 1:
        return <PaymentIcon />;
      case 2:
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${PALETTE.WHITE} 0%, ${PALETTE.OR}05 100%)`,
          minHeight: isMobile ? '90vh' : 'auto',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${PALETTE.BROWN} 0%, ${PALETTE.RED_DARK} 100%)`,
        color: PALETTE.WHITE,
        borderBottom: `1px solid ${PALETTE.OR}40`,
        position: 'relative',
        p: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {activeStep === 0 ? 'Voter pour ' + formatNomComplet(candidat) : 
               activeStep === 1 ? 'Paiement sécurisé' : 
               'Confirmation du vote'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              Édition {edition?.nom} {edition?.annee} • {category?.nom}
            </Typography>
          </Box>
          
          <IconButton 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: PALETTE.WHITE,
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { background: 'rgba(255,255,255,0.2)' },
              '&.Mui-disabled': { opacity: 0.5 }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {!success && (
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              mt: 2,
              '& .MuiStepLabel-label': {
                color: `${PALETTE.WHITE} !important`,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 'medium'
              },
              '& .MuiStepIcon-root': {
                color: `${PALETTE.OR}40`,
                '&.Mui-active': {
                  color: PALETTE.OR_LIGHT
                },
                '&.Mui-completed': {
                  color: PALETTE.OR_LIGHT
                }
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel StepIconComponent={() => (
                  <Badge
                    badgeContent={getStepIcon(index)}
                    color="default"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: activeStep === index ? PALETTE.OR_LIGHT : 
                                   activeStep > index ? PALETTE.OR : PALETTE.WHITE,
                        color: activeStep >= index ? PALETTE.BROWN : PALETTE.GRAY_DARK,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: `2px solid ${PALETTE.WHITE}`
                      }
                    }}
                  />
                )}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </DialogTitle>

      <DialogContent sx={{ 
        p: { xs: 2, sm: 3 },
        overflow: 'auto'
      }}>
        {renderStepContent(activeStep)}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${PALETTE.OR}20`,
          background: `${PALETTE.OR}05`
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            sx={{
              color: PALETTE.BROWN,
              fontWeight: 'medium',
              '&:hover': {
                background: `${PALETTE.BROWN}10`
              },
              '&.Mui-disabled': {
                color: `${PALETTE.BROWN}40`
              }
            }}
          >
            Retour
          </Button>
          
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={loading}
            sx={{
              background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
              color: PALETTE.WHITE,
              fontWeight: 'bold',
              px: 4,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                background: `linear-gradient(135deg, ${PALETTE.OR_DARK} 0%, ${PALETTE.RED_DARK_LIGHT} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${PALETTE.RED_DARK}30`
              },
              '&.Mui-disabled': {
                background: '#ddd',
                color: '#888',
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Terminer'
            ) : (
              activeStep === 0 ? 'Continuer vers le paiement' : 'Procéder au paiement'
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentModal;  