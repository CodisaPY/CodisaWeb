import { gql } from '@apollo/client';

export const CREATE_EQUIPO_MUTATION = gql`
  mutation CreateEquipo($input: CreateEquipoInput!) {
    createEquipo(input: $input) {
      success
      message
      equipoId
    }
  }
`;

export const UPDATE_EQUIPO_MUTATION = gql`
  mutation UpdateEquipo($id: ID!, $input: UpdateEquipoInput!) {
    updateEquipo(id: $id, input: $input) {
      success
      message
      equipoId
    }
  }
`;

export const DELETE_ATRIBUTO_MUTATION = gql`
  mutation DeleteAtributo($deleteAtributoId: Int!) {
    deleteAtributo(id: $deleteAtributoId)
  }
`;

export const CREATE_ATRIBUTO_MUTATION = gql`
  mutation CreateAtributo($input: AtributoInput!) {
    createAtributo(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_ATRIBUTO_MUTATION = gql`
  mutation UpdateAtributo($id: ID!, $input: AtributoInput!) {
    updateAtributo(id: $id, input: $input) {
      success
      message
    }
  }
`;

export const DELETE_MODELO_MUTATION = gql`
  mutation DeleteModelo($deleteModeloId: Int!) {
    deleteModelo(id: $deleteModeloId)
  }
`; 