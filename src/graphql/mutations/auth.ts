import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
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
`;

export const LOGIN_WITH_OTP_MUTATION = gql`
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
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout($input: LogoutInput!) {
    logout(input: $input) {
      message
      success
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      data {
        access_token
        expires_in
        refresh_expires_in
        refresh_token
        scope
        session_state
        token_type
      }
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

