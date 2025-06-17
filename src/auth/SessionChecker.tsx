import { useState, useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';
  
import { checkSessionWithRefreshToken } from './context/jwt/keycloak';

export function SessionChecker() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isChecking) return;
      setIsChecking(true);

      const isValid = await checkSessionWithRefreshToken();

      if (!isValid) {
        console.warn('La sesión ha expirado.');

        // Eliminar los tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('jwt_access_token');

        // Redirigir al login con un mensaje
        window.location.href = '/auth/jwt/sign-in?error=session-expired';
      }

      setIsChecking(false);
    }, 1000000); // Verificar cada 10 segundos

    return () => clearInterval(interval);
  }, [router, isChecking]);

  return null;
}
