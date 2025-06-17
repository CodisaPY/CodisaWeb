import { ROLES } from '@guard/roles.constants';
import { getRolesFromToken } from '@guard/role-utils';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTable } from 'src/hooks/use-table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { RoleTableRow } from '../role-table-row';
import { useGetRoles } from '../hooks/use-get-roles';
import { RoleTableToolbar } from '../role-table-toolbar';
import { RoleTableFiltersResult } from '../role-table-filters-result';

import type { Role } from '../hooks/use-get-roles';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'ID del Rol', width: 220, sticky: true },
  { id: 'description', label: 'Descripción', width: 220 },
  { id: 'composite', label: 'Compuesto', width: 120 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function RoleListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const { roles, loading, refetch } = useGetRoles();

  const [tableData, setTableData] = useState<Role[]>([]);

  useEffect(() => {
    if (roles) {
      setTableData(roles);
    }
  }, [roles]);

  const filters = useSetState({
    name: '',
    composite: 'all',
  });

  const [userRoles, setUserRoles] = useState<string[]>([]);

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.GENERACION_NUEVO_ROL_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const userRolesFromToken = getRolesFromToken();
    setUserRoles(userRolesFromToken);
  }, []);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: (a: any, b: any) => {
      const order = table.order === 'asc' ? 1 : -1;
      if (table.orderBy === 'name') {
        return order * a.name.localeCompare(b.name);
      }
      if (table.orderBy === 'description') {
        return order * a.description.localeCompare(b.description);
      }
      return 0;
    },
    filters: filters.state,
  });

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!(
    filters.state.name ||
    filters.state.composite !== 'all'
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);
      refetch();
    },
    [tableData, refetch]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    toast.success('¡Roles eliminados con éxito!');
    setTableData(deleteRows);
    confirm.onFalse();
  }, [table.selected, tableData, confirm]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.seguridad.moduloRoles.listaRol);
    },
    [router]
  );

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Listado de Roles"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Roles', href: paths.dashboard.seguridad.moduloRoles.listaRol },
          { name: 'Lista de roles' },
        ]}
        action={
          tienePermisoCrear && (
            <Button
              component={RouterLink}
              href={paths.dashboard.seguridad.moduloRoles.nuevoRol}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuevo Rol
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
            Cargando roles...
          </Box>
        ) : (
          <>
            <RoleTableToolbar
              filters={filters.state}
              onFilters={(name, value) => {
                table.onResetPage();
                filters.setState({ [name]: value });
              }}
            />

            {canReset && (
              <RoleTableFiltersResult
                filters={filters.state}
                onResetFilters={() => {
                  filters.setState({
                    name: '',
                    composite: 'all',
                  });
                }}
                results={dataFiltered.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
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
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    onSort={table.onSort}
                    sx={{
                      '& th': {
                        backgroundColor: 'background.paper',
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                      },
                      '& th:first-of-type': {
                        left: 0,
                        zIndex: 4,
                        backgroundColor: 'background.paper',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          backgroundColor: 'divider',
                        },
                      },
                    }}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <RoleTableRow
                          key={row.id}
                          row={row}
                          onEditRow={() => handleEditRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          dense={table.dense}
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
            ¿Estás seguro que deseas eliminar <strong> {table.selected.length} </strong> roles?
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

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: Role[];
  comparator: (a: any, b: any) => number;
  filters: {
    name: string;
    composite: string;
  };
}) {
  const { name, composite } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (role) => role.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (composite !== 'all') {
    inputData = inputData.filter((role) => role.composite === (composite === 'true'));
  }

  return inputData;
}

function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
} 