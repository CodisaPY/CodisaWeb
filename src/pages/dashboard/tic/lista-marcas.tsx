import { Helmet } from 'react-helmet-async';

import { MarcaListView } from 'src/sections/marca/view/marca-list-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Lista de Marcas',
  description: 'Listado de marcas en el sistema',
};

export default function MarcaListPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <MarcaListView />
    </>
  );
} 