import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DateTimePicker from '@mui/lab/DateTimePicker';
import Calendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { AgendamientoSala, ReservaSalaInput, AgendamientoSalaEvent } from 'src/types/agendamiento';
import { ICalendarRange } from 'src/types/calendar';
import { CREATE_RESERVA_SALA, UPDATE_AGENDAMIENTO_MUTATION, GET_AGENDAMIENTOS_QUERY, GET_RESERVAS_SALAS_CALENDARIO, GET_RESERVAS_SALAS_CALENDARIO_FILTRADO } from 'src/graphql/queries/agendamiento';
import { GET_ALL_SALAS_QUERY } from 'src/graphql/queries/salas';

// Función para decodificar el token JWT y extraer el ID del usuario
const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    // Decodificar el payload del JWT (parte del medio)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.user_id || payload.id || null;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

// ----------------------------------------------------------------------

const agendamientoSchema = zod.object({
  idSala: zod.number().min(1, 'La sala es requerida'),
  titulo: zod.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  fechaInicio: zod.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: zod.string().min(1, 'La fecha de fin es requerida'),
});

type AgendamientoSchemaType = zod.infer<typeof agendamientoSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentEvent: AgendamientoSalaEvent | null;
  isNew: boolean;
  selectedRange?: ICalendarRange | null;
  onClose: VoidFunction;
  onRefresh?: () => void;
};

export function AgendamientoForm({ currentEvent, isNew, selectedRange, onClose, onRefresh }: Props) {
  const { user } = useAuthContext();
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  
  // Función para verificar si hay superposición con reservas existentes
  const hasTimeOverlap = (startTime: Date, endTime: Date): boolean => {
    return existingReservations.some(reservation => {
      const resStart = new Date(reservation.fechaInicio);
      const resEnd = new Date(reservation.fechaFin);
      
      // Verificar si hay superposición
      return (startTime < resEnd && endTime > resStart);
    });
  };

  // Función para mostrar mensaje de error de superposición
  const showOverlapError = () => {
    toast.error('No puedes superponer horarios con reservas existentes. Selecciona otro horario.');
  };
  const [createReservaSala, { loading: createLoading }] = useMutation(CREATE_RESERVA_SALA, {
    onCompleted: (data) => {
      console.log('✅ Reserva creada exitosamente:', data);
      console.log('🔄 Llamando a onRefresh...');
      toast.success('Reserva creada exitosamente');
      onRefresh?.(); // Llamar a la función de refresh
      console.log('✅ onRefresh llamado');
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error al crear reserva:', error);
      console.error('❌ Detalles del error:', error.message);
      console.error('❌ GraphQL errors:', error.graphQLErrors);
      console.error('❌ Network error:', error.networkError);
      toast.error(`Error al crear la reserva: ${error.message}`);
    },
    refetchQueries: [
      { query: GET_RESERVAS_SALAS_CALENDARIO }
    ],
    awaitRefetchQueries: true,
  });

  const [updateAgendamiento, { loading: updateLoading }] = useMutation(UPDATE_AGENDAMIENTO_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Agendamiento actualizado exitosamente:', data);
      toast.success('Agendamiento actualizado exitosamente');
      onRefresh?.(); // Llamar a la función de refresh
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error al actualizar agendamiento:', error);
      toast.error('Error al actualizar el agendamiento');
    },
  });

  // Query para obtener las salas disponibles
  const { data: salasData } = useQuery(GET_ALL_SALAS_QUERY);

  // Estado para las reservas existentes
  const [existingReservations, setExistingReservations] = useState<any[]>([]);
  const [selectedSalaId, setSelectedSalaId] = useState<number | null>(null);

  // Query para obtener reservas filtradas por sala y fecha
  const { data: reservasFiltradasData, refetch: refetchReservasFiltradas, loading: loadingReservas } = useQuery(
    GET_RESERVAS_SALAS_CALENDARIO_FILTRADO,
    {
      variables: {
        fecha: selectedRange?.start ? new Date(selectedRange.start).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
        idSala: selectedSalaId || 0
      },
      skip: !selectedSalaId, // Solo ejecutar si hay una sala seleccionada
      onCompleted: (data) => {
        console.log('📅 Reservas existentes para la sala:', data);
        const reservas = data?.getReservasSalasCalendarioFiltrado || [];
        console.log('📅 Detalles de reservas existentes:', reservas.map((r: any) => ({
          id: r.id,
          title: r.title,
          fechaInicio: r.fechaInicio,
          fechaFin: r.fechaFin,
          sala: r.sala
        })));
        setExistingReservations(reservas);
      },
      onError: (error) => {
        console.error('❌ Error al obtener reservas filtradas:', error);
        setExistingReservations([]);
      }
    }
  );

  // Función para crear fechas de inicio y fin para el mismo día
  const createMeetingTimes = (selectedDate: string) => {
    const date = new Date(selectedDate);
    
    // Fecha de inicio: mismo día a las 9:00 AM (horario laboral típico)
    const startDate = new Date(date);
    startDate.setHours(9, 0, 0, 0);
    
    // Fecha de fin: mismo día a las 10:00 AM (1 hora después)
    const endDate = new Date(date);
    endDate.setHours(10, 0, 0, 0);
    
    // Crear fechas en hora local con timezone offset
    const timezoneOffset = startDate.getTimezoneOffset();
    const offsetHours = Math.abs(timezoneOffset / 60);
    const offsetSign = timezoneOffset > 0 ? '-' : '+';
    const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:00`;
    
    return {
      start: startDate.toISOString().replace('Z', offsetString),
      end: endDate.toISOString().replace('Z', offsetString),
    };
  };

  const defaultValues: AgendamientoSchemaType = {
    idSala: currentEvent?.extendedProps.salaId || 0,
    titulo: currentEvent?.title || '',
    fechaInicio: currentEvent?.start || (selectedRange?.start ? createMeetingTimes(String(selectedRange.start)).start : (() => {
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();
      const offsetHours = Math.abs(timezoneOffset / 60);
      const offsetSign = timezoneOffset > 0 ? '-' : '+';
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:00`;
      return now.toISOString().replace('Z', offsetString);
    })()),
    fechaFin: currentEvent?.end || (selectedRange?.start ? createMeetingTimes(String(selectedRange.start)).end : (() => {
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();
      const offsetHours = Math.abs(timezoneOffset / 60);
      const offsetSign = timezoneOffset > 0 ? '-' : '+';
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:00`;
      return now.toISOString().replace('Z', offsetString);
    })()),
  };

  console.log('🔧 Valores por defecto del formulario:', defaultValues);

  const methods = useForm<AgendamientoSchemaType>({
    resolver: zodResolver(agendamientoSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  // Efecto para debuggear los valores del formulario en tiempo real
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'fechaInicio' || name === 'fechaFin') {
        console.log('🔄 Campo actualizado:', { name, value: value[name], type });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Función para manejar el cambio de sala
  const handleSalaChange = (salaId: number) => {
    console.log('🏢 Sala seleccionada:', salaId);
    setSelectedSalaId(salaId);
    // Refetch las reservas cuando cambie la sala
    if (salaId) {
      refetchReservasFiltradas();
    }
  };

  // Función para manejar la selección de horarios en el mini calendario
  const handleTimeSelect = (arg: any) => {
    console.log('🎯 Argumentos recibidos:', arg);
    console.log('🎯 Start date:', arg.start);
    console.log('🎯 End date:', arg.end);
    
    // Verificar si hay superposición con reservas existentes
    if (hasTimeOverlap(arg.start, arg.end)) {
      showOverlapError();
      return; // No permitir la selección
    }
    
    // Usar las cadenas de fecha locales para evitar problemas de zona horaria
    const startTime = arg.startStr; // '2025-09-12T00:00:00-03:00'
    const endTime = arg.endStr;   // '2025-09-12T01:00:00-03:00'
    
    // Crear fechas para formateo de tiempo
    const startDate = new Date(arg.start);
    const endDate = new Date(arg.end);
    
    // Formatear tiempos para mostrar en el evento
    const startTimeFormatted = startDate.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
    const endTimeFormatted = endDate.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
    
    setSelectedStartTime(startTimeFormatted);
    setSelectedEndTime(endTimeFormatted);
    
    // Actualizar los valores del formulario con el formato correcto
    setValue('fechaInicio', startTime);
    setValue('fechaFin', endTime);
    
    console.log('🕐 Horario seleccionado:', { startTime, endTime });
    console.log('🟢 Valores actualizados en el formulario:', { 
      fechaInicio: startTime, 
      fechaFin: endTime,
      startTimeFormatted,
      endTimeFormatted,
      startDate: startDate.toString(),
      endDate: endDate.toString()
    });
  };

  const onSubmit = handleSubmit(async (data: AgendamientoSchemaType) => {
    try {
      // Validar que se haya seleccionado un horario
      if (!selectedStartTime || !selectedEndTime) {
        toast.error('Por favor selecciona un horario en el calendario');
        return;
      }

      // Validar que se haya seleccionado una sala
      if (!data.idSala) {
        toast.error('Por favor selecciona una sala');
        return;
      }

      const userIdFromToken = getUserIdFromToken();
      console.log('🔑 ID del usuario desde token:', userIdFromToken);
      
      // NO convertir a UTC - enviar las fechas en hora local como las selecciona el usuario
      // El backend debe manejar las fechas en hora local
      const fechaInicioLocal = data.fechaInicio; // Mantener en hora local
      const fechaFinLocal = data.fechaFin;       // Mantener en hora local
      
      console.log('📤 VALOR QUE SE ESTÁ ENVIANDO AL BACKEND:', {
        fechaInicio: fechaInicioLocal,
        fechaFin: fechaFinLocal
      });
      
      const agendamientoInput: ReservaSalaInput = {
        idSala: data.idSala,
        titulo: data.titulo.trim(),
        reservadoPor: userIdFromToken || user?.id || '',
        fechaInicio: fechaInicioLocal, // Enviar en hora local
        fechaFin: fechaFinLocal,       // Enviar en hora local
        estado: 'A', // Siempre activo por defecto
      };

      console.log('📝 Datos del agendamiento:', agendamientoInput);
      console.log('🔍 Usuario actual:', user);
      console.log('📋 Datos del formulario:', data);
      console.log('🕐 Horario seleccionado:', { selectedStartTime, selectedEndTime });
      console.log('🟢 Verificando valores del formulario:', {
        fechaInicioFormulario: data.fechaInicio,
        fechaFinFormulario: data.fechaFin,
        fechaInicioISO: new Date(data.fechaInicio).toISOString(),
        fechaFinISO: new Date(data.fechaFin).toISOString()
      });

      // Verificar conflictos con reservas existentes
      const startTime = new Date(data.fechaInicio);
      const endTime = new Date(data.fechaFin);
      
      const hasConflict = existingReservations.some((reserva: any) => {
        const reservaStart = new Date(reserva.fechaInicio);
        const reservaEnd = new Date(reserva.fechaFin);
        
        // Verificar si hay solapamiento
        return (startTime < reservaEnd && endTime > reservaStart);
      });

      if (hasConflict) {
        toast.error('El horario seleccionado tiene conflicto con una reserva existente');
        return;
      }

      if (isNew) {
        console.log('🚀 Enviando mutación con fetch (sin Authorization header)');
        
        // Datos de prueba hardcodeados para verificar el servidor
        const testData = {
          idSala: 1,
          titulo: "Reunión de prueba",
          reservadoPor: "8864c717-587d-472a-929a-8e5f298024da-0",
          fechaInicio: "2025-01-10T10:00:00.000Z",
          fechaFin: "2025-01-10T11:00:00.000Z",
          estado: "A"
        };
        
        const mutation = `
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

        const requestBody = {
          query: mutation,
          variables: { input: agendamientoInput }
        };

        console.log('📤 Request body completo (datos del formulario):', JSON.stringify(requestBody, null, 2));
        console.log('📤 Comparación con datos de prueba:', JSON.stringify(testData, null, 2));
        console.log('📅 Reservas existentes que NO se envían:', existingReservations.length);
        console.log('🟢 Solo se envía el evento verde (vista previa)');

        const response = await fetch('http://localhost:4001/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // NO incluir Authorization header
          },
          body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        console.log('✅ Respuesta del servidor:', result);

        if (result.errors) {
          console.error('❌ Errores GraphQL:', result.errors);
          throw new Error(result.errors[0]?.message || 'Error en la mutación');
        }

        if (result.data?.createReservaSala) {
          console.log('✅ Reserva creada exitosamente:', result.data.createReservaSala);
          console.log('🔄 Llamando a onRefresh...');
          toast.success('Reserva creada exitosamente');
          onRefresh?.(); // Llamar a la función de refresh
          console.log('✅ onRefresh llamado');
          onClose();
        } else {
          console.error('❌ No se recibieron datos del servidor:', result);
          throw new Error('No se recibieron datos del servidor');
        }
      } else {
        await updateAgendamiento({
          variables: {
            id: parseInt(currentEvent!.id, 10),
            input: agendamientoInput,
          },
        });
      }
    } catch (error) {
      console.error('Error en el submit:', error);
      toast.error(isNew ? 'Error al crear la reserva' : 'Error al actualizar el agendamiento');
    }
  });

  const loading = createLoading || updateLoading || isSubmitting;

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Panel izquierdo - Formulario */}
        <Box sx={{ 
          flex: '0 0 65%', 
          p: 3, 
          borderRight: 1, 
          borderColor: 'divider',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Botón Guardar en la parte superior */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading}
              disabled={loading}
              size="large"
              startIcon={<Iconify icon="eva:save-fill" />}
            >
              {isNew ? 'Reservar' : 'Actualizar Reserva'}
            </LoadingButton>
          </Box>

          {/* Campos del formulario */}
          <Box sx={{ flex: 1 }}>
            <Field.Text
              name="titulo"
              label="Título de la reunión *"
              placeholder="Ej: Reunión de equipo"
              helperText="Ingrese el título del agendamiento"
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Sala *</InputLabel>
              <Select
                name="idSala"
                label="Sala *"
                value={methods.watch('idSala') || ''}
                onChange={(e) => {
                  const salaId = parseInt(e.target.value as string, 10);
                  methods.setValue('idSala', salaId);
                  handleSalaChange(salaId);
                }}
              >
                {salasData?.getAllSalasReuniones?.map((sala: any) => (
                  <MenuItem key={sala.idSala} value={sala.idSala}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: sala.color,
                        }}
                      />
                      {sala.nombre}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Horario de la reunión *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona el horario en el calendario de la derecha
            </Typography>
          </Box>

          {/* Botón Cancelar en la parte inferior */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button variant="outlined" onClick={onClose} disabled={loading} fullWidth>
              Cancelar
            </Button>
          </Box>
        </Box>

        {/* Panel derecho - Calendario de vista previa */}
        <Box sx={{ 
          flex: '0 0 35%', 
          p: 2,
          backgroundColor: 'background.neutral',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Vista previa del horario
          </Typography>
          
          {/* Loading de consultando disponibilidades */}
          {loadingReservas && selectedSalaId && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 2,
              gap: 1
            }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Consultando disponibilidades...
              </Typography>
            </Box>
          )}
          
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            '& .fc .fc-toolbar-title': {
              fontSize: '0.875rem !important',
              fontWeight: 'normal !important'
            }
          }}>
            <Calendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
              initialDate={selectedRange?.start || new Date().toISOString()}
              locale={esLocale}
              selectable
              selectMirror
              selectOverlap={false}
              select={handleTimeSelect}
              height="auto"
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: ''
              }}
              allDaySlot={false}
              slotMinTime="00:00:00"
              slotMaxTime="23:59:59"
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              events={[
                // Evento de vista previa (si hay horario seleccionado)
                ...(selectedStartTime && selectedEndTime ? [{
                  id: 'preview-event',
                  title: `${selectedStartTime} - ${selectedEndTime}`,
                  start: methods.watch('fechaInicio'),
                  end: methods.watch('fechaFin'),
                  backgroundColor: '#4caf50',
                  borderColor: '#4caf50',
                  textColor: 'white',
                  editable: true,
                  startEditable: true,
                  durationEditable: true
                }] : []),
                // Reservas existentes
                ...existingReservations.map((reserva: any) => ({
                  id: `existing-${reserva.id}`,
                  title: `${reserva.title} - ${reserva.usuario || 'Usuario desconocido'}`,
                  start: reserva.fechaInicio,
                  end: reserva.fechaFin,
                  backgroundColor: reserva.color || '#f44336',
                  borderColor: reserva.color || '#f44336',
                  textColor: 'white',
                  editable: false, // Las reservas existentes no se pueden editar
                  display: 'block',
                  extendedProps: {
                    usuario: reserva.usuario || 'Usuario desconocido',
                    sala: reserva.sala
                  }
                }))
              ]}
              dayHeaderFormat={{ weekday: 'long' }}
              slotLabelFormat={{
                hour: 'numeric',
                hour12: false,
              }}
              eventDidMount={(info) => {
                // Agregar tooltip con información detallada
                const event = info.event;
                const startTime = event.start ? new Date(event.start).toLocaleTimeString('es-ES', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: false
                }) : '';
                const endTime = event.end ? new Date(event.end).toLocaleTimeString('es-ES', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: false
                }) : '';
                
                let tooltipContent = '';
                if (event.id === 'preview-event') {
                  tooltipContent = `Vista previa: ${startTime} - ${endTime}`;
                } else if (event.id?.startsWith('existing-')) {
                  const usuario = event.extendedProps?.usuario || 'Usuario desconocido';
                  const sala = event.extendedProps?.sala || '';
                  tooltipContent = `${event.title}\nReservado por: ${usuario}\nHorario: ${startTime} - ${endTime}\nSala: ${sala}`;
                }
                
                if (tooltipContent) {
                  info.el.setAttribute('title', tooltipContent);
                }
              }}
              eventResize={(info) => {
                const start = info.event.start;
                const end = info.event.end;
                if (start && end) {
                  // Verificar si hay superposición con reservas existentes
                  if (hasTimeOverlap(start, end)) {
                    showOverlapError();
                    // Revertir el cambio
                    info.revert();
                    return;
                  }
                  
                  // Usar las cadenas de fecha locales
                  const startTimeStr = info.event.startStr || start.toISOString();
                  const endTimeStr = info.event.endStr || end.toISOString();
                  
                  const startTime = new Date(start).toLocaleTimeString('es-ES', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false
                  });
                  const endTime = new Date(end).toLocaleTimeString('es-ES', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false
                  });
                  setSelectedStartTime(startTime);
                  setSelectedEndTime(endTime);
                  methods.setValue('fechaInicio', startTimeStr);
                  methods.setValue('fechaFin', endTimeStr);
                }
              }}
              eventDrop={(info) => {
                const start = info.event.start;
                const end = info.event.end;
                if (start && end) {
                  // Verificar si hay superposición con reservas existentes
                  if (hasTimeOverlap(start, end)) {
                    showOverlapError();
                    // Revertir el cambio
                    info.revert();
                    return;
                  }
                  
                  // Usar las cadenas de fecha locales
                  const startTimeStr = info.event.startStr || start.toISOString();
                  const endTimeStr = info.event.endStr || end.toISOString();
                  
                  const startTime = new Date(start).toLocaleTimeString('es-ES', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false
                  });
                  const endTime = new Date(end).toLocaleTimeString('es-ES', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false
                  });
                  setSelectedStartTime(startTime);
                  setSelectedEndTime(endTime);
                  methods.setValue('fechaInicio', startTimeStr);
                  methods.setValue('fechaFin', endTimeStr);
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Form>
  );
}
