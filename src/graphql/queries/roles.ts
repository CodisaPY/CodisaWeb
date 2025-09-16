import { gql } from '@apollo/client';

export const ROLES_QUERY = gql`
  query Roles {
    roles {
      id
      name
      description
      composite
      clientRole
      containerId
    }
  }
`;

export const ROLE_BY_NAME_QUERY = gql`
  query RoleByName($name: String!) {
    roleByName(name: $name) {
      id
      name
      description
      composite
      clientRole
      containerId
    }
  }
`;

export const GROUP_ROLES_QUERY = gql`
  query GroupRoles($groupName: String!) {
    groupRoles(groupName: $groupName) {
      success
      data {
        id
        name
        description
        composite
        clientRole
        containerId
      }
      message
    }
  }
`;

export const SCREEN_HIERARCHY_LEVEL3_QUERY = gql`
  query ScreenHierarchyLevel3 {
    screenHierarchyLevel3 {
      name
      description
      tipo
      attributes {
        nombre
      }
      children {
        name
        description
        composite
        tipo
        children {
          name
          description
          tipo
          children {
            composite
            name
            description
            tipo
            acciones
            attributes {
              nombre
              pantalla_id
            }
          }
          attributes {
            nombre
            pantalla_id
          }
        }
      }
    }
  }
`;

export const ROLE_PERMISSIONS_QUERY = gql`
  query RolePermissions($roleName: String!) {
    rolePermissions(roleName: $roleName) {
      success
      data {
        id
        name
        description
        composite
        clientRole
        containerId
      }
      message
    }
  }
`;

export const USER_ROLES_QUERY = gql`
  query UserRoles($userId: String!) {
    userRoles(userId: $userId) {
      id
      name
      description
      composite
      clientRole
      containerId
    }
  }
`;

export const GET_USER_ROLES_QUERY = gql`
  query GetUserRoles($id: ID!) {
    user(id: $id) {
      roles {
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

export const GET_GROUP_ROLES_QUERY = gql`
  query GetGroupRoles($groupName: String!) {
    groupRoles(groupName: $groupName) {
      success
      data {
        id
        name
        description
        composite
        clientRole
        containerId
      }
      message
    }
  }
`; 