import { gql } from '@apollo/client';

export const MODELOS_QUERY = gql`
  query Modelos {
    modelos {
      id
      nombre
      marcaId
      marcaNombre
    }
  }
`; 