import { useState, useEffect } from 'react';
import axios from 'axios';

// ----------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  avatarUrl?: string;
  department?: string;
  position?: string;
  branch?: string;
}

interface Pagination {
  page: number;
  rowsPerPage: number;
  total: number;
}

interface KeycloakUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified: boolean;
  attributes?: {
    cargo?: string[];
    departamento?: string[];
    sucursal?: string[];
  };
  createdTimestamp: number;
  enabled: boolean;
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
}

export function useGetUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    rowsPerPage: 10,
    total: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get<KeycloakUser[]>('http://localhost:4000/api/keycloak/usuarios');
        
        const formattedUsers: User[] = response.data.map((user) => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email || '',
          role: user.access.manage ? 'Administrador' : 'Usuario',
          status: user.enabled ? 'active' : 'inactive',
          createdAt: new Date(user.createdTimestamp),
          department: user.attributes?.departamento?.[0] || '',
          position: user.attributes?.cargo?.[0] || '',
          branch: user.attributes?.sucursal?.[0] || '',
          avatarUrl: undefined, // Podríamos agregar una URL por defecto o generar un avatar basado en el nombre
        }));

        setUsers(formattedUsers);
        setPagination((prev) => ({
          ...prev,
          total: formattedUsers.length,
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        // En caso de error, podríamos mostrar un mensaje al usuario
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return {
    users,
    loading,
    pagination,
    setPagination,
  };
} 