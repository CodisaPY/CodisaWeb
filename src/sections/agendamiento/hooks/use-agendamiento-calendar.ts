import type FullCalendar from '@fullcalendar/react';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { EventDropArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { ICalendarView, ICalendarRange } from 'src/types/calendar';
import type { AgendamientoSalaEvent } from 'src/types/agendamiento';

import { useRef, useState, useCallback } from 'react';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export function useAgendamientoCalendar() {
  const calendarRef = useRef<FullCalendar>(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState(new Date());

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState<ICalendarRange>(null);

  const [view, setView] = useState<ICalendarView>(smUp ? 'dayGridMonth' : 'listWeek');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = smUp ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView: ICalendarView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback((arg: DateSelectArg) => {
    const calendarApi = arg.view.calendar;

    calendarApi.unselect();

    setSelectedRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });

    setSelectEventId('');
    setOpenForm(true);
  }, []);

  const onClickEvent = useCallback((arg: EventClickArg) => {
    const { event } = arg;

    setSelectEventId(event.id);
    setSelectedRange(null);
    setOpenForm(true);
  }, []);

  const onDropEvent = useCallback(
    (arg: EventDropArg, updateEvent: (eventId: string, eventData: any) => void) => {
      const { event } = arg;

      updateEvent(event.id, {
        start: event.start,
        end: event.end,
      });
    },
    []
  );

  const onResizeEvent = useCallback(
    (arg: EventResizeDoneArg, updateEvent: (eventId: string, eventData: any) => void) => {
      const { event } = arg;

      updateEvent(event.id, {
        start: event.start,
        end: event.end,
      });
    },
    []
  );

  const onClickEventInFilters = useCallback((eventId: string) => {
    setSelectEventId(eventId);
    setSelectedRange(null);
    setOpenForm(true);
  }, []);

  return {
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
  };
}
