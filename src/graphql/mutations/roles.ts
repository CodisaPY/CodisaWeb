import { gql } from '@apollo/client';

export const CREATE_ROLE_MUTATION = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      success
      message
      data {
        id
        name
        description
        composite
        clientRole
        containerId
      }
    }
  }
`;

export const UPDATE_ROLE_MUTATION = gql`
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
      success
      message
      data {
        id
        name
        description
        composite
        clientRole
        containerId
      }
    }
  }
`;

export const DELETE_ROLE_MUTATION = gql`
  mutation DeleteRole($roleName: String!) {
    deleteRole(roleName: $roleName) {
      success
      message
      error
      code
      timestamp
    }
  }
`;

export const ASSIGN_ROLES_TO_USER_MUTATION = gql`
  mutation AssignRolesToUser($userId: ID!, $roles: [String!]!) {
    assignRolesToUser(userId: $userId, roles: $roles)
  }
`;

export const REMOVE_ROLES_FROM_USER_MUTATION = gql`
  mutation RemoveRolesFromUser($userId: ID!, $roles: [String!]!) {
    removeRolesFromUser(userId: $userId, roles: $roles)
  }
`;

export const ADD_ROLES_TO_GROUP_MUTATION = gql`
  mutation AddRolesToGroup($groupName: String!, $roles: [String!]!) {
    addRolesToGroup(groupName: $groupName, roles: $roles)
  }
`;

export const REMOVE_ROLES_FROM_GROUP_MUTATION = gql`
  mutation RemoveRolesFromGroup($groupName: String!, $roles: [String!]!) {
    removeRolesFromGroup(groupName: $groupName, roles: $roles)
  }
`; 