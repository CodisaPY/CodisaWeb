import { gql } from '@apollo/client';

export const CREAR_TIPO_EQUIPO_MUTATION = gql`
  mutation CreateTipoEquipo($input: TipoEquipoInput!) {
    createTipoEquipo(input: $input) {
      id
      nombre
    }
  }
`;

export const UPDATE_TIPO_EQUIPO_MUTATION = gql`
  mutation UpdateTipoEquipo($updateTipoEquipoId: Int!, $input: TipoEquipoInput!) {
    updateTipoEquipo(id: $updateTipoEquipoId, input: $input) {
      id
      nombre
    }
  }
`;

export const DELETE_TIPO_EQUIPO_MUTATION = gql`
  mutation DeleteTipoEquipo($deleteTipoEquipoId: Int!) {
    deleteTipoEquipo(id: $deleteTipoEquipoId)
  }
`;

export const DELETE_TIPOS_EQUIPO_MUTATION = gql`
  mutation DeleteTiposEquipo($ids: [Int!]!) {
    deleteTiposEquipo(ids: $ids)
  }
`; 