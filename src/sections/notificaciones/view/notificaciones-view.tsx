import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ConfiguracionNotificacionesForm } from '../configuracion-notificaciones-form';
 
// ----------------------------------------------------------------------

export function NotificacionesView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Notificaciones por estado"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notificaciones', href: paths.dashboard.seguridad.moduloNotificaciones.ajusteEnvioNotificaciones },
          { name: 'Configuración por pantalla' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

     <ConfiguracionNotificacionesForm/>
    </DashboardContent>
  );
}
