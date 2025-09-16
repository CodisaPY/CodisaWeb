import Calendar from '@fullcalendar/react';
import type { AgendamientoSala, AgendamientoSalaEvent } from 'src/types/agendamiento';

import { useEffect, useState } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';

import { useBoolean } from 'src/hooks/use-boolean';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { GET_RESERVAS_SALAS_CALENDARIO } from 'src/graphql/queries/agendamiento';
import { useQuery } from '@apollo/client';

import { StyledCalendar } from '../../calendar/styles';
import { useAgendamientoCalendar } from '../hooks/use-agendamiento-calendar';
import { useAgendamientoEvent } from '../hooks/use-agendamiento-event';
import { AgendamientoForm } from '../agendamiento-form';
import { MobileCalendarView } from './mobile-calendar-view';

// ----------------------------------------------------------------------

export function AgendamientoCalendarView() {
  const theme = useTheme();

  const openFilters = useBoolean();

  // Detectar si es dispositivo móvil con estado inicial más inteligente
  const [isMobile, setIsMobile] = useState(() => {
    // Detección inicial más agresiva para móviles
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const hasTouch = 'ontouchstart' in window;
      const isSmallScreen = window.innerWidth <= 768;
      
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
             hasTouch || isSmallScreen;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const hasTouch = 'ontouchstart' in window;
      const isSmallScreen = window.innerWidth <= 768;
      
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
                     hasTouch || isSmallScreen;
      
      console.log('🔍 Detección móvil:', {
        userAgent: `${userAgent.substring(0, 50)}...`,
        hasTouch,
        isSmallScreen,
        windowWidth: window.innerWidth,
        isMobile: mobile
      });
      
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Traer eventos con GraphQL (operación pública, sin header Authorization)
  const { data: calendarioData, refetch: refetchCalendario } = useQuery(GET_RESERVAS_SALAS_CALENDARIO, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onError: (e) => console.error('❌ Error calendario:', e),
  });

  // Función de refresh con logs
  const handleRefresh = async () => {
    console.log('🔄 Refrescando calendario...');
    try {
      await refetchCalendario();
      console.log('✅ Calendario refrescado exitosamente');
    } catch (error) {
      console.error('❌ Error al refrescar calendario:', error);
    }
  };

  // Mapear respuesta tanto a modelo de dominio esperado por hooks como a eventos de FullCalendar
  const agendamientos: AgendamientoSala[] = (calendarioData?.getReservasSalasCalendario || []).map((item: any) => ({
    id: Number(item.id),
    salaId: 0,
    salaNombre: item.sala,
    salaColor: item.color,
    titulo: item.title,
    descripcion: undefined,
    fechaInicio: item.fechaInicio,
    fechaFin: item.fechaFin,
    estado: 'A',
    usuarioId: 0,
    usuarioNombre: item.usuario,
    createdAt: '',
    updatedAt: '',
  }));

  const events: AgendamientoSalaEvent[] = (calendarioData?.getReservasSalasCalendario || []).map((item: any) => ({
    id: String(item.id),
    title: item.title || item.titulo || item.sala || 'Sin título',
    start: item.fechaInicio,
    end: item.fechaFin,
    color: item.color,
    extendedProps: {
      salaId: 0,
      salaNombre: item.sala,
      descripcion: undefined,
      estado: 'A',
      usuarioId: 0,
      usuarioNombre: item.usuario,
    },
  }));

  // Render personalizado del evento: formato "8 AM SALA DE REUNION 1" con barra de color y tooltip
  const renderEventContent = (arg: any) => {
    const salaNombre = arg?.event?.extendedProps?.salaNombre;
    const startTime = arg?.event?.start;
    const endTime = arg?.event?.end;
    const badgeColor = arg?.event?.backgroundColor || arg?.event?.extendedProps?.color || arg?.event?.color;
    
    // Formatear la hora de inicio
    const horaFormateada = startTime ? new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    }).toUpperCase() : '';
    
    // Formatear horas para el tooltip
    const horaInicioTooltip = startTime ? new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : '';
    
    const horaFinTooltip = endTime ? new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : '';
    
    // Crear el texto en el formato deseado: "8 AM SALA DE REUNION 1"
    const textoEvento = `${horaFormateada} ${salaNombre || 'SIN SALA'}`.trim();
    
    // Contenido del tooltip
    const tooltipContent = (
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {salaNombre || 'SIN SALA'}
        </Typography>
        <Typography variant="caption">
          {horaInicioTooltip} to {horaFinTooltip}
        </Typography>
      </Box>
    );
    
    return (
      <Tooltip title={tooltipContent} arrow placement="top">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          position: 'relative',
          backgroundColor: badgeColor ? `${badgeColor}20` : 'grey.100', // Color más claro (20% opacidad)
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer'
        }}>
          {/* Barra de color en el lado izquierdo */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: badgeColor || 'grey.500',
              borderRadius: '0 2px 2px 0',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5, py: 0.25, ml: 0.5, overflow: 'hidden', width: '100%' }}>
          <Typography 
            sx={{ 
              fontSize: 10, 
              lineHeight: '14px', 
              fontWeight: 'normal',
              color: 'text.primary',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              width: '100%'
            }} 
          >
            {textoEvento}
          </Typography>
          </Box>
        </Box>
      </Tooltip>
    );
  };

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  } = useAgendamientoCalendar();

  const currentEvent = useAgendamientoEvent(agendamientos, selectEventId, selectedRange, openForm);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  // Nota: los eventos ya están en estado `events` tras el fetch REST

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

  return (
    <>
      {isMobile ? (
        <MobileCalendarView
          events={events}
          onSelectRange={(range) => {
            console.log('📱 Selección móvil recibida:', range);
            console.log('📱 Llamando a onSelectRange del hook...');
            
            // Crear un objeto DateSelectArg válido para el hook
            const selectArg = {
              start: range.start,
              end: range.end,
              allDay: false,
              jsEvent: new Event('select') as any,
              view: { 
                calendar: {
                  unselect: () => console.log('📱 Calendar unselect llamado')
                }
              } as any,
              startStr: range.start.toISOString(),
              endStr: range.end.toISOString(),
            };
            
            console.log('📱 Objeto DateSelectArg creado:', selectArg);
            onSelectRange(selectArg);
            console.log('📱 onSelectRange llamado exitosamente');
          }}
          onEventClick={(event) => {
            console.log('📱 Evento clickeado:', event);
            onClickEvent({ event } as any);
          }}
          onEventMove={(eventId, newStart, newEnd) => {
            console.log('📱 Evento movido:', eventId, newStart, newEnd);
          }}
          onEventResize={(eventId, newStart, newEnd) => {
            console.log('📱 Evento redimensionado:', eventId, newStart, newEnd);
          }}
          selectedDate={date}
          onDateChange={(newDate) => {
            console.log('📱 Fecha cambiada:', newDate);
            // Crear una función personalizada para cambiar la fecha
            const calendarApi = calendarRef.current?.getApi();
            if (calendarApi) {
              calendarApi.gotoDate(newDate);
            }
          }}
        />
      ) : (
        <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Agendamiento de Salas</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onOpenForm}
          >
            Nuevo Agendamiento
          </Button>
        </Stack>

        <Card sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>
          <StyledCalendar sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 2.5,
                pr: 2,
                borderBottom: (themeVar) => `solid 1px ${themeVar.palette.divider}`,
                flexShrink: 0,
              }}
            >
              <Typography variant="h5">
                {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onDateToday}
                >
                  Hoy
                </Button>

                <Button
                  size="small"
                  variant={view === 'dayGridMonth' ? 'contained' : 'outlined'}
                  onClick={() => onChangeView('dayGridMonth')}
                >
                  Mes
                </Button>

                <Button
                  size="small"
                  variant={view === 'timeGridWeek' ? 'contained' : 'outlined'}
                  onClick={() => onChangeView('timeGridWeek')}
                >
                  Semana
                </Button>

                <Button
                  size="small"
                  variant={view === 'timeGridDay' ? 'contained' : 'outlined'}
                  onClick={() => onChangeView('timeGridDay')}
                >
                  Día
                </Button>

                <Button
                  size="small"
                  variant={view === 'listWeek' ? 'contained' : 'outlined'}
                  onClick={() => onChangeView('listWeek')}
                >
                  Lista
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ 
              flex: '1 1 auto', 
              minHeight: 400,
              '& .fc-daygrid-day': {
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                minHeight: '60px', // Aumentar altura mínima para mejor toque
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                }
              },
              '& .fc-daygrid-day:hover': {
                backgroundColor: 'action.hover',
              },
              '& .fc-daygrid-day:active': {
                backgroundColor: 'action.selected',
              },
              // Mejorar experiencia táctil en móviles
              '@media (max-width: 768px)': {
                '& .fc-daygrid-day': {
                  minHeight: '80px',
                  padding: '8px',
                },
                '& .fc-daygrid-day-number': {
                  fontSize: '16px',
                  fontWeight: 'bold',
                }
              }
            }}>
              <Calendar
                weekends
                editable
                droppable
                selectable
                rerenderDelay={10}
                allDayMaintainDuration
                eventResizableFromStart
                ref={calendarRef}
                initialDate={date}
                initialView={view}
                expandRows
                dayMaxEventRows={false}
                eventDisplay="block"
                events={events}
                headerToolbar={false}
                select={onSelectRange}
                eventClick={onClickEvent}
                eventContent={renderEventContent}
                dayCellDidMount={(info) => {
                  // Detectar si es dispositivo móvil
                  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                                        ('ontouchstart' in window);
                  
                  // Agregar listeners para clics y toques
                  const handleInteraction = (e: Event) => {
                    // Solo procesar si no se hizo clic en un evento
                    const target = e.target as Element;
                    if (target && !target.closest('.fc-event')) {
                      const start = info.date;
                      const end = new Date(start);
                      end.setHours(23, 59, 59, 999);
                      
                      onSelectRange({
                        start,
                        end,
                        allDay: false,
                        jsEvent: e,
                        view: info.view
                      } as any);
                    }
                  };
                  
                  // Para móviles, usar touchstart para mejor respuesta
                  if (isMobileDevice) {
                    info.el.addEventListener('touchstart', handleInteraction, { passive: true });
                  } else {
                    info.el.addEventListener('click', handleInteraction);
                  }
                }}
                aspectRatio={1.8}
                locale={esLocale}
                selectMirror
                selectOverlap
                unselectAuto={false}
                longPressDelay={100}
                dayMaxEvents={false}
                moreLinkClick="popover"
                selectLongPressDelay={50}
                selectMinDistance={0}
                eventDrop={(arg) => {
                  onDropEvent(arg, () => {
                    console.log('Event dropped:', arg);
                  });
                }}
                eventResize={(arg) => {
                  onResizeEvent(arg, () => {
                    console.log('Event resized:', arg);
                  });
                }}
                plugins={[
                  listPlugin,
                  dayGridPlugin,
                  timelinePlugin,
                  timeGridPlugin,
                  interactionPlugin,
                ]}
              />
            </Box>
          </StyledCalendar>
        </Card>
      </DashboardContent>
      )}

      <Dialog
        fullWidth
        maxWidth="lg"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            height: '85vh',
            width: '90vw',
            maxWidth: '1200px',
            '& form': { 
              minHeight: 0, 
              display: 'flex', 
              flex: '1 1 auto', 
              flexDirection: 'row',
              overflow: 'hidden'
            },
          },
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.event?.id ? 'Editar' : 'Nuevo'} Agendamiento</>}
        </DialogTitle>

        <AgendamientoForm
          currentEvent={currentEvent.event}
          isNew={currentEvent.isNew}
          selectedRange={currentEvent.selectedRange}
          onClose={onCloseForm}
          onRefresh={handleRefresh}
        />
      </Dialog>
    </>
  );
}
