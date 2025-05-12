import axios from 'axios';
import { CONFIG } from 'src/config-global';

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

export const changePasswordFromKeycloak = async (nuevaContraseña: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No se encontró el token en localStorage');
      return { success: false, message: 'No se encontró el token en localStorage' };
    }

    const idUsuario = JSON.parse(atob(token.split('.')[1]))?.sub;

    if (!idUsuario) {
      console.warn('No se pudo obtener el ID de usuario del token.');
      return { success: false, message: 'No se pudo obtener el ID de usuario.' };
    }

    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/change-password`,
      { userId: idUsuario, newPassword: nuevaContraseña },
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

export const loginToKeycloak = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `${CONFIG.serverUrl}/api/keycloak/login`,
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token } = response.data.data;
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);

    return access_token;
  } catch (error: any) {
    throw error.response?.data?.error || 'Error al iniciar sesión';
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
