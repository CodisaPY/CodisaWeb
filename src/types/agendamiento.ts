export type AgendamientoSala = {
  id: number;
  salaId: number;
  salaNombre: string;
  salaColor: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  usuarioId: number;
  usuarioNombre: string;
  createdAt: string;
  updatedAt: string;
};

export type ReservaSalaInput = {
  idSala: number;
  titulo: string;
  reservadoPor: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
};

export type AgendamientoSalaInput = ReservaSalaInput;

export type AgendamientoSalaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    salaId: number;
    salaNombre: string;
    descripcion?: string;
    estado: string;
    usuarioId: number;
    usuarioNombre: string;
  };
};
