import axios from 'axios';

import { CONFIG } from 'src/config-global';

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

export const checkKeycloakSession = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    console.warn('No hay token de acceso disponible.');
    return true; // Usuario no autenticado
  }

  try {
    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/check-session`,
      { token: accessToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta del backend:', response.data);
    return response.data.active === true;
  } catch (error) {
    console.error('Error al verificar la sesión:', error);
    return false; // Si hay error, consideramos que la sesión ha expirado
  }
};

export const logoutFromKeycloak = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.warn('No hay refresh token disponible, cerrando sesión localmente.');
    handleLocalLogout();
    return;
  }

  try {
    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/logout`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Sesión cerrada en Keycloak correctamente:', response.data);
  } catch (error) {
    console.error('❌ Error al cerrar sesión en Keycloak:', error.response?.data || error.message);
  } finally {
    handleLocalLogout();
  }
};

export const changePasswordFromKeycloak = async (
  nuevaContraseña: string, 
  idUsuario: string,
  token: string,
  requirePasswordChange: boolean = false
) => {
  try {
    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/change-password`,
      { 
        userId: idUsuario, 
        newPassword: nuevaContraseña,
        requirePasswordChange 
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Error al cambiar la contraseña:', error.response?.data || error.message);
    return { success: false, message: 'Error al cambiar la contraseña' };
  }
};

export const checkPasswordChangeRequired = async (userId: string, token: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${CONFIG.serverUrl}/api/keycloak/user/${userId}/check-password-change`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.requiresPasswordChange === true;
  } catch (error) {
    console.error('Error al verificar cambio de contraseña:', error);
    return false;
  }
};

export const loginToKeycloak = async (username: string, password: string) => {
  try {
    console.log('Intentando login con:', { username });
    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/login`,
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Respuesta completa del backend:', response);
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    // Si la respuesta indica que se requiere cambio de contraseña
    if (response.data?.requiresPasswordChange) {
      console.log('Se requiere cambio de contraseña');
      const error = new Error('Se requiere cambio de contraseña');
      (error as any).response = {
        data: {
          requiresPasswordChange: true,
          message: response.data.data?.message || 'Se requiere cambio de contraseña'
        }
      };
      throw error;
    }

    // Los tokens están dentro de response.data.data
    const { access_token, refresh_token } = response.data.data || {};

    if (!access_token || !refresh_token) {
      console.error('Estructura de la respuesta:', response.data);
      throw new Error('Tokens no encontrados en la respuesta');
    }

    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    // También guardar en sessionStorage para compatibilidad
    sessionStorage.setItem('jwt_access_token', access_token);

    // Mostrar información de duración del token
    logTokenDuration(access_token);

    return access_token;
  } catch (error: any) {
    console.error('Error en loginToKeycloak:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const checkSessionWithRefreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.warn('No hay refresh token disponible.');
    return true; // Usuario no autenticado
  }

  try {
    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/refresh-token`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data.data;
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    // También guardar en sessionStorage para compatibilidad
    sessionStorage.setItem('jwt_access_token', data.access_token);

    // Mostrar información de duración del token refrescado
    console.log('🔄 Token refrescado:');
    logTokenDuration(data.access_token);

    return true;
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return false;
  }
};

const handleLocalLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/auth/jwt/sign-in';
};
