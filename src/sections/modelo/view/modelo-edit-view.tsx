import { useState, useCallback, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewModeloForm } from '../new-modelo-form';

// ----------------------------------------------------------------------

type ModeloData = {
  id: number;
  nombre: string;
  marcaId: number;
  marcaNombre: string;
};

export function ModeloEditView() {
  const { id } = useParams();
  const [currentModelo, setCurrentModelo] = useState<ModeloData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchModelo = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/modelos/${id}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (response.ok) {
        const modeloData = await response.json();
        setCurrentModelo(modeloData);
      } else {
        toast.error('Error al cargar el modelo');
      }
    } catch (error) {
      console.error('Error fetching modelo:', error);
      toast.error('Error al cargar el modelo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchModelo();
  }, [fetchModelo]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentModelo) {
    return <div>Modelo no encontrado</div>;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Modelo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Lista de Modelos', href: paths.dashboard.tic.moduloInventario.listaModelos },
          { name: 'Editar Modelo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewModeloForm currentModelo={currentModelo} />
    </DashboardContent>
  );
} 