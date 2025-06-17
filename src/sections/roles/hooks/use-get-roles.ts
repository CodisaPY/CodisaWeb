import { useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/config-global';

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

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.serverUrl}/api/keycloak/groups/roles`, {
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
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, refetch: fetchRoles };
} 