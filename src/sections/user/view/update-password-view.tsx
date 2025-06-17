import { useLocation } from 'react-router-dom';
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AccountChangePassword } from 'src/sections/account/account-change-password';

// ----------------------------------------------------------------------

export function UpdatePasswordView() {
  const location = useLocation();
  const userFromState = location.state?.user;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={userFromState ? `Cambio de Contraseña - ${userFromState.name}` : "Cambio de Contraseña"}
        links={[
          { name: 'Seguridad', href: paths.dashboard.root },
          ...(userFromState ? [
            { name: 'Usuarios', href: paths.dashboard.seguridad.moduloUsuarios.listaUsuario }
          ] : [])
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AccountChangePassword 
        userId={userFromState?.id}
        userName={userFromState?.name}
        onSuccess={() => {
          if (userFromState) {
            // Si venimos de la lista de usuarios, volver a la lista
            window.history.back();
          }
        }}
      />
    </DashboardContent>
  );
}
