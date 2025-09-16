import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NewEquipoView } from 'src/sections/equipo/view/new-equipo-view';

// ----------------------------------------------------------------------

const metadata = { title: `Nuevo Equipo | Dashboard - ${CONFIG.appName}` };

export default function NewEquipoPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <NewEquipoView />
    </>
  );
} 