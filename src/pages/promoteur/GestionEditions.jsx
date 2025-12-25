import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  HowToVote as VoteIcon,
  Group as GroupIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ListAlt as ListIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  Poll as PollIcon,
  Settings as SettingsIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
} from '@mui/icons-material';
import Modal from '../../components/Modal/Modal';
import ConfigurerVotesModal from '../../components/Modals/ConfigurerVotesModal';
import GererVotesModal from '../../components/Modals/GererVotesModal';

const GestionEditions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [configVotesModalOpen, setConfigVotesModalOpen] = useState(false);
  const [gererVotesModalOpen, setGererVotesModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedEdition, setSelectedEdition] = useState(null);

  // États pour les formulaires
  const [formData, setFormData] = useState({
    nom: '',
    annee: new Date().getFullYear(),
    numero_edition: '',
    description: '',
    date_debut_inscriptions: '',
    date_fin_inscriptions: '',
    statut: 'brouillon',
  });

  const [categoryData, setCategoryData] = useState({
    nom: '',
    description: '',
    ordre_affichage: 0,
    active: true,
  });

  // Récupérer les éditions du promoteur
  const { data: editions, isLoading, refetch } = useQuery({
    queryKey: ['promoteur-editions'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/promoteur/editions');
        console.log('Éditions récupérées:', response.data?.data);
        return response.data?.data || [];
      } catch (error) {
        console.error('Error fetching editions:', error);
        throw error;
      }
    },
  });

  // Mutation pour créer une édition
  const createEditionMutation = useMutation({
    mutationFn: (data) => axiosInstance.post('/promoteur/editions', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['promoteur-editions']);
      setModalOpen(false);
      toast.success('Édition créée avec succès !');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  // Mutation pour modifier une édition
  const updateEditionMutation = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.put(`/promoteur/editions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['promoteur-editions']);
      setModalOpen(false);
      toast.success('Édition mise à jour avec succès !');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Mutation pour ouvrir les inscriptions
  const openRegistrationsMutation = useMutation({
    mutationFn: ({ id, dates }) => 
      axiosInstance.post(`/promoteur/editions/${id}/ouvrir-inscriptions`, dates),
    onSuccess: () => {
      queryClient.invalidateQueries(['promoteur-editions']);
      setModalOpen(false);
      toast.success('Inscriptions ouvertes avec succès !');
      setFormData(prev => ({ ...prev, date_debut_inscriptions: '', date_fin_inscriptions: '' }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ouverture des inscriptions');
    },
  });

  // Mutation pour fermer les inscriptions
  const closeRegistrationsMutation = useMutation({
    mutationFn: ({ id, reason }) => {
      console.log('Fermeture inscriptions pour édition:', id);
      return axiosInstance.post(`/promoteur/editions/${id}/fermer-inscriptions`, { reason });
    },
    onSuccess: (response) => {
      console.log('Réponse fermeture:', response.data);
      queryClient.invalidateQueries(['promoteur-editions']);
      toast.success('Inscriptions fermées avec succès !');
    },
    onError: (error) => {
      console.error('Erreur fermeture:', error.response);
      toast.error(error.response?.data?.message || 'Erreur lors de la fermeture des inscriptions');
    },
  });

  // Mutation pour gérer les catégories
  const categoryMutation = useMutation({
    mutationFn: ({ editionId, data }) => 
      axiosInstance.post(`/promoteur/editions/${editionId}/categories`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['promoteur-editions']);
      setModalOpen(false);
      toast.success('Catégorie ajoutée avec succès !');
      setCategoryData({ nom: '', description: '', ordre_affichage: 0, active: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout de la catégorie');
    },
  });

  // Mutation pour gérer les votes
  const manageVotesMutation = useMutation({
    mutationFn: ({ editionId, action, data }) => {
      let endpoint = '';
      let method = 'post';
      
      switch (action) {
        case 'configurer':
          endpoint = 'configurer-votes';
          break;
        case 'demarrer':
          endpoint = 'demarrer-votes';
          break;
        case 'suspendre':
          endpoint = 'suspendre-votes';
          break;
        case 'relancer':
          endpoint = 'relancer-votes';
          break;
        case 'terminer':
          endpoint = 'terminer-votes';
          break;
        default:
          throw new Error('Action inconnue');
      }
      return axiosInstance.post(`/promoteur/editions/${editionId}/${endpoint}`, data);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries(['promoteur-editions']);
      setConfigVotesModalOpen(false);
      setGererVotesModalOpen(false);
      
      let message = 'Action effectuée avec succès';
      switch (variables.action) {
        case 'configurer':
          message = 'Dates de vote configurées avec succès';
          break;
        case 'demarrer':
          message = 'Votes démarrés avec succès';
          break;
        case 'suspendre':
          message = 'Votes suspendus avec succès';
          break;
        case 'relancer':
          message = 'Votes relancés avec succès';
          break;
        case 'terminer':
          message = 'Votes terminés avec succès';
          break;
      }
      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'action');
    },
  });

  const resetForm = () => {
    setFormData({
      nom: '',
      annee: new Date().getFullYear(),
      numero_edition: '',
      description: '',
      date_debut_inscriptions: '',
      date_fin_inscriptions: '',
      statut: 'brouillon',
    });
    setSelectedEdition(null);
  };

  const handleOpenModal = (type, edition = null) => {
    setModalType(type);
    setSelectedEdition(edition);
    
    if (type === 'edit' && edition) {
      setFormData({
        nom: edition.nom,
        annee: edition.annee,
        numero_edition: edition.numero_edition,
        description: edition.description || '',
        statut: edition.statut,
        date_debut_inscriptions: edition.date_debut_inscriptions?.split('T')[0] || '',
        date_fin_inscriptions: edition.date_fin_inscriptions?.split('T')[0] || '',
      });
    } else if (type === 'create') {
      resetForm();
    } else if (type === 'openReg' && edition) {
      setFormData({
        date_debut_inscriptions: '',
        date_fin_inscriptions: '',
      });
    }
    
    setModalOpen(true);
  };

  const handleSubmitEdition = (e) => {
    e.preventDefault();
    
    if (modalType === 'create') {
      createEditionMutation.mutate(formData);
    } else if (modalType === 'edit' && selectedEdition) {
      updateEditionMutation.mutate({ 
        id: selectedEdition.id, 
        data: formData 
      });
    }
  };

  const handleOpenRegistrations = (e) => {
    e.preventDefault();
    if (!formData.date_debut_inscriptions || !formData.date_fin_inscriptions) {
      toast.error('Veuillez sélectionner les dates de début et fin');
      return;
    }
    
    // Vérifier que la date de fin est après la date de début
    if (new Date(formData.date_fin_inscriptions) <= new Date(formData.date_debut_inscriptions)) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }
    
    const dates = {
      date_debut: formData.date_debut_inscriptions,
      date_fin: formData.date_fin_inscriptions,
    };
    
    openRegistrationsMutation.mutate({
      id: selectedEdition.id,
      dates,
    });
  };

  const handleCloseRegistrations = (edition) => {
    const reason = prompt('Veuillez saisir la raison de la fermeture des inscriptions (optionnel):');
    
    closeRegistrationsMutation.mutate({
      id: edition.id,
      reason: reason || ''
    });
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    if (!categoryData.nom.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }
    
    categoryMutation.mutate({
      editionId: selectedEdition.id,
      data: categoryData,
    });
  };

  const handleOpenConfigVotesModal = (edition) => {
    setSelectedEdition(edition);
    setConfigVotesModalOpen(true);
  };

  const handleOpenGererVotesModal = (edition) => {
    setSelectedEdition(edition);
    setGererVotesModalOpen(true);
  };

  const handleConfigVotesSuccess = (updatedEdition) => {
    refetch();
    setConfigVotesModalOpen(false);
  };

  const handleManageVotes = (action, data = {}) => {
    if (!selectedEdition) return;
    
    if (action === 'demarrer' || action === 'terminer') {
      const message = action === 'demarrer' 
        ? 'Êtes-vous sûr de vouloir démarrer les votes ?' 
        : 'Êtes-vous sûr de vouloir terminer les votes définitivement ?';
      
      if (!window.confirm(message)) return;
    }
    
    manageVotesMutation.mutate({
      editionId: selectedEdition.id,
      action,
      data,
    });
  };

  const handleViewCandidatures = (editionId) => {
    navigate(`/promoteur/editions/${editionId}/candidatures`);
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'active': return 'success';
      case 'brouillon': return 'warning';
      case 'terminee': return 'default';
      case 'archivee': return 'info';
      default: return 'default';
    }
  };

  // CORRECTION : Utiliser inscriptions_ouvertes du backend
  const isRegistrationOpen = (edition) => {
    return edition.inscriptions_ouvertes === true || edition.inscriptions_ouvertes === 1;
  };

  const isVotingOpen = (edition) => {
    if (!edition.date_debut_votes || !edition.date_fin_votes) return false;
    const now = new Date();
    const start = new Date(edition.date_debut_votes);
    const end = new Date(edition.date_fin_votes);
    return now >= start && now <= end && edition.statut_votes === 'en_cours';
  };

  const getVotingStatusInfo = (edition) => {
    if (!edition.statut_votes) return { label: 'Non configuré', color: 'default' };
    
    switch (edition.statut_votes) {
      case 'en_attente':
        return { label: 'En attente', color: 'warning' };
      case 'en_cours':
        return { label: 'En cours', color: 'success' };
      case 'suspendu':
        return { label: 'Suspendu', color: 'error' };
      case 'termine':
        return { label: 'Terminé', color: 'default' };
      default:
        return { label: 'Inconnu', color: 'default' };
    }
  };

  const getCandidatureCount = (edition) => {
    return edition.nombre_candidatures || edition.candidatures_count || 0;
  };

  const getVoteCount = (edition) => {
    return edition.nombre_votes || edition.votes_count || 0;
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Gestion des Éditions
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 4 }}>
          Gérez vos éditions, inscriptions, catégories et votes
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal('create')}
          sx={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
            color: 'white',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 25px rgba(212, 175, 55, 0.4)',
            },
            transition: 'all 0.3s',
          }}
        >
          Nouvelle Édition
        </Button>
      </Box>

      {/* Liste des éditions */}
      <Grid container spacing={3}>
        {editions?.length > 0 ? (
          editions.map((edition) => {
            const votingStatus = getVotingStatusInfo(edition);
            const canManageVotes = edition.statut === 'active' && 
              (edition.statut_votes === 'en_attente' || 
               edition.statut_votes === 'en_cours' || 
               edition.statut_votes === 'suspendu');

            return (
              <Grid item xs={12} md={6} lg={4} key={edition.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      borderColor: '#D4AF37',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={`${edition.annee} - ${edition.numero_edition}ème`}
                        sx={{
                          bgcolor: '#8B0000',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={edition.statut}
                          color={getStatutColor(edition.statut)}
                          size="small"
                        />
                        {isRegistrationOpen(edition) && (
                          <Chip
                            label="Inscriptions ouvertes"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
                      {edition.nom}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {edition.description || 'Aucune description'}
                    </Typography>

                    {/* Dates inscriptions */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                        Inscriptions:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.875rem' }}>
                        {edition.date_debut_inscriptions 
                          ? `${new Date(edition.date_debut_inscriptions).toLocaleDateString()} - ${new Date(edition.date_fin_inscriptions).toLocaleDateString()}`
                          : 'Non définies'
                        }
                        {isRegistrationOpen(edition) && (
                          <Chip
                            label="OUVERT"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </Box>

                    {/* Dates votes */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                        Votes: 
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={votingStatus.label} 
                          color={votingStatus.color} 
                          size="small" 
                        />
                        {edition.date_debut_votes && (
                          <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.875rem' }}>
                            {`${new Date(edition.date_debut_votes).toLocaleDateString()} - ${new Date(edition.date_fin_votes).toLocaleDateString()}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Statistiques */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
                          {edition.categories?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Catégories
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
                          {getCandidatureCount(edition)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Candidatures
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {getVoteCount(edition)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Votes
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {/* Bouton Gérer Candidatures */}
                      <Tooltip title="Gérer les candidatures">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCandidatures(edition.id)}
                          sx={{
                            bgcolor: '#6366f1',
                            color: 'white',
                            '&:hover': { bgcolor: '#4f46e5' },
                            minWidth: '40px',
                          }}
                        >
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Bouton Modifier */}
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal('edit', edition)}
                          sx={{
                            bgcolor: '#fef3c7',
                            color: '#d97706',
                            '&:hover': { bgcolor: '#fde68a' },
                            minWidth: '40px',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Bouton Gérer Votes */}
                      <Tooltip title={canManageVotes ? "Gérer les votes" : "Configurer les votes"}>
                        <IconButton
                          size="small"
                          onClick={() => canManageVotes ? handleOpenGererVotesModal(edition) : handleOpenConfigVotesModal(edition)}
                          sx={{
                            bgcolor: '#dbeafe',
                            color: '#1d4ed8',
                            '&:hover': { bgcolor: '#bfdbfe' },
                            minWidth: '40px',
                          }}
                        >
                          {canManageVotes ? <SettingsIcon fontSize="small" /> : <VoteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      {/* Bouton Ouvrir inscriptions */}
                      {edition.statut === 'active' && !isRegistrationOpen(edition) && (
                        <Tooltip title="Ouvrir inscriptions">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal('openReg', edition)}
                            sx={{
                              bgcolor: '#dcfce7',
                              color: '#16a34a',
                              '&:hover': { bgcolor: '#bbf7d0' },
                              minWidth: '40px',
                            }}
                          >
                            <PlayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Bouton Fermer inscriptions */}
                      {isRegistrationOpen(edition) && (
                        <Tooltip title="Fermer inscriptions">
                          <IconButton
                            size="small"
                            onClick={() => handleCloseRegistrations(edition)}
                            disabled={closeRegistrationsMutation.isLoading}
                            sx={{
                              bgcolor: '#fee2e2',
                              color: '#dc2626',
                              '&:hover': { bgcolor: '#fecaca' },
                              '&.Mui-disabled': {
                                bgcolor: '#f3f4f6',
                                color: '#9ca3af',
                              },
                              minWidth: '40px',
                            }}
                          >
                            <PauseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Bouton Gérer catégories */}
                      <Tooltip title="Gérer catégories">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal('categories', edition)}
                          sx={{
                            bgcolor: '#e0e7ff',
                            color: '#4f46e5',
                            '&:hover': { bgcolor: '#c7d2fe' },
                            minWidth: '40px',
                          }}
                        >
                          <GroupIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Bouton Voir détails */}
                      <Tooltip title="Voir plus de détails">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/promoteur/editions/${edition.id}`)}
                          sx={{
                            bgcolor: '#f3f4f6',
                            color: '#6b7280',
                            '&:hover': { bgcolor: '#e5e7eb' },
                            minWidth: '40px',
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Bouton principal pour voir les candidatures */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ListIcon />}
                      onClick={() => handleViewCandidatures(edition.id)}
                      disabled={getCandidatureCount(edition) === 0}
                      sx={{
                        mt: 2,
                        background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        py: 1,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7a0000 0%, #b42828 100%)',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-disabled': {
                          background: '#e5e7eb',
                          color: '#9ca3af',
                        },
                      }}
                    >
                      {getCandidatureCount(edition) > 0 
                        ? `Voir les candidatures (${getCandidatureCount(edition)})` 
                        : 'Aucune candidature'
                      }
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', p: 6, borderRadius: '16px' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <AddIcon sx={{ fontSize: 40, color: '#9ca3af' }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                Aucune édition créée
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>
                Commencez par créer votre première édition
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal('create')}
                sx={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                }}
              >
                Créer une édition
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modal pour créer/modifier une édition */}
      <Modal
        open={modalOpen && (modalType === 'create' || modalType === 'edit')}
        onClose={() => setModalOpen(false)}
        title={modalType === 'create' ? 'Nouvelle Édition' : 'Modifier l\'Édition'}
        size="lg"
        showLogo={true}
      >
        <form onSubmit={handleSubmitEdition}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'édition *"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Année *"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) || new Date().getFullYear() })}
                required
                disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Numéro d'édition *"
                type="number"
                value={formData.numero_edition}
                onChange={(e) => setFormData({ ...formData, numero_edition: e.target.value })}
                required
                disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date début inscriptions"
                type="date"
                value={formData.date_debut_inscriptions}
                onChange={(e) => setFormData({ ...formData, date_debut_inscriptions: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date fin inscriptions"
                type="date"
                value={formData.date_fin_inscriptions}
                onChange={(e) => setFormData({ ...formData, date_fin_inscriptions: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {modalType === 'edit' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={formData.statut}
                    label="Statut"
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="brouillon">Brouillon</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="terminee">Terminée</MenuItem>
                    <MenuItem value="archivee">Archivée</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          <DialogActions sx={{ mt: 4, px: 0 }}>
            <Button
              onClick={() => setModalOpen(false)}
              disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
              sx={{
                color: '#6b7280',
                borderRadius: '12px',
                px: 4,
                '&.Mui-disabled': {
                  color: '#d1d5db',
                },
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createEditionMutation.isLoading || updateEditionMutation.isLoading}
              sx={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d4a600 0%, #e6c200 100%)',
                },
                '&.Mui-disabled': {
                  background: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              {createEditionMutation.isLoading || updateEditionMutation.isLoading 
                ? 'Traitement...' 
                : modalType === 'create' 
                  ? 'Créer l\'édition' 
                  : 'Mettre à jour'
              }
            </Button>
          </DialogActions>
        </form>
      </Modal>

      {/* Modal pour ouvrir les inscriptions */}
      <Modal
        open={modalOpen && modalType === 'openReg'}
        onClose={() => setModalOpen(false)}
        title="Ouvrir les Inscriptions"
        size="md"
        showLogo={true}
      >
        {selectedEdition && (
          <form onSubmit={handleOpenRegistrations}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
              L'édition doit être active pour ouvrir les inscriptions
            </Alert>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Édition: {selectedEdition.nom}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date début *"
                  type="date"
                  value={formData.date_debut_inscriptions}
                  onChange={(e) => setFormData({ ...formData, date_debut_inscriptions: e.target.value })}
                  required
                  disabled={openRegistrationsMutation.isLoading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { 
                      min: new Date().toISOString().split('T')[0] 
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date fin *"
                  type="date"
                  value={formData.date_fin_inscriptions}
                  onChange={(e) => setFormData({ ...formData, date_fin_inscriptions: e.target.value })}
                  required
                  disabled={openRegistrationsMutation.isLoading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { 
                      min: formData.date_debut_inscriptions || new Date().toISOString().split('T')[0]
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>

            <DialogActions sx={{ mt: 4, px: 0 }}>
              <Button
                onClick={() => setModalOpen(false)}
                disabled={openRegistrationsMutation.isLoading}
                sx={{
                  color: '#6b7280',
                  borderRadius: '12px',
                  px: 4,
                  '&.Mui-disabled': {
                    color: '#d1d5db',
                  },
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={openRegistrationsMutation.isLoading}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0da271 0%, #2bbf87 100%)',
                  },
                  '&.Mui-disabled': {
                    background: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
              >
                {openRegistrationsMutation.isLoading ? 'Ouverture...' : 'Ouvrir les inscriptions'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Modal>

      {/* Modal pour gérer les catégories */}
      <Modal
        open={modalOpen && modalType === 'categories'}
        onClose={() => setModalOpen(false)}
        title="Gérer les Catégories"
        size="lg"
        showLogo={true}
      >
        {selectedEdition && (
          <Box>
            <form onSubmit={handleSubmitCategory} style={{ marginBottom: '30px' }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1f2937' }}>
                Ajouter une nouvelle catégorie
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#6b7280' }}>
                Édition: {selectedEdition.nom}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom de la catégorie *"
                    value={categoryData.nom}
                    onChange={(e) => setCategoryData({ ...categoryData, nom: e.target.value })}
                    required
                    disabled={categoryMutation.isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Ordre d'affichage"
                    type="number"
                    value={categoryData.ordre_affichage}
                    onChange={(e) => setCategoryData({ ...categoryData, ordre_affichage: parseInt(e.target.value) || 0 })}
                    disabled={categoryMutation.isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={categoryData.active}
                        onChange={(e) => setCategoryData({ ...categoryData, active: e.target.checked })}
                        color="primary"
                        disabled={categoryMutation.isLoading}
                      />
                    }
                    label="Active"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={categoryData.description}
                    onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                    disabled={categoryMutation.isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={categoryMutation.isLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    px: 4,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7a0000 0%, #b42828 100%)',
                    },
                    '&.Mui-disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    },
                  }}
                >
                  {categoryMutation.isLoading ? 'Ajout...' : 'Ajouter la catégorie'}
                </Button>
              </Box>
            </form>

            {/* Liste des catégories existantes */}
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937' }}>
              Catégories existantes ({selectedEdition.categories?.length || 0})
            </Typography>

            {selectedEdition.categories?.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Ordre</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEdition.categories.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {category.nom}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {category.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={category.ordre_affichage}
                            size="small"
                            sx={{ bgcolor: '#e0e7ff', color: '#4f46e5' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={category.active ? 'Active' : 'Inactive'}
                            color={category.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<ListIcon />}
                            onClick={() => navigate(`/promoteur/editions/${selectedEdition.id}/candidatures?category=${category.id}`)}
                            sx={{
                              color: '#6366f1',
                              fontSize: '0.75rem',
                            }}
                          >
                            Candidatures
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                Aucune catégorie définie pour cette édition
              </Alert>
            )}
          </Box>
        )}
      </Modal>

      {/* Modal pour configurer les votes */}
      <ConfigurerVotesModal
        open={configVotesModalOpen}
        onClose={() => setConfigVotesModalOpen(false)}
        edition={selectedEdition}
        onSuccess={handleConfigVotesSuccess}
        api={axiosInstance}
      />

      {/* Modal pour gérer les votes */}
      <GererVotesModal
        open={gererVotesModalOpen}
        onClose={() => setGererVotesModalOpen(false)}
        edition={selectedEdition}
        onManageVotes={handleManageVotes}
        isLoading={manageVotesMutation.isLoading}
      />
    </Box>
  );
};

export default GestionEditions;