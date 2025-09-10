// Tipos para la autenticación GraphQL

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginWithOTPInput {
  username: string;
  password: string;
  otpCode: string;
}

export interface LoginData {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  code?: string;
  requiresOTP: boolean;
  data: LoginData | null;
}

export interface LoginMutationResponse {
  login: LoginResponse;
}

export interface LoginMutationVariables {
  input: LoginInput;
}

export interface LoginWithOTPMutationResponse {
  loginWithOTP: LoginResponse;
}

export interface LoginWithOTPMutationVariables {
  input: LoginWithOTPInput;
}

export interface LogoutInput {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface LogoutMutationResponse {
  logout: LogoutResponse;
}

export interface LogoutMutationVariables {
  input: LogoutInput;
}

export interface RefreshTokenInput {
  refresh_token: string;
}

export interface RefreshTokenData {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
}

export interface RefreshTokenResponse {
  data: RefreshTokenData;
}

export interface RefreshTokenMutationResponse {
  refreshToken: RefreshTokenResponse;
}

export interface RefreshTokenMutationVariables {
  input: RefreshTokenInput;
}

export interface ChangePasswordInput {
  newPassword: string;
  temporary: boolean;
  userId: string;
}

export interface ChangePasswordResponse {
  changePassword: boolean;
}

export interface ChangePasswordMutationResponse {
  changePassword: boolean;
}

export interface ChangePasswordMutationVariables {
  input: ChangePasswordInput;
}

export interface VerifyOTPInput {
  username: string;
  otpCode: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: LoginData | null;
}

export interface VerifyOTPMutationResponse {
  verifyOTP: VerifyOTPResponse;
}

export interface VerifyOTPMutationVariables {
  input: VerifyOTPInput;
}

export interface User {
  email: string;
  id: string;
  name: string;
  roles: string[];
  username: string;
}

export interface CheckSessionData {
  expiresAt: string;
  token: string;
  user: User;
  valid: boolean;
}

export interface CheckSessionResponse {
  checkSession: CheckSessionData;
}

export interface SearchUserData {
  userId: string;
}

export interface SearchUserResponse {
  data: SearchUserData;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface SearchUserQueryResponse {
  searchUser: SearchUserResponse;
}

export interface SearchUserQueryVariables {
  searchTerm: string;
} 