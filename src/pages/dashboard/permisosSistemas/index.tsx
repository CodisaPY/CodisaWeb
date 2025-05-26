import { useLocation } from 'react-router-dom';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Helmet } from 'react-helmet-async';
import { Box, Chip, Typography } from '@mui/material';
import { ArbolPermisos } from './arbol-permisos';

export default function PermisosSistemasPage() {
  const location = useLocation();
  const userData = location.state?.user;

  return (
    <DashboardContent>
      <Helmet>
        <title>Permisos del Sistema | Codisa</title>
      </Helmet>

      <CustomBreadcrumbs
        heading="Permisos del Sistema"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios', href: paths.dashboard.seguridad.moduloUsuarios.listaUsuario },
          { name: userData?.name || 'Usuario' },
          { name: 'Permisos del Sistema' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Chip label={userData?.name || ''} color="primary" />
        <Typography variant="body2" color="text.secondary">
          {userData?.email}
        </Typography>
      </Box>

      <ArbolPermisos userData={userData} />
    </DashboardContent>
  );
} 