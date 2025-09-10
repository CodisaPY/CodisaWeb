import { gql } from '@apollo/client';

export const TIPOS_EQUIPO_QUERY = gql`
  query TiposEquipo {
    tiposEquipo {
      id
      nombre
    }
  }
`;

export const MARCAS_QUERY = gql`
  query Marcas {
    marcas {
      id
      nombre
    }
  }
`;

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

export const ATRIBUTOS_QUERY = gql`
  query Atributos {
    atributos {
      id
      tipoEquipoId
      nombre
      tipoDato
      esObligatorio
      placeholder
      descripcionAtributo
      opcionesLista
      opcionesListaArray
      atributoDependienteId
      valorDependiente
      tipoDependencia
      tieneDependencia
    }
  }
`;

export const GET_ALL_ATRIBUTOS_EQUIPOS_QUERY = gql`
  query GetAllAtributosEquipos {
    getAllAtributosEquipos {
      id
      tipoEquipoId
      nombre
      tipoDato
      esObligatorio
      placeholder
      descripcionAtributo
      opcionesLista
      atributoDependienteId
      valorDependiente
      tipoDependencia
      tieneDependencia
      opcionesListaArray
    }
  }
`; 