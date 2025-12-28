import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  Typography,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme,
  alpha,
  Chip,
  Fade,
  Zoom,
  Slide,
  Collapse,
  Paper,
  Stack,
  Dialog,
  DialogContent,
  Divider,
  Grow,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  VideoLibrary as VideoIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  Category as CategoryIcon,
  CloudDone as CloudDoneIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  CheckCircle as CheckIcon,
  Description as DescriptionIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

// ==================== SCHEMA DE VALIDATION ====================
const schema = yup.object({
  nom: yup.string()
    .required('Nom requis')
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  
  prenoms: yup.string()
    .required('Prénoms requis')
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),
  
  email: yup.string()
    .email('Email invalide')
    .required('Email requis'),
  
  date_naissance: yup.string()
    .required('Date de naissance requise')
    .test('valid-date', 'Format de date invalide', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('age', 'Vous devez avoir au moins 10 ans', (value) => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 10;
      }
      return age >= 10;
    }),
  
  sexe: yup.string()
    .required('Sexe requis')
    .oneOf(['M', 'F'], 'Valeur invalide'),
  
  telephone: yup.string()
    .required('Téléphone requis')
    .matches(/^[0-9+\s]{8,20}$/, 'Numéro de téléphone invalide (8-20 chiffres)'),
  
  origine: yup.string()
    .required('Origine requise')
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),
  
  ethnie: yup.string()
    .nullable()
    .max(100, 'Maximum 100 caractères'),
  
  universite: yup.string()
    .required('Université requise')
    .min(2, 'Minimum 2 caractères')
    .max(200, 'Maximum 200 caractères'),
  
  filiere: yup.string()
    .required('Filière requise')
    .min(2, 'Minimum 2 caractères')
    .max(200, 'Maximum 200 caractères'),
  
  annee_etude: yup.string()
    .required('Année d\'étude requise')
    .oneOf(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat'], 'Valeur invalide'),
  
  edition_id: yup.number()
    .required('Édition requise')
    .typeError('Sélectionnez une édition'),
  
  category_id: yup.number()
    .required('Catégorie requise')
    .typeError('Sélectionnez une catégorie'),
  
  video_url: yup.string()
    .url('URL invalide')
    .required('Lien de la vidéo de présentation requis'),
  
  description_talent: yup.string()
    .nullable()
    .max(2000, 'Maximum 2000 caractères'),
});

// ==================== COMPOSANT PRINCIPAL ====================
const Postuler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ==================== FORM ====================
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    clearErrors,
    reset,
    getValues,
    formState: { errors: formErrors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nom: '',
      prenoms: '',
      email: '',
      date_naissance: '',
      sexe: '',
      telephone: '',
      origine: '',
      ethnie: '',
      universite: '',
      filiere: '',
      annee_etude: '',
      edition_id: '',
      category_id: '',
      video_url: '',
      description_talent: '',
    },
  });

  // Watched values
  const watchedEditionId = watch('edition_id');
  const watchedCategoryId = watch('category_id');
  const descriptionValue = watch('description_talent') || '';
  const videoUrlValue = watch('video_url');

  // ==================== STATES ====================
  const [activeStep, setActiveStep] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const formRef = useRef(null);

  // ==================== QUERIES OPTIMISÉES ====================
  const { 
    data: editionsData = [], 
    isLoading: editionsLoading,
    error: editionsError,
    isFetching: editionsFetching,
  } = useQuery({
    queryKey: ['editions-ouvertes'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/candidat/editions-ouvertes');
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erreur chargement éditions:', error);
        throw new Error('Impossible de charger les éditions. Veuillez réessayer.');
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    onSuccess: () => setIsInitialLoad(false),
    onError: () => setIsInitialLoad(false),
  });

  // Transformer les données d'éditions
  const editions = useMemo(() => {
    return Array.isArray(editionsData) ? editionsData.map(edition => ({
      id: edition.id || edition.value || edition._id,
      nom: edition.nom || edition.name || 'Édition sans nom',
      annee: edition.annee || edition.year || new Date().getFullYear(),
      numero_edition: edition.numero_edition || edition.edition_number || 1,
      description: edition.description || '',
      date_fin_inscriptions: edition.date_fin_inscriptions || edition.registration_end_date,
      date_debut_inscriptions: edition.date_debut_inscriptions || edition.registration_start_date,
      statut: edition.statut || edition.status || 'active',
      inscriptions_ouvertes: edition.inscriptions_ouvertes || edition.registrations_open || true,
    })) : [];
  }, [editionsData]);

  // Query pour les catégories
  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading,
    error: categoriesError,
    isFetching: categoriesFetching,
  } = useQuery({
    queryKey: ['categories', watchedEditionId],
    queryFn: async () => {
      if (!watchedEditionId) return [];
      try {
        const response = await axiosInstance.get(`/candidat/categories/${watchedEditionId}`);
        console.log('Catégories API response:', response.data);
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
        try {
          const fallbackResponse = await axiosInstance.get(`/categories/edition/${watchedEditionId}`);
          return fallbackResponse.data?.data || fallbackResponse.data || [];
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          return [];
        }
      }
    },
    enabled: !!watchedEditionId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Transformer les données de catégories
  const categories = useMemo(() => {
    if (categoriesLoading) return [];
    return Array.isArray(categoriesData) ? categoriesData.map(category => ({
      id: category.id || category.value || category._id,
      nom: category.nom || category.name || 'Catégorie sans nom',
      description: category.description || '',
      edition_id: category.edition_id || category.editionId,
      ordre_affichage: category.ordre_affichage || category.display_order || 0,
      active: category.active !== undefined ? category.active : true,
    })) : [];
  }, [categoriesData, categoriesLoading]);

  // ==================== MUTATION CORRIGÉE ====================
  const mutation = useMutation({
    mutationFn: async (formData) => {
      setIsSubmitting(true);
      setUploadProgress(0);
      
      try {
        console.log("Envoi de FormData au backend:");
        for (let [key, value] of formData.entries()) {
          console.log(key, ":", value instanceof File ? `Fichier: ${value.name} (${value.type}, ${value.size} octets)` : value);
        }

        const response = await axiosInstance.post('/candidat/postuler', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        });
        return response.data;
      } catch (error) {
        console.error("Erreur complète:", error);
        if (error.response?.data) {
          console.error("Données d'erreur:", error.response.data);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('🎉 Candidature soumise avec succès !');
      setTimeout(() => {
        navigate('/candidat/mes-candidatures', {
          state: { 
            success: true, 
            candidateId: data.data?.id,
            message: 'Votre candidature a été soumise avec succès.' 
          }
        });
      }, 1000);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      const errorData = error.response?.data;
      
      if (error.response?.status === 422 && errorData?.errors) {
        setErrors(errorData.errors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (error.response?.status === 500) {
        toast.error('Erreur serveur. Veuillez réessayer plus tard.');
        console.error("Erreur 500 backend:", errorData?.message || errorData?.error);
      } else if (error.response?.status === 413) {
        toast.error('Fichiers trop volumineux. La photo doit faire moins de 5MB.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Délai d\'attente dépassé. Vérifiez votre connexion.');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Erreur inconnue. Veuillez réessayer.');
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
      setUploadProgress(0);
    },
  });

  // ==================== FONCTIONS ====================
  const steps = useMemo(() => [
    { 
      label: 'Informations personnelles', 
      icon: <PersonIcon />, 
      fields: ['nom', 'prenoms', 'email', 'date_naissance', 'sexe', 'telephone'] 
    },
    { 
      label: 'Informations académiques', 
      icon: <SchoolIcon />, 
      fields: ['origine', 'ethnie', 'universite', 'filiere', 'annee_etude'] 
    },
    { 
      label: 'Choix de l\'édition', 
      icon: <TrophyIcon />, 
      fields: ['edition_id', 'category_id'] 
    },
    { 
      label: 'Présentation du talent', 
      icon: <VideoIcon />, 
      fields: ['video_url', 'description_talent'] 
    },
  ], []);

  const getCurrentEdition = useCallback(() => {
    return editions?.find(e => e.id === watchedEditionId);
  }, [editions, watchedEditionId]);

  const getCurrentCategory = useCallback(() => {
    return categories?.find(c => c.id === watchedCategoryId);
  }, [categories, watchedCategoryId]);

  const getStepError = useCallback(() => {
    const currentStepFields = steps[activeStep]?.fields || [];
    return currentStepFields.some(field => formErrors[field]);
  }, [activeStep, steps, formErrors]);

  // ==================== EFFECTS ====================
  // Animation d'entrée
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Pré-remplir l'édition depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editionId = params.get('edition');
    if (editionId && editions.length > 0 && !watchedEditionId) {
      const editionIdNum = parseInt(editionId);
      const edition = editions.find(e => e.id === editionIdNum);
      if (edition) {
        setValue('edition_id', edition.id, { shouldValidate: true });
      }
    }
  }, [location.search, editions, watchedEditionId, setValue]);

  // Reset category quand l'édition change
  useEffect(() => {
    if (watchedEditionId && getValues('category_id')) {
      setValue('category_id', '', { shouldValidate: false });
    }
  }, [watchedEditionId, setValue, getValues]);

  // ==================== HANDLERS ====================
  const handleNext = useCallback(async () => {
    const currentStepFields = steps[activeStep]?.fields || [];
    if (currentStepFields.length === 0) {
      setActiveStep(prev => prev + 1);
      return;
    }

    const isValid = await trigger(currentStepFields);
    if (isValid) {
      setActiveStep(prev => prev + 1);
      clearErrors();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Veuillez remplir correctement tous les champs avant de continuer');
    }
  }, [activeStep, steps, trigger, clearErrors]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm('Voulez-vous vraiment quitter ? Les modifications non enregistrées seront perdues.')) {
      return;
    }
    setDialogOpen(false);
    setTimeout(() => navigate('/'), 300);
  }, [isDirty, navigate]);

  const handlePhotoUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const removePhoto = useCallback((e) => {
    e?.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const onSubmit = useCallback(async (data) => {
    // Validation finale
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Veuillez corriger les erreurs avant de soumettre');
      return;
    }

    // Vérification photo
    if (!photoFile) {
      toast.error('La photo de profil est requise');
      return;
    }

    setUploadProgress(0);
    setErrors({});
    
    const formData = new FormData();
    
    // Ajouter tous les champs texte
    Object.keys(data).forEach(key => {
      if (key !== 'videoFile' && data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    // Ajouter la photo
    formData.append('photo', photoFile);

    console.log("FormData prêt à être envoyé:");
    console.log("Données:", data);
    console.log("Photo:", photoFile?.name);

    mutation.mutate(formData);
  }, [photoFile, trigger, mutation]);

  // ==================== RENDER FUNCTIONS ====================
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#8B0000',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}>
                <PersonIcon /> Informations personnelles
              </Typography>
              
              <Grid container spacing={isMobile ? 2 : 3}>
                {/* Photo Upload */}
                <Grid item xs={12} md={4}>
                  <Grow in timeout={600}>
                    <Card sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: photoPreview ? '#10B981' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#D4AF37',
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 2, 
                          fontWeight: 600,
                          textAlign: 'center',
                          color: 'text.primary'
                        }}>
                          Photo de profil *
                        </Typography>
                        
                        <Box
                          sx={{
                            border: '2px dashed',
                            borderColor: photoPreview ? '#10B981' : alpha(theme.palette.primary.main, 0.3),
                            borderRadius: 2,
                            p: isMobile ? 2 : 3,
                            position: 'relative',
                            cursor: 'pointer',
                            minHeight: isMobile ? 160 : 200,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#D4AF37',
                              backgroundColor: alpha('#D4AF37', 0.02),
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                          />
                          
                          {photoPreview ? (
                            <>
                              <Avatar
                                src={photoPreview}
                                sx={{
                                  width: isMobile ? 100 : 120,
                                  height: isMobile ? 100 : 120,
                                  mb: 2,
                                  border: '3px solid #D4AF37',
                                  boxShadow: 1,
                                }}
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={removePhoto}
                                startIcon={<DeleteIcon />}
                                sx={{ 
                                  borderRadius: 1,
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                Changer
                              </Button>
                            </>
                          ) : (
                            <>
                              <CameraIcon sx={{ 
                                fontSize: isMobile ? 40 : 48, 
                                color: alpha(theme.palette.text.secondary, 0.5),
                                mb: 2 
                              }} />
                              <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                textAlign: 'center',
                                mb: 1,
                                fontWeight: 500
                              }}>
                                Cliquez pour uploader
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                textAlign: 'center',
                                display: 'block'
                              }}>
                                JPG, PNG, WebP (max 5MB)
                              </Typography>
                            </>
                          )}
                        </Box>
                        
                        {errors.photo && (
                          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                            <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {errors.photo[0]}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                {/* Form Fields */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={isMobile ? 2 : 3}>
                    {[
                      { name: 'nom', label: 'Nom *', icon: <PersonIcon />, gridSize: 6, animationDelay: 100 },
                      { name: 'prenoms', label: 'Prénoms *', icon: null, gridSize: 6, animationDelay: 200 },
                      { name: 'email', label: 'Email *', icon: <EmailIcon />, gridSize: 12, animationDelay: 300 },
                      { name: 'telephone', label: 'Téléphone *', icon: <PhoneIcon />, gridSize: 6, animationDelay: 400 },
                      { name: 'date_naissance', label: 'Date de naissance *', icon: <CalendarIcon />, gridSize: 6, type: 'date', animationDelay: 500 },
                    ].map((field) => (
                      <Grid item xs={12} sm={field.gridSize} key={field.name}>
                        <Slide direction="up" in timeout={field.animationDelay}>
                          <Box>
                            <Controller
                              name={field.name}
                              control={control}
                              render={({ field: controllerField, fieldState }) => (
                                <TextField
                                  {...controllerField}
                                  fullWidth
                                  label={field.label}
                                  type={field.type || 'text'}
                                  InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                                  error={!!fieldState.error || !!errors[field.name]}
                                  helperText={fieldState.error?.message || errors[field.name]?.[0] || ''}
                                  InputProps={{
                                    startAdornment: field.icon ? (
                                      <InputAdornment position="start">
                                        {React.cloneElement(field.icon, { sx: { color: '#8B0000' } })}
                                      </InputAdornment>
                                    ) : undefined,
                                    sx: {
                                      borderRadius: 1,
                                      '& input': {
                                        py: isMobile ? 1.25 : 1.5
                                      }
                                    }
                                  }}
                                />
                              )}
                            />
                          </Box>
                        </Slide>
                      </Grid>
                    ))}

                    {/* Sexe */}
                    <Grid item xs={12}>
                      <Slide direction="up" in timeout={600}>
                        <Box>
                          <Controller
                            name="sexe"
                            control={control}
                            render={({ field, fieldState }) => (
                              <FormControl fullWidth error={!!fieldState.error || !!errors.sexe}>
                                <FormLabel sx={{ 
                                  mb: 1,
                                  fontWeight: 500,
                                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                                  color: 'text.primary'
                                }}>
                                  Sexe *
                                </FormLabel>
                                <Select
                                  {...field}
                                  displayEmpty
                                  value={field.value || ''}
                                  sx={{ 
                                    borderRadius: 1,
                                    '& .MuiSelect-select': {
                                      py: isMobile ? 1.25 : 1.5
                                    }
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    Sélectionnez votre sexe
                                  </MenuItem>
                                  <MenuItem value="M">Masculin</MenuItem>
                                  <MenuItem value="F">Féminin</MenuItem>
                                </Select>
                                {(fieldState.error || errors.sexe) && (
                                  <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                                    <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {fieldState.error?.message || errors.sexe?.[0]}
                                  </Typography>
                                )}
                              </FormControl>
                            )}
                          />
                        </Box>
                      </Slide>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Zoom in timeout={500}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#8B0000',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}>
                <SchoolIcon /> Informations académiques
              </Typography>
              
              <Grid container spacing={isMobile ? 2 : 3}>
                {[
                  { name: 'origine', label: 'Ville/Région d\'origine *', icon: <LocationIcon />, gridSize: 6, delay: 100 },
                  { name: 'ethnie', label: 'Ethnie (optionnel)', icon: <LanguageIcon />, gridSize: 6, delay: 200 },
                  { name: 'universite', label: 'Université/École *', icon: <SchoolIcon />, gridSize: 12, delay: 300 },
                  { name: 'filiere', label: 'Filière *', icon: null, gridSize: 8, delay: 400 },
                ].map((field) => (
                  <Grid item xs={12} sm={field.gridSize} key={field.name}>
                    <Slide direction="left" in timeout={field.delay}>
                      <Box>
                        <Controller
                          name={field.name}
                          control={control}
                          render={({ field: controllerField, fieldState }) => (
                            <TextField
                              {...controllerField}
                              fullWidth
                              label={field.label}
                              error={!!fieldState.error || !!errors[field.name]}
                              helperText={fieldState.error?.message || errors[field.name]?.[0] || ''}
                              InputProps={{
                                startAdornment: field.icon ? (
                                  <InputAdornment position="start">
                                    {React.cloneElement(field.icon, { sx: { color: '#8B0000' } })}
                                  </InputAdornment>
                                ) : undefined,
                                sx: {
                                  borderRadius: 1,
                                  '& input': {
                                    py: isMobile ? 1.25 : 1.5
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Slide>
                  </Grid>
                ))}

                {/* Année d'étude */}
                <Grid item xs={12} sm={4}>
                  <Slide direction="left" in timeout={500}>
                    <Box>
                      <Controller
                        name="annee_etude"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormControl fullWidth error={!!fieldState.error || !!errors.annee_etude}>
                            <FormLabel sx={{ 
                              mb: 1,
                              fontWeight: 500,
                              fontSize: isMobile ? '0.875rem' : '0.9375rem'
                            }}>
                              Année d'étude *
                            </FormLabel>
                            <Select
                              {...field}
                              displayEmpty
                              value={field.value || ''}
                              sx={{ 
                                borderRadius: 1,
                                '& .MuiSelect-select': {
                                  py: isMobile ? 1.25 : 1.5
                                }
                              }}
                            >
                              <MenuItem value="" disabled>
                                Sélectionnez votre année
                              </MenuItem>
                              <MenuItem value="Licence 1">Licence 1</MenuItem>
                              <MenuItem value="Licence 2">Licence 2</MenuItem>
                              <MenuItem value="Licence 3">Licence 3</MenuItem>
                              <MenuItem value="Master 1">Master 1</MenuItem>
                              <MenuItem value="Master 2">Master 2</MenuItem>
                              <MenuItem value="Doctorat">Doctorat</MenuItem>
                            </Select>
                            {(fieldState.error || errors.annee_etude) && (
                              <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                                <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {fieldState.error?.message || errors.annee_etude?.[0]}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Slide>
                </Grid>
              </Grid>
            </Box>
          </Zoom>
        );

      case 2:
        return (
          <Slide direction="right" in timeout={500}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#8B0000',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}>
                <TrophyIcon /> Choix de l'édition et catégorie
              </Typography>
              
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.8 },
                    '100%': { opacity: 1 }
                  }
                }}
              >
                <Typography variant="body2">
                  Sélectionnez l'édition à laquelle vous souhaitez participer et la catégorie correspondante.
                  {getCurrentEdition()?.date_fin_inscriptions && (
                    <> Les inscriptions se ferment le {new Date(getCurrentEdition().date_fin_inscriptions).toLocaleDateString('fr-FR')}.</>
                  )}
                </Typography>
              </Alert>

              <Grid container spacing={isMobile ? 2 : 3}>
                {/* Édition */}
                <Grid item xs={12}>
                  <Grow in timeout={600}>
                    <Card sx={{ 
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: formErrors.edition_id ? 'error.main' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#D4AF37',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Controller
                          name="edition_id"
                          control={control}
                          render={({ field, fieldState }) => (
                            <FormControl fullWidth error={!!fieldState.error || !!errors.edition_id}>
                              <FormLabel sx={{ 
                                mb: 1,
                                fontWeight: 600,
                                fontSize: isMobile ? '0.875rem' : '0.9375rem',
                                color: 'text.primary'
                              }}>
                                Édition *
                              </FormLabel>
                              <Select
                                {...field}
                                displayEmpty
                                value={field.value || ''}
                                disabled={editionsLoading || editionsFetching}
                                sx={{ 
                                  borderRadius: 1,
                                  '& .MuiSelect-select': {
                                    py: isMobile ? 1.25 : 1.5
                                  }
                                }}
                              >
                                <MenuItem value="" disabled>
                                  {editionsLoading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CircularProgress size={16} />
                                      Chargement des éditions...
                                    </Box>
                                  ) : editionsError ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                                      <ErrorIcon fontSize="small" />
                                      Erreur de chargement
                                    </Box>
                                  ) : editions.length === 0 ? (
                                    'Aucune édition ouverte aux inscriptions'
                                  ) : 'Sélectionnez une édition'}
                                </MenuItem>
                                {editions.map((edition, index) => (
                                  <MenuItem key={edition.id} value={edition.id}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {edition.nom}
                                      </Typography>
                                      <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        mt: 0.5,
                                        flexWrap: 'wrap',
                                        gap: 1
                                      }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                          {edition.annee} • {edition.numero_edition}ème édition
                                        </Typography>
                                        {edition.date_fin_inscriptions && (
                                          <Typography variant="caption" sx={{ 
                                            color: 'error.main',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                          }}>
                                            <TimeIcon fontSize="inherit" />
                                            Clôture: {new Date(edition.date_fin_inscriptions).toLocaleDateString('fr-FR')}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                              {(fieldState.error || errors.edition_id) && (
                                <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                                  <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  {fieldState.error?.message || errors.edition_id?.[0]}
                                </Typography>
                              )}
                            </FormControl>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                {/* Catégorie */}
                {watchedEditionId && (
                  <Grid item xs={12}>
                    <Grow in timeout={800}>
                      <Card sx={{ 
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: formErrors.category_id ? 'error.main' : 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#D4AF37',
                          transform: 'translateY(-2px)',
                        }
                      }}>
                        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                          <Controller
                            name="category_id"
                            control={control}
                            render={({ field, fieldState }) => (
                              <FormControl 
                                fullWidth 
                                error={!!fieldState.error || !!errors.category_id}
                                disabled={categoriesLoading || categoriesError || categoriesFetching}
                              >
                                <FormLabel sx={{ 
                                  mb: 1,
                                  fontWeight: 600,
                                  fontSize: isMobile ? '0.875rem' : '0.9375rem',
                                  color: categoriesLoading || categoriesError ? 'text.disabled' : 'text.primary'
                                }}>
                                  Catégorie *
                                </FormLabel>
                                <Select
                                  {...field}
                                  displayEmpty
                                  value={field.value || ''}
                                  disabled={categoriesLoading || categoriesError || categoriesFetching}
                                  sx={{ 
                                    borderRadius: 1,
                                    '& .MuiSelect-select': {
                                      py: isMobile ? 1.25 : 1.5
                                    }
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    {categoriesLoading || categoriesFetching ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={16} />
                                        Chargement des catégories...
                                      </Box>
                                    ) : categoriesError ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                                        <ErrorIcon fontSize="small" />
                                        Erreur de chargement
                                      </Box>
                                    ) : categories.length === 0 ? (
                                      'Aucune catégorie disponible pour cette édition'
                                    ) : 'Sélectionnez une catégorie'}
                                  </MenuItem>
                                  {categories.map((category, index) => (
                                    <MenuItem key={category.id} value={category.id}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <CategoryIcon sx={{ mr: 2, color: '#8B0000' }} />
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body1">{category.nom}</Typography>
                                          {category.description && (
                                            <Typography variant="caption" sx={{ 
                                              color: 'text.secondary',
                                              display: 'block',
                                              mt: 0.5
                                            }}>
                                              {category.description}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                                {(fieldState.error || errors.category_id) && (
                                  <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                                    <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {fieldState.error?.message || errors.category_id?.[0]}
                                  </Typography>
                                )}
                              </FormControl>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                )}

                {/* Détails édition */}
                {getCurrentEdition() && (
                  <Grid item xs={12}>
                    <Fade in timeout={1000}>
                      <Card sx={{ 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.03) 0%, rgba(212, 175, 55, 0.03) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                        transition: 'all 0.3s ease',
                        animation: 'glow 2s infinite alternate',
                        '@keyframes glow': {
                          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)' },
                          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }
                        }
                      }}>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 2, 
                            color: '#8B0000',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <CelebrationIcon fontSize="small" />
                            Détails de l'édition sélectionnée
                          </Typography>
                          
                          <Grid container spacing={isMobile ? 1 : 2}>
                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TrophyIcon sx={{ fontSize: 16, color: '#8B0000' }} />
                                  <Typography variant="body2">
                                    <strong>Nom :</strong> {getCurrentEdition().nom}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Année :</strong> {getCurrentEdition().annee}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Numéro :</strong> {getCurrentEdition().numero_edition}ème édition
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                {getCurrentEdition().date_fin_inscriptions && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimeIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                                      <strong>Clôture :</strong> {new Date(getCurrentEdition().date_fin_inscriptions).toLocaleDateString('fr-FR')}
                                    </Typography>
                                  </Box>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Catégories :</strong> {categories?.length || 0} disponible(s)
                                  </Typography>
                                </Box>
                                {getCurrentCategory() && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                                      <strong>Votre choix :</strong> {getCurrentCategory()?.nom}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Slide>
        );

      case 3:
        return (
          <Collapse in timeout={500}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#8B0000',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}>
                <VideoIcon /> Présentation de votre talent
              </Typography>
              
              <Grid container spacing={isMobile ? 2 : 3}>
                {/* Vidéo URL */}
                <Grid item xs={12}>
                  <Grow in timeout={600}>
                    <Card sx={{ 
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: formErrors.video_url ? 'error.main' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#D4AF37',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Controller
                          name="video_url"
                          control={control}
                          render={({ field, fieldState }) => (
                            <FormControl fullWidth error={!!fieldState.error || !!errors.video_url}>
                              <FormLabel sx={{ 
                                mb: 1,
                                fontWeight: 600,
                                fontSize: isMobile ? '0.875rem' : '0.9375rem'
                              }}>
                                Lien de la vidéo de présentation *
                              </FormLabel>
                              
                              <TextField
                                fullWidth
                                label="URL YouTube, TikTok, Vimeo, etc."
                                {...field}
                                error={!!fieldState.error || !!errors.video_url}
                                helperText={
                                  (fieldState.error?.message || errors.video_url?.[0]) || 
                                  "Collez le lien de votre vidéo de démonstration"
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <VideoIcon sx={{ color: '#8B0000' }} />
                                    </InputAdornment>
                                  ),
                                  sx: {
                                    borderRadius: 1,
                                    '& input': {
                                      py: isMobile ? 1.25 : 1.5
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                {/* Description - Optionnelle */}
                <Grid item xs={12}>
                  <Grow in timeout={800}>
                    <Card sx={{ 
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: formErrors.description_talent ? 'error.main' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#D4AF37',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Controller
                          name="description_talent"
                          control={control}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Description de votre talent (optionnel)"
                              multiline
                              rows={isMobile ? 4 : 6}
                              error={!!fieldState.error || !!errors.description_talent}
                              helperText={
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  mt: 0.5,
                                  alignItems: 'center'
                                }}>
                                  <span>
                                    {fieldState.error?.message || errors.description_talent?.[0] || 
                                     'Décrivez votre talent, votre expérience, vos réalisations...'}
                                  </span>
                                  <Chip 
                                    size="small"
                                    label={`${field.value?.length || 0}/2000`}
                                    color={
                                      (field.value?.length || 0) > 2000 ? 'error' : 'default'
                                    }
                                    sx={{ 
                                      fontWeight: 500,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                </Box>
                              }
                              placeholder="Parlez-nous de votre talent, de votre passion, de vos inspirations..."
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DescriptionIcon sx={{ color: '#8B0000' }} />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: 1,
                                  '& textarea': {
                                    py: isMobile ? 1.25 : 1.5
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                {/* Avertissement */}
                <Grid item xs={12}>
                  <Fade in timeout={1000}>
                    <Alert 
                      severity="warning" 
                      icon={<WarningIcon />}
                      sx={{ 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'warning.main',
                        animation: 'shake 0.5s ease-in-out',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '25%': { transform: 'translateX(-5px)' },
                          '75%': { transform: 'translateX(5px)' }
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                        <strong>Important :</strong> Votre candidature sera soumise pour validation. 
                        Vous recevrez un email de confirmation une fois votre compte activé par les organisateurs.
                        Vérifiez bien toutes les informations avant de soumettre.
                      </Typography>
                    </Alert>
                  </Fade>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================
  // Loading state initial
  if (isInitialLoad && editionsLoading) {
    return (
      <Dialog open={true} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: '#8B0000', mb: 3, animation: 'spin 2s linear infinite' }} />
            <Typography variant="h6" sx={{ color: '#8B0000', fontWeight: 600 }}>
              Chargement du formulaire...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Préparation de votre expérience de candidature
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      TransitionProps={{
        timeout: 500,
        mountOnEnter: true,
        unmountOnExit: true,
      }}
      PaperProps={{
        sx: {
          maxHeight: '100vh',
          height: '100%',
          borderRadius: isMobile ? 0 : 2,
          overflow: 'hidden',
          background: 'white',
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.5s ease',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
        padding: isMobile ? '20px 16px' : '24px 32px',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/pattern.png")',
          opacity: 0.1,
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffd700 0%, #D4AF37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '3px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                animation: 'pulse 2s infinite',
              }}
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  parent.innerHTML = `
                    <span style="color: white; font-size: 1.2rem; font-weight: bold; text-align: center">
                      SYT
                    </span>
                  `;
                }}
              />
            </Box>
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Postuler à une édition
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mt: 0.5
                }}
              >
                Montrez votre talent au monde entier
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={handleClose}
            size={isMobile ? "small" : "medium"}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CloseIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>

        {/* Progress Bar */}
        <LinearProgress 
          variant="determinate" 
          value={((activeStep + 1) / steps.length) * 100}
          sx={{ 
            height: 6, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #FFD700, #D4AF37)',
              borderRadius: 3,
              transition: 'transform 0.4s ease',
            }
          }}
        />

        {/* Stepper */}
        {!isMobile && (
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mt: 3,
              '& .MuiStepConnector-root': {
                top: 12,
                '& .MuiStepConnector-line': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }
              }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepIcon-root': {
                      color: 'rgba(255, 255, 255, 0.3)',
                      '&.Mui-active': {
                        color: '#FFD700',
                      },
                      '&.Mui-completed': {
                        color: '#D4AF37',
                      }
                    },
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      '&.Mui-active': {
                        color: 'white',
                        fontWeight: 600
                      },
                      '&.Mui-completed': {
                        color: '#D4AF37'
                      }
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Box>

      {/* Content */}
      <DialogContent sx={{ 
        flex: 1,
        overflow: 'auto',
        p: isMobile ? 2 : 3,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(180deg, #D4AF37, #FFD700)',
          borderRadius: '4px',
          '&:hover': {
            background: 'linear-gradient(180deg, #c19b2e, #e6c200)',
          }
        }
      }}>
        {/* Progress d'upload */}
        {isSubmitting && uploadProgress > 0 && (
          <Box sx={{ mb: 3, animation: 'fadeIn 0.5s ease' }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #D4AF37, #FFD700)',
                  borderRadius: 5,
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
              Upload en cours... {uploadProgress}%
            </Typography>
          </Box>
        )}

        {/* Erreurs globales */}
        {Object.keys(errors).length > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              animation: 'slideInDown 0.5s ease',
              '@keyframes slideInDown': {
                '0%': { transform: 'translateY(-20px)', opacity: 0 },
                '100%': { transform: 'translateY(0)', opacity: 1 }
              }
            }}
            onClose={() => setErrors({})}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Veuillez corriger les erreurs suivantes :
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {Object.entries(errors).map(([field, messages]) => (
                <li key={field}>
                  <Typography variant="caption">
                    {messages[0]}
                  </Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {/* Contenu du formulaire */}
        <Box ref={formRef} component="form" onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Navigation buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: isMobile ? 1 : 2,
            flexWrap: 'wrap'
          }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{
                color: '#8B0000',
                borderColor: '#8B0000',
                fontWeight: 600,
                borderRadius: 2,
                px: isMobile ? 2 : 3,
                py: isMobile ? 0.75 : 1,
                minWidth: isMobile ? '100px' : '120px',
                '&:hover': {
                  backgroundColor: 'rgba(139, 0, 0, 0.04)',
                  borderColor: '#7a0000',
                  transform: 'translateX(-2px)',
                },
                '&.Mui-disabled': {
                  borderColor: '#e5e7eb',
                  color: '#9ca3af',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Retour
            </Button>
            
            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 1 : 2,
              flex: 1,
              justifyContent: 'flex-end'
            }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || getStepError()}
                  startIcon={isSubmitting ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <CloudDoneIcon />
                  }
                  sx={{
                    background: 'linear-gradient(135deg, #8B0000 0%, #B22222 100%)',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: isMobile ? 3 : 6,
                    py: isMobile ? 0.75 : 1,
                    minWidth: isMobile ? '140px' : '180px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7a0000 0%, #a02020 100%)',
                      boxShadow: '0 8px 25px rgba(139, 0, 0, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                    '&.Mui-disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    },
                    transition: 'all 0.3s ease',
                    animation: isSubmitting ? 'pulse 1.5s infinite' : 'none',
                  }}
                >
                  {isSubmitting ? 'Soumission...' : 'Soumettre'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  disabled={getStepError()}
                  sx={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'black',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: isMobile ? 3 : 6,
                    py: isMobile ? 0.75 : 1,
                    minWidth: isMobile ? '120px' : '150px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #c19b2e 0%, #e6c200 100%)',
                      boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                    '&.Mui-disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Continuer
                </Button>
              )}
            </Box>
          </Box>

          {/* Indicateur de progression */}
          <Box sx={{ 
            mt: 3, 
            textAlign: 'center' 
          }}>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5
            }}>
              Étape {activeStep + 1} sur {steps.length}
              <Box component="span" sx={{ 
                color: '#8B0000', 
                fontWeight: 600,
                ml: 0.5
              }}>
                • {Math.round(((activeStep + 1) / steps.length) * 100)}% complété
              </Box>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Postuler;