import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  LinearProgress,
  Tooltip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Zoom,
  Slide,
  Collapse,
  CircularProgress,
  CardMedia,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Mail as MailIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  AccessTime as TimeIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  LocationOn as LocationIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as TransgenderIcon,
  Download as DownloadCloudIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ==================== COMPOSANT PRINCIPAL ====================
const ValidationCandidatures = () => {
  const { editionId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const queryClient = useQueryClient();
  
  // États
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterCategory, setFilterCategory] = useState('tous');
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [validationComment, setValidationComment] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [validationStatus, setValidationStatus] = useState('');

  // ==================== QUERIES ====================
  // Récupérer les candidatures avec pagination
  const {
    data: candidaturesData,
    isLoading: isLoadingCandidatures,
    error: errorCandidatures,
    refetch: refetchCandidatures,
  } = useQuery({
    queryKey: ['candidatures', editionId, page, rowsPerPage, searchTerm, filterStatus, filterCategory],
    queryFn: async () => {
      try {
        if (!editionId) {
          console.error('editionId est undefined');
          throw new Error('ID de l\'édition manquant');
        }

        const params = {
          page: page + 1,
          per_page: rowsPerPage,
        };
        
        if (searchTerm) params.search = searchTerm;
        if (filterStatus && filterStatus !== 'tous') params.statut = filterStatus;
        if (filterCategory && filterCategory !== 'tous') params.category_id = filterCategory;
        
        console.log('Requête API avec params:', params);
        const response = await axiosInstance.get(`/promoteur/editions/${editionId}/candidatures`, { params });
        
        console.log('Réponse API:', response.data);
        
        // Structure de la réponse Laravel avec pagination
        return {
          candidatures: response.data?.data || [],
          meta: response.data?.meta || {
            total: response.data?.total || response.data?.length || 0,
            current_page: page + 1,
            per_page: rowsPerPage,
            last_page: Math.ceil((response.data?.total || response.data?.length || 0) / rowsPerPage)
          }
        };
      } catch (error) {
        console.error('Erreur chargement candidatures:', error);
        if (error.response?.status === 404) {
          throw new Error('Édition non trouvée');
        }
        throw new Error('Impossible de charger les candidatures');
      }
    },
    enabled: !!editionId,
  });

  const candidatures = candidaturesData?.candidatures || [];
  const paginationMeta = candidaturesData?.meta;

  // Récupérer les détails de l'édition
  const {
    data: edition,
    isLoading: isLoadingEdition,
  } = useQuery({
    queryKey: ['edition', editionId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/editions/${editionId}`);
        return response.data?.data || response.data;
      } catch (error) {
        console.error('Erreur chargement édition:', error);
        return null;
      }
    },
    enabled: !!editionId,
  });

  // Récupérer les catégories pour les filtres
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories', editionId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/editions/${editionId}/categories`);
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
        return [];
      }
    },
    enabled: !!editionId,
  });

  // ==================== MUTATIONS ====================
  const validationMutation = useMutation({
    mutationFn: async ({ candidatureId, statut, motif_refus }) => {
      const response = await axiosInstance.post(
        `/promoteur/candidatures/${candidatureId}/valider`,
        { 
          statut,
          motif_refus: statut === 'refusee' ? motif_refus : null 
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Candidature ${variables.statut === 'validee' ? 'validée' : 'refusée'} avec succès !`);
      queryClient.invalidateQueries(['candidatures', editionId]);
      setOpenValidationDialog(false);
      setValidationComment('');
      setSelectedCandidature(null);
      setValidationStatus('');
      
      setSnackbar({
        open: true,
        message: `Candidature ${variables.statut === 'validee' ? 'validée' : 'refusée'} avec succès`,
        severity: 'success',
      });
    },
    onError: (error) => {
      console.error('Erreur validation:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erreur lors de la validation';
      toast.error(errorMessage);
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    },
  });

  // ==================== FONCTIONS ====================
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (candidature) => {
    setSelectedCandidature(candidature);
    setOpenDialog(true);
  };

  const handleOpenValidation = (candidature, statut) => {
    setSelectedCandidature(candidature);
    setValidationStatus(statut);
    setValidationComment('');
    setOpenValidationDialog(true);
  };

  const handleValidate = () => {
    if (!selectedCandidature || !validationStatus) return;
    
    validationMutation.mutate({
      candidatureId: selectedCandidature.id,
      statut: validationStatus,
      motif_refus: validationComment,
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidature(null);
  };

  const handleCloseValidationDialog = () => {
    setOpenValidationDialog(false);
    setValidationComment('');
    setSelectedCandidature(null);
    setValidationStatus('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleRowExpand = (candidatureId) => {
    setExpandedRow(expandedRow === candidatureId ? null : candidatureId);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('tous');
    setFilterCategory('tous');
    setPage(0);
  };

  const handleExportCSV = () => {
    try {
      const csvData = candidatures.map(c => {
        const candidat = c.candidat || {};
        const category = c.category || {};
        
        return {
          'ID': c.id,
          'Nom': candidat.nom || '',
          'Prénoms': candidat.prenoms || '',
          'Email': candidat.email || '',
          'Téléphone': candidat.telephone || '',
          'Statut': c.statut || '',
          'Catégorie': category.nom || 'Non spécifiée',
          'Date d\'inscription': c.created_at ? format(new Date(c.created_at), 'dd/MM/yyyy HH:mm') : '',
          'Motif refus': c.motif_refus || '',
          'Validé par': c.valide_par || '',
          'Date validation': c.valide_le ? format(new Date(c.valide_le), 'dd/MM/yyyy HH:mm') : '',
        };
      });

      if (csvData.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      const csvHeaders = Object.keys(csvData[0]).join(';');
      const csvRows = csvData.map(row => Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(';')).join('\n');
      
      const csvContent = `${csvHeaders}\n${csvRows}`;
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `candidatures_${edition?.nom || 'edition'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      
      toast.success('Export CSV généré avec succès');
    } catch (error) {
      console.error('Erreur export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  // ==================== FONCTIONS UTILITAIRES ====================
  const getCandidatInfo = (candidature) => {
    if (!candidature.candidat) {
      console.warn('Candidat manquant dans la candidature:', candidature);
      return {
        nom: 'Inconnu',
        prenoms: '',
        email: '',
        telephone: '',
        date_naissance: '',
        sexe: '',
        universite: '',
        filiere: '',
        annee_etude: '',
        origine: '',
        ethnie: '',
        photo_url: null,
      };
    }
    
    return {
      nom: candidature.candidat.nom || '',
      prenoms: candidature.candidat.prenoms || '',
      email: candidature.candidat.email || '',
      telephone: candidature.candidat.telephone || '',
      date_naissance: candidature.candidat.date_naissance || '',
      sexe: candidature.candidat.sexe || '',
      universite: candidature.candidat.universite || '',
      filiere: candidature.candidat.filiere || '',
      annee_etude: candidature.candidat.annee_etude || '',
      origine: candidature.candidat.origine || '',
      ethnie: candidature.candidat.ethnie || '',
      photo_url: candidature.candidat.photo_url || null,
      video_url: candidature.video_url || null,
      description_talent: candidature.description_talent || '',
    };
  };

  const getCategoryInfo = (candidature) => {
    return candidature.category || { nom: 'Non spécifiée' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validee': return 'success';
      case 'refusee': return 'error';
      case 'en_attente': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'validee': return 'Validée';
      case 'refusee': return 'Refusée';
      case 'en_attente': return 'En attente';
      default: return status || 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validee': return <CheckCircleIcon fontSize="small" />;
      case 'refusee': return <CancelIcon fontSize="small" />;
      case 'en_attente': return <TimeIcon fontSize="small" />;
      default: return null;
    }
  };

  const getSexeIcon = (sexe) => {
    switch (sexe) {
      case 'M': return <MaleIcon sx={{ fontSize: 16, color: '#1976d2' }} />;
      case 'F': return <FemaleIcon sx={{ fontSize: 16, color: '#d81b60' }} />;
      default: return <TransgenderIcon sx={{ fontSize: 16, color: '#7b1fa2' }} />;
    }
  };

  const getSexeText = (sexe) => {
    switch (sexe) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      case 'Autre': return 'Autre';
      default: return sexe || 'Non spécifié';
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderCandidatureRow = (candidature) => {
    const isExpanded = expandedRow === candidature.id;
    const candidat = getCandidatInfo(candidature);
    const category = getCategoryInfo(candidature);
    
    return (
      <React.Fragment key={candidature.id}>
        <TableRow hover>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={candidat.photo_url}
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {candidat.nom} {candidat.prenoms}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {candidat.email}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  📞 {candidat.telephone}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          
          <TableCell>
            <Chip
              label={getStatusText(candidature.statut)}
              color={getStatusColor(candidature.statut)}
              size="small"
              icon={getStatusIcon(candidature.statut)}
              sx={{ 
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            />
          </TableCell>
          
          <TableCell>
            <Typography variant="body2">
              {category.nom}
            </Typography>
          </TableCell>
          
          <TableCell>
            <Typography variant="body2">
              {candidature.created_at ? 
                format(new Date(candidature.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : 
                'Date inconnue'}
            </Typography>
          </TableCell>
          
          <TableCell align="right">
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Voir les détails">
                <IconButton
                  size="small"
                  onClick={() => handleViewDetails(candidature)}
                  sx={{
                    color: theme.palette.primary.main,
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Plus d'options">
                <IconButton
                  size="small"
                  onClick={() => toggleRowExpand(candidature.id)}
                  sx={{
                    color: 'text.secondary',
                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </TableCell>
        </TableRow>
        
        <TableRow>
          <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ 
                p: 3, 
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                      Informations personnelles
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Nom complet:</strong> {candidat.nom} {candidat.prenoms}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Email:</strong> {candidat.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Téléphone:</strong> {candidat.telephone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getSexeIcon(candidat.sexe)}
                        <Typography variant="body2">
                          <strong>Sexe:</strong> {getSexeText(candidat.sexe)}
                        </Typography>
                      </Box>
                      {candidat.date_naissance && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            <strong>Date de naissance:</strong> {format(new Date(candidat.date_naissance), 'dd/MM/yyyy', { locale: fr })}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                      Informations académiques
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Université:</strong> {candidat.universite}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Filière:</strong> {candidat.filiere}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Année d'étude:</strong> {candidat.annee_etude}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Origine:</strong> {candidat.origine}
                        </Typography>
                      </Box>
                      {candidat.ethnie && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            <strong>Ethnie:</strong> {candidat.ethnie}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                      Présentation du talent
                    </Typography>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" paragraph>
                        {candidat.description_talent || 'Aucune description fournie'}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        {candidat.video_url && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VideoIcon />}
                            onClick={() => window.open(candidat.video_url, '_blank')}
                          >
                            Voir la vidéo
                          </Button>
                        )}
                        {candidat.photo_url && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadCloudIcon />}
                            onClick={() => downloadFile(candidat.photo_url, `photo_${candidat.nom}_${candidat.prenoms}.jpg`)}
                          >
                            Télécharger la photo
                          </Button>
                        )}
                      </Stack>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleOpenValidation(candidature, 'validee')}
                        disabled={candidature.statut === 'validee'}
                      >
                        Valider
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleOpenValidation(candidature, 'refusee')}
                        disabled={candidature.statut === 'refusee'}
                      >
                        Refuser
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<MailIcon />}
                        onClick={() => window.location.href = `mailto:${candidat.email}`}
                      >
                        Contacter
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  const renderMobileCard = (candidature) => {
    const candidat = getCandidatInfo(candidature);
    const category = getCategoryInfo(candidature);
    
    return (
      <Card 
        key={candidature.id} 
        sx={{ 
          mb: 2,
          borderLeft: `4px solid ${
            candidature.statut === 'validee' ? theme.palette.success.main :
            candidature.statut === 'refusee' ? theme.palette.error.main :
            theme.palette.warning.main
          }`
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={candidat.photo_url}
                sx={{ 
                  width: 48, 
                  height: 48,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {candidat.nom} {candidat.prenoms}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {candidat.email}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  📞 {candidat.telephone}
                </Typography>
              </Box>
            </Box>
            
            <Chip
              label={getStatusText(candidature.statut)}
              color={getStatusColor(candidature.statut)}
              size="small"
              icon={getStatusIcon(candidature.statut)}
            />
          </Box>
          
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Catégorie
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {category.nom}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {candidature.created_at ? 
                  format(new Date(candidature.created_at), 'dd/MM/yyyy') : 
                  'Date inconnue'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Université
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {candidat.universite}
              </Typography>
            </Grid>
          </Grid>
          
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewDetails(candidature)}
              fullWidth
            >
              Détails
            </Button>
            <Button
              variant="contained"
              size="small"
              color={candidature.statut === 'en_attente' ? 'primary' : 'success'}
              startIcon={candidature.statut === 'en_attente' ? <ThumbUpIcon /> : <CheckCircleIcon />}
              onClick={() => handleOpenValidation(candidature, 'validee')}
              disabled={candidature.statut === 'validee'}
              fullWidth
            >
              {candidature.statut === 'en_attente' ? 'Valider' : 'Validée'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Calculer les statistiques
  const stats = {
    total: paginationMeta?.total || candidatures.length,
    en_attente: candidatures.filter(c => c.statut === 'en_attente').length,
    validee: candidatures.filter(c => c.statut === 'validee').length,
    refusee: candidatures.filter(c => c.statut === 'refusee').length,
  };

  // ==================== RENDER PRINCIPAL ====================
  if (!editionId) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          ID de l'édition manquant dans l'URL
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Container>
    );
  }

  if (isLoadingCandidatures || isLoadingEdition) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (errorCandidatures) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorCandidatures.message}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => refetchCandidatures()}
        >
          Réessayer
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
      {/* Snackbar pour notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            color: 'white',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  <GroupIcon sx={{ verticalAlign: 'middle', mr: 2, fontSize: 32 }} />
                  Validation des Candidatures
                </Typography>
                <Typography variant="h5" component="h2" sx={{ opacity: 0.9 }}>
                  {edition?.nom || 'Édition'} • {stats.total} candidatures
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Gérez et validez les candidatures pour cette édition
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={() => refetchCandidatures()}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                Actualiser
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { 
              label: 'Total', 
              value: stats.total, 
              icon: <GroupIcon />, 
              color: theme.palette.primary.main,
              bgColor: alpha(theme.palette.primary.main, 0.1)
            },
            { 
              label: 'En attente', 
              value: stats.en_attente, 
              icon: <TimeIcon />, 
              color: theme.palette.warning.main,
              bgColor: alpha(theme.palette.warning.main, 0.1)
            },
            { 
              label: 'Validées', 
              value: stats.validee, 
              icon: <CheckCircleIcon />, 
              color: theme.palette.success.main,
              bgColor: alpha(theme.palette.success.main, 0.1)
            },
            { 
              label: 'Refusées', 
              value: stats.refusee, 
              icon: <CancelIcon />, 
              color: theme.palette.error.main,
              bgColor: alpha(theme.palette.error.main, 0.1)
            },
          ].map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Card sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                backgroundColor: stat.bgColor,
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 1
                }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: '50%',
                    backgroundColor: alpha(stat.color, 0.2),
                    color: stat.color,
                    mr: 1
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Barre de recherche et filtres */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Statut"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="tous">Tous les statuts</MenuItem>
                    <MenuItem value="en_attente">En attente</MenuItem>
                    <MenuItem value="validee">Validées</MenuItem>
                    <MenuItem value="refusee">Refusées</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Catégorie"
                    onChange={(e) => setFilterCategory(e.target.value)}
                    disabled={isLoadingCategories}
                  >
                    <MenuItem value="tous">Toutes catégories</MenuItem>
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id.toString()}>
                        {category.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Effacer
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    color: 'white'
                  }}
                >
                  Exporter
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Liste des candidatures */}
      {isMobile ? (
        <Box>
          {isLoadingCandidatures ? (
            <LinearProgress />
          ) : candidatures.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Aucune candidature trouvée
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                {searchTerm || filterStatus !== 'tous' || filterCategory !== 'tous' 
                  ? 'Aucune candidature ne correspond à vos critères de recherche.'
                  : 'Aucune candidature n\'a été soumise pour cette édition.'}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Effacer les filtres
              </Button>
            </Paper>
          ) : (
            <>
              {candidatures.map(renderMobileCard)}
              {paginationMeta && (
                <TablePagination
                  component="div"
                  count={paginationMeta.total || candidatures.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage="Lignes par page:"
                />
              )}
            </>
          )}
        </Box>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {isLoadingCandidatures ? (
            <LinearProgress />
          ) : candidatures.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <GroupIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Aucune candidature trouvée
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 400, mx: 'auto' }}>
                {searchTerm || filterStatus !== 'tous' || filterCategory !== 'tous' 
                  ? 'Aucune candidature ne correspond à vos critères de recherche.'
                  : 'Aucune candidature n\'a été soumise pour cette édition.'}
              </Typography>
              <Button
                variant="contained"
                onClick={handleClearFilters}
                startIcon={<RefreshIcon />}
              >
                {searchTerm || filterStatus !== 'tous' || filterCategory !== 'tous' 
                  ? 'Effacer les filtres' 
                  : 'Actualiser'}
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Candidat</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Catégorie</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date d'inscription</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidatures.map(renderCandidatureRow)}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {paginationMeta && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={paginationMeta.total || candidatures.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
              )}
            </>
          )}
        </Paper>
      )}

      {/* Dialog de détail */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedCandidature && (() => {
          const candidat = getCandidatInfo(selectedCandidature);
          const category = getCategoryInfo(selectedCandidature);
          
          return (
            <>
              <DialogTitle sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={candidat.photo_url}
                    sx={{ 
                      width: 48, 
                      height: 48,
                      border: '3px solid white'
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {candidat.nom} {candidat.prenoms}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {candidat.email} • 📞 {candidat.telephone}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getStatusText(selectedCandidature.statut)}
                  color={getStatusColor(selectedCandidature.statut)}
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    fontWeight: 600
                  }}
                  variant="outlined"
                />
              </DialogTitle>
              
              <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Photo et vidéo */}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {candidat.photo_url && (
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={candidat.photo_url}
                              sx={{ 
                                width: 120, 
                                height: 120,
                                border: '3px solid #D4AF37'
                              }}
                            />
                            <Button
                              size="small"
                              startIcon={<DownloadCloudIcon />}
                              onClick={() => downloadFile(candidat.photo_url, `photo_${candidat.nom}_${candidat.prenoms}.jpg`)}
                              sx={{ position: 'absolute', bottom: 0, right: 0 }}
                            >
                              Télécharger
                            </Button>
                          </Box>
                        )}
                        {candidat.video_url && (
                          <Box>
                            <Button
                              variant="contained"
                              startIcon={<VideoIcon />}
                              onClick={() => window.open(candidat.video_url, '_blank')}
                              sx={{ 
                                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                                color: 'white'
                              }}
                            >
                              Voir la vidéo de présentation
                            </Button>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    
                    {/* Informations personnelles */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                        <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Informations personnelles
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Nom complet
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {candidat.nom} {candidat.prenoms}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {candidat.email}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Téléphone
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {candidat.telephone}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Sexe
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getSexeIcon(candidat.sexe)}
                            {getSexeText(candidat.sexe)}
                          </Typography>
                        </Box>
                        {candidat.date_naissance && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Date de naissance
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {format(new Date(candidat.date_naissance), 'dd MMMM yyyy', { locale: fr })}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    
                    {/* Informations académiques */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                        <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Informations académiques
                      </Typography>
                      <Stack spacing={2}>
                        {candidat.universite && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Université/École
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {candidat.universite}
                            </Typography>
                          </Box>
                        )}
                        {candidat.filiere && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Filière
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {candidat.filiere}
                            </Typography>
                          </Box>
                        )}
                        {candidat.annee_etude && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Année d'étude
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {candidat.annee_etude}
                            </Typography>
                          </Box>
                        )}
                        {candidat.origine && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Origine
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {candidat.origine}
                            </Typography>
                          </Box>
                        )}
                        {candidat.ethnie && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Ethnie
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {candidat.ethnie}
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Catégorie
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {category.nom}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    
                    {/* Description du talent */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                        <StarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Présentation du talent
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                        <Typography variant="body1" paragraph>
                          {candidat.description_talent || 'Aucune description fournie'}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    {/* Informations de validation */}
                    {selectedCandidature.valide_le && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                          <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Informations de validation
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Date de validation
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {format(new Date(selectedCandidature.valide_le), 'dd/MM/yyyy HH:mm', { locale: fr })}
                              </Typography>
                            </Paper>
                          </Grid>
                          {selectedCandidature.motif_refus && (
                            <Grid item xs={12}>
                              <Paper variant="outlined" sx={{ p: 2, backgroundColor: alpha(theme.palette.error.main, 0.05) }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  Motif du refus
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                  {selectedCandidature.motif_refus}
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </DialogContent>
              
              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseDialog}
                >
                  Fermer
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => {
                    handleCloseDialog();
                    handleOpenValidation(selectedCandidature, 'validee');
                  }}
                  disabled={selectedCandidature.statut === 'validee'}
                >
                  Valider
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ThumbDownIcon />}
                  onClick={() => {
                    handleCloseDialog();
                    handleOpenValidation(selectedCandidature, 'refusee');
                  }}
                  disabled={selectedCandidature.statut === 'refusee'}
                >
                  Refuser
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MailIcon />}
                  onClick={() => window.location.href = `mailto:${candidat.email}`}
                >
                  Contacter
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* Dialog de validation */}
      <Dialog
        open={openValidationDialog}
        onClose={handleCloseValidationDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedCandidature && (() => {
          const candidat = getCandidatInfo(selectedCandidature);
          const isRefusing = validationStatus === 'refusee';
          
          return (
            <>
              <DialogTitle sx={{ 
                backgroundColor: isRefusing ? 
                               alpha(theme.palette.error.main, 0.1) : 
                               alpha(theme.palette.success.main, 0.1),
                color: isRefusing ? 
                      theme.palette.error.dark : 
                      theme.palette.success.dark,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                {isRefusing ? (
                  <>
                    <ThumbDownIcon />
                    Refuser la candidature
                  </>
                ) : (
                  <>
                    <ThumbUpIcon />
                    Valider la candidature
                  </>
                )}
              </DialogTitle>
              
              <DialogContent dividers sx={{ pt: 3 }}>
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Vous êtes sur le point de {isRefusing ? 'refuser' : 'valider'} la candidature de :
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                      {candidat.nom} {candidat.prenoms}
                    </Typography>
                    <Typography variant="body2">
                      {candidat.email} • 📞 {candidat.telephone}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Catégorie: {getCategoryInfo(selectedCandidature).nom}
                    </Typography>
                  </Alert>
                  
                  {isRefusing && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Motif du refus *"
                      placeholder="Expliquez pourquoi la candidature est refusée..."
                      value={validationComment}
                      onChange={(e) => setValidationComment(e.target.value)}
                      helperText="Ce motif sera visible par le candidat"
                      required
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  {isRefusing ? (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Attention :</strong> Refuser cette candidature enverra une notification au candidat.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Félicitations :</strong> Valider cette candidature permettra au candidat de participer à l'édition.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </DialogContent>
              
              <DialogActions sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseValidationDialog}
                  disabled={validationMutation.isLoading}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  color={isRefusing ? 'error' : 'success'}
                  onClick={handleValidate}
                  disabled={validationMutation.isLoading || (isRefusing && !validationComment.trim())}
                  startIcon={validationMutation.isLoading ? <CircularProgress size={20} /> : 
                           isRefusing ? <ThumbDownIcon /> : <ThumbUpIcon />}
                >
                  {validationMutation.isLoading ? 'Traitement...' : 
                   isRefusing ? 'Confirmer le refus' : 'Confirmer la validation'}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Container>
  );
};

export default ValidationCandidatures;