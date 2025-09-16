import { gql } from '@apollo/client';

export const CREAR_MODELO_MUTATION = gql`
  mutation CreateModelo($input: ModeloInput!) {
    createModelo(input: $input) {
      id
      nombre
      marcaId
      marcaNombre
    }
  }
`;

export const UPDATE_MODELO_MUTATION = gql`
  mutation UpdateModelo($updateModeloId: Int!, $input: ModeloInput!) {
    updateModelo(id: $updateModeloId, input: $input) {
      id
      nombre
      marcaId
      marcaNombre
    }
  }
`;

export const DELETE_MODELO_MUTATION = gql`
  mutation DeleteModelo($deleteModeloId: Int!) {
    deleteModelo(id: $deleteModeloId)
  }
`;

export const DELETE_MODELOS_MUTATION = gql`
  mutation DeleteModelos($ids: [Int!]!) {
    deleteModelos(ids: $ids)
  }
`; 