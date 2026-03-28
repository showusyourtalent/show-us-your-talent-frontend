import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
  Tooltip,
  Container,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  EmojiEvents as TrophyIcon,
  Numbers as NumbersIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Public as PublicIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
         ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const PALETTE = {
  GOLD: '#D4AF37',
  GOLD_LIGHT: '#FFD700',
  GOLD_DARK: '#B8860B',
  RED_DARK: '#8B0000',
  RED_LIGHT: '#C53030',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  CHART_COLORS: ['#D4AF37', '#8B0000', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
};

const VoteDetailsPage = () => {
  const { candidatureId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // Fetch vote details
  const { data: voteData, isLoading, error, refetch } = useQuery({
    queryKey: ['vote-details', candidatureId],
    queryFn: async () => {
      const response = await axios.get(`/votes/details/${candidatureId}`);
      return response.data.data;
    },
    retry: 2,
  });

  // Fetch vote statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['vote-statistics', candidatureId],
    queryFn: async () => {
      const response = await axios.get(`/votes/statistiques/${candidatureId}`);
      return response.data.data;
    },
    enabled: !!voteData,
  });

  // Fetch category ranking
  const { data: rankingData, isLoading: rankingLoading } = useQuery({
    queryKey: ['category-ranking', voteData?.candidature?.category_id],
    queryFn: async () => {
      const response = await axios.get(`/votes/categorie/${voteData.candidature.category_id}`);
      return response.data.data;
    },
    enabled: !!voteData?.candidature?.category_id,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Votes de ${voteData?.candidature?.titre}`,
        text: `Découvrez les votes de ${voteData?.candidature?.titre} sur Show Your Talent!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier!');
    }
  };

  const handleExport = () => {
    // Logique d'export des données
    const dataToExport = {
      candidature: voteData?.candidature,
      votes: voteData?.votes,
      statistics: statsData,
      ranking: rankingData,
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `votes-${candidatureId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} sx={{ color: PALETTE.GOLD }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Erreur lors du chargement des données de votes
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Retour
        </Button>
      </Container>
    );
  }

  if (!voteData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Aucune donnée de vote disponible
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Retour
        </Button>
      </Container>
    );
  }

  const { candidature, votes, statistiques } = voteData;
  const { total_votes, moyenne_note, votes_jour, votes_semaine, distribution_notes } = statistiques || {};

  // Préparer les données pour les graphiques
  const dailyVotes = statsData?.statistics?.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    votes: item.votes_count,
    note: item.avg_note || 0,
  })) || [];

  const hourlyDistribution = statsData?.hourly_distribution?.map(item => ({
    hour: `${item.hour}h`,
    votes: item.votes_count,
  })) || [];

  const noteDistribution = Object.entries(distribution_notes || {}).map(([note, count]) => ({
    note: `${note} étoiles`,
    count: count,
    value: count,
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ color: PALETTE.GOLD }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: PALETTE.RED_DARK }}>
              Détails des Votes
            </Typography>
            <Typography variant="h6" sx={{ color: PALETTE.GOLD_DARK }}>
              {candidature.titre} • {candidature.edition?.nom}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Partager">
              <IconButton onClick={handleShare} sx={{ color: PALETTE.INFO }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter les données">
              <IconButton onClick={handleExport} sx={{ color: PALETTE.SUCCESS }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={() => refetch()} sx={{ color: PALETTE.GOLD }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${PALETTE.GOLD} 0%, ${PALETTE.GOLD_DARK} 100%)`, color: 'white' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <NumbersIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{total_votes || 0}</Typography>
                    <Typography variant="body2">Votes totaux</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${PALETTE.SUCCESS} 0%, #047857 100%)`, color: 'white' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <StarIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{moyenne_note?.toFixed(1) || '0.0'}</Typography>
                    <Typography variant="body2">Note moyenne</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${PALETTE.INFO} 0%, #1D4ED8 100%)`, color: 'white' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{votes_jour || 0}</Typography>
                    <Typography variant="body2">Votes aujourd'hui</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${PALETTE.WARNING} 0%, #D97706 100%)`, color: 'white' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUpIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{votes_semaine || 0}</Typography>
                    <Typography variant="body2">Cette semaine</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 'bold',
              color: PALETTE.BROWN,
              '&.Mui-selected': {
                color: PALETTE.RED_DARK,
              },
            },
          }}
        >
          <Tab label="Graphiques" icon={<BarChartIcon />} />
          <Tab label="Liste des votes" icon={<PeopleIcon />} />
          <Tab label="Classement" icon={<TrophyIcon />} />
          <Tab label="Statistiques" icon={<TrendingUpIcon />} />
        </Tabs>

        <CardContent>
          {/* Tab 1: Graphiques */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution des votes (30 derniers jours)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyVotes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="votes" 
                          stroke={PALETTE.GOLD} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Distribution des notes
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={noteDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ note, percent }) => `${note}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {noteDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PALETTE.CHART_COLORS[index % PALETTE.CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Votes par heure de la journée
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <ChartTooltip />
                        <Bar dataKey="votes" fill={PALETTE.INFO} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Comparaison avec la catégorie
                  </Typography>
                  {rankingData ? (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Position dans la catégorie
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" color={PALETTE.GOLD}>
                          #{statsData?.rank_in_category?.rank || 'N/A'}
                          <Typography component="span" variant="body2" color="text.secondary">
                            /{statsData?.rank_in_category?.total_in_category || 'N/A'}
                          </Typography>
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={statsData?.rank_in_category?.percentage || 0}
                          sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        />
                      </Box>
                      
                      <Divider />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Top 5 de la catégorie
                      </Typography>
                      <List>
                        {rankingData?.statistiques?.top_candidatures?.map((cand, index) => (
                          <ListItem 
                            key={cand.id}
                            secondaryAction={
                              <Chip 
                                label={`${cand.nombre_votes} votes`}
                                size="small"
                                color={index === 0 ? 'warning' : 'default'}
                              />
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: index < 3 ? PALETTE.CHART_COLORS[index] : 'grey.400' }}>
                                {index + 1}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={cand.titre}
                              secondary={`${cand.user?.prenoms} ${cand.user?.nom}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Stack>
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Liste des votes */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Liste des votes ({votes?.total || 0})
                </Typography>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Votant</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Heure</TableCell>
                        <TableCell>IP</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {votes?.data?.map((vote) => (
                        <TableRow key={vote.id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar 
                                src={vote.user?.photo_url} 
                                sx={{ width: 32, height: 32 }}
                              >
                                {vote.user?.prenoms?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {vote.user?.prenoms} {vote.user?.nom}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              {[...Array(5)].map((_, i) => (
                                i < vote.note ? (
                                  <StarIcon key={i} sx={{ color: PALETTE.GOLD, fontSize: 16 }} />
                                ) : (
                                  <StarBorderIcon key={i} sx={{ color: 'grey.300', fontSize: 16 }} />
                                )
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {new Date(vote.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {new Date(vote.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {vote.ip_address}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Classement */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Classement dans la catégorie
                  </Typography>
                  {rankingData ? (
                    <>
                      <Box sx={{ textAlign: 'center', my: 4 }}>
                        <Typography variant="h1" fontWeight="bold" color={PALETTE.GOLD}>
                          #{statsData?.rank_in_category?.rank || 'N/A'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          sur {statsData?.rank_in_category?.total_in_category || 0} candidats
                        </Typography>
                        <Chip 
                          label={`Top ${statsData?.rank_in_category?.percentage?.toFixed(1) || 0}%`}
                          color="success"
                          sx={{ mt: 2 }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Statistiques de la catégorie
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color={PALETTE.INFO}>
                              {rankingData.statistiques?.total_votes_categorie || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Votes totaux catégorie
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h4" fontWeight="bold" color={PALETTE.SUCCESS}>
                              {rankingData.statistiques?.moyenne_votes?.toFixed(1) || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Moyenne votes/candidat
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top 10 de la catégorie
                  </Typography>
                  {rankingData ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Position</TableCell>
                            <TableCell>Candidat</TableCell>
                            <TableCell align="right">Votes</TableCell>
                            <TableCell align="right">Différence</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rankingData?.candidatures?.data?.slice(0, 10).map((cand, index) => (
                            <TableRow 
                              key={cand.id}
                              sx={{ 
                                bgcolor: cand.id === candidature.id ? `${PALETTE.GOLD}10` : 'transparent',
                                borderLeft: cand.id === candidature.id ? `4px solid ${PALETTE.GOLD}` : 'none'
                              }}
                            >
                              <TableCell>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: index < 3 ? PALETTE.CHART_COLORS[index] : 'grey.400',
                                    width: 32,
                                    height: 32
                                  }}
                                >
                                  {index + 1}
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {cand.titre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {cand.user?.prenoms} {cand.user?.nom}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" fontWeight="bold">
                                  {cand.nombre_votes}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {cand.id === candidature.id ? (
                                  <Chip label="VOUS" size="small" color="primary" />
                                ) : (
                                  <Typography 
                                    variant="body2" 
                                    color={cand.nombre_votes > candidature.nombre_votes ? 'error' : 'success'}
                                  >
                                    {Math.abs(cand.nombre_votes - candidature.nombre_votes)}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Statistiques avancées */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={4}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performances
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Taux de croissance quotidien
                      </Typography>
                      <Typography variant="h4" color={PALETTE.SUCCESS}>
                        +{votes_jour || 0}%
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Meilleur jour
                      </Typography>
                      <Typography variant="h4" color={PALETTE.GOLD}>
                        {Math.max(...(dailyVotes.map(d => d.votes) || [0]))} votes
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Heure de pointe
                      </Typography>
                      <Typography variant="h4" color={PALETTE.INFO}>
                        {hourlyDistribution.reduce((max, item) => 
                          item.votes > max.votes ? item : max, 
                          { hour: 'N/A', votes: 0 }
                        ).hour}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              
              <Grid item xs={12} lg={8}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Analyse détaillée
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Sources des votes
                        </Typography>
                        <Box sx={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Réseaux sociaux', value: 45 },
                                  { name: 'Site web', value: 30 },
                                  { name: 'Partage direct', value: 15 },
                                  { name: 'Autre', value: 10 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill={PALETTE.INFO} />
                                <Cell fill={PALETTE.SUCCESS} />
                                <Cell fill={PALETTE.GOLD} />
                                <Cell fill={PALETTE.WARNING} />
                              </Pie>
                              <ChartTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Engagement
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Taux de rétention
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={85}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="h4" color={PALETTE.SUCCESS}>
                              85%
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Nouveaux votants
                            </Typography>
                            <Typography variant="h4" color={PALETTE.INFO}>
                              {statsData?.unique_voters || 0}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Score d'engagement
                            </Typography>
                            <Typography variant="h4" color={PALETTE.GOLD}>
                              92/100
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VoteDetailsPage;