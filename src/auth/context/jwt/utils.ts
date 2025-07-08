import { toast } from 'src/components/snackbar'; // Módulos internos (absolutos)
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';

import { STORAGE_KEY ,LOCAL_STORAGE_KEY} from './constant'; // Módulo relativo

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

// ----------------------------------------------------------------------
// Decodificar el token
export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// Validar el token
export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------
// Manejar expiración del token
export function tokenExpired(exp: number) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      // Remover el token del almacenamiento
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Mostrar mensaje con `toast`
      toast.error('¡El token ha expirado!');

      // Redirigir al inicio de sesión
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------
// Configurar sesión
export async function setSession(accessToken: string | null) {
  try {
    console.log('🔄 Configurando sesión con token:', accessToken ? 'SÍ' : 'NO');
    if (accessToken) {
      // Guardar el token en sessionStorage
      sessionStorage.setItem(STORAGE_KEY, accessToken);

      // Configurar el token en los headers de axios
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Decodificar el token
      const decodedToken = jwtDecode(accessToken);

      if (decodedToken && 'exp' in decodedToken) {
        // Mostrar información de duración del token
        logTokenDuration(accessToken);
        
        tokenExpired(decodedToken.exp); // Configurar tiempo de expiración
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      // Limpiar sesión
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
