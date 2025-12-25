import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const editionSchema = yup.object({
  nom: yup.string().required('Nom requis'),
  annee: yup.number()
    .required('Année requise')
    .min(2024, 'Année minimum : 2024')
    .max(2030, 'Année maximum : 2030'),
  numero_edition: yup.number()
    .required('Numéro d\'édition requis')
    .min(1, 'Minimum 1'),
  description: yup.string().max(2000, 'Maximum 2000 caractères'),
  statut: yup.string().oneOf(['brouillon', 'active', 'terminee', 'archivee']),
  date_debut_inscriptions: yup.date().nullable(),
  date_fin_inscriptions: yup.date()
    .nullable()
    .when('date_debut_inscriptions', (date_debut_inscriptions, schema) => {
      return date_debut_inscriptions
        ? schema.min(date_debut_inscriptions, 'Doit être après la date de début')
        : schema;
    }),
});

const categorySchema = yup.object({
  nom: yup.string().required('Nom requis'),
  description: yup.string().max(1000, 'Maximum 1000 caractères'),
  ordre_affichage: yup.number().default(0),
  active: yup.boolean().default(true),
});

const EditionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Mutation pour créer/modifier une édition
  const editionMutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return axiosInstance.put(`/promoteur/editions/${id}`, data);
      } else {
        return axiosInstance.post('/promoteur/editions', data);
      }
    },
    onSuccess: () => {
      toast.success(`Édition ${isEditing ? 'modifiée' : 'créée'} avec succès !`);
      queryClient.invalidateQueries(['promoteur-editions']);
      navigate('/promoteur');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    },
  });

  // Mutation pour les catégories
  const categoryMutation = useMutation({
    mutationFn: (data) => {
      if (editingCategory) {
        return axiosInstance.put(`/promoteur/categories/${editingCategory.id}`, data);
      } else {
        return axiosInstance.post(`/promoteur/editions/${id}/categories`, data);
      }
    },
    onSuccess: () => {
      toast.success(`Catégorie ${editingCategory ? 'modifiée' : 'ajoutée'} !`);
      queryClient.invalidateQueries(['edition-categories', id]);
      setOpenCategoryDialog(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    },
  });

  // Récupérer l'édition si édition
  const { data: edition, isLoading } = useQuery({
    queryKey: ['edition', id],
    queryFn: () => axiosInstance.get(`/promoteur/editions/${id}`).then(res => res.data.data),
    enabled: isEditing,
  });

  // Récupérer les catégories
  const { data: categories } = useQuery({
    queryKey: ['edition-categories', id],
    queryFn: () => axiosInstance.get(`/promoteur/editions/${id}/categories`).then(res => res.data.data),
    enabled: isEditing,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(editionSchema),
    defaultValues: {
      statut: 'brouillon',
      annee: new Date().getFullYear(),
    },
  });

  const categoryForm = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      active: true,
      ordre_affichage: 0,
    },
  });

  useEffect(() => {
    if (edition && isEditing) {
      reset({
        nom: edition.nom,
        annee: edition.annee,
        numero_edition: edition.numero_edition,
        description: edition.description,
        statut: edition.statut,
        date_debut_inscriptions: edition.date_debut_inscriptions?.split('T')[0],
        date_fin_inscriptions: edition.date_fin_inscriptions?.split('T')[0],
      });
    }
  }, [edition, isEditing, reset]);

  useEffect(() => {
    if (editingCategory && openCategoryDialog) {
      categoryForm.reset({
        nom: editingCategory.nom,
        description: editingCategory.description,
        ordre_affichage: editingCategory.ordre_affichage,
        active: editingCategory.active,
      });
    } else if (!editingCategory && openCategoryDialog) {
      categoryForm.reset({
        nom: '',
        description: '',
        ordre_affichage: categories?.length || 0,
        active: true,
      });
    }
  }, [editingCategory, openCategoryDialog, categoryForm, categories]);

  const onSubmitEdition = (data) => {
    editionMutation.mutate(data);
  };

  const onSubmitCategory = (data) => {
    categoryMutation.mutate(data);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      try {
        await axiosInstance.delete(`/promoteur/categories/${categoryId}`);
        toast.success('Catégorie supprimée');
        queryClient.invalidateQueries(['edition-categories', id]);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleActivateEdition = async () => {
    if (window.confirm('Activer cette édition ? Les inscriptions pourront être ouvertes.')) {
      try {
        await axiosInstance.put(`/promoteur/editions/${id}`, { statut: 'active' });
        toast.success('Édition activée');
        queryClient.invalidateQueries(['edition', id]);
        queryClient.invalidateQueries(['promoteur-editions']);
      } catch (error) {
        toast.error('Erreur lors de l\'activation');
      }
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <LinearProgress className="w-1/2" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Typography variant="h3" className="font-bold gradient-text mb-2">
            {isEditing ? 'Modifier l\'édition' : 'Nouvelle édition'}
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            {isEditing ? 'Modifiez les détails de votre édition' : 'Créez une nouvelle édition de la compétition'}
          </Typography>
        </div>
        
        {isEditing && edition?.statut === 'brouillon' && (
          <Button
            variant="contained"
            className="btn-primary"
            onClick={handleActivateEdition}
          >
            Activer l'édition
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmitEdition)}>
        <Card className="mb-8">
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nom de l'édition *"
                  {...register('nom')}
                  error={!!errors.nom}
                  helperText={errors.nom?.message}
                  placeholder="Ex: Show Us Your Talent 2024"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Année *"
                  type="number"
                  {...register('annee')}
                  error={!!errors.annee}
                  helperText={errors.annee?.message}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Numéro d'édition *"
                  type="number"
                  {...register('numero_edition')}
                  error={!!errors.numero_edition}
                  helperText={errors.numero_edition?.message}
                  placeholder="Ex: 3"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  placeholder="Décrivez l'édition, ses objectifs, son thème..."
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Date début inscriptions"
                  type="date"
                  {...register('date_debut_inscriptions')}
                  error={!!errors.date_debut_inscriptions}
                  helperText={errors.date_debut_inscriptions?.message}
                  InputLabelProps={{ shrink: true }}
                  disabled={isEditing && edition?.statut !== 'brouillon'}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Date fin inscriptions"
                  type="date"
                  {...register('date_fin_inscriptions')}
                  error={!!errors.date_fin_inscriptions}
                  helperText={errors.date_fin_inscriptions?.message}
                  InputLabelProps={{ shrink: true }}
                  disabled={isEditing && edition?.statut !== 'brouillon'}
                />
              </Grid>
              
              {isEditing && (
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...register('statut')}
                        checked={watch('statut') === 'active'}
                        onChange={(e) => setValue('statut', e.target.checked ? 'active' : 'brouillon')}
                        color="primary"
                        disabled={edition?.statut === 'terminee'}
                      />
                    }
                    label={
                      <Typography>
                        Édition active{' '}
                        <Chip
                          label={watch('statut')}
                          size="small"
                          className="ml-2"
                          color={
                            watch('statut') === 'active' ? 'success' :
                            watch('statut') === 'terminee' ? 'default' : 'warning'
                          }
                        />
                      </Typography>
                    }
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Gestion des catégories (seulement en mode édition) */}
        {isEditing && (
          <Card className="mb-8">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h5" className="font-bold text-custom-dark-red">
                  Catégories de l'édition
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingCategory(null);
                    setOpenCategoryDialog(true);
                  }}
                  className="border-custom-gold text-custom-gold"
                >
                  Ajouter une catégorie
                </Button>
              </div>

              {categories?.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Card key={category.id} variant="outlined" className="hover:bg-gray-50">
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <Typography variant="h6" className="font-bold">
                            {category.nom}
                            {!category.active && (
                              <Chip
                                label="Inactive"
                                size="small"
                                className="ml-2"
                                color="default"
                              />
                            )}
                          </Typography>
                          {category.description && (
                            <Typography variant="body2" className="text-gray-600 mt-1">
                              {category.description}
                            </Typography>
                          )}
                          <Typography variant="caption" className="text-gray-500">
                            Ordre: {category.ordre_affichage}
                          </Typography>
                        </div>
                        <div className="flex space-x-2">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingCategory(category);
                              setOpenCategoryDialog(true);
                            }}
                            className="text-custom-gold"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert severity="info">
                  Aucune catégorie définie. Ajoutez des catégories pour permettre aux candidats de postuler.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button
            variant="outlined"
            onClick={() => navigate('/promoteur')}
            className="border-custom-gold text-custom-gold"
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            className="btn-primary"
            disabled={editionMutation.isLoading}
          >
            {editionMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>

      {/* Dialog pour ajouter/modifier une catégorie */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => {
          setOpenCategoryDialog(false);
          setEditingCategory(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center justify-between">
          <Typography variant="h6" className="font-bold">
            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              setOpenCategoryDialog(false);
              setEditingCategory(null);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12}}>
                <TextField
                  fullWidth
                  label="Nom de la catégorie *"
                  {...categoryForm.register('nom')}
                  error={!!categoryForm.formState.errors.nom}
                  helperText={categoryForm.formState.errors.nom?.message}
                  placeholder="Ex: Chant, Danse, Théâtre..."
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...categoryForm.register('description')}
                  error={!!categoryForm.formState.errors.description}
                  helperText={categoryForm.formState.errors.description?.message}
                  placeholder="Décrivez la catégorie, les critères d'évaluation..."
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Ordre d'affichage"
                  type="number"
                  {...categoryForm.register('ordre_affichage')}
                  error={!!categoryForm.formState.errors.ordre_affichage}
                  helperText={categoryForm.formState.errors.ordre_affichage?.message}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      {...categoryForm.register('active')}
                      defaultChecked
                    />
                  }
                  label="Catégorie active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCategoryDialog(false);
                setEditingCategory(null);
              }}
              className="text-gray-600"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="btn-primary"
              disabled={categoryMutation.isLoading}
            >
              {categoryMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default EditionForm;