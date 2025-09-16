import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ROLES } from '@guard/roles.constants';
import { getRolesFromToken } from '@guard/role-utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTable } from 'src/hooks/use-table';
import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableNoData,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { TIPOS_EQUIPO_QUERY } from 'src/graphql/queries/tipos-equipo';
import { DELETE_TIPO_EQUIPO_MUTATION, DELETE_TIPOS_EQUIPO_MUTATION } from 'src/graphql/mutations/tipos-equipo';

import { TipoEquipoTableRow } from '../tipo-equipo-table-row';

import type { TipoEquipoItem } from '../tipo-equipo-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 100 },
  { id: 'nombre', label: 'Nombre', width: 220 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function TipoEquipoListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Query GraphQL para obtener tipos de equipo
  const { data, loading, error } = useQuery(TIPOS_EQUIPO_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    onCompleted: (queryData) => {
      console.log('✅ Query TIPOS_EQUIPO ejecutada exitosamente:', queryData);
    },
    onError: (queryError) => {
      console.error('❌ Error en query TIPOS_EQUIPO:', queryError);
    }
  });

  // Mutation GraphQL para eliminar tipo de equipo
  const [deleteTipoEquipo] = useMutation(DELETE_TIPO_EQUIPO_MUTATION, {
    onCompleted: (mutationData) => {
      console.log('✅ Mutation DELETE_TIPO_EQUIPO ejecutada exitosamente:', mutationData);
      toast.success('¡Tipo de equipo eliminado con éxito!');
    },
    onError: (mutationError) => {
      console.error('❌ Error en mutation DELETE_TIPO_EQUIPO:', mutationError);
      toast.error(mutationError.message || 'Error al eliminar el tipo de equipo');
    },
    refetchQueries: ['TiposEquipo'],
  });

  // Mutation GraphQL para eliminar múltiples tipos de equipo
  const [deleteTiposEquipo] = useMutation(DELETE_TIPOS_EQUIPO_MUTATION, {
    onCompleted: (mutationData) => {
      console.log('✅ Mutation DELETE_TIPOS_EQUIPO ejecutada exitosamente:', mutationData);
      toast.success('¡Tipos de equipo eliminados con éxito!');
    },
    onError: (mutationError) => {
      console.error('❌ Error en mutation DELETE_TIPOS_EQUIPO:', mutationError);
      toast.error(mutationError.message || 'Error al eliminar los tipos de equipo');
    },
    refetchQueries: ['TiposEquipo'],
  });

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.TIPO_EQUIPO_INVENTARIO_TIC_CREATE),
    [userRoles]
  );

  const tienePermisoEliminar = useMemo(
    () => userRoles.includes(ROLES.TIPO_EQUIPO_INVENTARIO_TIC_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  // Procesar datos de tipos de equipo desde GraphQL
  const tableData = useMemo(() => data?.tiposEquipo || [], [data?.tiposEquipo]);

  // Manejar errores de GraphQL
  useEffect(() => {
    if (error) {
      console.error('Error fetching tipos de equipo:', error);
      toast.error('Error al cargar los tipos de equipo');
    }
  }, [error]);

  const denseHeight = table.dense ? 52 : 72;

  const notFound = !tableData.length && !loading;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteTipoEquipo({
          variables: { deleteTipoEquipoId: parseInt(id, 10) },
        });
      } catch (deleteError) {
        console.error('Error deleting tipo de equipo:', deleteError);
        toast.error('Error al eliminar el tipo de equipo');
      }
    },
    [deleteTipoEquipo]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await deleteTiposEquipo({
        variables: { ids: table.selected.map(id => parseInt(id, 10)) },
      });
      table.onSelectAllRows(false, []);
      confirm.onFalse();
    } catch (deleteError) {
      console.error('Error deleting tipos de equipo:', deleteError);
      toast.error('Error al eliminar los tipos de equipo');
      confirm.onFalse();
    }
  }, [deleteTiposEquipo, table, confirm]);

  const handleEditRow = useCallback(
    (id: string) => {
      const tipoEquipo = tableData.find((item: TipoEquipoItem) => item.id.toString() === id);
      if (tipoEquipo) {
        const editUrl = `${paths.dashboard.tic.moduloInventario.editarTipoEquipo(id)}?nombre=${encodeURIComponent(tipoEquipo.nombre)}`;
        router.push(editUrl);
      }
    },
    [router, tableData]
  );

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Lista de Tipos de Equipo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Lista de tipos de equipo' },
        ]}
        action={
          tienePermisoCrear && (
            <Button
              component={RouterLink}
              href={paths.dashboard.tic.moduloInventario.crearNuevoTipoEquipo}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuevo Tipo de Equipo
            </Button>
          )
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Cargando tipos de equipo...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={tableData.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row: TipoEquipoItem) => row.id.toString())
                  )
                }
                action={
                  tienePermisoEliminar && (
                    <Tooltip title="Eliminar">
                      <IconButton color="primary" onClick={confirm.onTrue}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  )
                }
              />

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        tableData.map((row: TipoEquipoItem) => row.id.toString())
                      )
                    }
                  />

                  <TableBody>
                    {tableData
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row: TipoEquipoItem) => (
                        <TipoEquipoTableRow
                          key={row.id}
                          row={row}
                          onDeleteRow={() => handleDeleteRow(row.id.toString())}
                          onEditRow={() => handleEditRow(row.id.toString())}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </Box>

            <TablePaginationCustom
              count={tableData.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content={
          <>
            ¿Estás seguro que deseas eliminar <strong> {table.selected.length} </strong> tipos de equipo?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRows}
          >
            Eliminar
          </Button>
        }
      />
    </Container>
  );
} 