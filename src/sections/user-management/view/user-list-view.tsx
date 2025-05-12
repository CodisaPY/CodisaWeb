import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useTable } from 'src/hooks/use-table';
import { useSetState } from 'src/hooks/use-set-state';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';

import { TableEmptyRows, TableNoData, TableHeadCustom, UserTableRow, UserTableToolbar } from 'src/sections/user-management';
import { useGetUsers } from '../hooks/use-get-users';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre', width: 220 },
  { id: 'email', label: 'Email', width: 220 },
  { id: 'role', label: 'Rol', width: 120 },
  { id: 'department', label: 'Departamento', width: 120 },
  { id: 'position', label: 'Cargo', width: 120 },
  { id: 'branch', label: 'Sucursal', width: 120 },
  { id: 'status', label: 'Estado', width: 100 },
  { id: 'createdAt', label: 'Creado', width: 140 },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();
  const { users, loading } = useGetUsers();

  const [tableData, setTableData] = useState(users);

  const filters = useSetState({
    name: '',
    role: [],
    status: 'all',
  });

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

  const canReset = !!(filters.state.name || filters.state.role.length || filters.state.status !== 'all');

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Listado de Usuarios"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <UserTableToolbar
          filters={filters.state}
          onFilters={(name, value) => {
            table.onResetPage();
            filters.setState({ [name]: value });
          }}
          roleOptions={[
            { value: 'Administrador', label: 'Administrador' },
            { value: 'Usuario', label: 'Usuario' },
          ]}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={0}
                onSort={table.onSort}
                onSelectAllRows={() => {}}
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
                      id={row.id}
                      name={row.name}
                      email={row.email}
                      role={row.role}
                      status={row.status}
                      createdAt={row.createdAt}
                      avatarUrl={row.avatarUrl}
                      department={row.department}
                      position={row.position}
                      branch={row.branch}
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
      </Card>
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
    status: string;
  };
}) {
  const { name, role, status } = filters;

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

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  return inputData;
}

function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
} 