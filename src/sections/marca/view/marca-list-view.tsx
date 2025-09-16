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

import { MARCAS_QUERY } from 'src/graphql/queries/marcas';
import { DELETE_MARCA_MUTATION, DELETE_MARCAS_MUTATION } from 'src/graphql/mutations/marcas';
import { MarcaTableRow } from '../marca-table-row';

import type { MarcaItem } from '../marca-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 100 },
  { id: 'nombre', label: 'Nombre', width: 220 },
  { id: 'status', label: 'Estado', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function MarcaListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Query GraphQL para obtener marcas
  const { data, loading, error, refetch } = useQuery(MARCAS_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    onCompleted: (queryData) => {
      console.log('✅ Query MARCAS ejecutada exitosamente:', queryData);
    },
    onError: (queryError) => {
      console.error('❌ Error en query MARCAS:', queryError);
    }
  });

  // Mutaciones GraphQL para eliminar marcas
  const [deleteMarca] = useMutation(DELETE_MARCA_MUTATION, {
    onCompleted: (mutationData) => {
      console.log('✅ Mutación DELETE_MARCA ejecutada exitosamente:', mutationData);
    },
    onError: (mutationError) => {
      console.error('❌ Error en mutación DELETE_MARCA:', mutationError);
    }
  });
  
  const [deleteMarcas] = useMutation(DELETE_MARCAS_MUTATION, {
    onCompleted: (mutationData) => {
      console.log('✅ Mutación DELETE_MARCAS ejecutada exitosamente:', mutationData);
    },
    onError: (mutationError) => {
      console.error('❌ Error en mutación DELETE_MARCAS:', mutationError);
    }
  });

  const tableData = useMemo(() => data?.marcas || [], [data?.marcas]);

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.MARCA_INVENTARIO_TIC_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  // Manejar errores de GraphQL
  useEffect(() => {
    if (error) {
      console.error('Error fetching marcas:', error);
      toast.error('Error al cargar las marcas');
    }
  }, [error]);

  const dataFiltered = tableData;

  const denseHeight = table.dense ? 52 : 72;

  const notFound = !dataFiltered.length && !loading;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteMarca({
          variables: { deleteMarcaId: parseInt(id, 10) },
          refetchQueries: [{ query: MARCAS_QUERY }],
        });
        toast.success('¡Marca eliminada con éxito!');
      } catch (deleteError) {
        console.error('Error deleting marca:', deleteError);
        toast.error('Error al eliminar la marca');
      }
    },
    [deleteMarca]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await deleteMarcas({
        variables: { ids: table.selected.map(id => parseInt(id, 10)) },
        refetchQueries: [{ query: MARCAS_QUERY }],
      });
      toast.success('¡Marcas eliminadas con éxito!');
      table.onSelectAllRows(false, []);
      confirm.onFalse();
    } catch (deleteError) {
      console.error('Error deleting marcas:', deleteError);
      toast.error('Error al eliminar las marcas');
    }
  }, [deleteMarcas, table, confirm]);

  const handleEditRow = useCallback(
    (id: string) => {
      const marca = tableData.find((item: MarcaItem) => item.id.toString() === id);
      if (marca) {
        const editUrl = `${paths.dashboard.tic.moduloInventario.editarMarca(id)}?nombre=${encodeURIComponent(marca.nombre)}`;
        router.push(editUrl);
      }
    },
    [router, tableData]
  );

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Lista de Marcas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Lista de marcas' },
        ]}
        action={
          tienePermisoCrear && (
            <Button
              component={RouterLink}
              href={paths.dashboard.tic.moduloInventario.crearNuevaMarca}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nueva Marca
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
            <Typography>Cargando marcas...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row: MarcaItem) => row.id.toString())
                  )
                }
                action={
                  <Tooltip title="Eliminar">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered.map((row: MarcaItem) => row.id.toString())
                      )
                    }
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row: MarcaItem) => (
                        <MarcaTableRow
                          key={row.id}
                          row={row}
                          onDeleteRow={() => handleDeleteRow(row.id.toString())}
                          onEditRow={() => handleEditRow(row.id.toString())}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </Box>

            <TablePaginationCustom
              count={dataFiltered.length}
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
            ¿Estás seguro que deseas eliminar <strong> {table.selected.length} </strong> marcas?
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