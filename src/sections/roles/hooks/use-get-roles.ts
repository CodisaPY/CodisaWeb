import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { ROLES_QUERY } from 'src/graphql/queries/roles';
import { RolesQueryResponse } from 'src/types/role';

export interface Role {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
}

export function useGetRoles() {
  const { data, loading, error, refetch } = useQuery<RolesQueryResponse>(ROLES_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const roles = useMemo(() => data?.roles || [], [data?.roles]);

  return { 
    roles, 
    loading, 
    error,
    refetch 
  };
} 