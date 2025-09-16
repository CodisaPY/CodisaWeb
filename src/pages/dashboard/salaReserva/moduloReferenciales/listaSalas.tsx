import { Helmet } from 'react-helmet-async';

import SalaListView from 'src/sections/sala/view/sala-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Lista de Salas</title>
      </Helmet>

      <SalaListView />
    </>
  );
}
