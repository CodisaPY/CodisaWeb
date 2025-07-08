import { Helmet } from 'react-helmet-async';

import { AtributoEditView } from 'src/sections/atributo/view/atributo-edit-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Editar Atributo',
  description: 'Edición de atributo de tipo de equipo en el sistema',
};

export default function AtributoEditPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <AtributoEditView />
    </>
  );
} 