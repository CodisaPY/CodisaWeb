import { useState, useEffect } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';
  
import { checkSessionWithRefreshToken } from './context/jwt/keycloak';

export function SessionChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Si estamos en la pantalla de login, no hacer nada pero retornar función vacía
    if (pathname === '/auth/jwt/sign-in') return () => {};

    const interval = setInterval(async () => {
      if (isChecking) return;
      setIsChecking(true);

      // Verificar si el token actual es válido antes de intentar refrescar
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.warn('No hay token de acceso disponible.');
        setIsChecking(false);
        return;
      }

      try {
        // Decodificar el token para verificar su expiración
        const decoded = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;

        // Si el token expira en menos de 5 minutos, intentar refrescar
        if (timeUntilExpiry < 300) { // 5 minutos = 300 segundos
          console.log('🔄 Token expira pronto, intentando refrescar...');
          const refreshSuccess = await checkSessionWithRefreshToken();
          
          if (refreshSuccess) {
            console.log('✅ Token refrescado exitosamente');
          } else {
            console.warn('❌ Error al refrescar el token, la sesión ha expirado.');
            // Eliminar los tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('jwt_access_token');
            // Redirigir al login con un mensaje
            window.location.href = '/auth/jwt/sign-in?error=session-expired';
          }
        } else {
          console.log(`✅ Token válido por ${Math.floor(timeUntilExpiry / 60)} minutos más`);
        }
      } catch (error) {
        console.error('❌ Error al verificar el token:', error);
        // Si hay error al decodificar, intentar refrescar
        const refreshSuccess = await checkSessionWithRefreshToken();
        if (refreshSuccess) {
          console.log('✅ Token refrescado exitosamente después de error de decodificación');
        } else {
          console.warn('❌ Error al refrescar el token, cerrando sesión.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('jwt_access_token');
          window.location.href = '/auth/jwt/sign-in?error=session-expired';
        }
      }

      setIsChecking(false);
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [router, isChecking, pathname]);

  return null;
}
