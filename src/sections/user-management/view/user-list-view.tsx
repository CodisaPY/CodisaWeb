import { useState, useCallback, useEffect, useMemo } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import axios from 'axios';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useTable } from 'src/hooks/use-table';

import { varAlpha } from 'src/theme/styles';
import { ROLES } from '@guard/roles.constants';

import { Label } from 'src/components/label';
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

import { UserTableFiltersResult } from 'src/sections/user-management/user-table-filters-result';
import { useGetUsers, User } from '../hooks/use-get-users';
import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre', width: 220, sticky: true },
  { id: 'email', label: 'Email', width: 220 },
  { id: 'role', label: 'Rol', width: 120 },
  { id: 'position', label: 'Cargo', width: 120 },
  { id: 'branch', label: 'Sucursal', width: 120 },
  { id: 'status', label: 'Estado', width: 100 },
  { id: 'createdAt', label: 'Creado', width: 140 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const { users, loading } = useGetUsers();

  const [tableData, setTableData] = useState<User[]>([]);

  useEffect(() => {
    if (users) {
      console.log('Actualizando tableData con usuarios:', users);
      setTableData(users);
    }
  }, [users]);

  const filters = useSetState({
    name: '',
    role: [],
    cargo: [],
    sucursal: [],
    status: 'all',
  });

  const [userRoles, setUserRoles] = useState<string[]>([]); 

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.LISTA_USUARIOS_CREATE),
    [userRoles]
  );
 

useEffect(() => {
  const roles = getRolesFromToken();
  setUserRoles(roles);
}, []);


  const roleOptions = Array.from(new Set(tableData.map((u) => u.role).filter(Boolean))).map((option) => ({ value: option, label: option }));
  const cargoOptions = Array.from(new Set(tableData.map((u) => u.cargo).filter(Boolean))).map((option) => ({ value: option, label: option }));
  const sucursalOptions = Array.from(new Set(tableData.map((u) => u.sucursal).filter(Boolean))).map((option) => ({ value: option, label: option }));

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: (a: any, b: any) => {
      const order = table.order === 'asc' ? 1 : -1;
      if (table.orderBy === 'name') {
        return order * a.name.localeCompare(b.name);
      }
      if (table.orderBy === 'email') {
        return order * a.email.localeCompare(b.email);
      }
      if (table.orderBy === 'role') {
        return order * a.role.localeCompare(b.role);
      }
      if (table.orderBy === 'status') {
        return order * a.status.localeCompare(b.status);
      }
      if (table.orderBy === 'createdAt') {
        return order * (a.createdAt.getTime() - b.createdAt.getTime());
      }
      return 0;
    },
    filters: filters.state,
  });

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!(
    filters.state.name ||
    filters.state.role.length ||
    filters.state.cargo.length ||
    filters.state.sucursal.length ||
    filters.state.status !== 'all'
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('¡Usuario eliminado con éxito!');
      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    toast.success('¡Usuarios eliminados con éxito!');
    setTableData(deleteRows);
    confirm.onFalse();
  }, [table.selected, tableData, confirm]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.seguridad.moduloUsuarios.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  const handleToggleActive = async (id: string) => {
    try {
      await axios.patch(`http://localhost:4000/api/keycloak/user/${id}/toggle-status`);
      setTableData((prev) =>
        prev.map((user) =>
          user.id === id
            ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
            : user
        )
      );
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Listado de Usuarios"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios', href: paths.dashboard.seguridad.moduloUsuarios.listaUsuario },
          { name: 'Lista de usuarios' },
        ]}
        action={
          
           tienePermisoCrear && (
            <Button
            component={RouterLink}
            href={paths.dashboard.seguridad.moduloUsuarios.nuevoUsuario}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nuevo Usuario
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
            Cargando usuarios...
          </Box>
        ) : (
          <>
            <Tabs
              value={filters.state.status}
              onChange={handleFilterStatus}
              sx={{
                px: 2.5,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'active' && 'success') ||
                        (tab.value === 'inactive' && 'error') ||
                        'default'
                      }
                    >
                      {tab.value === 'all'
                        ? tableData.length
                        : tableData.filter((user) => user.status === tab.value).length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <UserTableToolbar
              filters={filters.state}
              onFilters={(name, value) => {
                table.onResetPage();
                filters.setState({ [name]: value });
              }}
              roleOptions={roleOptions}
              cargoOptions={cargoOptions}
              sucursalOptions={sucursalOptions}
            />

            {canReset && (
              <UserTableFiltersResult
                filters={filters.state}
                onResetFilters={() => {
                  filters.setState({
                    name: '',
                    role: [],
                    cargo: [],
                    sucursal: [],
                    status: 'all',
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
                        <UserTableRow
                          key={row.id}
                          row={row}
                          onEditRow={() => handleEditRow(row.id)}
                          onToggleActive={() => handleToggleActive(row.id)}
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
            ¿Estás seguro que deseas eliminar <strong> {table.selected.length} </strong> usuarios?
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
  inputData: any[];
  comparator: (a: any, b: any) => number;
  filters: {
    name: string;
    role: string[];
    cargo: string[];
    sucursal: string[];
    status: string;
  };
}) {
  const { name, role, cargo, sucursal, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  if (cargo.length) {
    inputData = inputData.filter((user) => cargo.includes(user.cargo));
  }

  if (sucursal.length) {
    inputData = inputData.filter((user) => sucursal.includes(user.sucursal));
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  return inputData;
}

function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
} 