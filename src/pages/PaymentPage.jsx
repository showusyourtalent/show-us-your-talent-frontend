// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Fade,
  Zoom,
  Slide,
  useTheme,
  useMediaQuery,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
  PersonAdd as PersonAddIcon,
  Timer as TimerIcon,
  CreditCard as CardIcon,
  PhoneAndroid as MobileIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from '../api/axios';

// Définir PALETTE localement
const PALETTE = {
  OR: '#D4AF37',
  OR_LIGHT: '#FFD700',
  OR_DARK: '#B8860B',
  RED_DARK: '#8B0000',
  RED_DARK_LIGHT: '#B22222',
  BROWN: '#8B4513',
  BROWN_LIGHT: '#A0522D',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_DARK: '#333333',
};

const steps = ['Informations', 'Paiement', 'Confirmation'];
const VOTE_PRICE = 100;

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { candidatId } = useParams();

  const { candidat, edition, category } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [votesCount, setVotesCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [fedapayWindow, setFedapayWindow] = useState(null);
  const [checkInterval, setCheckInterval] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  
  const [userData, setUserData] = useState({
    email: '',
    phone: '',
    firstname: '',
    lastname: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const voteOptions = [
    { value: 1, label: '1 vote - 100 XOF' },
    { value: 2, label: '2 vote - 200 XOF' },
    { value: 3, label: '3 vote - 300 XOF' },
    { value: 4, label: '4 vote - 400 XOF' },
    { value: 5, label: '5 votes - 500 XOF' },
    { value: 10, label: '10 votes - 1,000 XOF' },
    { value: 15, label: '15 vote - 1,500 XOF' },
    { value: 20, label: '20 votes - 2,000 XOF' },
    { value: 25, label: '25 votes - 2,500 XOF' },
    { value: 50, label: '50 votes - 5,000 XOF' },
    { value: 100, label: '100 votes - 10,000 XOF' },
    { value: 200, label: '200 votes - 20,000 XOF' },
    { value: 500, label: '500 votes - 50,000 XOF' },
    { value: 1000, label: '1000 votes - 100,000 XOF' }
  ];

  // Écouter les messages de la fenêtre FedaPay
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PAYMENT_RESULT') {
        console.log('Message reçu de FedaPay:', event.data);
        
        clearPolling();
        
        if (event.data.result === 'success') {
          handlePaymentSuccess(event.data.paymentData?.token);
        } else {
          setError(`Paiement ${event.data.result === 'cancelled' ? 'annulé' : 'échoué'}`);
          setPaymentStatus(event.data.result);
          setPollingActive(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Gérer la fermeture de la fenêtre FedaPay
  useEffect(() => {
    if (!fedapayWindow) return;

    const checkWindowClosed = setInterval(() => {
      if (fedapayWindow && fedapayWindow.closed) {
        console.log('Fenêtre FedaPay fermée');
        clearInterval(checkWindowClosed);
        setFedapayWindow(null);
        
        // Vérifier le statut si on n'a pas encore reçu de message
        if (pollingActive && paymentData?.payment_token) {
          checkPaymentStatusAfterClose(paymentData.payment_token);
        }
      }
    }, 1000);

    return () => clearInterval(checkWindowClosed);
  }, [fedapayWindow, pollingActive, paymentData]);

  // Timer pour l'expiration du paiement
  useEffect(() => {
    if (!paymentData || activeStep !== 1 || !pollingActive) return;

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
  }, [paymentData, activeStep, pollingActive]);

  const clearPolling = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setPollingActive(false);
  };

  const handlePaymentTimeout = () => {
    clearPolling();
    setError('Le paiement a expiré. Veuillez recommencer.');
    setPaymentStatus('expired');
    setPollingActive(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotal = () => VOTE_PRICE * votesCount;

  const validateForm = () => {
    const errors = {};
    
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email invalide';
    }
    
    if (!userData.phone || !/^(229|0)[0-9]{8,9}$/.test(userData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Numéro de téléphone invalide';
    }
    
    if (!userData.firstname || userData.firstname.length < 2) {
      errors.firstname = 'Prénom requis';
    }
    
    if (!userData.lastname || userData.lastname.length < 2) {
      errors.lastname = 'Nom requis';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
        setTimeLeft(1800); // Réinitialiser le timer
      } else {
        setError(response.data.message || 'Erreur lors de l\'initialisation');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const openFedapayWindow = (url) => {
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no`;
    
    const newWindow = window.open(url, 'fedapay_payment', features);

    if (newWindow) {
        setFedapayWindow(newWindow);
        setShowPaymentModal(true);
        
        // Vérifier périodiquement si la fenêtre est bloquée
        const checkPopupBlocked = setTimeout(() => {
            if (newWindow.closed || newWindow.location.href === 'about:blank') {
                console.log('Popup bloqué ou fermé');
                setError('La fenêtre de paiement a été bloquée. Veuillez autoriser les popups.');
                setShowPaymentModal(false);
                setLoading(false);
            }
        }, 1000);
        
        return newWindow;
    } else {
        setError('Veuillez autoriser les popups pour procéder au paiement.');
        setLoading(false);
        return null;
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
        // Ouvrir FedaPay dans une nouvelle fenêtre
        const windowRef = openFedapayWindow(response.data.data.redirect_url);
        
        if (windowRef) {
          // Commencer à vérifier le statut
          startPaymentStatusCheck(paymentData.payment_token);
        } else {
          setError('Veuillez autoriser les popups pour procéder au paiement');
          setLoading(false);
        }
      } else {
        setError(response.data.message || 'Erreur lors du traitement du paiement');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  const startPaymentStatusCheck = (paymentToken) => {
    setPollingActive(true);
    
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/payments/${paymentToken}/status`);
        
        if (response.data.success) {
          const { status, is_successful } = response.data.data;
          setPaymentStatus(status);

          if (is_successful) {
            clearInterval(interval);
            handlePaymentSuccess(paymentToken);
          } else if (['failed', 'cancelled', 'expired'].includes(status)) {
            clearInterval(interval);
            setError(`Paiement ${status}. Veuillez réessayer.`);
            setPollingActive(false);
          }
        }
      } catch (err) {
        console.error('Erreur vérification:', err);
      }
    }, 3000);

    setCheckInterval(interval);

    // Arrêter le polling après 15 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingActive(false);
        if (paymentStatus === 'processing') {
          setError('Délai d\'attente dépassé. Veuillez vérifier le statut de votre paiement.');
        }
      }
    }, 900000); // 15 minutes
  };

  const checkPaymentStatusAfterClose = async (paymentToken) => {
    try {
      const response = await axios.get(`/payments/${paymentToken}/status`);
      
      if (response.data.success) {
        const { status, is_successful } = response.data.data;
        setPaymentStatus(status);
        
        if (is_successful) {
          handlePaymentSuccess(paymentToken);
        } else if (status === 'cancelled' || status === 'failed' || status === 'expired') {
          setError(`Le paiement a été ${status === 'cancelled' ? 'annulé' : 'échoué'}.`);
          setPollingActive(false);
        }
      }
    } catch (err) {
      console.error('Erreur vérification statut:', err);
    }
  };

  const handlePaymentSuccess = async (paymentToken) => {
    try {
      const response = await axios.get(`/payments/${paymentToken}/success`);
      
      if (response.data.success) {
        setSuccess(true);
        setActiveStep(2);
        clearPolling();
        
        setTimeout(() => {
          navigate('/payment/success', { 
            state: { 
              paymentData: response.data.data,
              userData,
              votesCount,
              candidat,
              edition,
              category
            } 
          });
        }, 3000);
      }
    } catch (err) {
      setError('Erreur lors de la confirmation');
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(-1);
    } else {
      setActiveStep(prev => prev - 1);
      clearPolling();
      if (fedapayWindow) {
        fedapayWindow.close();
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateForm()) {
        initiatePayment();
      }
    } else if (activeStep === 1) {
      processPayment();
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
                        src={candidat?.photo_url}
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
                        </Select>
                      </FormControl>
                      
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
                
                {pollingActive && (
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
                )}
              </Box>

              {!pollingActive ? (
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
                    
                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                      <RadioGroup
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        sx={{ flexDirection: 'row', gap: 2 }}
                      >
                        <FormControlLabel
                          value="mobile_money"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MobileIcon />
                              <Box>
                                <Typography>Mobile Money</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  MTN & Moov Money
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{
                            border: paymentMethod === 'mobile_money' ? `2px solid ${PALETTE.OR}` : '1px solid #ddd',
                            borderRadius: 2,
                            padding: 2,
                            minWidth: 200
                          }}
                        />
                        
                        <FormControlLabel
                          value="card"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CardIcon />
                              <Box>
                                <Typography>Carte bancaire</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Visa, Mastercard
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{
                            border: paymentMethod === 'card' ? `2px solid ${PALETTE.OR}` : '1px solid #ddd',
                            borderRadius: 2,
                            padding: 2,
                            minWidth: 200
                          }}
                        />
                      </RadioGroup>
                    </FormControl>

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
                        <strong>Important:</strong> Une nouvelle fenêtre s'ouvrira. Ne fermez pas cette page pendant le paiement.
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
                    {paymentStatus === 'processing' ? 'Paiement en cours...' : 'Vérification du paiement...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {paymentStatus === 'processing' 
                      ? 'Veuillez compléter le paiement dans la fenêtre ouverte.'
                      : 'Veuillez patienter pendant que nous vérifions le statut de votre paiement.'}
                  </Typography>
                  
                  <LinearProgress 
                    sx={{ 
                      mt: 3,
                      height: 8,
                      borderRadius: 4,
                      background: `${PALETTE.OR}20`,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                        borderRadius: 4
                      }
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Statut: {paymentStatus}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 3 }}
                    onClick={() => {
                      clearPolling();
                      setPaymentStatus('pending');
                    }}
                  >
                    Annuler la vérification
                  </Button>
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
                mb: 3
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
                  Redirection vers la page de confirmation...
                </Typography>
              </Box>
            </Box>
          </Slide>
        );

      default:
        return null;
    }
  };

  if (!candidat) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Données du candidat manquantes. Veuillez sélectionner un candidat pour voter.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/candidats')}
          sx={{ mt: 2 }}
        >
          Retour aux candidats
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ 
        py: 4,
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${PALETTE.WHITE} 0%, ${PALETTE.OR}05 100%)`
      }}>
        {/* En-tête avec stepper */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ 
              mb: 2,
              color: PALETTE.BROWN,
              '&:hover': {
                background: `${PALETTE.BROWN}10`
              }
            }}
          >
            Retour
          </Button>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom color={PALETTE.RED_DARK}>
            {activeStep === 0 ? `Voter pour ${formatNomComplet(candidat)}` : 
             activeStep === 1 ? 'Paiement sécurisé' : 
             'Confirmation du vote'}
          </Typography>
          
          <Typography variant="body1" color={PALETTE.BROWN} gutterBottom>
            Édition {edition?.nom} {edition?.annee} • {category?.nom}
          </Typography>
          
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              mt: 3,
              '& .MuiStepLabel-label': {
                color: PALETTE.RED_DARK,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 'medium'
              },
              '& .MuiStepIcon-root': {
                color: `${PALETTE.OR}40`,
                '&.Mui-active': {
                  color: PALETTE.OR
                },
                '&.Mui-completed': {
                  color: PALETTE.OR
                }
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Contenu principal */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            border: `1px solid ${PALETTE.OR}20`,
            background: PALETTE.WHITE,
            mb: 4
          }}
        >
          {renderStepContent(activeStep)}
        </Paper>

        {/* Actions */}
        {!success && activeStep !== 2 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}>
            <Button
              onClick={handleBack}
              disabled={loading || pollingActive}
              variant="outlined"
              sx={{
                color: PALETTE.BROWN,
                borderColor: PALETTE.BROWN,
                fontWeight: 'medium',
                px: 4,
                '&:hover': {
                  background: `${PALETTE.BROWN}10`,
                  borderColor: PALETTE.BROWN
                },
                '&.Mui-disabled': {
                  color: `${PALETTE.BROWN}40`,
                  borderColor: `${PALETTE.BROWN}40`
                }
              }}
            >
              {activeStep === 0 ? 'Annuler' : 'Retour'}
            </Button>
            
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={loading || (activeStep === 1 && pollingActive)}
              sx={{
                background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
                color: PALETTE.WHITE,
                fontWeight: 'bold',
                px: 6,
                py: 1.5,
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
          </Box>
        )}

        {/* Messages d'erreur */}
        {error && !loading && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              borderRadius: 2
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </Container>

      {/* Modal pour informer de l'ouverture de FedaPay */}
      <Dialog 
        open={showPaymentModal && fedapayWindow !== null} 
        onClose={() => setShowPaymentModal(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Paiement en cours</Typography>
            <IconButton onClick={() => setShowPaymentModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <PaymentIcon sx={{ fontSize: 60, color: PALETTE.OR, mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Une fenêtre FedaPay s'est ouverte pour finaliser votre paiement.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Si la fenêtre ne s'est pas ouverte, vérifiez vos bloqueurs de popups.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (fedapayWindow) {
                fedapayWindow.focus();
              }
              setShowPaymentModal(false);
            }}
          >
            J'ai compris
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentPage;