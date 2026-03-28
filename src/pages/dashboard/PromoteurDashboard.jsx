import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  HowToVote as VoteIcon,
  People as PeopleIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

const PromoteurDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEditions: 0,
    activeEditions: 0,
    totalCandidatures: 0,
    pendingCandidatures: 0
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a le rôle promoteur
    if (user && !hasRole('promoteur')) {
      console.error('User is not a promoteur:', user);
      navigate('/dashboard');
      return;
    }

    fetchEditions();
  }, [user, hasRole, navigate]);

  // Calculer les statistiques quand les éditions changent
  useEffect(() => {
    if (editions.length > 0) {
      calculateStats();
    }
  }, [editions]);

  const fetchEditions = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching promoteur editions from API...');
      
      // Utiliser la route API Laravel que vous avez spécifiée
      const response = await axios.get('/promoteur/editions');
      
      console.log('API response:', response.data);
      
      // La route Laravel retourne EditionResource::collection
      // C'est probablement un objet pagination avec un champ "data"
      let editionsData = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Format pagination Laravel standard
        editionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Format direct array
        editionsData = response.data;
      }
      
      console.log('Processed editions data:', editionsData);
      setEditions(editionsData);
      
    } catch (error) {
      console.error('Error fetching editions:', error);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Erreur d\'authentification. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }
      
      // Vérifier si c'est une erreur 404 (route non trouvée)
      if (error.response?.status === 404) {
        setError('La route API n\'est pas disponible. Veuillez contacter l\'administrateur.');
        return;
      }
      
      // Autres erreurs
      setError('Impossible de charger les éditions: ' + 
        (error.response?.data?.message || error.message || 'Erreur de connexion au serveur'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalEditions = editions.length;
    const activeEditions = editions.filter(e => 
      e.statut === 'active' || e.statut === 'en_cours'
    ).length;
    
    // Calculer le total des candidatures
    const totalCandidatures = editions.reduce(
      (acc, edition) => acc + (edition.nombre_candidatures || 0), 
      0
    );
    
    // Calculer les votes totaux
    const totalVotes = editions.reduce(
      (acc, edition) => acc + (edition.votes_count || 0), 
      0
    );
    
    // Pour les candidatures en attente, vous devrez probablement 
    // faire un appel API séparé ou modifier votre backend
    const pendingCandidatures = 0; // À remplacer par une vraie valeur
    
    setStats({
      totalEditions,
      activeEditions,
      totalCandidatures,
      pendingCandidatures,
      totalVotes
    });
  };

  const getStatusColor = (statut) => {
    switch(statut?.toLowerCase()) {
      case 'active': 
      case 'en_cours': 
        return 'success';
      case 'brouillon': 
      case 'draft': 
        return 'warning';
      case 'terminee': 
      case 'completed': 
        return 'default';
      case 'pending': 
        return 'info';
      default: 
        return 'default';
    }
  };

  const getStatusLabel = (statut) => {
    switch(statut?.toLowerCase()) {
      case 'active': 
      case 'en_cours': 
        return 'Active';
      case 'brouillon': 
      case 'draft': 
        return 'Brouillon';
      case 'terminee': 
      case 'completed': 
        return 'Terminée';
      case 'pending': 
        return 'En attente';
      default: 
        return statut || 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Fonction pour formater la description (limiter la longueur)
  const truncateDescription = (description, maxLength = 100) => {
    if (!description) return 'Aucune description';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Chargement de votre espace promoteur...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <div className="promoteur-dashboard">
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
          Tableau de bord Promoteur
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Bienvenue, {user?.prenoms} {user?.nom} • Gérez vos éditions et candidatures
        </Typography>
      </Box>

      {/* Message d'erreur */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
          <Box sx={{ mt: 1 }}>
            <Button 
              size="small" 
              onClick={fetchEditions}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Réessayer
            </Button>
          </Box>
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon sx={{ color: 'primary.main', mr: 1, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Éditions
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalEditions}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total • {stats.activeEditions} active(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: 'success.main', mr: 1, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Candidatures
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.totalCandidatures}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total • {stats.pendingCandidatures} en attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VoteIcon sx={{ color: 'warning.main', mr: 1, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Votes
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {stats.totalVotes || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Votes totaux
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ color: 'info.main', mr: 1, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Échéances
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {editions.filter(e => {
                  if (!e.date_fin) return false;
                  try {
                    return new Date(e.date_fin) > new Date();
                  } catch {
                    return false;
                  }
                }).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Éditions en cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* En-tête des éditions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Mes Éditions
          <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
            {editions.length} édition(s) trouvée(s)
          </Typography>
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/promoteur/editions/nouvelle')}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { 
              bgcolor: 'primary.dark',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s'
          }}
        >
          Nouvelle édition
        </Button>
      </Box>

      {/* Liste des éditions */}
      {editions.length === 0 ? (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center',
          bgcolor: 'background.default',
          border: '2px dashed',
          borderColor: 'divider'
        }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Aucune édition créée
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
            Créez votre première édition pour organiser un talent show et commencer à recevoir des candidatures
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/promoteur/editions/nouvelle')}
            sx={{
              px: 4,
              py: 1.5
            }}
          >
            Créer ma première édition
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {editions.map((edition) => (
            <Grid item xs={12} md={6} lg={4} key={edition.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* En-tête de l'édition */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        color: 'primary.dark'
                      }}>
                        {edition.nom}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Édition {edition.numero_edition || '1'} • {edition.annee || new Date().getFullYear()}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusLabel(edition.statut)}
                      color={getStatusColor(edition.statut)}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        ml: 1
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" sx={{ 
                    mb: 3, 
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    minHeight: 40
                  }}>
                    {truncateDescription(edition.description)}
                  </Typography>

                  {/* Dates */}
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ minWidth: 50, color: 'text.secondary' }}>
                        Début:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatDate(edition.date_debut)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ minWidth: 50, color: 'text.secondary' }}>
                        Fin:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatDate(edition.date_fin)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Statistiques */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-around',
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 20, color: 'success.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {edition.nombre_candidatures || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Candidatures
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <VoteIcon sx={{ fontSize: 20, color: 'warning.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {edition.votes_count || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Votes
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip
                        label={edition.inscriptions_ouvertes ? 'Ouvert' : 'Fermé'}
                        size="small"
                        color={edition.inscriptions_ouvertes ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ 
                  p: 2, 
                  pt: 0,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/promoteur/editions/${edition.id}`)}
                      variant="text"
                      sx={{ color: 'primary.main' }}
                    >
                      Détails
                    </Button>
                    
                    {edition.statut === 'brouillon' && (
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/promoteur/editions/${edition.id}/modifier`)}
                        variant="outlined"
                        color="secondary"
                      >
                        Modifier
                      </Button>
                    )}
                    
                    <IconButton 
                      size="small"
                      sx={{ 
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Actions rapides */}
      <Box sx={{ 
        mt: 8, 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Actions rapides
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/promoteur/editions/nouvelle')}
              sx={{ 
                height: 56,
                bgcolor: 'primary.main',
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Nouvelle édition
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => navigate('/promoteur/editions')}
              sx={{ 
                height: 56,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': { 
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.light',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Toutes les éditions
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default PromoteurDashboard;