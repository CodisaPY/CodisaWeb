import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { SalaReunion } from 'src/types/sala';
import { GET_ALL_SALAS_QUERY } from 'src/graphql/queries/salas';

import { SalaTableRow } from '../sala-table-row';
import { SalaTableToolbar } from '../sala-table-toolbar';

// ----------------------------------------------------------------------

export default function SalaListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState<SalaReunion[]>([]);

  // Query GraphQL para obtener todas las salas
  const { 
    data: salasData, 
    loading: salasLoading, 
    error: salasError,
    refetch: refetchSalas
  } = useQuery(GET_ALL_SALAS_QUERY, {
    onCompleted: (data) => {
      console.log('✅ Query GET_ALL_SALAS ejecutada exitosamente:', data);
      if (data?.getAllSalasReuniones) {
        setTableData(data.getAllSalasReuniones);
      }
    },
    onError: (error) => {
      console.error('❌ Error en query GET_ALL_SALAS:', error);
    }
  });

  const handleDeleteRow = useCallback((id: number) => {
    console.log('🗑️ Eliminando sala con ID:', id);
    // TODO: Implementar eliminación con GraphQL mutation
    confirm.onTrue();
  }, [confirm]);

  const handleEditRow = useCallback((id: number) => {
    router.push(paths.dashboard.salaReserva.moduloReferenciales.editarSala(id.toString()));
  }, [router]);

  const handleViewRow = useCallback((id: number) => {
    router.push(paths.dashboard.salaReserva.moduloReferenciales.verSala(id.toString()));
  }, [router]);

  const handleFilterName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implementar filtrado por nombre
    console.log('🔍 Filtrando por nombre:', event.target.value);
  }, []);

  const handleFilterStatus = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implementar filtrado por estado
    console.log('🔍 Filtrando por estado:', event.target.value);
  }, []);

  const handleResetFilter = useCallback(() => {
    // TODO: Implementar reset de filtros
    console.log('🔄 Reseteando filtros');
  }, []);

  if (salasError) {
    return (
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="Lista de Salas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reserva de Sala', href: paths.dashboard.salaReserva.root },
            { name: 'Referenciales', href: paths.dashboard.salaReserva.moduloReferenciales.root },
            { name: 'Salas' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <p>Error al cargar las salas: {salasError.message}</p>
            <Button variant="contained" onClick={() => refetchSalas()}>
              Reintentar
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Lista de Salas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Reserva de Sala', href: paths.dashboard.salaReserva.root },
          { name: 'Referenciales', href: paths.dashboard.salaReserva.moduloReferenciales.root },
          { name: 'Salas' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.salaReserva.moduloReferenciales.crearNuevaSala)}
          >
            Nueva Sala
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <SalaTableToolbar
          onFilterName={handleFilterName}
          onFilterStatus={handleFilterStatus}
          onResetFilter={handleResetFilter}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table size="medium" sx={{ minWidth: 960 }}>
            <TableBody>
              {salasLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando salas...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                    No hay salas registradas
                  </td>
                </tr>
              ) : (
                tableData.map((row, index) => (
                  <SalaTableRow
                    key={row.idSala}
                    row={row}
                    index={index}
                    onDeleteRow={() => handleDeleteRow(row.idSala)}
                    onEditRow={() => handleEditRow(row.idSala)}
                    onViewRow={() => handleViewRow(row.idSala)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Estás seguro de que quieres eliminar esta sala?"
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            Eliminar
          </Button>
        }
      />
    </Container>
  );
}
