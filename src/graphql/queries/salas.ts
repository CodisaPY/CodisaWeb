import { gql } from '@apollo/client';

export const GET_ALL_SALAS_QUERY = gql`
  query GetAllSalasReuniones {
    getAllSalasReuniones {
      idSala
      nombre
      color
      estado
      createdAt
    }
  }
`;
