import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewRoleForm } from '../new-role-form';

// ----------------------------------------------------------------------

export function NewRoleView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nuevo Rol"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Roles', href: paths.dashboard.seguridad.moduloRoles.root },
          { name: 'Nuevo Rol' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewRoleForm />
    </DashboardContent>
  );
} 