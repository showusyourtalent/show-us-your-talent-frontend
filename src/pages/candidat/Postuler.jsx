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
  Container,
  Fade,
  Grow,
  Zoom,
  Divider,
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
  PhotoCamera as PhotoCameraIcon,
  UploadFile as UploadFileIcon,
  Description as DescriptionIcon,
  Favorite as FavoriteIcon,
  Stars as StarsIcon,
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
    .test('video-required', 'Vidéo de présentation requise', function(value) {
      const { videoFile } = this.parent;
      return !!(value || videoFile);
    }),
  
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ==================== FORM ====================
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors: formErrors, isSubmitting: formIsSubmitting },
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
      videoFile: null,
    },
  });

  // Watched values
  const watchedEditionId = watch('edition_id');
  const descriptionValue = watch('description_talent') || '';

  // ==================== STATES ====================
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
    onSettled: () => setIsLoading(false),
  });

  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading,
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
  });

  // Transformer les données
  const editions = useMemo(() => {
    return Array.isArray(editionsData) ? editionsData.map(edition => ({
      id: edition.id || edition.value || edition._id,
      nom: edition.nom || edition.name || 'Édition sans nom',
      annee: edition.annee || edition.year || new Date().getFullYear(),
      numero_edition: edition.numero_edition || edition.edition_number || 1,
      description: edition.description || '',
      date_fin_inscriptions: edition.date_fin_inscriptions || edition.registration_end_date,
    })) : [];
  }, [editionsData]);

  const categories = useMemo(() => {
    if (categoriesLoading) return [];
    return Array.isArray(categoriesData) ? categoriesData.map(category => ({
      id: category.id || category.value || category._id,
      nom: category.nom || category.name || 'Catégorie sans nom',
      description: category.description || '',
    })) : [];
  }, [categoriesData, categoriesLoading]);

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
      
      // Nettoyer les previews
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      
      setTimeout(() => {
        navigate('/candidat/mes-candidatures', {
          state: { 
            success: true, 
            candidateId: data.data?.id,
            message: 'Votre candidature a été soumise avec succès.' 
          },
          replace: true
        });
      }, 100);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 
                          errorData?.error || 
                          error.message || 
                          'Erreur lors de la soumission';
      
      if (error.response?.status === 422 && errorData?.errors) {
        setErrors(errorData.errors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(errorMessage);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
      setUploadProgress(0);
    },
  });

  // ==================== HANDLERS ====================
  const handleClose = useCallback(() => {
    if (formIsSubmitting) return;
    
    if (window.confirm('Voulez-vous vraiment quitter ?')) {
      // Nettoyer les previews
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      navigate('/');
    }
  }, [navigate, photoPreview, videoPreview, formIsSubmitting]);

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

    // Nettoyer ancienne preview
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, [photoPreview]);

  const handleVideoUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 100 * 1024 * 1024) {
      toast.error('La vidéo ne doit pas dépasser 100MB');
      return;
    }
    if (!['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'].includes(file.type)) {
      toast.error('Format non supporté. Utilisez MP4, MOV, AVI ou WebM');
      return;
    }

    // Nettoyer ancienne preview
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setValue('videoFile', file, { shouldValidate: true });
    
    const videoURL = URL.createObjectURL(file);
    setVideoPreview(videoURL);
  }, [videoPreview, setValue]);

  const removePhoto = useCallback(() => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [photoPreview]);

  const removeVideo = useCallback(() => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview('');
    setValue('video_url', '', { shouldValidate: false });
    setValue('videoFile', null, { shouldValidate: true });
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [videoPreview, setValue]);

  const onSubmit = useCallback(async (data) => {
    if (isSubmitting) return;
    
    // Validation photo
    if (!photoFile) {
      toast.error('La photo de profil est requise');
      return;
    }

    setUploadProgress(0);
    setErrors({});
    
    const formData = new FormData();
    
    // Ajouter tous les champs
    Object.keys(data).forEach(key => {
      if (key !== 'videoFile' && data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    // Ajouter les fichiers
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    if (videoFile) {
      formData.append('video', videoFile);
    } else if (data.video_url) {
      formData.append('video_url', data.video_url);
    }

    mutation.mutate(formData);
  }, [photoFile, videoFile, mutation, isSubmitting]);

  // ==================== RENDER ====================
  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
      }}>
        <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Chargement du formulaire...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Préparation de votre expérience de candidature
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      py: { xs: 0, md: 4 },
    }}>
      {/* Header fixe pour mobile */}
      <Paper sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
        color: 'white',
        borderRadius: 0,
        px: { xs: 2, md: 4 },
        py: 2,
        boxShadow: 3,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1200px',
          mx: 'auto',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700 0%, #D4AF37 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid white',
            }}>
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
                    <span style="color: white; font-size: 1rem; font-weight: bold;">
                      SYT
                    </span>
                  `;
                }}
              />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Postuler à une édition
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}>
                Montrez votre talent au monde entier
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Progress d'upload */}
        {isSubmitting && uploadProgress > 0 && (
          <Grow in>
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #D4AF37, #FFD700)',
                    borderRadius: 4,
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                Upload en cours... {uploadProgress}%
              </Typography>
            </Box>
          </Grow>
        )}

        {/* Erreurs globales */}
        {Object.keys(errors).length > 0 && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: 1,
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
          </Fade>
        )}

        {/* Formulaire principal */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Carte Photo */}
            <Grid item xs={12} md={4}>
              <Zoom in style={{ transitionDelay: '100ms' }}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: photoPreview ? '#10B981' : alpha('#8B0000', 0.1),
                  boxShadow: 3,
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: 6,
                    borderColor: '#D4AF37',
                  },
                  transition: 'all 0.3s ease',
                }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      mb: 3,
                      color: '#8B0000'
                    }}>
                      <PhotoCameraIcon />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Photo de profil
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        flex: 1,
                        border: '3px dashed',
                        borderColor: photoPreview ? '#10B981' : alpha('#8B0000', 0.3),
                        borderRadius: 2,
                        p: 3,
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        backgroundColor: photoPreview ? 'transparent' : alpha('#8B0000', 0.02),
                        '&:hover': {
                          borderColor: '#D4AF37',
                          backgroundColor: alpha('#D4AF37', 0.05),
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
                              width: 140,
                              height: 140,
                              mb: 3,
                              border: '4px solid #D4AF37',
                              boxShadow: 3,
                            }}
                          />
                          <Button
                            variant="contained"
                            color="error"
                            onClick={removePhoto}
                            startIcon={<DeleteIcon />}
                            sx={{ 
                              borderRadius: 2,
                              fontWeight: 600,
                              px: 3,
                              py: 1,
                            }}
                          >
                            Changer la photo
                          </Button>
                        </>
                      ) : (
                        <>
                          <CameraIcon sx={{ 
                            fontSize: 64, 
                            color: alpha('#8B0000', 0.4),
                            mb: 2 
                          }} />
                          <Typography variant="h6" sx={{ 
                            color: 'text.primary',
                            textAlign: 'center',
                            mb: 1,
                            fontWeight: 600
                          }}>
                            Ajoutez votre photo
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            textAlign: 'center',
                            mb: 2
                          }}>
                            Cliquez pour uploader votre photo
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary',
                            textAlign: 'center',
                            display: 'block',
                            px: 2,
                          }}>
                            Format: JPG, PNG, WebP (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                    
                    {errors.photo && (
                      <Typography color="error" variant="caption" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
                        {errors.photo[0]}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary', 
                      mt: 3,
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      * Photo obligatoire pour votre profil
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Colonne principale - Informations */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* Section Informations Personnelles */}
                <Grid item xs={12}>
                  <Fade in style={{ transitionDelay: '200ms' }}>
                    <Card sx={{ 
                      borderRadius: 3,
                      boxShadow: 3,
                      borderLeft: '4px solid #8B0000',
                      overflow: 'hidden',
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          mb: 3,
                          color: '#8B0000'
                        }}>
                          <PersonIcon />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Informations Personnelles
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="nom"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Nom *"
                                  error={!!fieldState.error || !!errors.nom}
                                  helperText={fieldState.error?.message || errors.nom?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PersonIcon sx={{ color: '#8B0000' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      '&:hover': {
                                        borderColor: '#D4AF37',
                                      }
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="prenoms"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Prénoms *"
                                  error={!!fieldState.error || !!errors.prenoms}
                                  helperText={fieldState.error?.message || errors.prenoms?.[0] || ''}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="email"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Email *"
                                  type="email"
                                  error={!!fieldState.error || !!errors.email}
                                  helperText={fieldState.error?.message || errors.email?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <EmailIcon sx={{ color: '#8B0000' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="telephone"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Téléphone *"
                                  error={!!fieldState.error || !!errors.telephone}
                                  helperText={fieldState.error?.message || errors.telephone?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: '#8B0000' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="date_naissance"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Date de naissance *"
                                  type="date"
                                  InputLabelProps={{ shrink: true }}
                                  error={!!fieldState.error || !!errors.date_naissance}
                                  helperText={fieldState.error?.message || errors.date_naissance?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarIcon sx={{ color: '#8B0000' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="sexe"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error || !!errors.sexe}>
                                  <FormLabel sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                    color: 'text.primary'
                                  }}>
                                    Sexe *
                                  </FormLabel>
                                  <Select
                                    {...field}
                                    displayEmpty
                                    value={field.value || ''}
                                    sx={{ 
                                      borderRadius: 2,
                                      '& .MuiSelect-select': {
                                        py: 1.5
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
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>

                {/* Section Informations Académiques */}
                <Grid item xs={12}>
                  <Fade in style={{ transitionDelay: '300ms' }}>
                    <Card sx={{ 
                      borderRadius: 3,
                      boxShadow: 3,
                      borderLeft: '4px solid #1976d2',
                      overflow: 'hidden',
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          mb: 3,
                          color: '#1976d2'
                        }}>
                          <SchoolIcon />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Informations Académiques
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="origine"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Ville/Région d'origine *"
                                  error={!!fieldState.error || !!errors.origine}
                                  helperText={fieldState.error?.message || errors.origine?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <LocationIcon sx={{ color: '#1976d2' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="ethnie"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Ethnie (optionnel)"
                                  error={!!fieldState.error || !!errors.ethnie}
                                  helperText={fieldState.error?.message || errors.ethnie?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <LanguageIcon sx={{ color: '#1976d2' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Controller
                              name="universite"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Université/École *"
                                  error={!!fieldState.error || !!errors.universite}
                                  helperText={fieldState.error?.message || errors.universite?.[0] || ''}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SchoolIcon sx={{ color: '#1976d2' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={8}>
                            <Controller
                              name="filiere"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Filière *"
                                  error={!!fieldState.error || !!errors.filiere}
                                  helperText={fieldState.error?.message || errors.filiere?.[0] || ''}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Controller
                              name="annee_etude"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error || !!errors.annee_etude}>
                                  <FormLabel sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                  }}>
                                    Année d'étude *
                                  </FormLabel>
                                  <Select
                                    {...field}
                                    displayEmpty
                                    value={field.value || ''}
                                    sx={{ 
                                      borderRadius: 2,
                                      '& .MuiSelect-select': {
                                        py: 1.5
                                      }
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Sélectionnez
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
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>

                {/* Section Édition et Catégorie */}
                <Grid item xs={12}>
                  <Fade in style={{ transitionDelay: '400ms' }}>
                    <Card sx={{ 
                      borderRadius: 3,
                      boxShadow: 3,
                      borderLeft: '4px solid #D4AF37',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(255, 215, 0, 0.05) 100%)',
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          mb: 3,
                          color: '#8B0000'
                        }}>
                          <TrophyIcon />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Choix de l'Édition et Catégorie
                          </Typography>
                        </Box>
                        
                        <Alert 
                          severity="info" 
                          icon={<InfoIcon />}
                          sx={{ 
                            mb: 3, 
                            borderRadius: 2,
                            backgroundColor: alpha('#1976d2', 0.1),
                          }}
                        >
                          <Typography variant="body2">
                            Sélectionnez l'édition à laquelle vous souhaitez participer et la catégorie correspondante.
                          </Typography>
                        </Alert>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="edition_id"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error || !!errors.edition_id}>
                                  <FormLabel sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                  }}>
                                    Édition *
                                  </FormLabel>
                                  <Select
                                    {...field}
                                    displayEmpty
                                    value={field.value || ''}
                                    disabled={editionsLoading}
                                    sx={{ 
                                      borderRadius: 2,
                                      '& .MuiSelect-select': {
                                        py: 1.5
                                      }
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      {editionsLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <CircularProgress size={16} />
                                          Chargement...
                                        </Box>
                                      ) : editions.length === 0 ? (
                                        'Aucune édition disponible'
                                      ) : 'Sélectionnez une édition'}
                                    </MenuItem>
                                    {editions.map((edition) => (
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
                                              }}>
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
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="category_id"
                              control={control}
                              render={({ field, fieldState }) => (
                                <FormControl 
                                  fullWidth 
                                  error={!!fieldState.error || !!errors.category_id}
                                  disabled={categoriesLoading || !watchedEditionId}
                                >
                                  <FormLabel sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                  }}>
                                    Catégorie *
                                  </FormLabel>
                                  <Select
                                    {...field}
                                    displayEmpty
                                    value={field.value || ''}
                                    disabled={categoriesLoading || !watchedEditionId}
                                    sx={{ 
                                      borderRadius: 2,
                                      '& .MuiSelect-select': {
                                        py: 1.5
                                      }
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      {!watchedEditionId ? (
                                        'Sélectionnez d\'abord une édition'
                                      ) : categoriesLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <CircularProgress size={16} />
                                          Chargement...
                                        </Box>
                                      ) : categories.length === 0 ? (
                                        'Aucune catégorie disponible'
                                      ) : 'Sélectionnez une catégorie'}
                                    </MenuItem>
                                    {categories.map((category) => (
                                      <MenuItem key={category.id} value={category.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <CategoryIcon sx={{ mr: 2, color: '#D4AF37' }} />
                                          <Typography>{category.nom}</Typography>
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
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>

                {/* Section Présentation du Talent */}
                <Grid item xs={12}>
                  <Fade in style={{ transitionDelay: '500ms' }}>
                    <Card sx={{ 
                      borderRadius: 3,
                      boxShadow: 3,
                      borderLeft: '4px solid #10B981',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%)',
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          mb: 3,
                          color: '#10B981'
                        }}>
                          <StarsIcon />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Présentation de Votre Talent
                          </Typography>
                        </Box>
                        
                        {/* Vidéo */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            mb: 2,
                          }}>
                            <VideoIcon sx={{ color: '#10B981' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Vidéo de présentation *
                            </Typography>
                          </Box>
                          
                          <Controller
                            name="video_url"
                            control={control}
                            render={({ field, fieldState }) => (
                              <TextField
                                fullWidth
                                label="Lien de votre vidéo (YouTube, TikTok, Vimeo, etc.)"
                                {...field}
                                error={!!fieldState.error || !!errors.video_url}
                                helperText={
                                  (fieldState.error?.message || errors.video_url?.[0]) || 
                                  "Partagez un lien vers votre vidéo de présentation"
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <VideoIcon sx={{ color: '#10B981' }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  mb: 2,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            )}
                          />
                          
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            Ou téléchargez votre vidéo directement :
                          </Typography>
                          
                          <Box
                            sx={{
                              border: '2px dashed',
                              borderColor: videoPreview ? '#10B981' : alpha('#10B981', 0.3),
                              borderRadius: 2,
                              p: 3,
                              textAlign: 'center',
                              cursor: 'pointer',
                              backgroundColor: videoPreview ? alpha('#10B981', 0.05) : 'transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: '#10B981',
                                backgroundColor: alpha('#10B981', 0.1),
                              }
                            }}
                            onClick={() => videoInputRef.current?.click()}
                          >
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              ref={videoInputRef}
                              style={{ display: 'none' }}
                            />
                            
                            {videoPreview ? (
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#10B981' }}>
                                  ✓ Vidéo sélectionnée
                                </Typography>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={removeVideo}
                                  startIcon={<DeleteIcon />}
                                  sx={{ 
                                    borderRadius: 2,
                                    fontWeight: 600,
                                  }}
                                >
                                  Supprimer la vidéo
                                </Button>
                              </Box>
                            ) : (
                              <Box>
                                <UploadFileIcon sx={{ fontSize: 48, color: alpha('#10B981', 0.5), mb: 1 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                  Cliquez pour uploader votre vidéo
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  Formats: MP4, MOV, AVI, WebM (max 100MB)
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          
                          {(formErrors.video_url || formErrors.videoFile) && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                              <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {formErrors.video_url?.message || formErrors.videoFile?.message || 'Vidéo requise'}
                            </Typography>
                          )}
                        </Box>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        {/* Description */}
                        <Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            mb: 2,
                          }}>
                            <DescriptionIcon sx={{ color: '#10B981' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Description de votre talent *
                            </Typography>
                          </Box>
                          
                          <Controller
                            name="description_talent"
                            control={control}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Décrivez votre talent, votre expérience, vos réalisations, vos ambitions..."
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
                                      sx={{ 
                                        fontWeight: 500,
                                      }}
                                    />
                                  </Box>
                                }
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>

                {/* Bouton de soumission */}
                <Grid item xs={12}>
                  <Fade in style={{ transitionDelay: '600ms' }}>
                    <Card sx={{ 
                      borderRadius: 3,
                      boxShadow: 3,
                      background: 'linear-gradient(135deg, #8B0000 0%, #c53030 100%)',
                      color: 'white',
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Alert 
                          severity="warning" 
                          icon={<WarningIcon />}
                          sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            backgroundColor: alpha('#fff3cd', 0.2),
                            color: 'white',
                            '& .MuiAlert-icon': { color: '#ffc107' }
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Important :</strong> Vérifiez bien toutes les informations avant de soumettre. 
                            Vous recevrez un email de confirmation une fois votre candidature traitée.
                          </Typography>
                        </Alert>
                        
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting || !photoFile}
                          startIcon={isSubmitting ? 
                            <CircularProgress size={20} color="inherit" /> : 
                            <CloudDoneIcon />
                          }
                          sx={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                            color: 'black',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            borderRadius: 3,
                            px: 6,
                            py: 2,
                            minWidth: 250,
                            boxShadow: 3,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #c19b2e 0%, #e6c200 100%)',
                              boxShadow: 6,
                              transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: '#e5e7eb',
                              color: '#9ca3af',
                              transform: 'none',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isSubmitting ? 'Soumission en cours...' : 'Soumettre ma candidature'}
                        </Button>
                        
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          mt: 2, 
                          display: 'block',
                          fontStyle: 'italic'
                        }}>
                          En soumettant, vous acceptez les conditions de participation
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        
        {/* Footer */}
        <Box sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} Show Your Talent - Tous droits réservés
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Besoin d'aide ? Contactez-nous à support@showyourtalent.com
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Postuler;