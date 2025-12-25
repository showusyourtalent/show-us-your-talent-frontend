import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  EmojiEvents as EventsIcon,
  TrendingUp as TrendingIcon,
  AccountBalanceWallet as WalletIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: () => axiosInstance.get('/admin/statistics').then(res => res.data),
  });

  const { data: recentUsers } = useQuery({
    queryKey: ['recent-users'],
    queryFn: () => axiosInstance.get('/admin/users?limit=5').then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LinearProgress className="w-1/2" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Utilisateurs',
      value: statistics?.total_users || 0,
      icon: <PeopleIcon className="text-3xl" />,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Candidats Actifs',
      value: statistics?.active_candidats || 0,
      icon: <PeopleIcon className="text-3xl" />,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Promoteurs',
      value: statistics?.total_promoteurs || 0,
      icon: <EventsIcon className="text-3xl" />,
      color: 'bg-purple-500',
      change: '+5%',
    },
    {
      title: 'Nouveaux (7j)',
      value: statistics?.recent_users || 0,
      icon: <TrendingIcon className="text-3xl" />,
      color: 'bg-amber-500',
      change: '+15%',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h4" className="font-bold gradient-text mb-2">
          Tableau de bord Admin
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Vue d'ensemble de la plateforme
        </Typography>
      </div>

      {/* Statistiques */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, md: 3 }} lg={3} key={index}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <div className={`${stat.color.replace('bg-', 'text-')}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <Chip
                    label={stat.change}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </div>
                <Typography variant="h3" className="font-bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Derniers utilisateurs */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography variant="h5" className="font-bold">
                Derniers utilisateurs
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Utilisateurs récemment inscrits
              </Typography>
            </div>
            <IconButton>
              <MoreIcon />
            </IconButton>
          </div>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Inscrit le</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentUsers?.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {user.prenoms?.[0]}{user.nom?.[0]}
                          </span>
                        </div>
                        <span>
                          {user.prenoms} {user.nom}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.type_compte}
                        size="small"
                        className="capitalize"
                        color={
                          user.type_compte === 'admin' ? 'error' :
                          user.type_compte === 'promoteur' ? 'warning' : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.compte_actif ? 'Actif' : 'Inactif'}
                        size="small"
                        color={user.compte_actif ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;