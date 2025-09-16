import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRolesFromToken } from '@guard/role-utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RolePermissionsTree } from '../role-permissions-tree';

// ----------------------------------------------------------------------

type RoleData = {
  id: string;
  name: string;
  description: string;
  composite: boolean;
};

export function RolePermissionsView() {
  const router = useRouter();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleData, setRoleData] = useState<RoleData | null>(null);

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);

    // Obtener datos del rol del estado de navegación
    const state = location.state as { role: RoleData } | null;
    if (state?.role) {
      setRoleData(state.role);
    } else {
      // Si no hay datos del rol, redirigir a la lista de roles
      toast.error('No se encontraron datos del rol');
      router.push(paths.dashboard.seguridad.moduloRoles.listaRol);
    }

    setLoading(false);
  }, [location.state, router]);

  const handlePermissionsChange = (permissions: string[]) => {
    setSelectedPermissions(permissions);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roleData) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading={`Permisos del Rol: ${roleData.name}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Roles', href: paths.dashboard.seguridad.moduloRoles.listaRol },
          { name: 'Permisos' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">
              Detalles del Rol
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {roleData.description}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                ID: {roleData.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Compuesto: {roleData.composite ? 'Sí' : 'No'}
              </Typography>
            </Stack>
          </Stack>
          
          <Box>
            <RolePermissionsTree
              roleId={roleData.id}
              roleName={roleData.name}
              onPermissionsChange={handlePermissionsChange}
            />
          </Box>
        </Stack>
      </Card>
    </Container>
  );
} 