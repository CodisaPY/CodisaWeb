import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, LOGIN_WITH_OTP_MUTATION, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION, CHANGE_PASSWORD_MUTATION } from 'src/graphql/mutations/auth';
import { CHECK_SESSION_QUERY, SEARCH_USER_QUERY } from 'src/graphql/queries/auth';
import { USERS_QUERY } from 'src/graphql/queries/users';
import { CREATE_USER_MUTATION, UPDATE_USER_MUTATION, TOGGLE_USER_STATUS_MUTATION } from 'src/graphql/mutations/users';
import { 
  LoginMutationResponse, 
  LoginMutationVariables,
  LoginWithOTPMutationResponse,
  LoginWithOTPMutationVariables,
  LogoutMutationResponse,
  LogoutMutationVariables,
  RefreshTokenMutationResponse,
  RefreshTokenMutationVariables,
  ChangePasswordMutationResponse,
  ChangePasswordMutationVariables,
  CheckSessionResponse,
  SearchUserQueryResponse,
  SearchUserQueryVariables
} from 'src/types/auth';
import { 
  UsersQueryResponse as UsersQueryResponseType, 
  CreateUserMutationResponse, 
  CreateUserMutationVariables,
  UpdateUserMutationResponse,
  UpdateUserMutationVariables,
  ToggleUserStatusMutationResponse,
  ToggleUserStatusMutationVariables
} from 'src/types/user';

// Función para calcular y mostrar la duración del token
const logTokenDuration = (accessToken: string) => {
  try {
    const decoded = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expirationTime = decoded.exp;
    const durationInSeconds = expirationTime - currentTime;
    const durationInMinutes = Math.floor(durationInSeconds / 60);
    const durationInHours = Math.floor(durationInMinutes / 60);
    
    console.log('🔐 Información del Token:');
    console.log(`   - Emitido: ${new Date(decoded.iat * 1000).toLocaleString()}`);
    console.log(`   - Expira: ${new Date(expirationTime * 1000).toLocaleString()}`);
    console.log(`   - Duración: ${durationInMinutes} minutos (${durationInHours} horas)`);
    console.log(`   - Tiempo restante: ${durationInMinutes} minutos`);
    
    return {
      issuedAt: decoded.iat,
      expiresAt: expirationTime,
      durationMinutes: durationInMinutes,
      durationHours: durationInHours
    };
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

export const loginWithGraphQL = async (username: string, password: string) => {
  try {
    console.log('🚀 INICIANDO LOGIN CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('👤 Usuario:', username);
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      LoginMutationResponse,
      LoginMutationVariables
    >({
      mutation: LOGIN_MUTATION,
      variables: {
        input: { username, password }
      }
    });

    console.log('✅ RESPUESTA GRAPHQL RECIBIDA:', data);

    // Verificar si se requiere OTP
    if (data?.login?.requiresOTP) {
      console.log('🔐 OTP REQUERIDO DETECTADO');
      console.log('📋 Código:', data.login.code);
      console.log('💬 Mensaje:', data.login.message);
      
      const customError = new Error(data.login.message || 'Se requiere código OTP');
      (customError as any).requiresOTP = true;
      (customError as any).otpCode = data.login.code;
      (customError as any).username = username;
      throw customError;
    }

    if (!data?.login?.success || !data?.login?.data) {
      throw new Error(data?.login?.message || 'Respuesta de login inválida');
    }

    // Verificar que data no sea null antes de acceder a sus propiedades
    const loginData = data.login.data;
    if (!loginData) {
      throw new Error('Datos de login no encontrados');
    }

    const { access_token, refresh_token } = loginData;

    if (!access_token || !refresh_token) {
      throw new Error('Tokens no encontrados en la respuesta');
    }

    // Guardar tokens en localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    // También guardar en sessionStorage para compatibilidad
    sessionStorage.setItem('jwt_access_token', access_token);

    // Mostrar información de duración del token
    logTokenDuration(access_token);

    return access_token;
  } catch (error: any) {
    console.error('Error en login GraphQL:', error);
    
    // Si ya es un error de OTP, re-lanzarlo
    if (error.requiresOTP) {
      throw error;
    }
    
    // Verificar si es un error de cambio de contraseña requerido
    if (error.graphQLErrors?.some((e: any) => 
      e.extensions?.code === 'PASSWORD_CHANGE_REQUIRED' ||
      e.extensions?.code === 'REQUIRES_PASSWORD_CHANGE' ||
      e.message?.includes('password change') ||
      e.message?.includes('cambio de contraseña')
    )) {
      console.log('🔐 ERROR DE CAMBIO DE CONTRASEÑA DETECTADO');
      console.log('📋 Código de error:', error.graphQLErrors.find((e: any) => 
        e.extensions?.code === 'PASSWORD_CHANGE_REQUIRED' ||
        e.extensions?.code === 'REQUIRES_PASSWORD_CHANGE'
      )?.extensions?.code);
      console.log('💬 Mensaje:', error.graphQLErrors.find((e: any) => 
        e.extensions?.code === 'PASSWORD_CHANGE_REQUIRED' ||
        e.extensions?.code === 'REQUIRES_PASSWORD_CHANGE'
      )?.message);
      
      const customError = new Error('Se requiere cambio de contraseña');
      (customError as any).requiresPasswordChange = true;
      (customError as any).errorDetails = error.graphQLErrors.find((e: any) => 
        e.extensions?.code === 'PASSWORD_CHANGE_REQUIRED' ||
        e.extensions?.code === 'REQUIRES_PASSWORD_CHANGE'
      );
      throw customError;
    }
    
    throw error;
  }
};



export const loginWithOTPWithGraphQL = async (username: string, password: string, otpCode: string) => {
  try {
    console.log('🔐 INICIANDO LOGIN CON OTP CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('👤 Usuario:', username);
    console.log('🔢 Código OTP:', otpCode);
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      LoginWithOTPMutationResponse,
      LoginWithOTPMutationVariables
    >({
      mutation: LOGIN_WITH_OTP_MUTATION,
      variables: {
        input: { username, password, otpCode }
      }
    });

    console.log('✅ RESPUESTA LOGIN CON OTP GRAPHQL:', data);

    if (!data?.loginWithOTP?.success || !data?.loginWithOTP?.data) {
      throw new Error(data?.loginWithOTP?.message || 'Error en el login con OTP');
    }

    // Verificar que data no sea null antes de acceder a sus propiedades
    const loginData = data.loginWithOTP.data;
    if (!loginData) {
      throw new Error('Datos de login no encontrados');
    }

    const { access_token, refresh_token } = loginData;

    if (!access_token || !refresh_token) {
      throw new Error('Tokens no encontrados en la respuesta');
    }

    // Guardar tokens en localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    // También guardar en sessionStorage para compatibilidad
    sessionStorage.setItem('jwt_access_token', access_token);

    // Mostrar información de duración del token
    logTokenDuration(access_token);

    return access_token;
  } catch (error: any) {
    console.error('Error en login con OTP GraphQL:', error);
    throw error;
  }
};

export const logoutWithGraphQL = async (refreshToken: string) => {
  try {
    console.log('🚪 INICIANDO LOGOUT CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      LogoutMutationResponse,
      LogoutMutationVariables
    >({
      mutation: LOGOUT_MUTATION,
      variables: {
        input: { refresh_token: refreshToken }
      }
    });

    console.log('✅ RESPUESTA LOGOUT GRAPHQL:', data);

    if (!data?.logout) {
      throw new Error('Respuesta de logout inválida');
    }

    if (!data.logout.success) {
      throw new Error(data.logout.message || 'Error en el logout');
    }

    console.log('✅ LOGOUT EXITOSO:', data.logout.message);
    return data.logout;
  } catch (error: any) {
    console.error('❌ Error en logout GraphQL:', error);
    throw error;
  }
};

export const refreshTokenWithGraphQL = async (refreshToken: string) => {
  try {
    console.log('🔄 INICIANDO REFRESH TOKEN CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      RefreshTokenMutationResponse,
      RefreshTokenMutationVariables
    >({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: {
        input: { refresh_token: refreshToken }
      }
    });

    console.log('✅ RESPUESTA REFRESH TOKEN GRAPHQL:', data);

    if (!data?.refreshToken?.data) {
      throw new Error('Respuesta de refresh token inválida');
    }

    // Verificar que data no sea null antes de acceder a sus propiedades
    const refreshTokenData = data.refreshToken.data;
    if (!refreshTokenData) {
      throw new Error('Datos de refresh token no encontrados');
    }

    const { access_token, refresh_token } = refreshTokenData;

    if (!access_token || !refresh_token) {
      throw new Error('Tokens no encontrados en la respuesta');
    }

    // Actualizar tokens en localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    // También guardar en sessionStorage para compatibilidad
    sessionStorage.setItem('jwt_access_token', access_token);

    // Mostrar información de duración del token refrescado
    console.log('🔄 TOKEN REFRESCADO:');
    logTokenDuration(access_token);

    return refreshTokenData;
  } catch (error: any) {
    console.error('❌ Error en refresh token GraphQL:', error);
    
    // Verificar si es un error específico de refresh token
    if (error.graphQLErrors?.some((e: any) => 
      e.extensions?.code === 'REFRESH_TOKEN_ERROR' ||
      e.message?.includes('Refresh token inválido') ||
      e.message?.includes('expirado')
    )) {
      console.log('🔄 Refresh token inválido o expirado, cerrando sesión');
      // Limpiar tokens y redirigir al login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('jwt_access_token');
      
      const customError = new Error('Refresh token inválido o expirado');
      (customError as any).requiresReauth = true;
      throw customError;
    }
    
    throw error;
  }
};

export const checkSessionWithGraphQL = async () => {
  try {
    console.log('🔍 INICIANDO CHECK SESSION CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.query<CheckSessionResponse>({
      query: CHECK_SESSION_QUERY,
      fetchPolicy: 'network-only', // No usar cache para verificar sesión
    });

    console.log('✅ RESPUESTA CHECK SESSION GRAPHQL:', data);

    if (!data?.checkSession) {
      throw new Error('Respuesta de check session inválida');
    }

    const { valid, user, expiresAt } = data.checkSession;

    if (!valid) {
      console.log('❌ Sesión inválida');
      return false;
    }

    console.log('✅ Sesión válida para usuario:', user.username);
    console.log('📅 Expira:', new Date(expiresAt).toLocaleString());
    console.log('👤 Usuario:', {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles
    });

    return true;
  } catch (error: any) {
    console.error('❌ Error en check session GraphQL:', error);
    
    // Verificar si es un error de autenticación
    if (error.graphQLErrors?.some((e: any) => 
      e.extensions?.code === 'UNAUTHENTICATED' ||
      e.message?.includes('Unauthorized') ||
      e.message?.includes('authentication')
    )) {
      console.log('🔍 Usuario no autenticado');
      return false;
    }
    
    // Para otros errores, asumir que la sesión no es válida
    console.log('🔍 Error al verificar sesión, asumiendo inválida');
    return false;
  }
};

export const searchUserWithGraphQL = async (searchTerm: string) => {
  try {
    console.log('🔍 INICIANDO BÚSQUEDA DE USUARIO CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('🔎 Término de búsqueda:', searchTerm);
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.query<
      SearchUserQueryResponse,
      SearchUserQueryVariables
    >({
      query: SEARCH_USER_QUERY,
      variables: { searchTerm },
      fetchPolicy: 'network-only', // No usar cache para búsquedas
    });

    console.log('✅ RESPUESTA BÚSQUEDA USUARIO GRAPHQL:', data);

    if (!data?.searchUser) {
      throw new Error('Respuesta de búsqueda de usuario inválida');
    }

    const { success, message, data: userData } = data.searchUser;

    if (!success) {
      throw new Error(message || 'Error al buscar usuario');
    }

    if (!userData?.userId) {
      throw new Error('UserId no encontrado en la respuesta');
    }

    console.log('✅ Usuario encontrado:', userData.userId);
    console.log('💬 Mensaje:', message);

    return userData.userId;
  } catch (error: any) {
    console.error('❌ Error en búsqueda de usuario GraphQL:', error);
    
    // Verificar si es un error específico de usuario no encontrado
    if (error.graphQLErrors?.some((e: any) => 
      e.extensions?.code === 'USER_NOT_FOUND' ||
      e.message?.includes('Usuario no encontrado')
    )) {
      console.log('🔍 Usuario no encontrado');
      throw new Error('Usuario no encontrado');
    }
    
    throw error;
  }
}; 

export const changePasswordWithGraphQL = async (userId: string, newPassword: string, temporary: boolean = false) => {
  try {
    console.log('🔐 INICIANDO CAMBIO DE CONTRASEÑA CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('👤 UserId:', userId);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('⏰ Temporal:', temporary);
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      ChangePasswordMutationResponse,
      ChangePasswordMutationVariables
    >({
      mutation: CHANGE_PASSWORD_MUTATION,
      variables: {
        input: {
          newPassword,
          temporary,
          userId
        }
      }
    });

    console.log('✅ RESPUESTA GRAPHQL RECIBIDA:', data);

    if (data?.changePassword === true) {
      console.log('✅ Contraseña cambiada exitosamente');
      return { success: true, message: 'Contraseña cambiada exitosamente' };
    }
    
    throw new Error('Error al cambiar la contraseña');
  } catch (error: any) {
    console.error('❌ Error en cambio de contraseña GraphQL:', error);
    
    // Extraer mensaje de error específico
    let errorMessage = 'Error al cambiar la contraseña';
    
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message || errorMessage;
      
      // Log específico para errores de GraphQL
      console.log('📋 Código de error:', graphQLError.extensions?.code);
      console.log('💬 Mensaje de error:', graphQLError.message);
      console.log('🔍 Detalles:', graphQLError.extensions?.details);
    }
    
    return { success: false, message: errorMessage };
  }
};

export const toggleUserStatusWithGraphQL = async (userId: string) => {
  try {
    console.log('🔄 INICIANDO TOGGLE DE ESTADO DE USUARIO CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('👤 UserId:', userId);
    
    // Verificar token antes de hacer la request
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Token disponible:', token ? 'Sí' : 'No');
    if (token) {
      console.log('🔑 Token (primeros 20 chars):', `${token.substring(0, 20)}...`);
      
      // Verificar si el token está expirado
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const expirationTime = decoded.exp;
        
        if (currentTime >= expirationTime) {
          console.log('⚠️ Token expirado, intentando refresh...');
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await refreshTokenWithGraphQL(refreshToken);
            console.log('✅ Token refrescado exitosamente');
          } else {
            throw new Error('Token expirado y no hay refresh token disponible');
          }
        } else {
          console.log('✅ Token válido, expira en:', Math.floor((expirationTime - currentTime) / 60), 'minutos');
        }
      } catch (tokenError) {
        console.error('❌ Error al verificar token:', tokenError);
        throw new Error('Token inválido');
      }
    } else {
      throw new Error('No hay token de acceso disponible');
    }
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      ToggleUserStatusMutationResponse,
      ToggleUserStatusMutationVariables
    >({
      mutation: TOGGLE_USER_STATUS_MUTATION,
      variables: { userId },
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

    console.log('✅ RESPUESTA GRAPHQL TOGGLE USER STATUS RECIBIDA:', JSON.stringify(data, null, 2));

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
  } catch (error: any) {
    console.error('❌ Error en toggle user status GraphQL:', error);
    
    // Extraer mensaje de error específico
    let errorMessage = 'Error al cambiar estado del usuario';
    
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message || errorMessage;
      
      // Log específico para errores de GraphQL
      console.log('📋 Código de error:', graphQLError.extensions?.code);
      console.log('💬 Mensaje de error:', graphQLError.message);
      console.log('🔍 Detalles:', graphQLError.extensions?.details);
    }
    
    return { success: false, message: errorMessage, active: false };
  }
}; 

export const getUsersWithGraphQL = async () => {
  try {
    console.log('👥 INICIANDO OBTENCIÓN DE USUARIOS CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.query<UsersQueryResponseType>({
      query: USERS_QUERY,
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    });

    console.log('✅ RESPUESTA GRAPHQL USUARIOS RECIBIDA:', data);

    if (data?.users) {
      console.log(`✅ ${data.users.length} usuarios obtenidos exitosamente`);
      return { success: true, users: data.users };
    }
    
    throw new Error('No se pudieron obtener los usuarios');
  } catch (error: any) {
    console.error('❌ Error en obtención de usuarios GraphQL:', error);
    
    // Extraer mensaje de error específico
    let errorMessage = 'Error al obtener usuarios';
    
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message || errorMessage;
      
      // Log específico para errores de GraphQL
      console.log('📋 Código de error:', graphQLError.extensions?.code);
      console.log('💬 Mensaje de error:', graphQLError.message);
    }
    
    return { success: false, users: [], message: errorMessage };
  }
}; 

export const createUserWithGraphQL = async (input: CreateUserMutationVariables['input']) => {
  try {
    console.log('👤 INICIANDO CREACIÓN DE USUARIO CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('👤 Usuario:', input.username);
    console.log('📧 Email:', input.email);
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      CreateUserMutationResponse,
      CreateUserMutationVariables
    >({
      mutation: CREATE_USER_MUTATION,
      variables: { input }
    });

    console.log('✅ RESPUESTA GRAPHQL CREAR USUARIO RECIBIDA:', data);

    if (data?.createUser?.success) {
      console.log(`✅ Usuario creado exitosamente: ${data.createUser.userId}`);
      return { 
        success: true, 
        message: data.createUser.message, 
        userId: data.createUser.userId 
      };
    }
    
    throw new Error(data?.createUser?.message || 'Error al crear usuario');
  } catch (error: any) {
    console.error('❌ Error en creación de usuario GraphQL:', error);
    
    // Extraer mensaje de error específico
    let errorMessage = 'Error al crear usuario';
    
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message || errorMessage;
      
      // Log específico para errores de GraphQL
      console.log('📋 Código de error:', graphQLError.extensions?.code);
      console.log('💬 Mensaje de error:', graphQLError.message);
      console.log('🔍 Detalles:', graphQLError.extensions?.details);
    }
    
    return { success: false, message: errorMessage, userId: '' };
  }
}; 

export const updateUserWithGraphQL = async (userId: string, input: UpdateUserMutationVariables['input']) => {
  try {
    console.log('👤 INICIANDO ACTUALIZACIÓN DE USUARIO CON GRAPHQL');
    console.log('📡 Endpoint: https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io/graphql');
    console.log('👤 UserId:', userId);
    console.log('👤 Usuario:', input.username);
    console.log('📧 Email:', input.email);
    
    // Importar el cliente Apollo dinámicamente
    const { apolloClient } = await import('src/lib/apollo');
    
    const { data } = await apolloClient.mutate<
      UpdateUserMutationResponse,
      UpdateUserMutationVariables
    >({
      mutation: UPDATE_USER_MUTATION,
      variables: { 
        updateUserId: userId,
        input 
      },
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

    console.log('✅ RESPUESTA GRAPHQL ACTUALIZAR USUARIO RECIBIDA:', JSON.stringify(data, null, 2));

    if (data?.updateUser?.success) {
      console.log(`✅ Usuario actualizado exitosamente`);
      console.log('📨 Mensaje del backend:', data.updateUser.message);
      return { 
        success: true, 
        message: data.updateUser.message
      };
    }
    
    throw new Error(data?.updateUser?.message || 'Error al actualizar usuario');
  } catch (error: any) {
    console.error('❌ Error en actualización de usuario GraphQL:', error);
    
    // Extraer mensaje de error específico
    let errorMessage = 'Error al actualizar usuario';
    
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message || errorMessage;
      
      // Log específico para errores de GraphQL
      console.log('📋 Código de error:', graphQLError.extensions?.code);
      console.log('💬 Mensaje de error:', graphQLError.message);
      console.log('🔍 Detalles:', graphQLError.extensions?.details);
    }
    
    return { success: false, message: errorMessage };
  }
}; 