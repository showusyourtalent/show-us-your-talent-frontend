// src/pages/Votes/Votes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Alert,
  Divider,
  IconButton,
  Stack,
  Paper,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const CandidateCard = styled(Card)(({ theme, isvoted }) => ({
  borderRadius: 12,
  border: isvoted ? '2px solid #4CAF50' : '1px solid #e0e0e0',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const VoteBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: -10,
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#000',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
}));

const Votes = () => {
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const countdownRef = useRef(null);

  // Récupérer les candidats et informations de vote
  const { data: voteData, isLoading, error, refetch } = useQuery({
    queryKey: ['votes-data'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/editions/active/candidats');
        return response.data;
      } catch (error) {
        console.error('Error fetching vote data:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    refetchOnWindowFocus: true,
  });

  // Mutation pour voter
  const voteMutation = useMutation({
    mutationFn: (data) => axiosInstance.post('/votes', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['votes-data']);
      toast.success('Vote enregistré avec succès !');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors du vote');
    },
  });

  // Gérer le décompte en temps réel
  useEffect(() => {
    if (voteData?.edition?.temps_restant) {
      const updateCountdown = () => {
        const temps = voteData.edition.temps_restant;
        const totalSecondes = temps.total_secondes - 1;
        
        if (totalSecondes <= 0) {
          clearInterval(countdownRef.current);
          setTimeRemaining(null);
          refetch(); // Rafraîchir les données
          return;
        }

        const jours = Math.floor(totalSecondes / (24 * 3600));
        const heures = Math.floor((totalSecondes % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSecondes % 3600) / 60);
        const secondes = totalSecondes % 60;

        setTimeRemaining({
          jours,
          heures,
          minutes,
          secondes,
          total_secondes: totalSecondes
        });
      };

      // Initialiser
      updateCountdown();
      
      // Mettre à jour chaque seconde
      countdownRef.current = setInterval(updateCountdown, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [voteData?.edition?.temps_restant, refetch]);

  // Calculer le pourcentage de votes
  const calculatePercentage = (votes, totalVotes) => {
    if (!totalVotes || totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const handleVote = (candidatId, categorieId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir voter pour ce candidat ?')) {
      return;
    }

    voteMutation.mutate({
      candidat_id: candidatId,
      categorie_id: categorieId,
    });
  };

  const formatSexe = (sexe) => {
    return sexe === 'F' ? 'Candidat(e)' : 'Candidat';
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6">Erreur de chargement</Typography>
          <Typography variant="body2">
            {error.response?.data?.message || 'Impossible de charger les données de vote'}
          </Typography>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => refetch()}
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!voteData?.success) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="h6">Aucun vote en cours</Typography>
          <Typography variant="body2">
            {voteData?.message || 'Aucune édition en cours de vote pour le moment.'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  const { edition, categories, statistiques } = voteData;
  const totalVotes = statistiques?.total_votes || 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête avec informations */}
      <StyledCard sx={{ mb: 4, background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {edition.nom} - {edition.annee}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Élection en cours
              </Typography>
              
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  <Typography variant="body1">
                    {statistiques.total_candidats || 0} Candidats
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VoteIcon />
                  <Typography variant="body1">
                    {totalVotes} Votes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon />
                  <Typography variant="body1">
                    {categories.length} Catégories
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {edition.statut_votes === 'en_attente' ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <TimeIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Vote commence dans
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                      {timeRemaining?.jours || 0} Jours
                    </Typography>
                  </Box>
                ) : edition.statut_votes === 'en_cours' && timeRemaining ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Temps restant
                    </Typography>
                    <Grid container spacing={1} justifyContent="center">
                      <Grid item>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                            {timeRemaining.jours}
                          </Typography>
                          <Typography variant="caption">Jours</Typography>
                        </Box>
                      </Grid>
                      <Grid item sx={{ alignSelf: 'center' }}>
                        <Typography variant="h5">:</Typography>
                      </Grid>
                      <Grid item>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                            {timeRemaining.heures.toString().padStart(2, '0')}
                          </Typography>
                          <Typography variant="caption">Heures</Typography>
                        </Box>
                      </Grid>
                      <Grid item sx={{ alignSelf: 'center' }}>
                        <Typography variant="h5">:</Typography>
                      </Grid>
                      <Grid item>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                            {timeRemaining.minutes.toString().padStart(2, '0')}
                          </Typography>
                          <Typography variant="caption">Minutes</Typography>
                        </Box>
                      </Grid>
                      <Grid item sx={{ alignSelf: 'center' }}>
                        <Typography variant="h5">:</Typography>
                      </Grid>
                      <Grid item>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                            {timeRemaining.secondes.toString().padStart(2, '0')}
                          </Typography>
                          <Typography variant="caption">Secondes</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : edition.statut_votes === 'termine' ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <TrophyIcon sx={{ fontSize: 40, mb: 1, color: '#FFD700' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Vote terminé
                    </Typography>
                  </Box>
                ) : null}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Bouton rafraîchir */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Rafraîchir
        </Button>
      </Box>

      {/* Liste des catégories */}
      {categories.map((categorie, index) => (
        <Box key={categorie.id} sx={{ mb: 6 }}>
          {/* En-tête catégorie */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CategoryIcon sx={{ fontSize: 32, color: '#8B0000' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {categorie.nom}
              </Typography>
              {categorie.description && (
                <Typography variant="body2" color="text.secondary">
                  {categorie.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Total votes: {categorie.total_votes_categorie}
              </Typography>
            </Box>
          </Box>

          {/* Liste des candidats */}
          <Grid container spacing={3}>
            {categorie.candidats.map((candidat, idx) => {
              const pourcentage = calculatePercentage(candidat.nombre_votes, totalVotes);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={candidat.id}>
                  <CandidateCard isvoted={candidat.a_deja_vote}>
                    {idx < 3 && candidat.nombre_votes > 0 && (
                      <VoteBadge>
                        #{idx + 1}
                      </VoteBadge>
                    )}
                    
                    <CardContent>
                      {/* Photo et informations */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={candidat.photo}
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            mb: 2,
                            border: '4px solid #f5f5f5',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        >
                          {candidat.nom_complet.charAt(0)}
                        </Avatar>
                        
                        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                          {candidat.nom_complet}
                        </Typography>
                        
                        <Chip 
                          label={formatSexe(candidat.sexe)}
                          size="small" 
                          sx={{ mt: 1, mb: 1 }}
                        />
                      </Box>

                      {/* Informations détaillées */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        {candidat.ethnie && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FlagIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {candidat.ethnie}
                            </Typography>
                          </Box>
                        )}
                        
                        {candidat.universite && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {candidat.universite}
                            </Typography>
                          </Box>
                        )}
                        
                        {candidat.filiere && (
                          <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                            {candidat.filiere}
                          </Typography>
                        )}
                        
                        {candidat.entite && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {candidat.entite}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Barre de progression */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {candidat.nombre_votes} votes
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {pourcentage}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={pourcentage}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #8B0000 0%, #c53030 100%)',
                              borderRadius: 4,
                            }
                          }}
                        />
                      </Box>

                      {/* Bouton voter */}
                      {edition.statut_votes === 'en_cours' && (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<VoteIcon />}
                          onClick={() => handleVote(candidat.id, categorie.id)}
                          disabled={candidat.a_deja_vote || voteMutation.isLoading}
                          sx={{
                            background: candidat.a_deja_vote 
                              ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
                              : 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: 2,
                            py: 1.5,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            },
                            '&.Mui-disabled': {
                              background: '#e5e7eb',
                              color: '#9ca3af',
                            },
                          }}
                        >
                          {candidat.a_deja_vote ? 'Déjà voté ✓' : 'Voter'}
                        </Button>
                      )}
                    </CardContent>
                  </CandidateCard>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ mt: 4, mb: 2 }} />
        </Box>
      ))}

      {/* Section statistiques */}
      {totalVotes > 0 && (
        <StyledCard sx={{ mt: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon /> Statistiques Globales
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Répartition par catégorie
                  </Typography>
                  {categories.map((categorie) => {
                    const pourcentageCat = calculatePercentage(
                      categorie.total_votes_categorie, 
                      totalVotes
                    );
                    
                    return (
                      <Box key={categorie.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {categorie.nom}
                          </Typography>
                          <Typography variant="body2">
                            {categorie.total_votes_categorie} votes ({pourcentageCat}%)
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={pourcentageCat}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                    );
                  })}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Top 3 Candidats
                  </Typography>
                  <Stack spacing={2}>
                    {categories.slice(0, 3).map((categorie, catIndex) => (
                      categorie.candidats.slice(0, 3).map((candidat, candIndex) => (
                        <Box 
                          key={`${candidat.id}-${catIndex}`}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#f8f9fa',
                          }}
                        >
                          <Avatar 
                            src={candidat.photo}
                            sx={{ width: 50, height: 50 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {candidat.nom_complet}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {categorie.nom} • {candidat.nombre_votes} votes
                            </Typography>
                          </Box>
                          <Chip 
                            label={`#${candIndex + 1}`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      ))
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      )}

      {/* Style pour le décompte */}
      <style jsx="true">{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .countdown-number {
          animation: pulse 1s infinite;
        }
      `}</style>
    </Container>
  );
};

export default Votes;