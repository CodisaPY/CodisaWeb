import { Helmet } from 'react-helmet-async';

import { NewMarcaView } from 'src/sections/marca/view/new-marca-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Nueva Marca',
  description: 'Creación de nueva marca en el sistema',
};

export default function NewMarcaPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <NewMarcaView />
    </>
  );
} 