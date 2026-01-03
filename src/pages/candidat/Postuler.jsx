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
  LinearProgress,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
  useMediaQuery,
  useTheme,
  alpha,
  Chip,
  Paper,
  Stack,
  Dialog,
  DialogContent,
  Container,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  VideoLibrary as VideoIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
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
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
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
    .test('age', 'Vous devez avoir au moins 16 ans', (value) => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 16;
      }
      return age >= 16;
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
    .required('Vidéo de présentation requise'),
  
  description_talent: yup.string()
    .required('Description requise')
    .min(100, 'Minimum 100 caractères')
    .max(2000, 'Maximum 2000 caractères'),
});

// ==================== COMPOSANT PRINCIPAL ====================
const Postuler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ==================== FORM ====================
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    clearErrors,
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

  // ==================== STATES ====================
  const [activeStep, setActiveStep] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef(null);
  const formContainerRef = useRef(null);

  // ==================== QUERIES ====================
  const { 
    data: editionsData = [], 
    isLoading: editionsLoading,
    error: editionsError,
  } = useQuery({
    queryKey: ['editions-ouvertes'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/candidat/editions-ouvertes');
        const data = response.data?.data || response.data || [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erreur chargement éditions:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories', watchedEditionId],
    queryFn: async () => {
      if (!watchedEditionId) return [];
      try {
        const response = await axiosInstance.get(`/candidat/categories/${watchedEditionId}`);
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
        return [];
      }
    },
    enabled: !!watchedEditionId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Transformer les données
  const editions = useMemo(() => {
    return Array.isArray(editionsData) ? editionsData.map(edition => ({
      id: edition.id || edition.value,
      nom: edition.nom || edition.name || 'Édition sans nom',
      annee: edition.annee || edition.year || new Date().getFullYear(),
      numero_edition: edition.numero_edition || edition.edition_number || 1,
      description: edition.description || '',
      date_fin_inscriptions: edition.date_fin_inscriptions || edition.registration_end_date,
      statut: edition.statut || edition.status || 'active',
    })) : [];
  }, [editionsData]);

  const categories = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData.map(category => ({
      id: category.id || category.value,
      nom: category.nom || category.name || 'Catégorie sans nom',
      description: category.description || '',
    })) : [];
  }, [categoriesData]);

  // ==================== MUTATION ====================
  const mutation = useMutation({
    mutationFn: async (formData) => {
      setIsSubmitting(true);
      const response = await axiosInstance.post('/candidat/postuler', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
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
    },
    onSuccess: (data) => {
      toast.success('🎉 Candidature soumise avec succès !');
      navigate('/candidat/mes-candidatures', {
        state: { 
          success: true, 
          candidateId: data.data?.id,
          message: 'Votre candidature a été soumise avec succès.' 
        }
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      const errorData = error.response?.data;
      
      if (error.response?.status === 422 && errorData?.errors) {
        setErrors(errorData.errors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else {
        toast.error(errorData?.message || 'Erreur lors de la soumission');
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
      setUploadProgress(0);
    },
  });

  // ==================== EFFETS ====================
  useEffect(() => {
    // Pré-remplir l'édition depuis l'URL
    const params = new URLSearchParams(location.search);
    const editionId = params.get('edition');
    if (editionId && editions.length > 0 && !watchedEditionId) {
      const edition = editions.find(e => e.id === parseInt(editionId));
      if (edition) {
        setTimeout(() => {
          setValue('edition_id', edition.id, { shouldValidate: true });
        }, 100);
      }
    }
  }, [location.search, editions, watchedEditionId, setValue]);

  useEffect(() => {
    // Initial loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ==================== HANDLERS ====================
  const steps = [
    'Informations personnelles',
    'Informations académiques', 
    'Choix édition/catégorie',
    'Présentation talent'
  ];

  const handleNext = async () => {
    const stepFields = getStepFields(activeStep);
    const isValid = await trigger(stepFields);
    if (isValid) {
      if (activeStep < steps.length - 1) {
        setActiveStep(prev => prev + 1);
        setTimeout(() => {
          if (formContainerRef.current) {
            formContainerRef.current.scrollTop = 0;
          }
        }, 50);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setTimeout(() => {
        if (formContainerRef.current) {
          formContainerRef.current.scrollTop = 0;
        }
      }, 50);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('Voulez-vous vraiment quitter ? Les modifications seront perdues.')) {
      return;
    }
    navigate('/');
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
  };

  const removePhoto = (e) => {
    e?.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStepFields = (step) => {
    const stepFields = {
      0: ['nom', 'prenoms', 'email', 'date_naissance', 'sexe', 'telephone'],
      1: ['origine', 'ethnie', 'universite', 'filiere', 'annee_etude'],
      2: ['edition_id', 'category_id'],
      3: ['video_url', 'description_talent'],
    };
    return stepFields[step] || [];
  };

  const onSubmit = async (data) => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Veuillez corriger les erreurs avant de soumettre');
      return;
    }

    setUploadProgress(0);
    setErrors({});
    
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    mutation.mutate(formData);
  };

  // ==================== RENDER STEP CONTENT ====================
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#8B0000' }}>
              Informations personnelles
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: '2px dashed #ddd' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
                      Photo de profil
                    </Typography>
                    
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: photoPreview ? '#10B981' : '#ddd',
                        borderRadius: 1,
                        p: 2,
                        cursor: 'pointer',
                        minHeight: 150,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                              width: 80,
                              height: 80,
                              mb: 1,
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={removePhoto}
                            startIcon={<DeleteIcon />}
                          >
                            Changer
                          </Button>
                        </>
                      ) : (
                        <>
                          <CameraIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            Cliquez pour uploader
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            JPG, PNG, WebP (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {[
                    { name: 'nom', label: 'Nom *', icon: <PersonIcon />, gridSize: 6 },
                    { name: 'prenoms', label: 'Prénoms *', gridSize: 6 },
                    { name: 'email', label: 'Email *', icon: <EmailIcon />, gridSize: 12 },
                    { name: 'telephone', label: 'Téléphone *', icon: <PhoneIcon />, gridSize: 6 },
                    { name: 'date_naissance', label: 'Date de naissance *', icon: <CalendarIcon />, gridSize: 6, type: 'date' },
                  ].map((field) => (
                    <Grid item xs={12} sm={field.gridSize} key={field.name}>
                      <Controller
                        name={field.name}
                        control={control}
                        render={({ field: controllerField, fieldState }) => (
                          <TextField
                            {...controllerField}
                            fullWidth
                            size="small"
                            label={field.label}
                            type={field.type || 'text'}
                            InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            InputProps={{
                              startAdornment: field.icon ? (
                                <InputAdornment position="start">
                                  {React.cloneElement(field.icon, { sx: { color: '#8B0000', fontSize: 20 } })}
                                </InputAdornment>
                              ) : undefined,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Controller
                      name="sexe"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth size="small" error={!!fieldState.error}>
                          <InputLabel>Sexe *</InputLabel>
                          <Select {...field} label="Sexe *">
                            <MenuItem value="M">Masculin</MenuItem>
                            <MenuItem value="F">Féminin</MenuItem>
                          </Select>
                          {fieldState.error && (
                            <Typography variant="caption" color="error">
                              {fieldState.error.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#8B0000' }}>
              Informations académiques
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { name: 'origine', label: 'Ville/Région d\'origine *', icon: <LocationIcon />, gridSize: 6 },
                { name: 'ethnie', label: 'Ethnie (optionnel)', icon: <LanguageIcon />, gridSize: 6 },
                { name: 'universite', label: 'Université/École *', icon: <SchoolIcon />, gridSize: 12 },
                { name: 'filiere', label: 'Filière *', gridSize: 8 },
              ].map((field) => (
                <Grid item xs={12} sm={field.gridSize} key={field.name}>
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <TextField
                        {...controllerField}
                        fullWidth
                        size="small"
                        label={field.label}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          startAdornment: field.icon ? (
                            <InputAdornment position="start">
                              {React.cloneElement(field.icon, { sx: { color: '#8B0000', fontSize: 20 } })}
                            </InputAdornment>
                          ) : undefined,
                        }}
                      />
                    )}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={4}>
                <Controller
                  name="annee_etude"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth size="small" error={!!fieldState.error}>
                      <InputLabel>Année d'étude *</InputLabel>
                      <Select {...field} label="Année d'étude *">
                        <MenuItem value="Licence 1">Licence 1</MenuItem>
                        <MenuItem value="Licence 2">Licence 2</MenuItem>
                        <MenuItem value="Licence 3">Licence 3</MenuItem>
                        <MenuItem value="Master 1">Master 1</MenuItem>
                        <MenuItem value="Master 2">Master 2</MenuItem>
                        <MenuItem value="Doctorat">Doctorat</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <Typography variant="caption" color="error">
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#8B0000' }}>
              Choix de l'édition et catégorie
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Sélectionnez l'édition à laquelle vous souhaitez participer et la catégorie correspondante.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="edition_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error} disabled={editionsLoading}>
                      <InputLabel>Édition *</InputLabel>
                      <Select {...field} label="Édition *">
                        <MenuItem value="" disabled>
                          {editionsLoading ? 'Chargement...' : 'Sélectionnez une édition'}
                        </MenuItem>
                        {editions.map((edition) => (
                          <MenuItem key={edition.id} value={edition.id}>
                            {edition.nom} ({edition.annee})
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <Typography variant="caption" color="error">
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {watchedEditionId && (
                <Grid item xs={12}>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error} disabled={categoriesLoading}>
                        <InputLabel>Catégorie *</InputLabel>
                        <Select {...field} label="Catégorie *">
                          <MenuItem value="" disabled>
                            {categoriesLoading ? 'Chargement...' : 'Sélectionnez une catégorie'}
                          </MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.nom}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <Typography variant="caption" color="error">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#8B0000' }}>
              Présentation de votre talent
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="video_url"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Lien de votre vidéo *"
                      placeholder="https://youtube.com/..."
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || "Lien YouTube, TikTok, Vimeo, etc."}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VideoIcon sx={{ color: '#8B0000', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description_talent"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Description de votre talent *"
                      placeholder="Décrivez votre talent, votre expérience, vos réalisations..."
                      error={!!fieldState.error}
                      helperText={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <span>
                            {fieldState.error?.message || 
                             (field.value?.length < 100 
                               ? `Minimum ${100 - (field.value?.length || 0)} caractères restants` 
                               : 'Description suffisante')}
                          </span>
                          <Chip 
                            size="small"
                            label={`${field.value?.length || 0}/2000`}
                            color={
                              (field.value?.length || 0) > 2000 ? 'error' : 
                              (field.value?.length || 0) >= 100 ? 'success' : 'default'
                            }
                          />
                        </Box>
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Important :</strong> Votre candidature sera soumise pour validation. 
                    Vérifiez bien toutes les informations avant de soumettre.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================
  if (isLoading) {
    return (
      <Dialog open maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: '#8B0000', mb: 3 }} />
            <Typography variant="h6" sx={{ color: '#8B0000' }}>
              Chargement...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: '100%',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
        p: isMobile ? 2 : 3,
        position: 'relative',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #D4AF37',
              }}
            >
              <TrophyIcon sx={{ color: '#8B0000', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Postuler à une édition
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Montrez votre talent
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        <LinearProgress 
          variant="determinate" 
          value={((activeStep + 1) / steps.length) * 100}
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#D4AF37',
              borderRadius: 3,
            }
          }}
        />

        {/* Stepper */}
        {!isMobile && (
          <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ 
                  '& .MuiStepLabel-label': { 
                    color: 'rgba(255,255,255,0.9)',
                    '&.Mui-active': { color: 'white' },
                    '&.Mui-completed': { color: '#D4AF37' }
                  } 
                }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Box>

      {/* Content */}
      <Box 
        ref={formContainerRef}
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: isMobile ? 2 : 3,
        }}
      >
        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="caption" sx={{ textAlign: 'center', display: 'block' }}>
              Upload en cours... {uploadProgress}%
            </Typography>
          </Box>
        )}

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors({})}>
            <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2 }}>
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

        {/* Form Content */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Navigation */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4, 
            pt: 3,
            borderTop: '1px solid #eee',
            gap: 2
          }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
              startIcon={<PrevIcon />}
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              Retour
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudDoneIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #8B0000 0%, #B22222 100%)',
                    color: 'white',
                    minWidth: 140,
                  }}
                >
                  {isSubmitting ? 'Soumission...' : 'Soumettre'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<NextIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'black',
                    minWidth: 120,
                  }}
                >
                  Continuer
                </Button>
              )}
            </Box>
          </Box>

          {/* Progress Indicator */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Étape {activeStep + 1} sur {steps.length} • {Math.round(((activeStep + 1) / steps.length) * 100)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default Postuler;