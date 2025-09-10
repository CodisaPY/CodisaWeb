import { useGraphQLUsers } from 'src/hooks/use-graphql-users';

// ----------------------------------------------------------------------

export type User = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  avatarUrl: string | null;
  department: string;
  cargo: string;
  sucursal: string;
  groupRole: string;
};

export function useGetUsers() {
  const { users: graphqlUsers, loading, error, refetch } = useGraphQLUsers();

  // Transformar los datos de GraphQL al formato esperado por el componente
  const users: User[] = graphqlUsers.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.enabled ? 'active' : 'inactive',
    createdAt: new Date(parseInt(user.createdTimestamp, 10)),
    avatarUrl: null,
    department: user.attributes?.departamento?.[0] || 'Sin departamento',
    cargo: user.attributes?.cargo?.[0] || 'Sin cargo',
    sucursal: user.attributes?.sucursal?.[0] || 'Sin sucursal',
    groupRole: user.groupRole || 'N/A',
    role: user.groupRoleDescription || 'N/A'
  }));

  return { users, loading, error: error?.message || null, refetch };
} 