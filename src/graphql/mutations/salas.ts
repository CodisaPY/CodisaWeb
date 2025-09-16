import { gql } from '@apollo/client';

export const CREATE_SALA_MUTATION = gql`
  mutation CreateSalaReunion($input: SalaReunionInput!) {
    createSalaReunion(input: $input) {
      idSala
      nombre
      color
      estado
      createdAt
    }
  }
`;

export const UPDATE_SALA_MUTATION = gql`
  mutation UpdateSalaReunion($idSala: Int!, $input: SalaReunionInput!) {
    updateSalaReunion(idSala: $idSala, input: $input) {
      idSala
      nombre
      color
      estado
      createdAt
    }
  }
`;

export const DELETE_SALA_MUTATION = gql`
  mutation DeleteSalaReunion($idSala: Int!) {
    deleteSalaReunion(idSala: $idSala)
  }
`;
