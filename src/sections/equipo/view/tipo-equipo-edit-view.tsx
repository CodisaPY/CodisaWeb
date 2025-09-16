import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { useParams } from 'src/routes/hooks';

import { NewTipoEquipoForm } from '../new-tipo-equipo-form';

import type { TipoEquipoItem } from '../tipo-equipo-table-row';

// ----------------------------------------------------------------------

const GET_TIPO_EQUIPO_BY_ID_QUERY = gql`
  query GetTipoEquipoById($getTipoEquipoByIdId: Int!) {
    getTipoEquipoById(id: $getTipoEquipoByIdId) {
      id
      nombre
    }
  }
`;

export default function TipoEquipoEditView() {
  const params = useParams();
  const [tipoEquipo, setTipoEquipo] = useState<TipoEquipoItem | null>(null);

  // Query GraphQL para obtener tipo de equipo por ID
  const { data, loading, error } = useQuery(GET_TIPO_EQUIPO_BY_ID_QUERY, {
    variables: { getTipoEquipoByIdId: parseInt(params.id || '0', 10) },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    skip: !params.id,
    onCompleted: (queryData) => {
      console.log('✅ Query GET_TIPO_EQUIPO_BY_ID ejecutada exitosamente:', queryData);
      if (queryData?.getTipoEquipoById) {
        setTipoEquipo(queryData.getTipoEquipoById);
      }
    },
    onError: (queryError) => {
      console.error('❌ Error en query GET_TIPO_EQUIPO_BY_ID:', queryError);
      toast.error('Error al cargar el tipo de equipo');
    }
  });

  // Manejar errores de GraphQL
  useEffect(() => {
    if (error) {
      console.error('Error cargando tipo de equipo:', error);
      toast.error('Error al cargar el tipo de equipo');
    }
  }, [error]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!tipoEquipo) {
    return null;
  }

  return <NewTipoEquipoForm isEdit currentTipoEquipo={tipoEquipo} />;
} 