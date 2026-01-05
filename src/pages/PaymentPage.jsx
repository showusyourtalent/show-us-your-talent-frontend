// src/pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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

const VOTE_PRICE = 100;

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidatId } = useParams();

  const { candidat, edition, category } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(1800);
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
        setTimeLeft(1800);
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
    const width = Math.min(500, window.screen.width - 40);
    const height = Math.min(700, window.screen.height - 100);
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no`;
    
    const newWindow = window.open(url, 'fedapay_payment', features);

    if (newWindow) {
        setFedapayWindow(newWindow);
        setShowPaymentModal(true);
        
        setTimeout(() => {
            if (newWindow.closed || newWindow.location.href === 'about:blank') {
                setError('Veuillez autoriser les popups pour procéder au paiement.');
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
        const windowRef = openFedapayWindow(response.data.data.redirect_url);
        
        if (windowRef) {
          startPaymentStatusCheck(paymentData.payment_token);
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

    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingActive(false);
        if (paymentStatus === 'processing') {
          setError('Délai d\'attente dépassé. Veuillez vérifier le statut de votre paiement.');
        }
      }
    }, 900000);
  };

  const checkPaymentStatusAfterClose = async (paymentToken) => {
    try {
      const response = await axios.get(`/payments/${paymentToken}/status`);
      
      if (response.data.success) {
        const { status, is_successful } = response.data.data;
        setPaymentStatus(status);
        
        if (is_successful) {
          handlePaymentSuccess(paymentToken);
        } else if (['cancelled', 'failed', 'expired'].includes(status)) {
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
      clearPolling();
      if (fedapayWindow) {
        fedapayWindow.close();
      }
      setActiveStep(prev => prev - 1);
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

  // Styles inline pour éviter les problèmes CSS
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${PALETTE.WHITE} 0%, ${PALETTE.OR}05 100%)`
    },
    paper: {
      background: PALETTE.WHITE,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      border: `1px solid ${PALETTE.OR}20`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    buttonPrimary: {
      background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
      color: PALETTE.WHITE,
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    buttonSecondary: {
      background: PALETTE.WHITE,
      color: PALETTE.BROWN,
      border: `1px solid ${PALETTE.BROWN}`,
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: `1px solid ${formErrors.email ? '#f44336' : '#ddd'}`,
      borderRadius: '6px',
      fontSize: '16px',
      marginBottom: '8px'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '16px',
      marginBottom: '16px',
      background: PALETTE.WHITE
    },
    alertError: {
      background: '#ffebee',
      color: '#c62828',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid #ffcdd2'
    },
    alertSuccess: {
      background: '#e8f5e9',
      color: '#2e7d32',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid #c8e6c9'
    },
    alertInfo: {
      background: '#e3f2fd',
      color: '#1565c0',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid #bbdefb'
    },
    stepper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '30px 0'
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      margin: '0 10px'
    },
    stepCircle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    stepLine: {
      width: '80px',
      height: '2px',
      margin: '0 10px'
    }
  };

  if (!candidat) {
    return (
      <div style={styles.container}>
        <div style={styles.alertError}>
          Données du candidat manquantes. Veuillez sélectionner un candidat pour voter.
        </div>
        <button 
          style={styles.buttonPrimary}
          onClick={() => navigate('/candidats')}
        >
          Retour aux candidats
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={handleBack}
          style={{
            ...styles.buttonSecondary,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Retour
        </button>
        
        <h1 style={{ 
          color: PALETTE.RED_DARK, 
          marginBottom: '10px',
          fontSize: '24px'
        }}>
          {activeStep === 0 ? `Voter pour ${formatNomComplet(candidat)}` : 
           activeStep === 1 ? 'Paiement sécurisé' : 
           'Confirmation du vote'}
        </h1>
        
        <p style={{ color: PALETTE.BROWN, marginBottom: '20px' }}>
          Édition {edition?.nom} {edition?.annee} • {category?.nom}
        </p>
        
        {/* Stepper personnalisé */}
        <div style={styles.stepper}>
          {['Informations', 'Paiement', 'Confirmation'].map((label, index) => (
            <React.Fragment key={label}>
              <div style={styles.step}>
                <div style={{
                  ...styles.stepCircle,
                  background: activeStep === index ? PALETTE.OR : 
                            activeStep > index ? PALETTE.OR : '#e0e0e0',
                  color: activeStep >= index ? PALETTE.WHITE : '#666'
                }}>
                  {index + 1}
                </div>
                <span style={{
                  marginLeft: '8px',
                  color: activeStep === index ? PALETTE.RED_DARK : '#666',
                  fontWeight: activeStep === index ? 'bold' : 'normal'
                }}>
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div style={{
                  ...styles.stepLine,
                  background: activeStep > index ? PALETTE.OR : '#e0e0e0'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div style={styles.paper}>
        {activeStep === 0 && (
          <Step1Informations 
            candidat={candidat}
            category={category}
            votesCount={votesCount}
            setVotesCount={setVotesCount}
            voteOptions={voteOptions}
            VOTE_PRICE={VOTE_PRICE}
            calculateTotal={calculateTotal}
            userData={userData}
            setUserData={setUserData}
            formErrors={formErrors}
            PALETTE={PALETTE}
            styles={styles}
          />
        )}

        {activeStep === 1 && (
          <Step2Paiement 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            pollingActive={pollingActive}
            paymentStatus={paymentStatus}
            timeLeft={timeLeft}
            formatTime={formatTime}
            formatNomComplet={formatNomComplet}
            candidat={candidat}
            votesCount={votesCount}
            calculateTotal={calculateTotal}
            error={error}
            setError={setError}
            clearPolling={clearPolling}
            setPaymentStatus={setPaymentStatus}
            PALETTE={PALETTE}
            styles={styles}
          />
        )}

        {activeStep === 2 && (
          <Step3Confirmation 
            paymentData={paymentData}
            votesCount={votesCount}
            calculateTotal={calculateTotal}
            formatNomComplet={formatNomComplet}
            candidat={candidat}
            paymentMethod={paymentMethod}
            userData={userData}
            PALETTE={PALETTE}
            styles={styles}
          />
        )}
      </div>

      {/* Actions */}
      {!success && activeStep !== 2 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginTop: '20px'
        }}>
          <button
            onClick={handleBack}
            disabled={loading || pollingActive}
            style={{
              ...styles.buttonSecondary,
              opacity: (loading || pollingActive) ? 0.5 : 1,
              cursor: (loading || pollingActive) ? 'not-allowed' : 'pointer'
            }}
          >
            {activeStep === 0 ? 'Annuler' : 'Retour'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading || (activeStep === 1 && pollingActive)}
            style={{
              ...styles.buttonPrimary,
              opacity: (loading || (activeStep === 1 && pollingActive)) ? 0.5 : 1,
              cursor: (loading || (activeStep === 1 && pollingActive)) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${PALETTE.WHITE}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }} />
                Chargement...
              </span>
            ) : activeStep === 0 ? (
              'Continuer vers le paiement'
            ) : (
              'Procéder au paiement'
            )}
          </button>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && !loading && (
        <div style={styles.alertError}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal pour informer de l'ouverture de FedaPay */}
      {showPaymentModal && fedapayWindow !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: PALETTE.WHITE,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: PALETTE.RED_DARK }}>
                Paiement en cours
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: PALETTE.GRAY_DARK
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                fontSize: '60px',
                color: PALETTE.OR,
                marginBottom: '20px'
              }}>
                💳
              </div>
              <p style={{ marginBottom: '10px' }}>
                Une fenêtre FedaPay s'est ouverte pour finaliser votre paiement.
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Si la fenêtre ne s'est pas ouverte, vérifiez vos bloqueurs de popups.
              </p>
            </div>
            
            <button 
              onClick={() => {
                if (fedapayWindow) {
                  fedapayWindow.focus();
                }
                setShowPaymentModal(false);
              }}
              style={{
                ...styles.buttonPrimary,
                width: '100%'
              }}
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { width: 30%; }
          100% { width: 70%; }
        }
        
        @media (max-width: 768px) {
          .responsive-grid {
            flex-direction: column !important;
          }
        }
        
        input:focus, select:focus, button:focus {
          outline: 2px solid ${PALETTE.OR} !important;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

// Les composants Step1Informations, Step2Paiement et Step3Confirmation 
// restent EXACTEMENT les mêmes que dans votre code original (sans modification)

// Composant pour l'étape 1
const Step1Informations = React.memo(({
  candidat,
  category,
  votesCount,
  setVotesCount,
  voteOptions,
  VOTE_PRICE,
  calculateTotal,
  userData,
  setUserData,
  formErrors,
  PALETTE,
  styles
}) => {
  return (
    <div>
      <h2 style={{ color: PALETTE.RED_DARK, marginBottom: '20px' }}>
        Informations pour le vote
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          ...styles.paper,
          background: `${PALETTE.OR}08`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <img 
              src={candidat?.photo_url}
              alt={candidat?.nom}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${PALETTE.OR}`
              }}
            />
            <div>
              <h3 style={{ 
                color: PALETTE.RED_DARK, 
                margin: '0 0 8px 0',
                fontSize: '18px'
              }}>
                {`${candidat?.prenoms || ''} ${candidat?.nom || ''}`.trim()}
              </h3>
              <span style={{
                display: 'inline-block',
                background: PALETTE.BROWN,
                color: PALETTE.WHITE,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {category?.nom || 'Catégorie'}
              </span>
            </div>
          </div>
          
          <div>
            <h4 style={{ color: PALETTE.BROWN, marginBottom: '16px' }}>
              Détails du vote
            </h4>
            
            <select
              value={votesCount}
              onChange={(e) => setVotesCount(Number(e.target.value))}
              style={styles.select}
            >
              {voteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div style={{
              padding: '16px',
              background: `${PALETTE.OR}10`,
              borderRadius: '8px',
              border: `1px solid ${PALETTE.OR}30`,
              marginTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span>Prix par vote:</span>
                <span style={{ fontWeight: '500' }}>
                  {VOTE_PRICE.toLocaleString()} XOF
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span>Nombre de votes:</span>
                <span style={{ fontWeight: '500' }}>
                  {votesCount}
                </span>
              </div>
              <hr style={{ 
                border: 'none',
                height: '1px',
                background: `${PALETTE.OR}30`,
                margin: '12px 0'
              }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 'bold' }}>Total à payer:</span>
                <span style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: PALETTE.RED_DARK 
                }}>
                  {calculateTotal().toLocaleString()} XOF
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          ...styles.paper,
          background: `${PALETTE.OR}08`
        }}>
          <h4 style={{ color: PALETTE.BROWN, marginBottom: '16px' }}>
            Vos informations
          </h4>
          
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Ces informations seront utilisées pour la confirmation du paiement
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Prénom *
              </label>
              <input
                type="text"
                value={userData.firstname}
                onChange={(e) => setUserData(prev => ({...prev, firstname: e.target.value}))}
                placeholder="Votre prénom"
                style={{
                  ...styles.input,
                  borderColor: formErrors.firstname ? '#f44336' : '#ddd'
                }}
              />
              {formErrors.firstname && (
                <span style={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  {formErrors.firstname}
                </span>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nom *
              </label>
              <input
                type="text"
                value={userData.lastname}
                onChange={(e) => setUserData(prev => ({...prev, lastname: e.target.value}))}
                placeholder="Votre nom"
                style={{
                  ...styles.input,
                  borderColor: formErrors.lastname ? '#f44336' : '#ddd'
                }}
              />
              {formErrors.lastname && (
                <span style={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  {formErrors.lastname}
                </span>
              )}
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email *
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData(prev => ({...prev, email: e.target.value}))}
                placeholder="votre@email.com"
                style={{
                  ...styles.input,
                  borderColor: formErrors.email ? '#f44336' : '#ddd'
                }}
              />
              {formErrors.email ? (
                <span style={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  {formErrors.email}
                </span>
              ) : (
                <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                  Nous enverrons la confirmation à cette adresse
                </span>
              )}
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Téléphone *
              </label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData(prev => ({...prev, phone: e.target.value}))}
                placeholder="0XXXXXXXXX"
                style={{
                  ...styles.input,
                  borderColor: formErrors.phone ? '#f44336' : '#ddd'
                }}
              />
              {formErrors.phone ? (
                <span style={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  {formErrors.phone}
                </span>
              ) : (
                <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                  Format: 0XXXXXXXXX ou 229XXXXXXXX
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.alertInfo}>
            <strong>Important:</strong> Assurez-vous que vos informations sont correctes avant de continuer.
          </div>
        </div>
      </div>
    </div>
  );
});

// Composant pour l'étape 2
const Step2Paiement = React.memo(({
  paymentMethod,
  setPaymentMethod,
  pollingActive,
  paymentStatus,
  timeLeft,
  formatTime,
  formatNomComplet,
  candidat,
  votesCount,
  calculateTotal,
  error,
  setError,
  clearPolling,
  setPaymentStatus,
  PALETTE,
  styles
}) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: PALETTE.RED_DARK }}>
          Procéder au paiement
        </h2>
        
        {pollingActive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '20px',
              color: timeLeft < 300 ? PALETTE.RED_DARK : PALETTE.BROWN
            }}>
              ⏱️
            </span>
            <span style={{
              fontWeight: 'bold',
              color: timeLeft < 300 ? PALETTE.RED_DARK : PALETTE.BROWN,
              fontFamily: 'monospace'
            }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {!pollingActive ? (
        <>
          <div style={styles.paper}>
            <h4 style={{ color: PALETTE.BROWN, marginBottom: '16px' }}>
              Choisissez votre méthode de paiement
            </h4>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: paymentMethod === 'mobile_money' ? `2px solid ${PALETTE.OR}` : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: paymentMethod === 'mobile_money' ? `${PALETTE.OR}10` : PALETTE.WHITE
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile_money"
                  checked={paymentMethod === 'mobile_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '12px' }}
                />
                <span style={{ fontSize: '20px', marginRight: '12px' }}>📱</span>
                <div>
                  <div style={{ fontWeight: '500' }}>Mobile Money</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>MTN & Moov Money</div>
                </div>
              </label>
              
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: paymentMethod === 'card' ? `2px solid ${PALETTE.OR}` : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: paymentMethod === 'card' ? `${PALETTE.OR}10` : PALETTE.WHITE
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '12px' }}
                />
                <span style={{ fontSize: '20px', marginRight: '12px' }}>💳</span>
                <div>
                  <div style={{ fontWeight: '500' }}>Carte bancaire</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Visa, Mastercard</div>
                </div>
              </label>
            </div>

            <div style={{
              padding: '20px',
              background: `${PALETTE.RED_DARK}08`,
              borderRadius: '8px',
              border: `1px solid ${PALETTE.RED_DARK}30`,
              marginBottom: '20px'
            }}>
              <h5 style={{ 
                color: PALETTE.RED_DARK, 
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                Récapitulatif de la commande
              </h5>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <div>Candidat:</div>
                <div style={{ textAlign: 'right', fontWeight: '500' }}>
                  {formatNomComplet(candidat)}
                </div>
                
                <div>Nombre de votes:</div>
                <div style={{ textAlign: 'right', fontWeight: '500' }}>
                  {votesCount}
                </div>
                
                <div>Montant total:</div>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  fontSize: '20px',
                  color: PALETTE.RED_DARK
                }}>
                  {calculateTotal().toLocaleString()} XOF
                </div>
              </div>
            </div>

            <div style={{
              ...styles.alertInfo,
              marginBottom: '12px'
            }}>
              <strong>Information:</strong> Vous serez redirigé vers la plateforme sécurisée de FedaPay pour finaliser le paiement.
            </div>
            
            <div style={styles.alertInfo}>
              <strong>Important:</strong> Une nouvelle fenêtre s'ouvrira. Ne fermez pas cette page pendant le paiement.
            </div>
          </div>

          {error && (
            <div style={styles.alertError}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                <button 
                  onClick={() => setError('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c62828',
                    cursor: 'pointer',
                    fontSize: '20px',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${PALETTE.OR}20`,
            borderTopColor: PALETTE.OR,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          
          <h3 style={{ 
            color: PALETTE.RED_DARK, 
            marginBottom: '12px'
          }}>
            {paymentStatus === 'processing' ? 'Paiement en cours...' : 'Vérification du paiement...'}
          </h3>
          
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {paymentStatus === 'processing' 
              ? 'Veuillez compléter le paiement dans la fenêtre ouverte.'
              : 'Veuillez patienter pendant que nous vérifions le statut de votre paiement.'}
          </p>
          
          <div style={{
            height: '8px',
            background: `${PALETTE.OR}20`,
            borderRadius: '4px',
            margin: '20px 0',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
              borderRadius: '4px',
              animation: 'progress 2s ease-in-out infinite alternate'
            }} />
          </div>
          
          <span style={{ 
            color: '#666', 
            fontSize: '14px',
            display: 'block',
            marginTop: '12px'
          }}>
            Statut: {paymentStatus}
          </span>
          
          <button 
            style={{
              ...styles.buttonSecondary,
              marginTop: '20px'
            }}
            onClick={() => {
              clearPolling();
              setPaymentStatus('pending');
            }}
          >
            Annuler la vérification
          </button>
        </div>
      )}
    </div>
  );
});

// Composant pour l'étape 3
const Step3Confirmation = React.memo(({
  paymentData,
  votesCount,
  calculateTotal,
  formatNomComplet,
  candidat,
  paymentMethod,
  userData,
  PALETTE,
  styles
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${PALETTE.OR} 0%, ${PALETTE.RED_DARK} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '50px',
        color: PALETTE.WHITE
      }}>
        ✓
      </div>
      
      <h1 style={{ 
        color: PALETTE.RED_DARK, 
        marginBottom: '12px',
        fontSize: '28px'
      }}>
        Paiement Réussi !
      </h1>
      
      <h3 style={{ 
        color: PALETTE.BROWN, 
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        Merci pour votre soutien !
      </h3>
      
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
        Vous avez voté <strong>{votesCount} fois</strong> pour <strong>{formatNomComplet(candidat)}</strong>.
        Votre vote a été enregistré avec succès.
      </p>
      
      <div style={{
        ...styles.paper,
        maxWidth: '400px',
        margin: '0 auto',
        background: `${PALETTE.OR}08`
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              marginBottom: '4px'
            }}>
              Référence
            </div>
            <div style={{ 
              fontWeight: '500',
              wordBreak: 'break-all',
              fontSize: '14px'
            }}>
              {paymentData?.payment_token || 'N/A'}
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              marginBottom: '4px'
            }}>
              Montant
            </div>
            <div style={{ 
              fontWeight: '500',
              color: PALETTE.RED_DARK
            }}>
              {calculateTotal().toLocaleString()} XOF
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              marginBottom: '4px'
            }}>
              Date
            </div>
            <div style={{ fontWeight: '500' }}>
              {new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              marginBottom: '4px'
            }}>
              Méthode
            </div>
            <div style={{ fontWeight: '500' }}>
              {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte'}
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              marginBottom: '4px'
            }}>
              Statut
            </div>
            <span style={{
              display: 'inline-block',
              background: '#4CAF50',
              color: PALETTE.WHITE,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Confirmé
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <p style={{ color: '#666', marginBottom: '8px' }}>
          Un email de confirmation a été envoyé à <strong>{userData.email}</strong>
        </p>
        <p style={{ 
          color: '#666', 
          fontSize: '14px',
          marginTop: '12px'
        }}>
          Redirection vers la page de confirmation...
        </p>
      </div>
    </div>
  );
});

export default PaymentPage;