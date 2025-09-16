import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NewModeloView } from 'src/sections/modelo/view/new-modelo-view';

// ----------------------------------------------------------------------

const metadata = { title: `Nuevo Modelo | Dashboard - ${CONFIG.appName}` };

export default function NewModeloPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <NewModeloView />
    </>
  );
} 