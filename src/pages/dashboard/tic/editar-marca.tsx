import { Helmet } from 'react-helmet-async';

import { MarcaEditView } from 'src/sections/marca/view/marca-edit-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Editar Marca',
  description: 'Edición de marca en el sistema',
};

export default function MarcaEditPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <MarcaEditView />
    </>
  );
} 