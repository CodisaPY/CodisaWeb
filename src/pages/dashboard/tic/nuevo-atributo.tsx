import { Helmet } from 'react-helmet-async';

import { NewAtributoView } from 'src/sections/atributo/view/new-atributo-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Nuevo Atributo',
  description: 'Crear nuevo atributo de tipo de equipo en el sistema',
};

export default function NewAtributoPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <NewAtributoView />
    </>
  );
} 