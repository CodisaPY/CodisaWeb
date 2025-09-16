import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { 
  ROLES_QUERY, 
  ROLE_BY_NAME_QUERY, 
  GROUP_ROLES_QUERY, 
  USER_ROLES_QUERY,
  SCREEN_HIERARCHY_LEVEL3_QUERY,
  ROLE_PERMISSIONS_QUERY
} from '../graphql/queries/roles';
import { 
  CREATE_ROLE_MUTATION, 
  UPDATE_ROLE_MUTATION, 
  DELETE_ROLE_MUTATION,
  ASSIGN_ROLES_TO_USER_MUTATION,
  REMOVE_ROLES_FROM_USER_MUTATION,
  ADD_ROLES_TO_GROUP_MUTATION,
  REMOVE_ROLES_FROM_GROUP_MUTATION
} from '../graphql/mutations/roles';
import { 
  RolesQueryResponse, 
  CreateRoleMutationVariables, 
  CreateRoleMutationResponse,
  UpdateRoleMutationVariables,
  UpdateRoleMutationResponse,
  DeleteRoleMutationVariables,
  DeleteRoleMutationResponse,
  GroupRolesQueryResponse,
  GroupRolesQueryVariables,
  AddRolesToGroupMutationVariables,
  AddRolesToGroupMutationResponse,
  RemoveRolesFromGroupMutationVariables,
  RemoveRolesFromGroupMutationResponse,
  ScreenHierarchyLevel3QueryResponse,
  RolePermissionsQueryResponse,
  RolePermissionsQueryVariables
} from '../types/role';

// Hook para obtener todos los roles
export const useGetRoles = () => useQuery<RolesQueryResponse>(ROLES_QUERY, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network',
});

// Hook para obtener un rol por nombre
export const useGetRoleByName = (name: string) => useQuery(ROLE_BY_NAME_QUERY, {
  variables: { name },
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network',
  skip: !name,
});

// Hook para obtener roles por grupo
export const useGetGroupRoles = (groupName: string) => useQuery<GroupRolesQueryResponse, GroupRolesQueryVariables>(GROUP_ROLES_QUERY, {
  variables: { groupName },
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network',
  skip: !groupName,
});

// Hook para obtener roles de un usuario
export const useGetUserRoles = (userId: string) => useQuery(USER_ROLES_QUERY, {
  variables: { userId },
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network',
  skip: !userId,
});

// Hook para crear un rol
export const useCreateRole = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [createRole, { loading }] = useMutation<
    CreateRoleMutationResponse,
    CreateRoleMutationVariables
  >(CREATE_ROLE_MUTATION, {
    onCompleted: (data) => {
      if (data.createRole.success) {
        enqueueSnackbar(data.createRole.message || 'Rol creado exitosamente', { variant: 'success' });
        // Refetch roles list
        client.refetchQueries({
          include: [ROLES_QUERY],
        });
      } else {
        enqueueSnackbar(data.createRole.message || 'Error al crear el rol', { variant: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error creating role:', error);
      enqueueSnackbar(
        error.message || 'Error al crear el rol',
        { variant: 'error' }
      );
    },
  });

  return { createRole, loading };
};

// Hook para actualizar un rol
export const useUpdateRole = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [updateRole, { loading }] = useMutation<
    UpdateRoleMutationResponse,
    UpdateRoleMutationVariables
  >(UPDATE_ROLE_MUTATION, {
    onCompleted: (data) => {
      if (data.updateRole.success) {
        enqueueSnackbar(data.updateRole.message || 'Rol actualizado exitosamente', { variant: 'success' });
        // Refetch roles list
        client.refetchQueries({
          include: [ROLES_QUERY],
        });
      } else {
        enqueueSnackbar(data.updateRole.message || 'Error al actualizar el rol', { variant: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      enqueueSnackbar(
        error.message || 'Error al actualizar el rol',
        { variant: 'error' }
      );
    },
  });

  return { updateRole, loading };
};

// Hook para eliminar un rol
export const useDeleteRole = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [deleteRole, { loading }] = useMutation<
    DeleteRoleMutationResponse,
    DeleteRoleMutationVariables
  >(DELETE_ROLE_MUTATION, {
    onCompleted: (data) => {
      if (data.deleteRole.success) {
        enqueueSnackbar(data.deleteRole.message || 'Rol eliminado exitosamente', { variant: 'success' });
        // Refetch roles list
        client.refetchQueries({
          include: [ROLES_QUERY],
        });
      } else {
        enqueueSnackbar(data.deleteRole.error || data.deleteRole.message || 'Error al eliminar el rol', { variant: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error deleting role:', error);
      enqueueSnackbar(
        error.message || 'Error al eliminar el rol',
        { variant: 'error' }
      );
    },
  });

  return { deleteRole, loading };
};

// Hook para asignar roles a un usuario
export const useAssignRolesToUser = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [assignRoles, { loading }] = useMutation(ASSIGN_ROLES_TO_USER_MUTATION, {
    onCompleted: (data) => {
      enqueueSnackbar('Roles asignados exitosamente', { variant: 'success' });
      // Refetch user roles
      client.refetchQueries({
        include: [USER_ROLES_QUERY],
      });
    },
    onError: (error) => {
      console.error('Error assigning roles:', error);
      enqueueSnackbar(
        error.message || 'Error al asignar roles',
        { variant: 'error' }
      );
    },
  });

  return { assignRoles, loading };
};

// Hook para remover roles de un usuario
export const useRemoveRolesFromUser = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [removeRoles, { loading }] = useMutation(REMOVE_ROLES_FROM_USER_MUTATION, {
    onCompleted: (data) => {
      enqueueSnackbar('Roles removidos exitosamente', { variant: 'success' });
      // Refetch user roles
      client.refetchQueries({
        include: [USER_ROLES_QUERY],
      });
    },
    onError: (error) => {
      console.error('Error removing roles:', error);
      enqueueSnackbar(
        error.message || 'Error al remover roles',
        { variant: 'error' }
      );
    },
  });

  return { removeRoles, loading };
};

// Hook para agregar roles a un grupo
export const useAddRolesToGroup = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [addRolesToGroup, { loading }] = useMutation<
    AddRolesToGroupMutationResponse,
    AddRolesToGroupMutationVariables
  >(ADD_ROLES_TO_GROUP_MUTATION, {
    onCompleted: (data) => {
      if (data.addRolesToGroup) {
        enqueueSnackbar('Roles agregados exitosamente', { variant: 'success' });
        // Refetch group roles
        client.refetchQueries({
          include: [GROUP_ROLES_QUERY],
        });
      } else {
        enqueueSnackbar('Error al agregar roles', { variant: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error adding roles to group:', error);
      enqueueSnackbar(
        error.message || 'Error al agregar roles al grupo',
        { variant: 'error' }
      );
    },
  });

  return { addRolesToGroup, loading };
};

// Hook para remover roles de un grupo
export const useRemoveRolesFromGroup = () => {
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();

  const [removeRolesFromGroup, { loading }] = useMutation<
    RemoveRolesFromGroupMutationResponse,
    RemoveRolesFromGroupMutationVariables
  >(REMOVE_ROLES_FROM_GROUP_MUTATION, {
    onCompleted: (data) => {
      if (data.removeRolesFromGroup) {
        enqueueSnackbar('Roles removidos exitosamente', { variant: 'success' });
        // Refetch group roles
        client.refetchQueries({
          include: [GROUP_ROLES_QUERY],
        });
      } else {
        enqueueSnackbar('Error al remover roles', { variant: 'error' });
      }
    },
    onError: (error) => {
      console.error('Error removing roles from group:', error);
      enqueueSnackbar(
        error.message || 'Error al remover roles del grupo',
        { variant: 'error' }
      );
    },
  });

  return { removeRolesFromGroup, loading };
}; 

// Hook para obtener el árbol de permisos
export const useGetScreenHierarchyLevel3 = () => useQuery<ScreenHierarchyLevel3QueryResponse>(SCREEN_HIERARCHY_LEVEL3_QUERY, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network',
});

// Hook para obtener permisos por rol
export const useGetRolePermissions = (roleName: string) => useQuery<RolePermissionsQueryResponse, RolePermissionsQueryVariables>(ROLE_PERMISSIONS_QUERY, {
  variables: { roleName },
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network',
  skip: !roleName,
}); 