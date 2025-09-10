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
  mutation AssignRolesToUser($userId: String!, $roleNames: [String!]!) {
    assignRolesToUser(userId: $userId, roleNames: $roleNames) {
      success
      message
    }
  }
`;

export const REMOVE_ROLES_FROM_USER_MUTATION = gql`
  mutation RemoveRolesFromUser($userId: String!, $roleNames: [String!]!) {
    removeRolesFromUser(userId: $userId, roleNames: $roleNames) {
      success
      message
    }
  }
`;

export const ADD_ROLES_TO_GROUP_MUTATION = gql`
  mutation AddRolesToSpecificGroup($groupName: String!, $input: AddRolesToGroupInput!) {
    addRolesToSpecificGroup(groupName: $groupName, input: $input) {
      success
      message
      data {
        groupName
        addedRoles {
          id
          name
          description
          composite
          clientRole
          containerId
        }
      }
    }
  }
`;

export const REMOVE_ROLES_FROM_GROUP_MUTATION = gql`
  mutation RemoveRolesFromSpecificGroup($groupName: String!, $input: RemoveRolesFromGroupInput!) {
    removeRolesFromSpecificGroup(groupName: $groupName, input: $input) {
      success
      message
      data {
        groupName
        removedRoles {
          id
          name
          description
          composite
          clientRole
          containerId
        }
      }
    }
  }
`; 