import { Helmet } from 'react-helmet-async';

import PermisosSistemasPage from '.';

 
// ----------------------------------------------------------------------

export default function PermisoViewPage() {
  return (
    <>
      <Helmet>
        <title>Permisos | Codisa</title>
      </Helmet>

      <PermisosSistemasPage />
    </>
  );
} 