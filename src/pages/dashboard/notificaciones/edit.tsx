import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NotificacionesView } from 'src/sections/notificaciones/view/notificaciones-view';

 
// ----------------------------------------------------------------------

const metadata = { title: `Parametrizaciones de notificaciones | Seguridad - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <NotificacionesView />
    </>
  );
}
