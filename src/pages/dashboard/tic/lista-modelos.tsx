import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ModeloListView } from 'src/sections/modelo/view/modelo-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Lista de Modelos | Dashboard - ${CONFIG.appName}` };

export default function ModeloListPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ModeloListView />
    </>
  );
} 