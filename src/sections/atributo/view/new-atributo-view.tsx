import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewAtributoForm } from '../new-atributo-form';

// ----------------------------------------------------------------------

export function NewAtributoView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nuevo Atributo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Nuevo Atributo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewAtributoForm />
    </DashboardContent>
  );
} 