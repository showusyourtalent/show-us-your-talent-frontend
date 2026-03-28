import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  LinearProgress,
  Tabs,
  Tab,
  Pagination,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Paid as PaidIcon,
  EventAvailable as FreeIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  TrendingFlat as TrendFlatIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const VotesStats = ({ editionId, categoryId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  // Récupérer les statistiques de votes
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['votes-stats', editionId, categoryId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/candidat/votes/${editionId || ''}/${categoryId || ''}`);
        return response.data;
      } catch (error) {
        console.error('Erreur chargement stats votes:', error);
        return { success: false, data: [] };
      }
    },
    enabled: !!user,
  });

  // Récupérer le classement
  const { data: rankingData, isLoading: rankingLoading, refetch: refetchRanking } = useQuery({
    queryKey: ['votes-ranking', editionId, categoryId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/candidat/classement/${editionId || ''}/${categoryId || ''}`);
        return response.data;
      } catch (error) {
        console.error('Erreur chargement classement:', error);
        return { success: false, data: [] };
      }
    },
    enabled: !!user,
  });

  const votes = statsData?.data || [];
  const ranking = rankingData?.data || [];
  const userPosition = rankingData?.user_position;
  const pagination = statsData?.pagination;

  const stats = [
    {
      title: 'Total des votes',
      value: votes.reduce((sum, vote) => sum + 1, 0),
      icon: <TrendingIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Votes payants',
      value: votes.filter(v => v.is_paid).length,
      icon: <PaidIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Votes gratuits',
      value: votes.filter(v => !v.is_paid).length,
      icon: <FreeIcon />,
      color: theme.palette.info.main,
    },
    {
      title: 'Votes aujourd\'hui',
      value: votes.filter(v => {
        const voteDate = new Date(v.created_at);
        const today = new Date();
        return voteDate.toDateString() === today.toDateString();
      }).length,
      icon: <CalendarIcon />,
      color: theme.palette.warning.main,
    },
  ];

  const handleRefresh = () => {
    refetchStats();
    refetchRanking();
    toast.success('Statistiques rafraîchies !');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (statsLoading || rankingLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Chargement des statistiques...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Statistiques des votes
        </Typography>
        <Tooltip title="Rafraîchir">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistiques principales */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${stat.color}20`,
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Position dans le classement */}
      {userPosition && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: userPosition.position <= 3 ? 'gold' : 'primary.main',
                color: 'white',
                fontSize: 24,
                fontWeight: 'bold'
              }}>
                {userPosition.position}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Votre position dans le classement
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip 
                    label={`${userPosition.votes} votes`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={`Top ${Math.round((userPosition.position / rankingData.total_participants) * 100)}%`} 
                    color="secondary" 
                    size="small" 
                  />
                </Stack>
              </Box>
              {userPosition.position <= 3 && (
                <TrophyIcon sx={{ fontSize: 48, color: 'gold' }} />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Tabs pour les détails */}
      <Card sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Historique des votes" />
          <Tab label="Classement complet" />
          <Tab label="Évolution" />
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              {votes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Aucun vote reçu pour le moment
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Votant</TableCell>
                          <TableCell align="right">Montant</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {votes.map((vote) => (
                          <TableRow key={vote.id}>
                            <TableCell>{formatDate(vote.created_at)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={vote.is_paid ? 'Payant' : 'Gratuit'} 
                                size="small"
                                color={vote.is_paid ? 'success' : 'info'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar src={vote.votant?.photo_url} sx={{ width: 24, height: 24 }}>
                                  {vote.votant?.prenoms?.[0]}
                                </Avatar>
                                <Typography variant="body2">
                                  {vote.votant?.prenoms || 'Anonyme'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              {vote.is_paid ? `${vote.vote_price || 0} €` : 'Gratuit'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {pagination && pagination.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination 
                        count={pagination.last_page} 
                        page={page} 
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {ranking.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Aucun classement disponible
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="80">Position</TableCell>
                        <TableCell>Candidat</TableCell>
                        <TableCell align="right">Votes</TableCell>
                        <TableCell>Progression</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ranking.map((item) => (
                        <TableRow 
                          key={item.candidat_id}
                          sx={{ 
                            bgcolor: item.candidat_id === user?.id ? 'primary.light' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {item.position <= 3 && (
                                <TrophyIcon sx={{ 
                                  color: item.position === 1 ? 'gold' : 
                                         item.position === 2 ? 'silver' : 
                                         '#CD7F32' 
                                }} />
                              )}
                              <Typography fontWeight="bold">
                                {item.position}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={item.photo_url}>
                                {item.candidat_prenoms?.[0]}
                              </Avatar>
                              <Box>
                                <Typography fontWeight="medium">
                                  {item.candidat_prenoms} {item.candidat_nom}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.category}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="primary">
                              {item.votes}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(item.votes / Math.max(...ranking.map(r => r.votes))) * 100} 
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {Math.round((item.votes / Math.max(...ranking.map(r => r.votes))) * 100)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TimelineIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>
                Graphique d'évolution des votes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cette fonctionnalité sera disponible prochainement
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VotesStats;