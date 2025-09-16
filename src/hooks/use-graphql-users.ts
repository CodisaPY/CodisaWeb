import { useQuery, useMutation } from '@apollo/client';
import { USERS_QUERY } from '../graphql/queries/users';
import { CREATE_USER_MUTATION, UPDATE_USER_MUTATION, TOGGLE_USER_STATUS_MUTATION } from '../graphql/mutations/users';
import { 
  UsersQueryResponse, 
  CreateUserMutationResponse, 
  CreateUserMutationVariables,
  UpdateUserMutationResponse,
  UpdateUserMutationVariables,
  ToggleUserStatusMutationResponse,
  ToggleUserStatusMutationVariables
} from '../types/user';

export const useGraphQLUsers = () => {
  const { data, loading, error, refetch } = useQuery<UsersQueryResponse>(USERS_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const users = data?.users || [];

  return {
    users,
    loading,
    error,
    refetch,
  };
};

export const useGraphQLCreateUser = () => {
  const [createUserMutation, { loading, error }] = useMutation<
    CreateUserMutationResponse,
    CreateUserMutationVariables
  >(CREATE_USER_MUTATION);

  const createUser = async (input: CreateUserMutationVariables['input']) => {
    try {
      console.log('Intentando crear usuario con GraphQL:', { username: input.username, email: input.email });
      
      const { data } = await createUserMutation({
        variables: { input }
      });

      console.log('Respuesta GraphQL create user:', data);

      if (data?.createUser?.success) {
        console.log('✅ Usuario creado exitosamente:', data.createUser.userId);
        return { success: true, message: data.createUser.message, userId: data.createUser.userId };
      }
      
      throw new Error(data?.createUser?.message || 'Error al crear usuario');
    } catch (createUserError: any) {
      console.error('Error en create user GraphQL:', createUserError);
      
      // Extraer mensaje de error específico
      let errorMessage = 'Error al crear usuario';
      
      if (createUserError.graphQLErrors?.length > 0) {
        const graphQLError = createUserError.graphQLErrors[0];
        errorMessage = graphQLError.message || errorMessage;
      }
      
      return { success: false, message: errorMessage, userId: '' };
    }
  };

  return {
    createUser,
    loading,
    error
  };
};

export const useGraphQLUpdateUser = () => {
  const [updateUserMutation, { loading, error }] = useMutation<
    UpdateUserMutationResponse,
    UpdateUserMutationVariables
  >(UPDATE_USER_MUTATION, {
    // Actualizar el cache después de la mutación
    update: (cache, { data: mutationData }) => {
      if (mutationData?.updateUser?.success) {
        // Refetch la query de usuarios para obtener datos actualizados
        cache.evict({ fieldName: 'users' });
        cache.gc();
      }
    },
    // Refetch después de la mutación
    refetchQueries: ['Users'],
  });

  const updateUser = async (userId: string, input: UpdateUserMutationVariables['input']) => {
    try {
      console.log('Intentando actualizar usuario con GraphQL:', { userId, username: input.username, email: input.email });
      
      const { data } = await updateUserMutation({
        variables: { 
          updateUserId: userId,
          input 
        }
      });

      console.log('Respuesta GraphQL update user:', data);

      if (data?.updateUser?.success) {
        console.log('✅ Usuario actualizado exitosamente');
        return { success: true, message: data.updateUser.message };
      }
      
      throw new Error(data?.updateUser?.message || 'Error al actualizar usuario');
    } catch (updateUserError: any) {
      console.error('Error en update user GraphQL:', updateUserError);
      
      // Extraer mensaje de error específico
      let errorMessage = 'Error al actualizar usuario';
      
      if (updateUserError.graphQLErrors?.length > 0) {
        const graphQLError = updateUserError.graphQLErrors[0];
        errorMessage = graphQLError.message || errorMessage;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  return {
    updateUser,
    loading,
    error
  };
};

export const useGraphQLToggleUserStatus = () => {
  const [toggleUserStatusMutation, { loading, error }] = useMutation<
    ToggleUserStatusMutationResponse,
    ToggleUserStatusMutationVariables
  >(TOGGLE_USER_STATUS_MUTATION, {
    // Actualizar el cache después de la mutación
    update: (cache, { data: mutationData }) => {
      if (mutationData?.toggleUserStatus?.success) {
        // Refetch la query de usuarios para obtener datos actualizados
        cache.evict({ fieldName: 'users' });
        cache.gc();
      }
    },
    // Refetch después de la mutación
    refetchQueries: ['Users'],
  });

  const toggleUserStatus = async (userId: string) => {
    try {
      console.log('🔄 Intentando cambiar estado del usuario con GraphQL:', { userId });
      
      // Verificar token antes de hacer la request
      const token = localStorage.getItem('accessToken');
      console.log('🔐 Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        console.log('🔑 Token (primeros 20 chars):', `${token.substring(0, 20)}...`);
      } else {
        throw new Error('No hay token de acceso disponible');
      }
      
      const { data } = await toggleUserStatusMutation({
        variables: { userId }
      });

      console.log('✅ Respuesta GraphQL toggle user status:', JSON.stringify(data, null, 2));

      if (data?.toggleUserStatus?.success) {
        console.log('✅ Estado del usuario cambiado exitosamente');
        console.log('📊 Nuevo estado:', data.toggleUserStatus.data.active ? 'Activo' : 'Inactivo');
        return { 
          success: true, 
          message: data.toggleUserStatus.message,
          active: data.toggleUserStatus.data.active
        };
      }
      
      throw new Error(data?.toggleUserStatus?.message || 'Error al cambiar estado del usuario');
    } catch (toggleError: any) {
      console.error('❌ Error en toggle user status GraphQL:', toggleError);
      
      // Extraer mensaje de error específico
      let errorMessage = 'Error al cambiar estado del usuario';
      
      if (toggleError.graphQLErrors?.length > 0) {
        const graphQLError = toggleError.graphQLErrors[0];
        errorMessage = graphQLError.message || errorMessage;
      }
      
      return { success: false, message: errorMessage, active: false };
    }
  };

  return {
    toggleUserStatus,
    loading,
    error
  };
}; 