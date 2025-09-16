import { gql } from '@apollo/client';

export const CHECK_SESSION_QUERY = gql`
  query CheckSession {
    checkSession {
      expiresAt
      token
      user {
        email
        id
        name
        roles
        username
      }
      valid
    }
  }
`;

export const SEARCH_USER_QUERY = gql`
  query SearchUser($searchTerm: String!) {
    searchUser(searchTerm: $searchTerm) {
      data {
        userId
      }
      message
      success
      timestamp
    }
  }
`; 