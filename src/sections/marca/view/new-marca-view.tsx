import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewMarcaForm } from '../new-marca-form';

// ----------------------------------------------------------------------

export function NewMarcaView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nueva Marca"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Nueva Marca' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewMarcaForm />
    </DashboardContent>
  );
} 