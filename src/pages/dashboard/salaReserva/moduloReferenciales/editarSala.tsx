import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { LoadingScreen } from 'src/components/loading-screen';

import { SalaForm } from 'src/sections/sala/sala-form';
import { SalaReunion } from 'src/types/sala';
import { GET_ALL_SALAS_QUERY } from 'src/graphql/queries/salas';

// ----------------------------------------------------------------------

export default function EditarSalaPage() {
  const { id } = useParams();
  
  const { data, loading, error } = useQuery(GET_ALL_SALAS_QUERY);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div>
        <h1>Error al cargar la sala</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  const sala = data?.getAllSalasReuniones?.find((s: SalaReunion) => s.idSala === parseInt(id || '0', 10));

  if (!sala) {
    return (
      <div>
        <h1>Sala no encontrada</h1>
        <p>La sala con ID {id} no existe.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title> Editar Sala</title>
      </Helmet>

      <SalaForm currentSala={sala} />
    </>
  );
}
