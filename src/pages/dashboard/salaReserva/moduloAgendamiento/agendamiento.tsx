import { Helmet } from 'react-helmet-async';

import { AgendamientoCalendarView } from 'src/sections/agendamiento';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Agendamiento de Salas</title>
      </Helmet>

      <AgendamientoCalendarView />
    </>
  );
}
