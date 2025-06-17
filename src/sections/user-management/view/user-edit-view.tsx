import type { EditUserSchemaType } from 'src/sections/user/user-edit-form';

import { useParams, useLocation, useNavigate } from 'react-router-dom';

import UserEditForm from 'src/sections/user/user-edit-form';

export default function UserEditView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user as EditUserSchemaType | undefined;

  if (!user) return <div>No se encontraron datos del usuario.</div>;

  return (
    <UserEditForm
      initialValues={user}
      userId={id as string}
      onSuccess={() => navigate(-1)}
    />
  );
}