import { gql } from '@apollo/client';

export const CREAR_MARCA_MUTATION = gql`
  mutation CreateMarca($input: MarcaInput!) {
    createMarca(input: $input) {
      id
      nombre
    }
  }
`;

export const UPDATE_MARCA_MUTATION = gql`
  mutation UpdateMarca($updateMarcaId: Int!, $input: MarcaInput!) {
    updateMarca(id: $updateMarcaId, input: $input) {
      nombre
      id
    }
  }
`;

export const DELETE_MARCA_MUTATION = gql`
  mutation DeleteMarca($deleteMarcaId: Int!) {
    deleteMarca(id: $deleteMarcaId)
  }
`;

export const DELETE_MARCAS_MUTATION = gql`
  mutation DeleteMarcas($ids: [ID!]!) {
    deleteMarcas(ids: $ids) {
      id
      nombre
    }
  }
`; 