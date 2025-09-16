import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewEquipoForm } from '../new-equipo-form';

// ----------------------------------------------------------------------

export function NewEquipoView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nuevo Equipo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Nuevo Equipo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewEquipoForm />
    </DashboardContent>
  );
} 