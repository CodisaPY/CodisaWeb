import { Helmet } from 'react-helmet-async';

import { AtributoListView } from 'src/sections/atributo/view/atributo-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Lista de Atributos',
  description: 'Lista de atributos de tipos de equipo en el sistema',
};

export default function AtributoListPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <AtributoListView />
    </>
  );
} 