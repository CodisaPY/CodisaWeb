import { useParams, useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewMarcaForm } from '../new-marca-form';

// ----------------------------------------------------------------------

export function MarcaEditView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Obtener los datos de la marca desde los searchParams
  const marcaData = {
    id: parseInt(id || '0', 10),
    nombre: searchParams.get('nombre') || '',
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Marca"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Lista de marcas', href: paths.dashboard.tic.moduloInventario.listaMarcas },
          { name: 'Editar marca' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewMarcaForm currentMarca={marcaData} />
    </DashboardContent>
  );
} 