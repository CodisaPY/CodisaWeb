import { gql } from '@apollo/client';

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      message
      userId
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($updateUserId: ID!, $input: UpdateUserInput!) {
    updateUser(id: $updateUserId, input: $input) {
      success
      message
    }
  }
`;

export const TOGGLE_USER_STATUS_MUTATION = gql`
  mutation ToggleUserStatus($userId: ID!) {
    toggleUserStatus(userId: $userId) {
      success
      data {
        userId
        active
      }
      message
    }
  }
`; 