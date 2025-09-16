import { gql } from '@apollo/client';

export const TIPOS_EQUIPO_QUERY = gql`
  query TiposEquipo {
    tiposEquipo {
      id
      nombre
    }
  }
`; 