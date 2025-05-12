import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { useBoolean } from 'src/hooks/use-boolean';
import { useTable } from 'src/components/table/use-table';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableEmptyRows, TableNoData, TableHeadCustom, TableSelectedAction, UserTableRow, UserTableToolbar } from 'src/sections/user-management';
import { useGetUsers } from './hooks/use-get-users';

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

export function UserListTable() {
  const table = useTable();
  const { value: confirm, onTrue: onConfirm, onFalse: onCloseConfirm } = useBoolean();
  const { users, loading } = useGetUsers();

  const [tableData, setTableData] = useState(users);

  const [filters, setFilters] = useState({
    name: '',
    role: [],
    status: 'all',
  });

  const handleFilters = useCallback(
    (name: string, value: any) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(tableData.length);
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: tableData.length,
      totalRowsFiltered: tableData.length,
    });
  }, [table, tableData]);

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
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!(filters.name || filters.role.length || filters.status !== 'all');

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  return (
    <>
      <Container maxWidth={false}>
        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            roleOptions={[
              { value: 'Administrador', label: 'Administrador' },
              { value: 'Usuario', label: 'Usuario' },
            ]}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked: boolean) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Eliminar">
                  <IconButton color="primary" onClick={onConfirm}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked: boolean) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {dataInPage.map((row: any) => (
                  <Box key={row.id} sx={{ mb: 2 }}>
                    <UserTableRow
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
                  </Box>
                ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm}
        onClose={onCloseConfirm}
        title="Eliminar"
        content={
          <>
            ¿Estás seguro que deseas eliminar <strong> {table.selected.length} </strong> elementos?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              onCloseConfirm();
            }}
          >
            Eliminar
          </Button>
        }
      />
    </>
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