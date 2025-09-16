import { z as zod } from 'zod';
import { useState, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { loginWithOTPWithGraphQL } from '../../context/jwt/graphql-auth';

// ----------------------------------------------------------------------

export type OTPFormSchemaType = zod.infer<typeof OTPFormSchema>;

export const OTPFormSchema = zod.object({
  otpCode: zod
    .union([zod.string(), zod.number()])
    .transform((val) => val.toString())
    .refine((val) => val.length === 6, { message: 'El código OTP debe tener exactamente 6 dígitos!' })
    .refine((val) => /^\d+$/.test(val), { message: 'El código OTP solo debe contener números!' }),
});

// ----------------------------------------------------------------------

interface JwtOTPViewProps {
  open: boolean;
  onClose: () => void;
  username: string;
  password: string;
  message?: string;
}

export function JwtOTPView({ open, onClose, username, password, message }: JwtOTPViewProps) {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isInvalid, setIsInvalid] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Función para manejar el cambio en cada input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1); // Tomar solo el último carácter
    }

    if (!/^\d*$/.test(value)) {
      return; // Solo permitir números
    }

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);
    setIsInvalid(false); // Limpiar error cuando el usuario empiece a escribir

    // Mover al siguiente input si hay un valor
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si se completó el código, verificar automáticamente
    if (newOtpCode.every(digit => digit !== '') && newOtpCode.join('').length === 6) {
      handleOtpSubmit(newOtpCode.join(''));
    }
  };

  // Función para manejar la eliminación (backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      // Si el input actual está vacío y se presiona backspace, ir al anterior
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Función para manejar el pegado
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtpCode = pastedData.split('');
      setOtpCode(newOtpCode);
      setIsInvalid(false);
      
      // Enfocar el último input
      inputRefs.current[5]?.focus();
      
      // Verificar automáticamente
      handleOtpSubmit(pastedData);
    }
  };

  // Función para verificar el código OTP
  const handleOtpSubmit = async (code: string) => {
    if (code.length !== 6) return;

    setErrorMsg('');
    setIsLoading(true);
    setIsInvalid(false);
    
    try {
      await loginWithOTPWithGraphQL(username, password, code);
      await checkUserSession?.();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.log('Error en verificación OTP:', error);
      const errorMessage = error.message || 'Error en la verificación del código OTP';
      console.error('Error de verificación OTP:', errorMessage);
      setErrorMsg(errorMessage);
      setIsInvalid(true);
      
      // Limpiar el código y enfocar el primer input
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const onCloseOTP = () => {
    console.log('Cerrando diálogo de OTP');
    onClose();
    setErrorMsg('');
    setOtpCode(['', '', '', '', '', '']);
    setIsInvalid(false);
  };

  // Limpiar el código cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setOtpCode(['', '', '', '', '', '']);
      setIsInvalid(false);
      setErrorMsg('');
      // Enfocar el primer input después de un pequeño delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  const renderOtpInputs = (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        mb: 3,
      }}
    >
      {otpCode.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            inputRefs.current[index] = el;
          }}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          variant="outlined"
          size="small"
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            },
          }}
          sx={{
            width: 60,
            height: 60,
            '& .MuiOutlinedInput-root': {
              height: 60,
              borderRadius: 2,
              ...(isInvalid && {
                borderColor: 'error.main',
                '& fieldset': {
                  borderColor: 'error.main',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: 'error.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'error.main',
                },
              }),
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onCloseOTP} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FormHead
          title="Verificación de Seguridad"
          description="Ingrese el código de verificación de 6 dígitos de su aplicación de autenticación para completar el inicio de sesión."
        />
      </DialogTitle>

      <DialogContent>
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {isInvalid ? 'Token Inválido' : errorMsg}
          </Alert>
        )}

        {/* Mensaje de seguridad con icono */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            mb: 3,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Iconify icon="solar:lock-password-bold" sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Código de su aplicación autenticadora
          </Typography>
        </Box>

        {renderOtpInputs}

        {isLoading && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Verificando código...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCloseOTP} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
} 