import { Helmet } from 'react-helmet-async';

import { NewUserView } from 'src/sections/user/view/new-user-view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Nuevo Usuario',
  description: 'Creación de nuevo usuario en el sistema',
};

export default function NewUserPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <NewUserView />
    </>
  );
}
