import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { useGraphQLLoginWithOTP } from 'src/hooks/use-graphql-auth';

export function OTPExample() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { loginWithOTP, loading } = useGraphQLLoginWithOTP();

  const handleVerifyOTP = async () => {
    if (!username || !password || !otpCode) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      setError('');
      setResult('');
      
      const accessToken = await loginWithOTP(username, password, otpCode);
      setResult(`✅ OTP verificado exitosamente! Token: ${accessToken.substring(0, 20)}...`);
    } catch (err: any) {
      setError(err.message || 'Error al verificar OTP');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Ejemplo de Verificación OTP
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="usuario@ejemplo.com"
          fullWidth
        />
        
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          fullWidth
        />
        
        <TextField
          label="Código OTP"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="123456"
          fullWidth
          inputProps={{ maxLength: 8 }}
        />
        
        <Button
          variant="contained"
          onClick={handleVerifyOTP}
          disabled={loading || !username || !password || !otpCode}
          fullWidth
        >
          {loading ? 'Verificando...' : 'Login con OTP'}
        </Button>
        
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        
        {result && (
          <Alert severity="success">
            {result}
          </Alert>
        )}
      </Box>
    </Paper>
  );
} 