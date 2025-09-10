import { useParams } from 'src/routes/hooks';
import { useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import { NewTipoEquipoForm } from 'src/sections/equipo/new-tipo-equipo-form';
import { CONFIG } from 'src/config-global';
import { toast } from 'src/components/snackbar';
import type { TipoEquipoItem } from 'src/sections/equipo/tipo-equipo-table-row';

export default function TipoEquipoEditPage() {
  const params = useParams();
  const [tipoEquipo, setTipoEquipo] = useState<TipoEquipoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTipoEquipo = async () => {
      try {
        const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/tipos-equipo/${params.id}`, {
          method: 'GET',
          headers: { accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setTipoEquipo(data);
        } else {
          console.error('Error cargando tipo de equipo:', response.status, response.statusText);
          toast.error('Error al cargar el tipo de equipo');
        }
      } catch (error) {
        console.error('Error cargando tipo de equipo:', error);
        toast.error('Error al cargar el tipo de equipo');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTipoEquipo();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!tipoEquipo) {
    return null;
  }

  return <NewTipoEquipoForm isEdit currentTipoEquipo={tipoEquipo} />;
} 