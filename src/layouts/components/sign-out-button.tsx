import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';
import { logoutFromKeycloak } from 'src/auth/context/jwt/keycloak';
import { signOut as jwtSignOut } from 'src/auth/context/jwt/action';
import { signOut as amplifySignOut } from 'src/auth/context/amplify/action';
import { signOut as supabaseSignOut } from 'src/auth/context/supabase/action';
import { signOut as firebaseSignOut } from 'src/auth/context/firebase/action';
// ----------------------------------------------------------------------

const signOut =
  (CONFIG.auth.method === 'supabase' && supabaseSignOut) ||
  (CONFIG.auth.method === 'firebase' && firebaseSignOut) ||
  (CONFIG.auth.method === 'amplify' && amplifySignOut) ||
  (CONFIG.auth.method === 'keycloak' && logoutFromKeycloak) ||
  jwtSignOut;

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const navigate = useNavigate(); // Hook para navegación

  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const { logout: signOutAuth0 } = useAuth0();

  const handleLogout = useCallback(async () => {
    try {
      if (CONFIG.auth.method === 'keycloak') {
        await logoutFromKeycloak();
      } else {
        await signOut();
        await checkUserSession?.();
        onClose?.();
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cerrar sesión');
    }
  }, [checkUserSession, onClose, router]);

  const handleLogoutAuth0 = useCallback(async () => {
    try {
      await signOutAuth0();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [onClose, router, signOutAuth0]);

  return (
    <>
      <Button
        fullWidth
        variant="soft"
        size="large"
        color="error"
        onClick={
          CONFIG.auth.method === 'keycloak'
            ? logoutFromKeycloak
            : CONFIG.auth.method === 'auth0'
              ? handleLogoutAuth0
              : handleLogout
        }
        {...other}
      >
        Cerrar sesión
      </Button>

      {/* Botón para cambiar la contraseña */}
      <Button
        fullWidth
        variant="soft"
        size="large"
        color="primary"
        sx={{ mt: 1 }}
        onClick={() => navigate('/dashboard/seguridad/cambioPass')} // Navegar a la ruta
      >
        Cambiar contraseña
      </Button>
    </>
  );
}
