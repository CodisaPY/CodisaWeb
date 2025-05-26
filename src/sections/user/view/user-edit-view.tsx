import type { IUserItem } from 'src/types/user';
import { useLocation } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import UserEditForm from '../user-edit-form';

// ----------------------------------------------------------------------

type Props = {
  user?: IUserItem;
};

export function UserEditView({ user: currentUser }: Props) {
  const location = useLocation();
  const userFromState = location.state?.user;

  const user = userFromState || currentUser;

  const initialValues = {
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    sucursal: { 
      name: user?.sucursal || '', 
      description: user?.sucursal || '' 
    },
    cargo: { 
      name: user?.cargo || '', 
      description: user?.cargo || '' 
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Usuario"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios', href: paths.dashboard.user.root },
          { name: user?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <UserEditForm 
        initialValues={initialValues}
        userId={user?.id || ''}
      />
    </DashboardContent>
  );
}
