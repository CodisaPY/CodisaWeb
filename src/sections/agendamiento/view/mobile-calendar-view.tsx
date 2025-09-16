import { useState, useCallback, useRef } from 'react';
import { Box, Typography, Stack, Button, IconButton, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useTheme } from '@mui/material/styles';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

interface MobileCalendarViewProps {
  events: any[];
  onSelectRange: (range: { start: Date; end: Date }) => void;
  onEventClick: (event: any) => void;
  onEventMove: (eventId: string, newStart: Date, newEnd: Date) => void;
  onEventResize: (eventId: string, newStart: Date, newEnd: Date) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function MobileCalendarView({
  events,
  onSelectRange,
  onEventClick,
  onEventMove,
  onEventResize,
  selectedDate,
  onDateChange
}: MobileCalendarViewProps) {
  const theme = useTheme();
  const calendarRef = useRef<Calendar>(null);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);

  // Navegación de fechas
  const goToPreviousMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      onDateChange(calendarApi.getDate());
    }
  };

  const goToNextMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      onDateChange(calendarApi.getDate());
    }
  };

  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      onDateChange(calendarApi.getDate());
    }
  };

  // Manejar selección de rango
  const handleSelectRange = useCallback((arg: any) => {
    console.log('📱 Selección móvil:', arg);
    console.log('📱 Evento detectado - abriendo modal...');
    onSelectRange({
      start: arg.start,
      end: arg.end,
    });
  }, [onSelectRange]);

  // Manejar clic en evento
  const handleEventClick = useCallback((arg: any) => {
    console.log('📱 Evento clickeado:', arg.event);
    onEventClick(arg.event);
  }, [onEventClick]);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      overflow: 'hidden'
    }}>
      {/* Header móvil */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Agendamiento de Salas
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => {
              // Abrir modal de nuevo agendamiento
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              onSelectRange({ start: today, end: tomorrow });
            }}
            sx={{ 
              backgroundColor: 'black',
              '&:hover': { backgroundColor: 'grey.800' }
            }}
          >
            Nuevo Agendamiento
          </Button>
        </Stack>

        {/* Navegación del mes */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <IconButton onClick={goToPreviousMonth} size="small">
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {selectedDate.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={goToToday}>
              Hoy
            </Button>
            <IconButton onClick={goToNextMonth} size="small">
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Indicador de feedback táctil */}
      {touchFeedback && (
        <Box sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'primary.main',
          color: 'white',
          padding: 2,
          borderRadius: 2,
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {touchFeedback}
        </Box>
      )}

      {/* Calendario móvil */}
      <Box sx={{ flex: 1, p: 1 }}>
        <Card sx={{ 
          height: '100%', 
          overflow: 'hidden',
          '& .fc-daygrid-day': {
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minHeight: '60px',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&:active': {
              backgroundColor: 'action.selected',
            }
          },
          '& .fc-daygrid-day-number': {
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '8px',
          }
        }}>
          <Calendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={selectedDate}
            events={events}
            locale={esLocale}
            headerToolbar={false}
            selectable
            selectMirror
            selectOverlap={false}
            unselectAuto={false}
            select={handleSelectRange}
            eventClick={handleEventClick}
            height="100%"
            aspectRatio={1.2}
            dayMaxEvents={3}
            moreLinkClick="popover"
            // Configuración específica para móviles
            longPressDelay={100}
            selectLongPressDelay={50}
            selectMinDistance={0}
            // Mejorar interacción táctil
            dayCellDidMount={(info) => {
              // Agregar listener táctil específico para móviles
              const handleCellTouch = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Mostrar feedback visual
                setTouchFeedback(`Tocado: ${info.date.toLocaleDateString()}`);
                setTimeout(() => setTouchFeedback(null), 1000);
                
                // Crear evento de selección manual
                const start = info.date;
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);
                
                handleSelectRange({
                  start,
                  end,
                  allDay: false,
                  jsEvent: e,
                  view: info.view
                } as any);
              };
              
              // Agregar listeners para diferentes tipos de eventos táctiles
              info.el.addEventListener('touchstart', handleCellTouch, { passive: false });
              info.el.addEventListener('click', handleCellTouch);
            }}
            // Estilos optimizados para móvil
            dayCellContent={(arg) => (
              <Box sx={{ 
                fontSize: '14px', 
                fontWeight: arg.isToday ? 'bold' : 'normal',
                color: arg.isToday ? theme.palette.primary.main : 'inherit'
              }}>
                {arg.dayNumberText}
              </Box>
            )}
            eventContent={(arg) => (
              <Box sx={{
                fontSize: '11px',
                padding: '2px 4px',
                borderRadius: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                backgroundColor: (arg.event as any).color || theme.palette.primary.main,
                color: 'white',
                fontWeight: '500'
              }}>
                {arg.event.title}
              </Box>
            )}
            // Configuración específica para móviles
            dayMaxEventRows={false}
            moreLinkContent={(arg) => `+${arg.num} más`}
          />
        </Card>
      </Box>
    </Box>
  );
}
