// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from '../api/axios';
import AdvancedErrorBoundary from '../components/AdvancedErrorBoundary';

const VOTE_PRICE = 100;

const StepContainer = ({ stepId, content, onReady }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const newContainer = document.createElement('div');
      newContainer.id = `step-container-${stepId}`;
      newContainer.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      `;
      
      newContainer.innerHTML = content;
      
      const style = document.createElement('style');
      style.textContent = `
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `;
      newContainer.appendChild(style);
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(newContainer);
      
      if (onReady) {
        setTimeout(() => onReady(), 10);
      }
    }
  }, [content, stepId, onReady]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: 'none'
      }}
    />
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidatId } = useParams();

  const { candidat, edition, category } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(1800);
  const [votesCount, setVotesCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [fedapayWindow, setFedapayWindow] = useState(null);
  const [checkInterval, setCheckInterval] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);
  
  const [userData, setUserData] = useState({
    email: '',
    phone: '',
    firstname: '',
    lastname: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [stepContent, setStepContent] = useState('');
  const [stepReady, setStepReady] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const stepKey = useRef(0);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const savedState = localStorage.getItem('paymentPageRecoveryState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.activeStep !== undefined) {
          setRecoveryMode(true);
          setActiveStep(state.activeStep);
          setPaymentData(state.paymentData);
          setUserData(state.userData || {
            email: '',
            phone: '',
            firstname: '',
            lastname: ''
          });
          setVotesCount(state.votesCount || 1);
        }
      } catch (e) {
        console.warn('Failed to restore state:', e);
      }
    }
  }, []);

  const formatNomComplet = (cand) => {
    return `${cand?.prenoms || ''} ${cand?.nom || ''}`.trim();
  };

  const calculateTotal = () => VOTE_PRICE * votesCount;

  const getStep0Content = () => {
    const total = calculateTotal();
    const candidateName = formatNomComplet(candidat);
    const categoryName = category?.nom || 'Catégorie';
    
    const firstnameError = formErrors.firstname ? 'error' : '';
    const lastnameError = formErrors.lastname ? 'error' : '';
    const emailError = formErrors.email ? 'error' : '';
    const phoneError = formErrors.phone ? 'error' : '';
    
    const firstnameErrorHtml = formErrors.firstname ? `<div class="error-text">${formErrors.firstname}</div>` : '';
    const lastnameErrorHtml = formErrors.lastname ? `<div class="error-text">${formErrors.lastname}</div>` : '';
    const emailErrorHtml = formErrors.email ? `<div class="error-text">${formErrors.email}</div>` : 
      '<div style="color: #666; font-size: 12px; margin-top: 3px;">Nous enverrons la confirmation à cette adresse</div>';
    const phoneErrorHtml = formErrors.phone ? `<div class="error-text">${formErrors.phone}</div>` : 
      '<div style="color: #666; font-size: 12px; margin-top: 3px;">Format: 0XXXXXXXXX ou 229XXXXXXXX</div>';

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
body {
  padding: 20px;
  background: #f5f5f5;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.title {
  color: #8B0000;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.candidate-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}
.candidate-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #D4AF37;
  object-fit: cover;
}
.candidate-name {
  font-weight: bold;
  color: #8B0000;
  font-size: 18px;
}
.category {
  display: inline-block;
  background: #8B4513;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-top: 5px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}
input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
input.error {
  border-color: #f44336;
}
.error-text {
  color: #f44336;
  font-size: 12px;
  margin-top: 3px;
}
.summary {
  background: rgba(212, 175, 55, 0.1);
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.total {
  font-size: 20px;
  font-weight: bold;
  color: #8B0000;
}
.alert {
  background: rgba(139, 0, 0, 0.1);
  border: 1px solid rgba(139, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  color: #8B0000;
}
</style>
</head>
<body>
<div class="container">
  <h1 class="title">Informations pour le vote</h1>
  
  <div class="card">
    <div class="candidate-info">
      <img src="${candidat?.photo_url || ''}" class="candidate-photo" alt="${candidateName}">
      <div>
        <div class="candidate-name">${candidateName}</div>
        <div class="category">${categoryName}</div>
      </div>
    </div>
    
    <div class="form-group">
      <label>Nombre de votes</label>
      <select id="votesCount">
        <option value="1" ${votesCount === 1 ? 'selected' : ''}>1 vote - 100 XOF</option>
        <option value="5" ${votesCount === 5 ? 'selected' : ''}>5 votes - 500 XOF</option>
        <option value="10" ${votesCount === 10 ? 'selected' : ''}>10 votes - 1,000 XOF</option>
        <option value="20" ${votesCount === 20 ? 'selected' : ''}>20 votes - 2,000 XOF</option>
        <option value="50" ${votesCount === 50 ? 'selected' : ''}>50 votes - 5,000 XOF</option>
        <option value="100" ${votesCount === 100 ? 'selected' : ''}>100 votes - 10,000 XOF</option>
      </select>
    </div>
    
    <div class="summary">
      <div class="summary-row">
        <span>Prix par vote:</span>
        <span>${VOTE_PRICE.toLocaleString()} XOF</span>
      </div>
      <div class="summary-row">
        <span>Nombre de votes:</span>
        <span>${votesCount}</span>
      </div>
      <hr style="margin: 10px 0; border: none; border-top: 1px solid rgba(212, 175, 55, 0.3);">
      <div class="summary-row">
        <span>Total à payer:</span>
        <span class="total">${total.toLocaleString()} XOF</span>
      </div>
    </div>
  </div>
  
  <div class="card">
    <h3 style="color: #8B4513; margin-bottom: 15px;">Vos informations</h3>
    <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
      Ces informations seront utilisées pour la confirmation du paiement
    </p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div class="form-group">
        <label>Prénom *</label>
        <input 
          type="text" 
          id="firstname" 
          value="${userData.firstname || ''}"
          placeholder="Votre prénom"
          class="${firstnameError}"
        >
        ${firstnameErrorHtml}
      </div>
      
      <div class="form-group">
        <label>Nom *</label>
        <input 
          type="text" 
          id="lastname" 
          value="${userData.lastname || ''}"
          placeholder="Votre nom"
          class="${lastnameError}"
        >
        ${lastnameErrorHtml}
      </div>
      
      <div class="form-group" style="grid-column: span 2;">
        <label>Email *</label>
        <input 
          type="email" 
          id="email" 
          value="${userData.email || ''}"
          placeholder="votre@email.com"
          class="${emailError}"
        >
        ${emailErrorHtml}
      </div>
      
      <div class="form-group" style="grid-column: span 2;">
        <label>Téléphone *</label>
        <input 
          type="tel" 
          id="phone" 
          value="${userData.phone || ''}"
          placeholder="0XXXXXXXXX"
          class="${phoneError}"
        >
        ${phoneErrorHtml}
      </div>
    </div>
    
    <div class="alert">
      <strong>Important:</strong> Assurez-vous que vos informations sont correctes avant de continuer.
    </div>
  </div>
</div>

<script>
document.getElementById('votesCount').addEventListener('change', function(e) {
  window.parent.postMessage({
    type: 'UPDATE_VOTES',
    value: parseInt(e.target.value)
  }, '*');
});

['firstname', 'lastname', 'email', 'phone'].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', function(e) {
      window.parent.postMessage({
        type: 'UPDATE_USER_DATA',
        field: id,
        value: e.target.value
      }, '*');
    });
  }
});
</script>
</body>
</html>
    `;
  };

  const getStep1Content = () => {
    const total = calculateTotal();
    const candidateName = formatNomComplet(candidat);
    
    const mobileMoneySelected = paymentMethod === 'mobile_money';
    const cardSelected = paymentMethod === 'card';
    
    const mobileMoneyStyle = `border: 2px solid ${mobileMoneySelected ? '#D4AF37' : '#ddd'}; background: ${mobileMoneySelected ? 'rgba(212, 175, 55, 0.1)' : 'white'};`;
    const cardStyle = `border: 2px solid ${cardSelected ? '#D4AF37' : '#ddd'}; background: ${cardSelected ? 'rgba(212, 175, 55, 0.1)' : 'white'};`;
    
    const timerHtml = pollingActive ? `
      <div class="timer">
        ⏱️ ${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    ` : '';
    
    const contentHtml = !pollingActive ? `
      <div class="card">
        <h3 style="color: #8B4513; margin-bottom: 15px;">Choisissez votre méthode de paiement</h3>
        
        <div class="payment-option" onclick="selectPayment('mobile_money')" style="${mobileMoneyStyle}">
          <div class="payment-icon">📱</div>
          <div>
            <div style="font-weight: 500;">Mobile Money</div>
            <div style="font-size: 14px; color: #666;">MTN & Moov Money</div>
          </div>
          <input 
            type="radio" 
            name="payment" 
            value="mobile_money" 
            ${mobileMoneySelected ? 'checked' : ''}
            style="margin-left: auto;"
          >
        </div>
        
        <div class="payment-option card" onclick="selectPayment('card')" style="${cardStyle}">
          <div class="payment-icon">💳</div>
          <div>
            <div style="font-weight: 500;">Carte bancaire</div>
            <div style="font-size: 14px; color: #666;">Visa, Mastercard</div>
          </div>
          <input 
            type="radio" 
            name="payment" 
            value="card" 
            ${cardSelected ? 'checked' : ''}
            style="margin-left: auto;"
          >
        </div>
        
        <div class="summary">
          <h4 style="color: #8B0000; margin-bottom: 15px; font-weight: bold;">Récapitulatif</h4>
          <div class="summary-row">
            <span>Candidat:</span>
            <span>${candidateName}</span>
          </div>
          <div class="summary-row">
            <span>Votes:</span>
            <span>${votesCount}</span>
          </div>
          <div class="summary-row">
            <span>Total:</span>
            <span class="total">${total.toLocaleString()} XOF</span>
          </div>
        </div>
        
        <div class="alert alert-info">
          <strong>Information:</strong> Vous serez redirigé vers la plateforme sécurisée de FedaPay.
        </div>
        
        <div class="alert alert-warning">
          <strong>Important:</strong> Une nouvelle fenêtre s'ouvrira. Ne fermez pas cette page.
        </div>
      </div>
    ` : `
      <div class="card loading">
        <div class="spinner"></div>
        <h3 style="color: #8B0000; margin-bottom: 10px;">
          ${paymentStatus === 'processing' ? 'Paiement en cours...' : 'Vérification...'}
        </h3>
        <p style="color: #666; margin-bottom: 20px;">
          ${paymentStatus === 'processing' 
            ? 'Veuillez compléter le paiement dans la fenêtre ouverte.' 
            : 'Veuillez patienter pendant la vérification.'}
        </p>
        <div style="background: rgba(212, 175, 55, 0.2); height: 8px; border-radius: 4px; margin: 20px 0;">
          <div style="width: 60%; height: 100%; background: linear-gradient(90deg, #D4AF37, #8B0000); border-radius: 4px; animation: progress 2s ease-in-out infinite;"></div>
        </div>
        <p style="color: #666; font-size: 14px;">Statut: ${paymentStatus}</p>
      </div>
    `;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
body {
  padding: 20px;
  background: #f5f5f5;
}
.title {
  color: #8B0000;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.payment-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}
.payment-icon {
  font-size: 24px;
  margin-right: 15px;
}
.summary {
  background: rgba(139, 0, 0, 0.1);
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.total {
  font-size: 20px;
  font-weight: bold;
  color: #8B0000;
}
.alert {
  padding: 12px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 14px;
}
.alert-info {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  color: #1565c0;
}
.alert-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #856404;
}
.loading {
  text-align: center;
  padding: 40px 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(212, 175, 55, 0.2);
  border-top-color: #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.timer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 20px;
  color: #8B0000;
  font-weight: bold;
  font-family: monospace;
  font-size: 18px;
}
@keyframes progress {
  0% { width: 30%; }
  100% { width: 90%; }
}
</style>
</head>
<body>
<div style="max-width: 800px; margin: 0 auto;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <h1 class="title">Procéder au paiement</h1>
    ${timerHtml}
  </div>
  
  ${contentHtml}
</div>

<script>
function selectPayment(method) {
  window.parent.postMessage({
    type: 'UPDATE_PAYMENT_METHOD',
    value: method
  }, '*');
}

document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', function(e) {
    if (e.target.checked) {
      selectPayment(e.target.value);
    }
  });
});
</script>
</body>
</html>
    `;
  };

  const getStep2Content = () => {
    const total = calculateTotal();
    const candidateName = formatNomComplet(candidat);
    const paymentMethodText = paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte';
    const paymentToken = paymentData?.payment_token || 'N/A';
    
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
body {
  padding: 20px;
  background: #f5f5f5;
  text-align: center;
}
.success-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #D4AF37, #8B0000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 50px;
  color: white;
}
.title {
  color: #8B0000;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: bold;
}
.subtitle {
  color: #8B4513;
  margin-bottom: 20px;
  font-size: 18px;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 400px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: left;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 10px;
}
.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}
.info-value {
  font-weight: 500;
  word-break: break-all;
}
.status {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}
.email-notice {
  color: #666;
  margin-top: 20px;
  font-size: 14px;
}
.redirect {
  color: #666;
  margin-top: 10px;
  font-size: 12px;
}
</style>
</head>
<body>
<div class="success-icon">✓</div>
<h1 class="title">Paiement Réussi !</h1>
<h2 class="subtitle">Merci pour votre soutien !</h2>

<p style="color: #666; margin-bottom: 20px; font-size: 16px;">
  Vous avez voté <strong>${votesCount} fois</strong> pour 
  <strong>${candidateName}</strong>.
  Votre vote a été enregistré avec succès.
</p>

<div class="card">
  <div style="grid-column: span 2;">
    <div class="info-label">Référence</div>
    <div class="info-value">${paymentToken}</div>
  </div>
  
  <div>
    <div class="info-label">Montant</div>
    <div class="info-value" style="color: #8B0000;">${total.toLocaleString()} XOF</div>
  </div>
  
  <div>
    <div class="info-label">Date</div>
    <div class="info-value">${new Date().toLocaleDateString()}</div>
  </div>
  
  <div>
    <div class="info-label">Méthode</div>
    <div class="info-value">${paymentMethodText}</div>
  </div>
  
  <div>
    <div class="info-label">Statut</div>
    <div class="status">Confirmé</div>
  </div>
</div>

<div class="email-notice">
  Un email de confirmation a été envoyé à <strong>${userData.email}</strong>
</div>

<div class="redirect">
  Redirection vers la page de confirmation...
</div>
</body>
</html>
    `;
  };

  useEffect(() => {
    let content = '';
    try {
      if (activeStep === 0) {
        content = getStep0Content();
      } else if (activeStep === 1) {
        content = getStep1Content();
      } else if (activeStep === 2) {
        content = getStep2Content();
      } else {
        content = '<div>Étape invalide</div>';
      }
      setStepContent(content);
      setStepReady(false);
      stepKey.current += 1;
    } catch (err) {
      console.error('Error generating step content:', err);
      content = `<div style="padding: 20px; color: red;">Erreur: ${err.message}</div>`;
      setStepContent(content);
    }
  }, [activeStep, userData, votesCount, paymentMethod, pollingActive, paymentStatus, timeLeft, formErrors]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'UPDATE_VOTES') {
        setVotesCount(event.data.value);
      } else if (event.data.type === 'UPDATE_USER_DATA') {
        setUserData(prev => ({
          ...prev,
          [event.data.field]: event.data.value
        }));
      } else if (event.data.type === 'UPDATE_PAYMENT_METHOD') {
        setPaymentMethod(event.data.value);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const saveState = () => {
      const state = {
        activeStep,
        paymentData,
        userData,
        votesCount,
        paymentMethod,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('paymentPageState', JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save state:', e);
      }
    };

    const interval = setInterval(saveState, 5000);
    return () => clearInterval(interval);
  }, [activeStep, paymentData, userData, votesCount, paymentMethod]);

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
        setTimeout(() => {
          setActiveStep(1);
          setTimeLeft(1800);
        }, 100);
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
      
      setTimeout(() => {
        if (newWindow.closed || newWindow.location.href === 'about:blank') {
          setError('Veuillez autoriser les popups pour procéder au paiement.');
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

  const handlePaymentSuccess = async (paymentToken) => {
    try {
      const response = await axios.get(`/payments/${paymentToken}/success`);
      
      if (response.data.success) {
        setTimeout(() => {
          setActiveStep(2);
        }, 100);
        
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

  const handleRetry = useCallback(() => {
    retryCount.current += 1;
    
    if (retryCount.current >= maxRetries) {
      localStorage.removeItem('paymentPageState');
      localStorage.removeItem('paymentPageRecoveryState');
      window.location.reload();
      return;
    }
    
    stepKey.current += 1;
    setStepReady(false);
  }, []);

  if (!candidat) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          Données du candidat manquantes. Veuillez sélectionner un candidat pour voter.
        </div>
        <button 
          onClick={() => navigate('/candidats')}
          style={{
            backgroundColor: '#8B0000',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Retour aux candidats
        </button>
      </div>
    );
  }

  const errorBoundaryState = {
    activeStep,
    paymentData,
    userData,
    votesCount,
    paymentMethod,
    stepKey: stepKey.current
  };

  return (
    <AdvancedErrorBoundary
      stateToSave={errorBoundaryState}
      onRetry={handleRetry}
      onReset={() => {
        localStorage.removeItem('paymentPageState');
        localStorage.removeItem('paymentPageRecoveryState');
        window.location.reload();
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        minHeight: '100vh'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #8B4513',
              color: '#8B4513',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Retour
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              color: '#8B0000', 
              marginBottom: '5px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {activeStep === 0 ? `Voter pour ${formatNomComplet(candidat)}` : 
               activeStep === 1 ? 'Paiement sécurisé' : 
               'Confirmation du vote'}
            </h1>
            <p style={{ color: '#8B4513' }}>
              Édition {edition?.nom} {edition?.annee} • {category?.nom}
            </p>
          </div>
          
          <div style={{ width: '100px' }}></div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          {['Informations', 'Paiement', 'Confirmation'].map((label, index) => (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: activeStep === index ? '#D4AF37' : 
                                  activeStep > index ? '#D4AF37' : '#e0e0e0',
                  color: activeStep >= index ? 'white' : '#666',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {index + 1}
                </div>
                <span style={{
                  marginLeft: '8px',
                  color: activeStep === index ? '#8B0000' : '#666',
                  fontWeight: activeStep === index ? 'bold' : 'normal',
                  fontSize: '14px'
                }}>
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  backgroundColor: activeStep > index ? '#D4AF37' : '#e0e0e0',
                  margin: '0 10px'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {recoveryMode && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            color: '#856404',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <strong>Mode récupération activé:</strong> Vos données précédentes ont été restaurées.
          </div>
        )}
        
        <div style={{
          position: 'relative',
          minHeight: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <StepContainer
            key={`step-${stepKey.current}`}
            stepId={stepKey.current}
            content={stepContent}
            onReady={() => setStepReady(true)}
          />
          
          {(!stepReady || loading) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(212, 175, 55, 0.2)',
                  borderTopColor: '#D4AF37',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: '#8B0000', fontWeight: '500' }}>
                  {loading ? 'Chargement...' : 'Préparation de l\'étape...'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {activeStep !== 2 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px',
            gap: '20px'
          }}>
            <button
              onClick={handleBack}
              disabled={loading || pollingActive}
              style={{
                backgroundColor: 'white',
                color: '#8B4513',
                border: '1px solid #8B4513',
                padding: '14px 30px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading || pollingActive ? 'not-allowed' : 'pointer',
                opacity: loading || pollingActive ? 0.5 : 1,
                minWidth: '120px'
              }}
            >
              {activeStep === 0 ? 'Annuler' : 'Retour'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading || (activeStep === 1 && pollingActive)}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #8B0000 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 40px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading || (activeStep === 1 && pollingActive) ? 'not-allowed' : 'pointer',
                opacity: loading || (activeStep === 1 && pollingActive) ? 0.5 : 1,
                minWidth: '200px',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
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
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 0, 0, 0.2);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          
          button {
            padding: 12px 20px;
            font-size: 14px;
          }
          
          h1 {
            font-size: 20px;
          }
        }
      `}</style>
    </AdvancedErrorBoundary>
  );
};

export default PaymentPage;