import { gql } from '@apollo/client';

export const GET_AGENDAMIENTOS_QUERY = gql`
  query GetAgendamientosSala($fechaInicio: String!, $fechaFin: String!) {
    getAgendamientosSala(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      id
      salaId
      salaNombre
      salaColor
      titulo
      descripcion
      fechaInicio
      fechaFin
      estado
      usuarioId
      usuarioNombre
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_RESERVA_SALA = gql`
  mutation CreateReservaSala($input: ReservaSalaInput!) {
    createReservaSala(input: $input) {
      idReserva
      idSala
      titulo
      reservadoPor
      fechaInicio
      fechaFin
      estado
      createdAt
      updatedAt
      __typename
    }
  }
`;

// Mutación alternativa por si la anterior no funciona
export const CREATE_AGENDAMIENTO_MUTATION_ALT = gql`
  mutation CreateAgendamientoSala($input: AgendamientoSalaInput!) {
    createAgendamientoSala(input: $input) {
      id
      salaId
      salaNombre
      salaColor
      titulo
      descripcion
      fechaInicio
      fechaFin
      estado
      usuarioId
      usuarioNombre
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_AGENDAMIENTO_MUTATION = gql`
  mutation UpdateReservaSala($id: Int!, $input: AgendamientoSalaInput!) {
    updateReservaSala(id: $id, input: $input) {
      idReserva
      idSala
      titulo
      reservadoPor
      fechaInicio
      fechaFin
      estado
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_AGENDAMIENTO_MUTATION = gql`
  mutation DeleteAgendamientoSala($id: Int!) {
    deleteAgendamientoSala(id: $id)
  }
`;

// Calendario - reservas para FullCalendar (sin auth header)
export const GET_RESERVAS_SALAS_CALENDARIO = gql`
  query GetReservasSalasCalendario {
    getReservasSalasCalendario {
      id
      title
      fechaInicio
      fechaFin
      sala
      color
      usuario
      __typename
    }
  }
`;

// Query para obtener reservas filtradas por sala y fecha
export const GET_RESERVAS_SALAS_CALENDARIO_FILTRADO = gql`
  query GetReservasSalasCalendarioFiltrado($fecha: String!, $idSala: Int!) {
    getReservasSalasCalendarioFiltrado(fecha: $fecha, idSala: $idSala) {
      id
      title
      fechaInicio
      fechaFin
      idSala
      sala
      color
      usuario
    }
  }
`;
