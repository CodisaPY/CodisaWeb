import { Helmet } from 'react-helmet-async';

import { UserListView } from 'src/sections/user-management/view/user-list-view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title>Usuarios | Codisa</title>
      </Helmet>

      <UserListView />
    </>
  );
} 