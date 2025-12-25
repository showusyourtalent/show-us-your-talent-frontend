import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  LinearProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

const Editions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: editions, isLoading } = useQuery({
    queryKey: ['all-editions'],
    queryFn: () => axiosInstance.get('/editions').then(res => res.data.data),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'brouillon': return 'warning';
      case 'terminee': return 'default';
      case 'archivee': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'brouillon': 'Brouillon',
      'terminee': 'Terminée',
      'archivee': 'Archivée',
    };
    return labels[status] || status;
  };

  const filteredEditions = editions?.filter(edition => {
    const matchesSearch = !searchTerm || 
      edition.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edition.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = !yearFilter || edition.annee.toString() === yearFilter;
    const matchesStatus = !statusFilter || edition.statut === statusFilter;
    
    return matchesSearch && matchesYear && matchesStatus;
  });

  const years = [...new Set(editions?.map(e => e.annee) || [])].sort((a, b) => b - a);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LinearProgress className="w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Typography variant="h3" className="font-bold gradient-text mb-4">
          Toutes les éditions
        </Typography>
        <Typography variant="body1" className="text-gray-600 max-w-2xl mx-auto">
          Découvrez l'historique complet des éditions de SHOW US YOUR TALENT. 
          Postulez aux éditions actives pour montrer votre talent.
        </Typography>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Rechercher une édition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Année</InputLabel>
                <Select
                  value={yearFilter}
                  label="Année"
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <MenuItem value="">Toutes</MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="active">Actives</MenuItem>
                  <MenuItem value="brouillon">Brouillons</MenuItem>
                  <MenuItem value="terminee">Terminées</MenuItem>
                  <MenuItem value="archivee">Archivées</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setYearFilter('');
                  setStatusFilter('');
                }}
                className="border-custom-gold text-custom-gold h-14"
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des éditions */}
      {filteredEditions?.length > 0 ? (
        <>
          <Grid container spacing={4}>
            {filteredEditions.map((edition) => (
              <Grid size={{ xs: 12, md: 6 }} lg={4} key={edition.id}>
                <Card className="h-full hover:shadow-xl transition-shadow group">
                  <CardContent className="h-full flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Chip
                          label={`${edition.annee} - ${edition.numero_edition}ème`}
                          className="bg-custom-dark-red text-white"
                        />
                        <Chip
                          label={getStatusLabel(edition.statut)}
                          color={getStatusColor(edition.statut)}
                          size="small"
                        />
                      </div>
                      
                      <Typography variant="h5" className="font-bold mb-2 group-hover:text-custom-gold transition">
                        {edition.nom}
                      </Typography>
                      
                      <Typography variant="body2" className="text-gray-600 mb-4 line-clamp-2">
                        {edition.description}
                      </Typography>
                    </div>

                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="mr-2 text-sm" />
                        <Typography variant="body2">
                          {edition.inscriptions_ouvertes ? (
                            <>
                              Inscriptions jusqu'au{' '}
                              <span className="font-semibold text-green-600">
                                {new Date(edition.date_fin_inscriptions).toLocaleDateString()}
                              </span>
                            </>
                          ) : (
                            'Inscriptions fermées'
                          )}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <PeopleIcon className="mr-2 text-sm" />
                        <Typography variant="body2">
                          {edition.categories?.length || 0} catégories
                        </Typography>
                      </div>
                      
                      {edition.promoteur && (
                        <div className="text-sm text-gray-500">
                          Organisé par: {edition.promoteur.prenoms} {edition.promoteur.nom}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Chip
                          label={edition.inscriptions_ouvertes ? 'Ouvert' : 'Fermé'}
                          size="small"
                          color={edition.inscriptions_ouvertes ? 'success' : 'default'}
                        />
                        <Chip
                          label={edition.votes_ouverts ? 'Votes ouverts' : 'Votes fermés'}
                          size="small"
                          color={edition.votes_ouverts ? 'info' : 'default'}
                        />
                      </div>
                      
                      {edition.statut === 'active' && edition.inscriptions_ouvertes ? (
                        <Link to={`/postuler?edition=${edition.id}`}>
                          <Button
                            variant="contained"
                            size="small"
                            className="btn-primary"
                            endIcon={<ArrowIcon />}
                          >
                            Postuler
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          className="border-gray-300 text-gray-600"
                          disabled
                        >
                          Non disponible
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredEditions.length > 9 && (
            <div className="flex justify-center mt-8">
              <Pagination
                count={Math.ceil(filteredEditions.length / 9)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                className="[&_.MuiPaginationItem-root]:border-custom-gold [&_.Mui-selected]:bg-custom-gold"
              />
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <TrophyIcon className="text-6xl text-gray-300 mx-auto mb-4" />
          <Typography variant="h6" className="text-gray-500 mb-2">
            Aucune édition trouvée
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            Aucune édition ne correspond à vos critères de recherche
          </Typography>
        </Card>
      )}
    </div>
  );
};

export default Editions;