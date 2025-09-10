import { gql } from '@apollo/client';

export const USERS_QUERY = gql`
  query Users {
    users {
      access {
        manageGroupMembership
        view
        mapRoles
        impersonate
        manage
      }
      attributes {
        sucursal
        cargo
        departamento
        is_temporary_admin
      }
      createdTimestamp
      disableableCredentialTypes
      email
      emailVerified
      enabled
      firstName
      groupRole
      groupRoleDescription
      id
      lastName
      notBefore
      requiredActions
      totp
      username
    }
  }
`; 