import { useState, useEffect } from 'react';
import axios from 'axios';
import { CONFIG } from 'src/config-global';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No hay token de acceso');
        }

        const response = await axios.get(`${CONFIG.serverUrl}/api/keycloak/usuarios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Respuesta de la API:', response.data);

        const formattedUsers = response.data.map((user: any) => {
          const formattedUser = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            status: user.enabled ? 'active' : 'inactive',
            createdAt: new Date(user.createdTimestamp),
            avatarUrl: null,
            departamento: user.attributes?.departamento?.[0] || 'Sin departamento',
            cargo: user.attributes?.cargo?.[0] || 'Sin cargo',
            sucursal: user.attributes?.sucursal?.[0] || 'Sin sucursal',
            groupRole: user.groupRole || 'N/A',
            role: user.groupRoleDescription || 'N/A'
          };

          console.log('Usuario formateado:', formattedUser);
          return formattedUser;
        });

        setUsers(formattedUsers);
      } catch (err) {
        console.error('Error al obtener usuarios:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
} 