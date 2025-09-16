import { gql } from '@apollo/client';

export const MARCAS_QUERY = gql`
  query Marcas {
    marcas {
      id
      nombre
    }
  }
`; 