import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, LOGIN_WITH_OTP_MUTATION, CHANGE_PASSWORD_MUTATION } from '../graphql/mutations/auth';
import { LoginMutationResponse, LoginMutationVariables, LoginWithOTPMutationResponse, LoginWithOTPMutationVariables, ChangePasswordMutationResponse, ChangePasswordMutationVariables } from '../types/auth';

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

export const useGraphQLLogin = () => {
  const [loginMutation, { loading, error }] = useMutation<
    LoginMutationResponse,
    LoginMutationVariables
  >(LOGIN_MUTATION);

  const login = async (username: string, password: string) => {
    try {
      console.log('Intentando login con GraphQL:', { username });
      
      const { data } = await loginMutation({
        variables: {
          input: { username, password }
        }
      });

      console.log('Respuesta GraphQL:', data);

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
    } catch (loginError: any) {
      console.error('Error en login GraphQL:', loginError);
      
      // Si ya es un error de OTP, re-lanzarlo
      if (loginError.requiresOTP) {
        throw loginError;
      }
      
      // Verificar si es un error de cambio de contraseña requerido
      if (loginError.graphQLErrors?.some((e: any) => 
        e.extensions?.code === 'REQUIRES_PASSWORD_CHANGE' ||
        e.message?.includes('password change')
      )) {
        const customError = new Error('Se requiere cambio de contraseña');
        (customError as any).requiresPasswordChange = true;
        throw customError;
      }
      
      throw loginError;
    }
  };

  return {
    login,
    loading,
    error
  };
}; 

export const useGraphQLChangePassword = () => {
  const [changePasswordMutation, { loading, error }] = useMutation<
    ChangePasswordMutationResponse,
    ChangePasswordMutationVariables
  >(CHANGE_PASSWORD_MUTATION);

  const changePassword = async (userId: string, newPassword: string, temporary: boolean = false) => {
    try {
      console.log('Intentando cambiar contraseña con GraphQL:', { userId, temporary });
      
      const { data } = await changePasswordMutation({
        variables: {
          input: {
            newPassword,
            temporary,
            userId
          }
        }
      });

      console.log('Respuesta GraphQL change password:', data);

      if (data?.changePassword === true) {
        console.log('✅ Contraseña cambiada exitosamente');
        return { success: true, message: 'Contraseña cambiada exitosamente' };
      }
      
      throw new Error('Error al cambiar la contraseña');
    } catch (changePasswordError: any) {
      console.error('Error en change password GraphQL:', changePasswordError);
      
      // Extraer mensaje de error específico
      let errorMessage = 'Error al cambiar la contraseña';
      
      if (changePasswordError.graphQLErrors?.length > 0) {
        const graphQLError = changePasswordError.graphQLErrors[0];
        errorMessage = graphQLError.message || errorMessage;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  return {
    changePassword,
    loading,
    error
  };
};

export const useGraphQLLoginWithOTP = () => {
  const [loginWithOTPMutation, { loading, error }] = useMutation<
    LoginWithOTPMutationResponse,
    LoginWithOTPMutationVariables
  >(LOGIN_WITH_OTP_MUTATION);

  const loginWithOTP = async (username: string, password: string, otpCode: string) => {
    try {
      console.log('Intentando login con OTP con GraphQL:', { username, otpCode });
      
      const { data } = await loginWithOTPMutation({
        variables: {
          input: { username, password, otpCode }
        }
      });

      console.log('Respuesta GraphQL login con OTP:', data);

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
    } catch (loginWithOTPError: any) {
      console.error('Error en login con OTP GraphQL:', loginWithOTPError);
      throw loginWithOTPError;
    }
  };

  return {
    loginWithOTP,
    loading,
    error
  };
}; 