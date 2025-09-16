import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ConfiguracionAutorizacionesFirmasForm } from '../configuracion-firmas-form';
  
// ----------------------------------------------------------------------

export function AutorizacionesFirmasView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Autorizaciones de firmas por estado"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Autorizaciones', href: paths.dashboard.seguridad.moduloNotificaciones.ajusteAutorizacionesFirmas },
          { name: 'Configuración por pantalla' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

     <ConfiguracionAutorizacionesFirmasForm/>
    </DashboardContent>
  );
}
