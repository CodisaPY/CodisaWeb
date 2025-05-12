import { useState, useCallback } from 'react';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

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
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { TableEmptyRows, TableNoData, TableHeadCustom, TableSelectedAction, UserTableRow, UserTableToolbar } from 'src/sections/user-management';

import { useTable } from './hooks/use-table';
import { useGetUsers, User } from './hooks/use-get-users';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre', width: 220 },
  { id: 'email', label: 'Email', width: 220 },
  { id: 'role', label: 'Rol', width: 120 },
  { id: 'department', label: 'Departamento', width: 120 },
  { id: 'position', label: 'Cargo', width: 120 },
  { id: 'sucursal', label: 'Sucursal', width: 120 },
  { id: 'cargo', label: 'Estado', width: 100 },
  { id: 'createdAt', label: 'Creado', width: 140 },
];

// ----------------------------------------------------------------------

export default function UserListTable() {
  const table = useTable();
  const confirm = useBoolean();
  const { users, loading } = useGetUsers();
  const router = useRouter();

  const [tableData, setTableData] = useState<User[]>(users);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: table.filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!(table.filters.name || table.filters.role || table.filters.status);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.seguridad.moduloUsuarios.edit(id));
    },
    [router]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: tableData.length,
      totalRowsFiltered: tableData.length,
    });
  }, [table, tableData]);

  const roleOptions = Array.from(new Set(tableData.map((u) => u.role).filter(Boolean))).map((option) => ({ value: option, label: option }));
  const cargoOptions = Array.from(new Set(tableData.map((u) => u.cargo).filter(Boolean))).map((option) => ({ value: option, label: option }));
  const sucursalOptions = Array.from(new Set(tableData.map((u) => u.sucursal).filter(Boolean))).map((option) => ({ value: option, label: option }));

  return (
    <>
      <Container maxWidth={false}>
        <Card>
          <UserTableToolbar
            filters={table.filters}
            onFilters={(name: string, value: any) => {
              table.onResetPage();
              table.onUpdateFilters({
                ...table.filters,
                [name]: value,
              });
            }}
            roleOptions={roleOptions}
            cargoOptions={cargoOptions}
            sucursalOptions={sucursalOptions}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
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

            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {dataInPage.map((row) => (
                  <Box key={row.id} sx={{ mb: 2 }}>
                    <UserTableRow
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onToggleActive={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
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
        open={confirm.value}
        onClose={confirm.onFalse}
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
              confirm.onFalse();
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
  inputData: User[];
  comparator: (a: any, b: any) => number;
  filters: {
    name: string;
    role: string[];
    sucursal: string[];
    cargo: string[];
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

  if (status) {
    inputData = inputData.filter((user) => user.status === status);
  }

  return inputData;
}

function getComparator(order: 'asc' | 'desc', orderBy: string) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a: any, b: any, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
} 