import type { ICalendarRange } from 'src/types/calendar';
import type { AgendamientoSala, AgendamientoSalaEvent } from 'src/types/agendamiento';

// ----------------------------------------------------------------------

export function useAgendamientoEvent(
  agendamientos: AgendamientoSala[],
  selectEventId: string,
  selectedRange: ICalendarRange,
  openForm: boolean
) {
  const currentEvent = agendamientos.find((event) => event.id.toString() === selectEventId);

  const event: AgendamientoSalaEvent | null = currentEvent
    ? {
        id: currentEvent.id.toString(),
        title: currentEvent.titulo,
        start: currentEvent.fechaInicio,
        end: currentEvent.fechaFin,
        color: currentEvent.salaColor,
        extendedProps: {
          salaId: currentEvent.salaId,
          salaNombre: currentEvent.salaNombre,
          descripcion: currentEvent.descripcion,
          estado: currentEvent.estado,
          usuarioId: currentEvent.usuarioId,
          usuarioNombre: currentEvent.usuarioNombre,
        },
      }
    : null;

  return {
    event,
    isNew: !currentEvent && !!selectedRange,
    selectedRange,
  };
}
