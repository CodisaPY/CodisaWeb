import { useState, useEffect, useRef } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';
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
  
  // Detectar si es dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [selectedSalaId, setSelectedSalaId] = useState<number | null>(null);
  const calendarRef = useRef<any>(null);
  
  // Función para manejar cambio de sala
  const handleSalaChange = (salaId: number | null) => {
    console.log('🏢 ===== INICIO handleSalaChange =====');
    console.log('🏢 Sala seleccionada:', salaId);
    console.log('🏢 Tipo de salaId:', typeof salaId);
    
    if (salaId === null || Number.isNaN(salaId)) {
      console.log('🏢 Valor inválido, limpiando selección');
      setSelectedSalaId(null);
      methods.setValue('idSala', 0);
      console.log('🏢 ===== FIN handleSalaChange (valor inválido) =====');
      return;
    }
    
    console.log('🏢 Sala encontrada:', salasData?.getAllSalasReuniones?.find((sala: any) => sala.idSala === salaId));
    
    console.log('🏢 Estado antes del cambio:');
    console.log('🏢 - selectedSalaId:', selectedSalaId);
    console.log('🏢 - showTimeSelector:', showTimeSelector);
    
    setSelectedSalaId(salaId);
    console.log('🏢 setSelectedSalaId ejecutado');
    
    methods.setValue('idSala', salaId);
    console.log('🏢 methods.setValue ejecutado');
    
    // Verificar que el valor se estableció correctamente
    const formValue = methods.getValues('idSala');
    console.log('🏢 Valor en formulario después de setValue:', formValue);
    
    // Buscar reservas de la sala seleccionada
    console.log('🔍 Buscando reservas para sala:', salaId);
    console.log('🔍 Reservas existentes antes del filtro:', existingReservations.length);
    
    // Filtrar las reservas existentes por la sala seleccionada
    const reservasFiltradas = existingReservations.filter(reserva => reserva.idSala === salaId);
    console.log('🔍 Reservas filtradas para sala', salaId, ':', reservasFiltradas.length);
    
    // Si estamos en el selector de tiempo, actualizar las reservas mostradas
    if (showTimeSelector) {
      console.log('🔄 Actualizando calendario de tiempo con reservas filtradas');
      // El filtrado se hace automáticamente en el render del Calendar
      // pero podemos forzar una actualización si es necesario
    }
    
    console.log('🏢 ===== FIN handleSalaChange =====');
  };
  
  // Cleanup para asegurar que el scroll se reactive al desmontar
  useEffect(() => () => {
    // Asegurar que el scroll esté reactivado al desmontar el componente
    document.body.style.overflow = 'auto';
  }, []);
  
  // Manejar eventos de touch para el calendario móvil
  useEffect(() => {
    if (!isMobile || !showTimeSelector) return undefined;

    const calendarElement = calendarRef.current?.getApi()?.el;
    if (!calendarElement) return undefined;

    let isSelecting = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Verificar si el touch está en el área de selección del calendario
      const target = e.target as Element;
      if (target.closest('.fc-timegrid-slot') || 
          target.closest('.fc-timegrid-slot-label') ||
          target.closest('.fc-event') ||
          target.closest('.fc-event-main') ||
          target.closest('.fc-event-title')) {
        console.log('📅 Touch iniciado en área de selección/evento:', target.className);
        isSelecting = true;
        // Solo desactivar scroll del body, no interferir con FullCalendar
        document.body.style.overflow = 'hidden';
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isSelecting) {
        // Solo prevenir scroll de la página, pero permitir que FullCalendar maneje el arrastre
        const target = e.target as Element;
        if (target.closest('.fc-event') || target.closest('.fc-event-main') || target.closest('.fc-event-title')) {
          // Para eventos, solo prevenir scroll vertical
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            const deltaY = Math.abs(touch.clientY - (touch as any).startY || 0);
            if (deltaY > 10) {
              e.preventDefault();
              console.log('📅 Preveniendo scroll durante arrastre de evento');
            }
          }
        } else {
          // Para slots vacíos, prevenir scroll
          e.preventDefault();
          console.log('📅 Touch move durante selección de slots');
        }
      }
    };

    const handleTouchEnd = () => {
      if (isSelecting) {
        console.log('📅 Touch terminado, reactivando scroll');
        // Reactivar scroll después de un pequeño delay
        setTimeout(() => {
          document.body.style.overflow = 'auto';
          isSelecting = false;
        }, 100);
      }
    };

    calendarElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    calendarElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    calendarElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      calendarElement.removeEventListener('touchstart', handleTouchStart);
      calendarElement.removeEventListener('touchmove', handleTouchMove);
      calendarElement.removeEventListener('touchend', handleTouchEnd);
      // Asegurar que el scroll esté reactivado
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, showTimeSelector]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) ||
                     window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Función para verificar si hay superposición con reservas existentes
  const hasTimeOverlap = (startTime: Date, endTime: Date): boolean => 
    existingReservations.some(reservation => {
      const resStart = new Date(reservation.fechaInicio);
      const resEnd = new Date(reservation.fechaFin);
      
      // Verificar si hay superposición
      return (startTime < resEnd && endTime > resStart);
    });

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
  
  // Debug de salas
  useEffect(() => {
    console.log('🏢 Datos de salas cargados:', salasData);
    console.log('🏢 Salas disponibles:', salasData?.getAllSalasReuniones?.length || 0);
    if (salasData?.getAllSalasReuniones) {
      console.log('🏢 Lista de salas:', salasData.getAllSalasReuniones.map((sala: any) => ({ idSala: sala.idSala, nombre: sala.nombre, color: sala.color })));
    }
  }, [salasData]);

  // Estado para las reservas existentes
  const [existingReservations, setExistingReservations] = useState<any[]>([]);

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

        const response = await fetch('http://192.168.6.102/graphql', {
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
      {isMobile ? (
        // Vista móvil
        <Box sx={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}>
          {!showTimeSelector ? (
            // Vista principal móvil
            <>
              {/* Header */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {isNew ? 'Nuevo Agendamiento' : 'Editar Agendamiento'}
                </Typography>
              </Box>

              {/* Formulario principal */}
              <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Título de la reunión */}
                <Field.Text
                  name="titulo"
                  label="Título de la reunión"
                  placeholder="Ingrese el título del agendamiento"
                  fullWidth
                />

                {/* Sala */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Seleccionar Sala
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {salasData?.getAllSalasReuniones?.map((sala: any, index: number) => {
                      const salaId = sala.idSala || sala.id || sala._id || sala.ID || index;
                      return (
                        <Button
                          key={salaId}
                          variant={selectedSalaId === salaId ? 'contained' : 'outlined'}
                        onClick={() => {
                          console.log('🎯 Botón sala clickeado - Sala completa:', sala);
                          console.log('🎯 Botón sala clickeado - sala.idSala:', sala.idSala);
                          console.log('🎯 Botón sala clickeado - sala.nombre:', sala.nombre);
                          console.log('🎯 Botón sala clickeado - typeof sala.idSala:', typeof sala.idSala);
                          console.log('🎯 Botón sala clickeado - Object.keys(sala):', Object.keys(sala));
                          
                          // Intentar diferentes propiedades de ID
                          const finalSalaId = sala.idSala || sala.id || sala._id || sala.ID || sala.salaId;
                          console.log('🎯 Botón sala clickeado - salaId final:', finalSalaId);
                          
                          if (finalSalaId) {
                            handleSalaChange(finalSalaId);
                          } else {
                            console.log('🎯 Botón sala clickeado - No se encontró ID válido');
                          }
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          p: 2,
                          border: selectedSalaId === salaId ? 2 : 1,
                          borderColor: selectedSalaId === salaId ? sala.color : 'divider',
                          backgroundColor: selectedSalaId === salaId ? sala.color : 'transparent',
                          color: selectedSalaId === salaId ? 'white' : 'text.primary',
                          '&:hover': {
                            backgroundColor: selectedSalaId === salaId ? sala.color : 'action.hover',
                            borderColor: sala.color,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: selectedSalaId === salaId ? 'white' : sala.color,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: selectedSalaId === salaId ? 'bold' : 'normal' }}>
                            {sala.nombre}
                          </Typography>
                        </Box>
                      </Button>
                    );
                  })}
                  </Box>
                </Box>
                
                {/* Debug info */}
                <Box sx={{ p: 1, backgroundColor: 'grey.100', borderRadius: 1, fontSize: '0.75rem' }}>
                  <Typography variant="caption" component="div">
                    <strong>Debug:</strong> Sala seleccionada: {selectedSalaId || 'Ninguna'}
                  </Typography>
                  <Typography variant="caption" component="div">
                    Salas disponibles: {salasData?.getAllSalasReuniones?.length || 0}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      console.log('🔍 Botón de prueba - Salas disponibles:');
                      console.log('🔍 salasData:', salasData);
                      console.log('🔍 getAllSalasReuniones:', salasData?.getAllSalasReuniones);
                      if (salasData?.getAllSalasReuniones) {
                        salasData.getAllSalasReuniones.forEach((sala: any, index: number) => {
                          console.log(`🔍 Sala ${index}:`, { idSala: sala.idSala, nombre: sala.nombre, color: sala.color });
                        });
                      }
                    }}
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  >
                    🔍 Ver Salas en Consola
                  </Button>
                </Box>

                {/* Botón de fecha/hora */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowTimeSelector(true)}
                  sx={{ 
                    height: 56,
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha y Hora
                    </Typography>
                    <Typography variant="body1">
                      {selectedStartTime && selectedEndTime 
                        ? `${selectedStartTime} - ${selectedEndTime}`
                        : 'Seleccionar fecha y hora'
                      }
                    </Typography>
                  </Box>
                </Button>

                {/* Botones */}
                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={onClose} 
                    disabled={loading} 
                    fullWidth
                    size="large"
                  >
                    Cancelar
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={loading}
                    disabled={loading || !selectedStartTime || !selectedEndTime}
                    size="large"
                    fullWidth
                    startIcon={<Iconify icon="eva:save-fill" />}
                  >
                    {isNew ? 'Reservar' : 'Actualizar'}
                  </LoadingButton>
                </Box>
              </Box>
            </>
          ) : (
            // Selector de tiempo móvil
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: 'background.default'
            }}>
              {/* Header del selector */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Seleccionar Hora
                  </Typography>
                  {selectedSalaId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: salasData?.getAllSalasReuniones?.find((sala: any) => sala.id === selectedSalaId)?.color || 'primary.main',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Sala: {salasData?.getAllSalasReuniones?.find((sala: any) => sala.id === selectedSalaId)?.nombre}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="error.main">
                      ⚠️ Selecciona una sala primero
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setShowTimeSelector(false)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  ✓
                </Button>
              </Box>

              {/* Botón para cambiar sala */}
              {selectedSalaId && (
                <Box sx={{ p: 1, backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => {
                      setShowTimeSelector(false);
                      setSelectedSalaId(null);
                      methods.setValue('idSala', 0);
                    }}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    🔄 Cambiar Sala
                  </Button>
                </Box>
              )}

              {/* Botón de navegación superior */}
              <Box sx={{ p: 1, backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => {
                    console.log('📅 Navegando hacia arriba');
                    const calendarApi = calendarRef.current?.getApi();
                    if (calendarApi) {
                      const currentDate = calendarApi.getDate();
                      const newDate = new Date(currentDate);
                      newDate.setHours(currentDate.getHours() - 1);
                      calendarApi.gotoDate(newDate);
                      console.log('📅 Nueva fecha:', newDate);
                    }
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  ⬆️ Ver hora anterior
                </Button>
              </Box>

              {/* Calendario de tiempo */}
              <Box sx={{ flex: 1, p: 1 }}>
                <Card sx={{ 
                  height: '100%', 
                  overflow: 'hidden',
                  // Permitir scroll normal por defecto
                  touchAction: 'auto',
                  userSelect: 'auto'
                }}>
                  <Calendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    initialDate={(() => {
                      const fecha = selectedRange?.start ? new Date(selectedRange.start) : new Date();
                      console.log('📅 Fecha inicial del calendario:', fecha);
                      console.log('📅 selectedRange:', selectedRange);
                      return fecha;
                    })()}
                    events={(() => {
                      const eventosFiltrados = existingReservations
                        .filter(reserva => !selectedSalaId || reserva.idSala === selectedSalaId)
                        .map(reserva => {
                          console.log('🔄 Mapeando reserva:', reserva);
                          console.log('🔄 Reserva.usuario:', reserva.usuario);
                          console.log('🔄 Reserva.sala:', reserva.sala);
                          console.log('🔄 Reserva.fechaInicio:', reserva.fechaInicio, typeof reserva.fechaInicio);
                          console.log('🔄 Reserva.fechaFin:', reserva.fechaFin, typeof reserva.fechaFin);
                          console.log('🔄 Reserva.color:', reserva.color);
                          const evento = {
                            id: `existing-${reserva.id}`,
                            title: `${reserva.title} - ${reserva.usuario || 'Usuario desconocido'}`,
                            start: reserva.fechaInicio,
                            end: reserva.fechaFin,
                            backgroundColor: reserva.color || '#f44336',
                            borderColor: reserva.color || '#f44336',
                            textColor: 'white',
                            editable: false,
                            display: 'block',
                            extendedProps: {
                              usuario: reserva.usuario || 'Usuario desconocido',
                              sala: reserva.sala
                            }
                          };
                          console.log('🔄 Evento mapeado:', evento);
                          return evento;
                        });
                      
                      console.log('📅 Eventos en calendario móvil:', {
                        salaSeleccionada: selectedSalaId,
                        totalReservas: existingReservations.length,
                        eventosFiltrados: eventosFiltrados.length,
                        eventos: eventosFiltrados,
                        reservaEjemplo: existingReservations[0], // Mostrar estructura de una reserva
                        slotMinTime: '00:00:00',
                        slotMaxTime: '23:59:59'
                      });
                      
                      return eventosFiltrados;
                    })()}
                    locale={esLocale}
                    headerToolbar={false}
                    selectable
                    selectMirror
                    selectOverlap={false}
                    unselectAuto={false}
                    select={(arg) => {
                      const start = arg.start;
                      const end = arg.end;
                      
                      console.log('📅 Selección confirmada en calendario móvil:', arg);
                      
                      // Asegurar que el scroll esté reactivado después de la selección
                      document.body.style.overflow = 'auto';
                      document.body.style.touchAction = 'auto';
                      
                      setSelectedStartTime(start.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }));
                      setSelectedEndTime(end.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }));
                      
                      // Actualizar el formulario
                      methods.setValue('fechaInicio', start.toISOString());
                      methods.setValue('fechaFin', end.toISOString());
                    }}
                    height="100%"
                    slotMinTime="00:00:00"
                    slotMaxTime="23:59:59"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    allDaySlot={false}
                    dayHeaderFormat={{ weekday: 'long' }}
                    // Estilos para móvil
                    dayMaxEvents={false}
                    eventDisplay="block"
                    // Mejorar interacción táctil
                    longPressDelay={100}
                    selectLongPressDelay={50}
                    selectMinDistance={0}
                    // Configuración para arrastre de eventos
                    eventStartEditable
                    eventDurationEditable
                    eventResizableFromStart
                    // Configuración específica para móvil
                    eventDragMinDistance={5}
                    eventLongPressDelay={100}
                    // Configuración adicional para asegurar que los eventos se muestren
                    eventDidMount={(info) => {
                      console.log('📅 Evento montado en calendario móvil:', info.event);
                      
                      // Agregar handles de redimensionamiento personalizados
                      const eventElement = info.el;
                      if (eventElement) {
                        // Crear handle superior
                        const topHandle = document.createElement('div');
                        topHandle.className = 'fc-event-resize-handle-top';
                        topHandle.style.cssText = `
                          position: absolute;
                          top: -5px;
                          left: 50%;
                          transform: translateX(-50%);
                          width: 20px;
                          height: 10px;
                          background: #1976d2;
                          border-radius: 50%;
                          cursor: ns-resize;
                          z-index: 1000;
                          border: 2px solid white;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        `;
                        
                        // Crear handle inferior
                        const bottomHandle = document.createElement('div');
                        bottomHandle.className = 'fc-event-resize-handle-bottom';
                        bottomHandle.style.cssText = `
                          position: absolute;
                          bottom: -5px;
                          left: 50%;
                          transform: translateX(-50%);
                          width: 20px;
                          height: 10px;
                          background: #1976d2;
                          border-radius: 50%;
                          cursor: ns-resize;
                          z-index: 1000;
                          border: 2px solid white;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        `;
                        
                        eventElement.appendChild(topHandle);
                        eventElement.appendChild(bottomHandle);
                        
                        // Agregar eventos de touch para los handles
                        const addHandleEvents = (handle: HTMLElement, isTop: boolean) => {
                          let startY = 0;
                          let startTime = 0;
                          let currentStartTime = 0;
                          let currentEndTime = 0;
                          
                          const handleTouchStart = (e: TouchEvent) => {
                            e.stopPropagation();
                            startY = e.touches[0].clientY;
                            
                            // Capturar los tiempos actuales del evento
                            const eventStart = info.event.start;
                            const eventEnd = info.event.end;
                            
                            if (!eventStart || !eventEnd) {
                              console.log('📅 Error: Evento sin start/end válidos');
                              return;
                            }
                            
                            // Guardar tiempos actuales para usar durante el arrastre
                            currentStartTime = eventStart.getTime();
                            currentEndTime = eventEnd.getTime();
                            startTime = isTop ? currentStartTime : currentEndTime;
                            
                            console.log('📅 Handle touch iniciado:', isTop ? 'top' : 'bottom', 'startTime:', new Date(startTime).toLocaleTimeString());
                            
                            // Desactivar scroll durante redimensionamiento
                            document.body.style.overflow = 'hidden';
                          };
                          
                          const handleTouchMove = (e: TouchEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const currentY = e.touches[0].clientY;
                            const deltaY = currentY - startY;
                            
                            // Convertir movimiento en tiempo (aproximadamente 30px = 1 hora)
                            const timeDelta = (deltaY / 30) * 60 * 60 * 1000; // en milisegundos
                            const newTime = startTime + timeDelta;
                            
                            if (isTop) {
                              // Redimensionar desde arriba
                              const newStart = new Date(newTime);
                              if (newStart.getTime() < currentEndTime) {
                                // Actualizar el evento si es válido, sino usar el estado local
                                try {
                                  info.event.setStart(newStart);
                                  console.log('📅 Redimensionando desde arriba:', newStart.toLocaleTimeString());
                                } catch (error) {
                                  console.log('📅 Evento no disponible, usando estado local');
                                }
                              }
                            } else {
                              // Redimensionar desde abajo
                              const newEnd = new Date(newTime);
                              if (newEnd.getTime() > currentStartTime) {
                                // Actualizar el evento si es válido, sino usar el estado local
                                try {
                                  info.event.setEnd(newEnd);
                                  console.log('📅 Redimensionando desde abajo:', newEnd.toLocaleTimeString());
                                } catch (error) {
                                  console.log('📅 Evento no disponible, usando estado local');
                                }
                              }
                            }
                          };
                          
                          const handleTouchEnd = (e: TouchEvent) => {
                            e.stopPropagation();
                            console.log('📅 Handle touch terminado');
                            
                            // Reactivar scroll
                            document.body.style.overflow = 'auto';
                            
                            // Calcular los nuevos tiempos basados en el movimiento
                            const currentY = e.changedTouches[0].clientY;
                            const deltaY = currentY - startY;
                            const timeDelta = (deltaY / 30) * 60 * 60 * 1000;
                            const newTime = startTime + timeDelta;
                            
                            let finalStartTime = currentStartTime;
                            let finalEndTime = currentEndTime;
                            
                            if (isTop) {
                              // Redimensionar desde arriba
                              const newStart = new Date(newTime);
                              if (newStart.getTime() < currentEndTime) {
                                finalStartTime = newStart.getTime();
                              }
                            } else {
                              // Redimensionar desde abajo
                              const newEnd = new Date(newTime);
                              if (newEnd.getTime() > currentStartTime) {
                                finalEndTime = newEnd.getTime();
                              }
                            }
                            
                            // Actualizar el formulario con los tiempos finales
                            const finalStart = new Date(finalStartTime);
                            const finalEnd = new Date(finalEndTime);
                            
                            setSelectedStartTime(finalStart.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }));
                            setSelectedEndTime(finalEnd.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }));
                            
                            methods.setValue('fechaInicio', finalStart.toISOString());
                            methods.setValue('fechaFin', finalEnd.toISOString());
                            
                            console.log('📅 Formulario actualizado:', finalStart.toLocaleTimeString(), '→', finalEnd.toLocaleTimeString());
                          };
                          
                          handle.addEventListener('touchstart', handleTouchStart, { passive: false });
                          handle.addEventListener('touchmove', handleTouchMove, { passive: false });
                          handle.addEventListener('touchend', handleTouchEnd, { passive: false });
                        };
                        
                        addHandleEvents(topHandle, true);
                        addHandleEvents(bottomHandle, false);
                      }
                    }}
                    eventWillUnmount={(info) => {
                      console.log('📅 Evento desmontado en calendario móvil:', info.event);
                    }}
                    // Callback cuando se mueve un evento
                    eventDrop={(info) => {
                      console.log('📅 Evento movido:', info.event);
                      const start = info.event.start;
                      const end = info.event.end;
                      
                      if (start && end) {
                        setSelectedStartTime(start.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }));
                        setSelectedEndTime(end.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }));
                        
                        // Actualizar el formulario
                        methods.setValue('fechaInicio', start.toISOString());
                        methods.setValue('fechaFin', end.toISOString());
                      }
                    }}
                  />
                </Card>
              </Box>

              {/* Botón de navegación inferior */}
              <Box sx={{ p: 1, backgroundColor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => {
                    console.log('📅 Navegando hacia abajo');
                    const calendarApi = calendarRef.current?.getApi();
                    if (calendarApi) {
                      const currentDate = calendarApi.getDate();
                      const newDate = new Date(currentDate);
                      newDate.setHours(currentDate.getHours() + 1);
                      calendarApi.gotoDate(newDate);
                      console.log('📅 Nueva fecha:', newDate);
                    }
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  ⬇️ Ver hora siguiente
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        // Vista desktop (existente)
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
          {/* Botones en la parte inferior */}
          <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button variant="contained" onClick={onClose} disabled={loading} size="large">
              Cancelar
            </Button>
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
                left: '',
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
      )}
    </Form>
  );
}
