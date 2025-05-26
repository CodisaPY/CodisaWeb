import { useState, useEffect } from 'react';

export interface Role {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
}

export function useGetRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/keycloak/groups/roles', {
          headers: {
            'accept': 'application/json',
          },
        });
        const result = await response.json();
        
        if (result.success) {
          setRoles(result.data);
        } else {
          console.error('Error fetching roles:', result.message);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading };
} 