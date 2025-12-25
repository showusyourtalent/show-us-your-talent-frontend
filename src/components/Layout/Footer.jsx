import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  WhatsApp as WhatsAppIcon, // <-- New Icon for WhatsApp
  DeveloperMode as DeveloperIcon, // <-- New Icon for Developer section
  Code as CodeIcon,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState(''); // For newsletter input

  // === NEW: Developer Information ===
  const developerInfo = {
    name: 'H. Diègue HOUNDOKINNOU',
    title: 'Développeur d\'Application Web & Mobile',
    phone: '+229 01 94 11 94 76',
    phoneRaw: '2290194119476', // For direct tel: link
    whatsappUrl: 'https://wa.me/2290194119476', // WhatsApp direct chat URL
    callUrl: 'tel:+2290194119476', // Direct call URL
  };

  // === NEW: Function to handle developer contact ===
  const handleDeveloperContact = (method = 'whatsapp') => {
    if (method === 'whatsapp') {
      window.open(developerInfo.whatsappUrl, '_blank', 'noopener,noreferrer');
    } else if (method === 'call') {
      window.location.href = developerInfo.callUrl;
    }
  };

  // Animation du bouton scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Éditions', path: '/editions' },
    { label: 'Postuler', path: '/postuler' },
    { label: 'Comment ça marche', path: '/how-it-works' },
    { label: 'Résultats', path: '/results' },
    { label: 'Partenaires', path: '/partners' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  const legalLinks = [
    { label: 'Conditions d\'utilisation', path: '/terms' },
    { label: 'Politique de confidentialité', path: '/privacy' },
    { label: 'Mentions légales', path: '/legal' },
    { label: 'Cookies', path: '/cookies' },
  ];

  return (
    <>
      {/* Bouton Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-custom-gold text-white rounded-full shadow-lg hover:bg-amber-600 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center animate-bounce"
          aria-label="Remonter en haut"
        >
          <span className="transform -translate-y-0.5">↑</span>
        </button>
      )}

      {/* Footer compact */}
      <footer className="bg-custom-dark-red text-white mt-12">
        <Container maxWidth="lg" className="py-8">
          <Grid container spacing={4}>
            {/* Colonne 1: Logo, description et réseaux sociaux */}
            <Grid item xs={12} md={3}>
              <div 
                className="flex items-center space-x-3 mb-4 group cursor-pointer"
                onMouseEnter={() => setHoveredItem('logo')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <img 
                    src="/logo.png"  // Chez depuis le dossier public
                    alt="Logo Show Us Your Talent" 
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null; // Éviter les boucles d'erreur
                      e.target.style.display = 'none'; // Cacher si l'image échoue
                      // Afficher un fallback si l'image échoue
                      const parent = e.target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-10 h-10 bg-gradient-to-br from-custom-gold to-custom-dark-red rounded-full flex items-center justify-center';
                        fallback.innerHTML = '<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/></svg>';
                        parent.insertBefore(fallback, e.target);
                      }
                    }}
                  />
                <div>
                  <Typography 
                    variant="h6" 
                    className="font-bold text-lg transition-all duration-300 group-hover:text-custom-gold"
                  >
                    SHOW US YOUR TALENT
                  </Typography>
                  <Typography variant="caption" className="text-gray-300 text-xs">
                    Montre nous ton talent
                  </Typography>
                </div>
              </div>
              
              <Typography variant="body2" className="text-gray-300 mb-4 text-sm leading-relaxed">
                La plateforme ultime pour découvrir, promouvoir et récompenser 
                les talents extraordinaires à travers l'Afrique et au-delà.
              </Typography>
              
              <div className="flex space-x-1">
                {[
                  { icon: <FacebookIcon fontSize="small" />, label: 'Facebook', href: '#' },
                  { icon: <TwitterIcon fontSize="small" />, label: 'Twitter', href: '#' },
                  { icon: <InstagramIcon fontSize="small" />, label: 'Instagram', href: '#' },
                  { icon: <YouTubeIcon fontSize="small" />, label: 'YouTube', href: '#' }
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-gray-800 text-white hover:bg-custom-gold hover:text-white transition-all duration-300 transform ${hoveredItem === `social-${index}` ? 'scale-110 -rotate-6' : 'hover:scale-105'}`}
                    size="small"
                    onMouseEnter={() => setHoveredItem(`social-${index}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    aria-label={`Visiter notre ${social.label}`}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </div>
            </Grid>

            {/* Colonne 2: Liens rapides et légaux en colonne */}
            <Grid item xs={12} sm={6} md={3}>
              <div className="grid grid-cols-2 gap-4">
                {/* Liens rapides */}
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-3 text-custom-gold text-sm">
                    Navigation
                  </Typography>
                  <ul className="space-y-1.5">
                    {quickLinks.slice(0, 4).map((link, index) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className={`text-gray-300 hover:text-custom-gold transition-all duration-300 text-sm flex items-center ${hoveredItem === `quick-${index}` ? 'pl-2 font-medium' : ''}`}
                          onMouseEnter={() => setHoveredItem(`quick-${index}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <span className={`w-1 h-1 bg-custom-gold rounded-full mr-2 transition-all duration-300 ${hoveredItem === `quick-${index}` ? 'opacity-100' : 'opacity-0'}`}></span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Liens légaux */}
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-3 text-custom-gold text-sm">
                    Légal
                  </Typography>
                  <ul className="space-y-1.5">
                    {legalLinks.map((link, index) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className={`text-gray-300 hover:text-custom-gold transition-all duration-300 text-sm flex items-center ${hoveredItem === `legal-${index}` ? 'pl-2 font-medium' : ''}`}
                          onMouseEnter={() => setHoveredItem(`legal-${index}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <span className={`w-1 h-1 bg-custom-gold rounded-full mr-2 transition-all duration-300 ${hoveredItem === `legal-${index}` ? 'opacity-100' : 'opacity-0'}`}></span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Grid>

            {/* Colonne 3: Contact et newsletter */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" className="font-semibold mb-3 text-custom-gold text-sm">
                Contact
              </Typography>
              
              <div className="space-y-2.5 mb-4">
                {[
                  { icon: <LocationIcon fontSize="small" />, text: 'UNSTIM / Centre Universitaire de Lokossa' },
                  { icon: <PhoneIcon fontSize="small" />, text: '+229 01 94 11 94 76 / +229 01 91 06 05 77' },
                  { icon: <EmailIcon fontSize="small" />, text: 'showusyourtalent2@gmail.com' }
                ].map((info, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-2 group"
                    onMouseEnter={() => setHoveredItem(`contact-${index}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className={`pt-0.5 transition-transform duration-300 ${hoveredItem === `contact-${index}` ? 'scale-110' : ''}`}>
                      {info.icon}
                    </div>
                    <Typography 
                      variant="caption" 
                      className={`text-gray-300 transition-all duration-300 text-xs leading-tight ${hoveredItem === `contact-${index}` ? 'text-custom-gold' : ''}`}
                    >
                      {info.text}
                    </Typography>
                  </div>
                ))}
              </div>

              {/* Newsletter */}
              <div className="space-y-2">
                <Typography variant="caption" className="text-gray-300">
                  Inscrivez-vous à notre newsletter
                </Typography>
                <div className="flex">
                  <TextField
                    placeholder="Votre email"
                    size="small"
                    className="bg-white rounded-l-lg flex-grow"
                    InputProps={{
                      className: 'text-black text-xs',
                      sx: { height: 36 }
                    }}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    className="btn-primary rounded-l-none rounded-r-lg min-h-0 h-9 px-3 text-xs"
                    onMouseEnter={() => setHoveredItem('newsletter')}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => {
                      // Simple validation and action for newsletter
                      if (newsletterEmail) {
                        alert(`Merci pour votre inscription avec: ${newsletterEmail}`);
                        setNewsletterEmail('');
                      }
                    }}
                  >
                    S'inscrire
                  </Button>
                </div>
              </div>
            </Grid>

            {/* === NEW: Colonne 4 - Developer Contact === */}
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                className="p-4 rounded-lg border border-amber-700/30 bg-gradient-to-br from-amber-950/30 to-transparent"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <DeveloperIcon className="text-custom-gold" />
                  <Typography variant="subtitle1" className="font-semibold text-custom-gold text-sm">
                    Contactez le Développeur
                  </Typography>
                </div>
                
                <Typography variant="body2" className="text-amber-100 mb-2 font-medium">
                  {developerInfo.name}
                </Typography>
                <Typography variant="caption" className="text-gray-300 mb-4 block">
                  {developerInfo.title}
                </Typography>
                
                <div className="space-y-3">
                  <Tooltip title="Contacter via WhatsApp" arrow>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      sx={{
                        backgroundColor: '#25D366',
                        '&:hover': { backgroundColor: '#128C7E' },
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                      onClick={() => handleDeveloperContact('whatsapp')}
                    >
                      WhatsApp: {developerInfo.phone}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Appeler directement" arrow>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      startIcon={<PhoneIcon />}
                      sx={{
                        borderColor: '#D4AF37',
                        color: '#D4AF37',
                        '&:hover': { 
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)'
                        },
                        textTransform: 'none',
                        fontSize: '0.75rem',
                      }}
                      onClick={() => handleDeveloperContact('call')}
                    >
                      Appeler maintenant
                    </Button>
                  </Tooltip>
                </div>
                
                <Typography variant="caption" className="text-gray-400 block mt-4 text-center italic">
                  Développement & Maintenance du site
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Séparateur */}
          <div className="h-px bg-gradient-to-r from-transparent via-red-700 to-transparent my-4"></div>

          {/* Copyright compact */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left space-y-2 sm:space-y-0">
            <Typography variant="caption" className="text-gray-400">
              &copy; {currentYear} SHOW US YOUR TALENT. Tous droits réservés.
            </Typography>
            <Typography variant="caption" className="text-gray-400">
              Développé avec ❤️ pour les talents étudiantins
            </Typography>
          </div>
        </Container>
      </footer>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .bg-gradient-gold {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        }
      `}</style>
    </>
  );
};

export default Footer;