import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewUserForm } from '../new-user-form';

// ----------------------------------------------------------------------

export function NewUserView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nuevo Usuario"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios', href: paths.dashboard.user.root },
          { name: 'Nuevo Usuario' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewUserForm />
    </DashboardContent>
  );
} 