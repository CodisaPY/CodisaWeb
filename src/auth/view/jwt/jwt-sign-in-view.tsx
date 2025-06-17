import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { signInWithPassword } from '../../context/jwt';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email o Usuario es requerido!' }),
  password: zod
    .string()
    .min(1, { message: 'Contraseña es requerido!' }),
});

export const ChangePasswordSchema = zod.object({
  newPassword: zod
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/[A-Z]/, { message: 'Debe contener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'Debe contener al menos una letra minúscula' })
    .regex(/[0-9]/, { message: 'Debe contener al menos un número' })
    .regex(/[^A-Za-z0-9]/, { message: 'Debe contener al menos un carácter especial' }),
  confirmPassword: zod
    .string()
    .min(1, { message: 'Confirmación de contraseña es requerida!' })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const password = useBoolean();
  const newPassword = useBoolean();
  const currentPassword = useBoolean();

  const defaultValues = {
    email: '',
    password: '',
  };

  const changePasswordDefaultValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const changePasswordMethods = useForm<zod.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: changePasswordDefaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    handleSubmit: handleChangePasswordSubmit,
    formState: { isSubmitting: isChangingPassword },
  } = changePasswordMethods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg(''); // Limpiar mensajes de error previos
    
    try {
      await signInWithPassword({ email: data.email, password: data.password });
      await checkUserSession?.();
      router.refresh();
    } catch (error: any) {
      console.log('Error en onSubmit:', error);
      console.log('Error response:', error.response?.data);

      // Verificar si el error es por cambio de contraseña requerido
      if (error.response?.data?.requiresPasswordChange) {
        console.log('Abriendo diálogo de cambio de contraseña');
        setUserEmail(data.email);
        setChangePasswordOpen(true);
      } else {
        // Para otros tipos de error
        const errorMessage = error.response?.data?.message || error.message || 'Error en el proceso de login';
        console.error('Error de login:', errorMessage);
        setErrorMsg(errorMessage);
      }
    }
  });

  const onCloseChangePassword = () => {
    console.log('Cerrando diálogo de cambio de contraseña');
    setChangePasswordOpen(false);
    changePasswordMethods.reset();
  };

  const onChangePassword = handleChangePasswordSubmit(async (data) => {
    try {
      console.log('Iniciando proceso de cambio de contraseña para:', userEmail);
      
      // 1. Obtener el userId del usuario
      const userIdResponse = await axios.get(
        `${CONFIG.serverUrl}/api/keycloak/user-id`,
        {
          params: { searchTerm: userEmail },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!userIdResponse.data.success || !userIdResponse.data.userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const userId = userIdResponse.data.userId;
      console.log('UserId obtenido:', userId);

      // 2. Cambiar la contraseña
      const changePasswordResponse = await axios.post(
        `${CONFIG.serverUrl}/api/keycloak/change-password`,
        {
          userId,
          newPassword: data.newPassword,
          requirePasswordChange: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!changePasswordResponse.data.success) {
        throw new Error(changePasswordResponse.data.message || 'Error al cambiar la contraseña');
      }

      console.log('Contraseña cambiada exitosamente');
      
      // Cerrar el diálogo y mostrar mensaje de éxito
      onCloseChangePassword();
      
      // Mostrar mensaje de éxito y redirigir al login
      setErrorMsg(''); // Limpiar cualquier error previo
      methods.setValue('password', ''); // Limpiar el campo de contraseña
      
      // Mostrar mensaje de éxito
      const successMessage = 'Contraseña cambiada exitosamente. Por favor, inicie sesión con su nueva contraseña.';
      setErrorMsg(successMessage);
      
    } catch (error: any) {
      console.error('Error en el proceso de cambio de contraseña:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar la contraseña';
      setErrorMsg(errorMessage);
    }
  });

  const renderForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text 
        name="email" 
        label="Correo o usuario" 
        InputLabelProps={{ shrink: true }}
      />

      <Box gap={1.5} display="flex" flexDirection="column">
        <Field.Text
          name="password"
          label="Contraseña"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
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
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Iniciando..."
      >
        Iniciar sesión
      </LoadingButton>
    </Box>
  );

  const renderChangePasswordDialog = (
    <Dialog 
      open={changePasswordOpen} 
      onClose={onCloseChangePassword} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxWidth: '500px',
          width: '100%',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        Cambio de Contraseña Requerido
      </DialogTitle>
      
      <Form methods={changePasswordMethods} onSubmit={onChangePassword}>
        <DialogContent>
          <Box gap={3} display="flex" flexDirection="column">
            <Alert severity="info" sx={{ mb: 2 }}>
              La contraseña debe contener al menos:
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>8 caracteres</li>
                <li>Una letra mayúscula</li>
                <li>Una letra minúscula</li>
                <li>Un número</li>
                <li>Un carácter especial</li>
              </ul>
            </Alert>

            <Field.Text
              name="newPassword"
              label="Nueva contraseña"
              type={newPassword.value ? 'text' : 'password'}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={newPassword.onToggle} edge="end">
                      <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Field.Text
              name="confirmPassword"
              label="Confirmar nueva contraseña"
              type={newPassword.value ? 'text' : 'password'}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={newPassword.onToggle} edge="end">
                      <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onCloseChangePassword}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isChangingPassword}
            sx={{ minWidth: '120px' }}
            disabled={!changePasswordMethods.formState.isValid}
          >
            Cambiar Contraseña
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );

  return (
    <>
      <FormHead title="Inicio de sesión" sx={{ textAlign: { xs: 'center', md: 'left' } }} />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      {renderChangePasswordDialog}
    </>
  );
}
