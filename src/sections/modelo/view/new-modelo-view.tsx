import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewModeloForm } from '../new-modelo-form';

// ----------------------------------------------------------------------

export function NewModeloView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nuevo Modelo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Nuevo Modelo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewModeloForm />
    </DashboardContent>
  );
} 