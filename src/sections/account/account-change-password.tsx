import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { changePasswordFromKeycloak } from 'src/auth/context/jwt/keycloak';
import { ROLES } from '@guard/roles.constants';
import { getRolesFromToken } from '@guard/role-utils';

// ----------------------------------------------------------------------

type Props = {
  userId?: string; // ID opcional del usuario a modificar
  userName?: string; // Nombre del usuario a modificar
  onSuccess?: () => void; // Callback opcional para cuando el cambio es exitoso
};

export type ChangePassWordSchemaType = zod.infer<typeof ChangePassWordSchema>;

export const ChangePassWordSchema = zod
  .object({
    newPassword: zod
      .string()
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres!' }),
    confirmNewPassword: zod
      .string()
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres!' }),
    requirePasswordChange: zod.boolean().default(false),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden!',
    path: ['confirmNewPassword'],
  });

// ----------------------------------------------------------------------

export function AccountChangePassword({ userId, userName, onSuccess }: Props) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const requireChange = searchParams.get('requireChange') === 'true';

  const password = useBoolean();
  const [userRoles, setUserRoles] = useState<string[]>([]); 

  // Verificar si viene de la tabla de usuarios
  const vieneDeTablaUsuarios = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from === 'user-table';
  }, [location.state]);

  const defaultValues = { 
    newPassword: '', 
    confirmNewPassword: '',
    requirePasswordChange: false 
  };
  const tienePermisoCambiarPass = useMemo(
    () => userRoles.includes(ROLES.LISTA_USUARIOS_PASSWORD),
    [userRoles]
  );
  
useEffect(() => {
  const roles = getRolesFromToken();
  console.log(roles);
  setUserRoles(roles);
}, []);


  const methods = useForm<ChangePassWordSchemaType>({
    mode: 'all',
    resolver: zodResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = methods;

  const requirePasswordChange = watch('requirePasswordChange');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No se encontró el token en localStorage');
        return;
      }

      // Si no se proporciona userId, usar el ID del usuario actual
      let targetUserId = userId;
      if (!targetUserId) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        targetUserId = decodedToken?.sub;
        
        if (!targetUserId) {
          toast.error('No se pudo obtener el ID de usuario.');
          return;
        }
      }
      
      const response = await changePasswordFromKeycloak(
        data.newPassword,
        targetUserId,
        token,
        data.requirePasswordChange
      );

      if (response.success) {
        toast.success(response.message);
        reset();
        console.info('✅ Contraseña cambiada con éxito', data);
        onSuccess?.(); // Llamar al callback si existe
      } else {
        toast.error(response.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('❌ Error al cambiar la contraseña del usuario:', error);
      toast.error('Error inesperado. Inténtalo de nuevo.');
    }
  });

  return (
    <Card sx={{ p: 3 }}>
      {requireChange && (
        <Typography 
          variant="subtitle1" 
          color="warning.main" 
          sx={{ mb: 3 }}
        >
          Se requiere cambiar la contraseña antes de continuar
        </Typography>
      )}

      {userName && (
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Cambiar contraseña de: {userName}
        </Typography>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Box gap={3} display="flex" flexDirection="column">
          <Field.Text
            name="newPassword"
            label="Nueva contraseña"
            type={password.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Field.Text
            name="confirmNewPassword"
            type={password.value ? 'text' : 'password'}
            label="Confirmar Nueva contraseña"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {vieneDeTablaUsuarios && tienePermisoCambiarPass && (
            <FormControlLabel
              control={
                <Switch
                  checked={requirePasswordChange}
                  onChange={(event) => setValue('requirePasswordChange', event.target.checked)}
                  disabled={requireChange}
                />
              }
              label="Requerir cambio de contraseña en el próximo inicio de sesión"
            />
          )}

          <Box sx={{ mt: 2 }}>
            <LoadingButton
              color="inherit"
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={requireChange && !methods.watch('newPassword')}
              sx={{ 
                minWidth: '120px',
                float: 'right'
              }}
            >
              Cambiar contraseña
            </LoadingButton>
          </Box>
        </Box>
      </Form>
    </Card>
  );
}
