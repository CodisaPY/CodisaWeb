import { useParams, useSearchParams } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewAtributoForm } from '../new-atributo-form';

// ----------------------------------------------------------------------

export function AtributoEditView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Obtener los datos del atributo desde los searchParams
  const atributoData = {
    id: parseInt(id || '0', 10),
    nombre: searchParams.get('nombre') || '',
    tipoEquipoId: parseInt(searchParams.get('tipoEquipoId') || '0', 10),
    tipoEquipoNombre: searchParams.get('tipoEquipoNombre') || '',
    tipoDato: searchParams.get('tipoDato') || '',
    esObligatorio: searchParams.get('esObligatorio') || '',
    placeholder: searchParams.get('placeholder') || '',
    descripcionAtributo: searchParams.get('descripcionAtributo') || '',
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Atributo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Lista de atributos', href: paths.dashboard.tic.moduloInventario.listaAtributos },
          { name: 'Editar atributo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <NewAtributoForm currentAtributo={atributoData} />
    </DashboardContent>
  );
} 