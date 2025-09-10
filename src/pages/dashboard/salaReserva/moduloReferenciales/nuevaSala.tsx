import { Helmet } from 'react-helmet-async';

import { SalaForm } from 'src/sections/sala/sala-form';

// ----------------------------------------------------------------------

export default function NuevaSalaPage() {
  return (
    <>
      <Helmet>
        <title> Nueva Sala</title>
      </Helmet>

      <SalaForm />
    </>
  );
}
