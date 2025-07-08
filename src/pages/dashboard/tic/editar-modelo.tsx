import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ModeloEditView } from 'src/sections/modelo/view/modelo-edit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Editar Modelo | Dashboard - ${CONFIG.appName}` };

export default function ModeloEditPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ModeloEditView />
    </>
  );
} 