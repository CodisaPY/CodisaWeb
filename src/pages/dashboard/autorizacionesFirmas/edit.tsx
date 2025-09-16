import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AutorizacionesFirmasView } from 'src/sections/autorizacionesFirmas/view/autorizaciones-firmas-view';
 
 
// ----------------------------------------------------------------------

const metadata = { title: `Autorizaciones de firmas | Seguridad - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AutorizacionesFirmasView />
    </>
  );
}
