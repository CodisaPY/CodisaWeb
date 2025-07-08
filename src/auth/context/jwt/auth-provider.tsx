import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import { STORAGE_KEY,LOCAL_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

import type { AuthState } from '../../types';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      console.log('🔍 Verificando sesión de usuario...');
      const accessToken = localStorage.getItem(LOCAL_STORAGE_KEY);
      console.log('Token encontrado en localStorage:', accessToken ? 'SÍ' : 'NO');

      if (accessToken && isValidToken(accessToken)) {
        console.log('✅ Token válido, configurando sesión...');
        setSession(accessToken);

        // Simulando la respuesta de la API
        const simulatedResponse = {
          user: {
            id: '8864c717-587d-472a-929a-8e5f298024da-0',
            displayName: 'Jaydon Frankie',
            photoURL: 'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-25.webp',
            phoneNumber: '+1 416-555-0198',
            country: 'Canada',
            address: '90210 Broadway Blvd',
            state: 'California',
            city: 'San Francisco',
            zipCode: '94116',
            about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
            role: 'admin',
            isPublic: true,
            email: 'demo@minimals.cc',
            password: '@demo1',
          },
        };

        setState({ user: { ...simulatedResponse.user, accessToken }, loading: false });
        console.log('✅ Usuario autenticado correctamente');
      } else {
        console.log('❌ Token no válido o no encontrado');
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'admin',
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
