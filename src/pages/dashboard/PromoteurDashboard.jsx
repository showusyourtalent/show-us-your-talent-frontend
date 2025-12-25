import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  HowToVote as VoteIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const PromoteurDashboard = () => {
  const { data: editions, isLoading } = useQuery({
    queryKey: ['promoteur-editions'],
    queryFn: () => axiosInstance.get('/promoteur/editions').then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LinearProgress className="w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" className="font-bold gradient-text mb-2">
            Tableau de bord Promoteur
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Gérez vos éditions et candidatures
          </Typography>
        </div>
        <Link to="/promoteur/editions/nouvelle">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="btn-primary"
          >
            Nouvelle édition
          </Button>
        </Link>
      </div>

      {/* Éditions en cours */}
      <Grid container spacing={3}>
        {editions?.map((edition) => (
          <Grid item xs={12} md={6} lg={4} key={edition.id}>
            <Card className="hover:shadow-xl transition-shadow h-full">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Typography variant="h6" className="font-bold">
                      {edition.nom}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {edition.annee} - {edition.numero_edition}ème édition
                    </Typography>
                  </div>
                  <Chip
                    label={edition.statut}
                    color={
                      edition.statut === 'active' ? 'success' :
                      edition.statut === 'brouillon' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Inscriptions
                    </Typography>
                    <Chip
                      label={edition.inscriptions_ouvertes ? 'Ouvertes' : 'Fermées'}
                      size="small"
                      color={edition.inscriptions_ouvertes ? 'success' : 'default'}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Votes
                    </Typography>
                    <Chip
                      label={edition.votes_ouverts ? 'Ouverts' : 'Fermés'}
                      size="small"
                      color={edition.votes_ouverts ? 'success' : 'default'}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="font-bold">
                      {edition.nombre_candidatures || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Candidatures
                    </Typography>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/promoteur/editions/${edition.id}`}>
                      <Button
                        variant="outlined"
                        size="small"
                        className="border-custom-gold text-custom-gold hover:bg-custom-gold hover:text-white"
                      >
                        Voir
                      </Button>
                    </Link>
                    {edition.statut === 'brouillon' && (
                      <Button
                        variant="contained"
                        size="small"
                        className="btn-primary"
                      >
                        Activer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default PromoteurDashboard;