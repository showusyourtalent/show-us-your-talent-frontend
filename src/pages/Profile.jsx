import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const profileSchema = yup.object({
  nom: yup.string().required('Nom requis'),
  prenoms: yup.string().required('Prénoms requis'),
  telephone: yup.string().nullable(),
  photo_url: yup.string().url('URL invalide').nullable(),
  universite: yup.string().nullable(),
  filiere: yup.string().nullable(),
  annee_etude: yup.string().nullable(),
});

const passwordSchema = yup.object({
  current_password: yup.string().required('Mot de passe actuel requis'),
  new_password: yup.string()
    .min(8, 'Minimum 8 caractères')
    .required('Nouveau mot de passe requis')
    .notOneOf([yup.ref('current_password')], 'Le nouveau mot de passe doit être différent'),
  new_password_confirmation: yup.string()
    .oneOf([yup.ref('new_password'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation requise'),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nom: user?.nom || '',
      prenoms: user?.prenoms || '',
      telephone: user?.telephone || '',
      photo_url: user?.photo_url || '',
      universite: user?.universite || '',
      filiere: user?.filiere || '',
      annee_etude: user?.annee_etude || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const handleEditToggle = () => {
    if (editMode) {
      resetProfile();
    }
    setEditMode(!editMode);
  };

  const onProfileSubmit = async (data) => {
    setLoading(true);
    const result = await updateProfile(data);
    setLoading(false);
    
    if (result.success) {
      setEditMode(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    setPasswordError('');
    
    try {
      // TODO: Implémenter l'API de changement de mot de passe
      // const response = await axiosInstance.put('/auth/change-password', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      
      resetPassword();
      setPasswordError('');
      // toast.success('Mot de passe modifié avec succès');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LinearProgress className="w-1/2" />
      </div>
    );
  }

  const userInfo = [
    { label: 'Email', value: user.email, icon: <EmailIcon /> },
    { label: 'Téléphone', value: user.telephone || 'Non renseigné', icon: <PhoneIcon /> },
    { label: 'Date de naissance', value: user.date_naissance ? new Date(user.date_naissance).toLocaleDateString() : 'Non renseigné', icon: <CalendarIcon /> },
    { label: 'Sexe', value: user.sexe === 'M' ? 'Masculin' : user.sexe === 'F' ? 'Féminin' : 'Autre', icon: <PersonIcon /> },
    { label: 'Université', value: user.universite || 'Non renseigné', icon: <SchoolIcon /> },
    { label: 'Filière', value: user.filiere || 'Non renseigné', icon: <SchoolIcon /> },
    { label: 'Année d\'étude', value: user.annee_etude || 'Non renseigné', icon: <SchoolIcon /> },
    { label: 'Origine', value: user.origine || 'Non renseigné' },
    { label: 'Ethnie', value: user.ethnie || 'Non renseigné' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Typography variant="h3" className="font-bold gradient-text">
          Mon Profil
        </Typography>
        
        <div className="flex items-center space-x-2">
          <Chip
            label={user.type_compte}
            className="capitalize"
            color={
              user.type_compte === 'admin' ? 'error' :
              user.type_compte === 'promoteur' ? 'warning' : 'success'
            }
          />
          <Chip
            label={user.compte_actif ? 'Compte actif' : 'Compte inactif'}
            color={user.compte_actif ? 'success' : 'default'}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        className="mb-8"
      >
        <Tab label="Informations personnelles" />
        <Tab label="Sécurité" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar
                    src={user.photo_url}
                    className="w-24 h-24 border-4 border-custom-gold"
                  >
                    {user.prenoms?.[0]}{user.nom?.[0]}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      className="absolute bottom-0 right-0 bg-custom-gold text-white hover:bg-amber-600"
                      size="small"
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                </div>
                <div>
                  <Typography variant="h4" className="font-bold">
                    {user.prenoms} {user.nom}
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    Membre depuis {new Date(user.created_at).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
              
              <Button
                variant={editMode ? "outlined" : "contained"}
                startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                className={editMode ? "border-red-600 text-red-600" : "btn-primary"}
              >
                {editMode ? 'Annuler' : 'Modifier'}
              </Button>
            </div>

            <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
              <Grid container spacing={3}>
                {editMode ? (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Nom *"
                        {...registerProfile('nom')}
                        error={!!profileErrors.nom}
                        helperText={profileErrors.nom?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Prénoms *"
                        {...registerProfile('prenoms')}
                        error={!!profileErrors.prenoms}
                        helperText={profileErrors.prenoms?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        {...registerProfile('telephone')}
                        error={!!profileErrors.telephone}
                        helperText={profileErrors.telephone?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Photo (URL)"
                        {...registerProfile('photo_url')}
                        error={!!profileErrors.photo_url}
                        helperText={profileErrors.photo_url?.message}
                        placeholder="https://exemple.com/photo.jpg"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Université"
                        {...registerProfile('universite')}
                        error={!!profileErrors.universite}
                        helperText={profileErrors.universite?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Filière"
                        {...registerProfile('filiere')}
                        error={!!profileErrors.filiere}
                        helperText={profileErrors.filiere?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Année d'étude"
                        {...registerProfile('annee_etude')}
                        error={!!profileErrors.annee_etude}
                        helperText={profileErrors.annee_etude?.message}
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12}}>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={handleEditToggle}
                          className="border-gray-400 text-gray-600"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          className="btn-primary"
                          disabled={loading}
                        >
                          {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                      </div>
                    </Grid>
                  </>
                ) : (
                  <>
                    {userInfo.map((info, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={index}>
                        <Card variant="outlined" className="h-full">
                          <CardContent>
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-400">
                                {info.icon}
                              </div>
                              <div>
                                <Typography variant="caption" className="text-gray-500 uppercase">
                                  {info.label}
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                  {info.value}
                                </Typography>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </>
                )}
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h5" className="font-bold mb-6 text-custom-dark-red">
              Sécurité du compte
            </Typography>
            
            <Alert severity="info" className="mb-6">
              Pour modifier votre mot de passe, vous devez confirmer votre mot de passe actuel.
            </Alert>

            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="max-w-md">
              <div className="space-y-4">
                <TextField
                  fullWidth
                  label="Mot de passe actuel *"
                  type="password"
                  {...registerPassword('current_password')}
                  error={!!passwordErrors.current_password}
                  helperText={passwordErrors.current_password?.message}
                />
                
                <TextField
                  fullWidth
                  label="Nouveau mot de passe *"
                  type="password"
                  {...registerPassword('new_password')}
                  error={!!passwordErrors.new_password}
                  helperText={passwordErrors.new_password?.message}
                />
                
                <TextField
                  fullWidth
                  label="Confirmer le nouveau mot de passe *"
                  type="password"
                  {...registerPassword('new_password_confirmation')}
                  error={!!passwordErrors.new_password_confirmation}
                  helperText={passwordErrors.new_password_confirmation?.message}
                />
                
                {passwordError && (
                  <Alert severity="error">{passwordError}</Alert>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  className="btn-secondary"
                  disabled={loading}
                >
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="h-full">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <PersonIcon className="text-white text-2xl" />
                </div>
                <Typography variant="h2" className="font-bold mb-2">
                  0
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Candidatures actives
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="h-full">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <SchoolIcon className="text-white text-2xl" />
                </div>
                <Typography variant="h2" className="font-bold mb-2">
                  0
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Votes reçus
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="h-full">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="text-white text-2xl" />
                </div>
                <Typography variant="h2" className="font-bold mb-2">
                  0
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Participations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Profile;