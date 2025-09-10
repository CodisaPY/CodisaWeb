# 🔐 Autenticación GraphQL - OTP

## 📋 Descripción

Este módulo implementa la funcionalidad de autenticación con códigos OTP (One-Time Password) usando GraphQL. Cuando un usuario intenta iniciar sesión y tiene habilitada la autenticación de dos factores, el sistema solicitará un código OTP.

## 🚀 Funcionalidades

### ✅ Implementado

- **Login con OTP**: Detección automática cuando se requiere código OTP
- **Verificación OTP**: Mutation GraphQL para verificar códigos OTP
- **Pantalla OTP**: Componente modal para ingresar el código
- **Manejo de errores**: Gestión de errores específicos para OTP
- **Hooks personalizados**: `useGraphQLVerifyOTP` para verificación

## 📁 Estructura de Archivos

```
src/
├── auth/
│   ├── view/jwt/
│   │   ├── jwt-sign-in-view-graphql.tsx  # Pantalla de login con manejo OTP
│   │   └── jwt-otp-view.tsx              # Pantalla para ingresar código OTP
│   └── context/jwt/
│       └── graphql-auth.ts               # Funciones de autenticación GraphQL
├── graphql/
│   └── mutations/
│       └── auth.ts                       # Mutations GraphQL (LOGIN, VERIFY_OTP)
├── hooks/
│   └── use-graphql-auth.ts               # Hooks personalizados
├── types/
│   └── auth.ts                           # Tipos TypeScript
└── sections/auth/examples/
    └── otp-example.tsx                   # Ejemplo de uso
```

## 🔧 Configuración

### GraphQL Mutations

#### Login Mutation (sin OTP)
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    success
    message
    code
    requiresOTP
    data {
      access_token
      expires_in
      refresh_expires_in
      refresh_token
      token_type 
      session_state
      scope
    }
  }
}
```

#### Login con OTP Mutation
```graphql
mutation LoginWithOTP($input: LoginWithOTPInput!) {
  loginWithOTP(input: $input) {
    success
    message
    data {
      access_token
      expires_in
      refresh_expires_in
      refresh_token
      token_type 
      session_state
      scope
    }
    requiresOTP
    code
  }
}
```

### Tipos TypeScript

```typescript
export interface LoginResponse {
  success: boolean;
  message: string;
  code?: string;
  requiresOTP: boolean;
  data: LoginData | null;
}

export interface LoginWithOTPInput {
  username: string;
  password: string;
  otpCode: string;
}

export interface LoginWithOTPMutationResponse {
  loginWithOTP: LoginResponse;
}

export interface LoginWithOTPMutationVariables {
  input: LoginWithOTPInput;
}
```

## 🎯 Uso

### 1. Login con Detección OTP

```typescript
import { loginWithGraphQL } from 'src/auth/context/jwt/graphql-auth';

try {
  const accessToken = await loginWithGraphQL(username, password);
  // Login exitoso
} catch (error: any) {
  if (error.requiresOTP) {
    // Mostrar pantalla OTP
    console.log('Usuario:', error.username);
    console.log('Mensaje:', error.message);
  }
}
```

### 2. Login con OTP

```typescript
import { loginWithOTPWithGraphQL } from 'src/auth/context/jwt/graphql-auth';

try {
  const accessToken = await loginWithOTPWithGraphQL(username, password, otpCode);
  // Login con OTP exitoso
} catch (error) {
  // Manejar error de login con OTP
}
```

### 3. Hook Personalizado

```typescript
import { useGraphQLLoginWithOTP } from 'src/hooks/use-graphql-auth';

function MyComponent() {
  const { loginWithOTP, loading, error } = useGraphQLLoginWithOTP();

  const handleLoginWithOTP = async () => {
    try {
      const token = await loginWithOTP(username, password, otpCode);
      // Éxito
    } catch (err) {
      // Error
    }
  };

  return (
    <Button onClick={handleLoginWithOTP} disabled={loading}>
      {loading ? 'Verificando...' : 'Login con OTP'}
    </Button>
  );
}
```

### 4. Componente OTP

```typescript
import { JwtOTPView } from 'src/auth/view/jwt/jwt-otp-view';

function LoginPage() {
  const [otpOpen, setOtpOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      {/* Formulario de login */}
      
      <JwtOTPView
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        username={username}
        password={password}
        message="Se requiere código OTP. Por favor, ingrese el código de su aplicación de autenticación."
      />
    </>
  );
}
```

## 🔄 Flujo de Autenticación

### Login Normal (sin OTP)
1. **Usuario ingresa credenciales** → Login mutation
2. **Backend responde exitosamente** → Retorna tokens de acceso
3. **Frontend guarda tokens** → Usuario autenticado

### Login con OTP
1. **Usuario ingresa credenciales** → Login mutation
2. **Backend responde con OTP requerido** → `requiresOTP: true`
3. **Frontend detecta OTP requerido** → Muestra pantalla OTP
4. **Usuario ingresa código OTP** → Login with OTP mutation
5. **Backend verifica código** → Retorna tokens de acceso
6. **Frontend guarda tokens** → Usuario autenticado

## 📝 Respuestas del Backend

### Login con OTP Requerido
```json
{
  "data": {
    "login": {
      "data": null,
      "requiresOTP": true,
      "code": "OTP_REQUIRED",
      "message": "Se requiere código OTP. Por favor, ingrese el código de su aplicación de autenticación.",
      "success": false
    }
  }
}
```

### Login con OTP Exitosa
```json
{
  "data": {
    "loginWithOTP": {
      "success": true,
      "message": "Login con OTP exitoso",
      "data": {
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
        "expires_in": 1800,
        "refresh_expires_in": 1800,
        "token_type": "Bearer",
        "session_state": "session-id",
        "scope": "profile email"
      },
      "requiresOTP": null,
      "code": null
    }
  }
}
```

## 🛠️ Desarrollo

### Agregar Validaciones

```typescript
// En jwt-otp-view.tsx
export const OTPFormSchema = zod.object({
  otpCode: zod
    .string()
    .min(6, { message: 'El código OTP debe tener al menos 6 dígitos!' })
    .max(8, { message: 'El código OTP no puede tener más de 8 dígitos!' })
    .regex(/^\d+$/, { message: 'El código OTP solo debe contener números!' }),
});
```

### Personalizar Mensajes

```typescript
// En jwt-sign-in-view-graphql.tsx
if (error.requiresOTP) {
  setOtpMessage(error.message || 'Código OTP requerido');
  setOtpOpen(true);
}
```

## 🧪 Testing

### Ejemplo de Prueba

```typescript
// Probar login con OTP
const testLoginWithOTP = async () => {
  try {
    const token = await loginWithOTPWithGraphQL('usuario@test.com', 'password123', '123456');
    console.log('✅ Login con OTP exitoso:', token);
  } catch (error) {
    console.error('❌ Error login con OTP:', error.message);
  }
};
```

## 📚 Referencias

- [GraphQL Mutations](https://graphql.org/learn/queries/#mutations)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Material-UI Dialogs](https://mui.com/material-ui/react-dialog/)
- [React Hook Form](https://react-hook-form.com/) 