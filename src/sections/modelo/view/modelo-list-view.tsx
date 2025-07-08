
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ROLES } from '@guard/roles.constants';
import { getRolesFromToken } from '@guard/role-utils';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ModeloTableRow, type ModeloItem } from '../modelo-table-row';
import { ModeloTableToolbar } from '../modelo-table-toolbar';
import { ModeloTableFiltersResult } from '../modelo-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'nombre', label: 'Nombre' },
  { id: 'marca', label: 'Marca' },
  { id: 'status', label: 'Estado' },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function ModeloListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  
  const [tableData, setTableData] = useState<ModeloItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const filters = useSetState({
    nombre: '',
    marca: [],
    status: 'all',
  });

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.MODELO_INVENTARIO_TIC_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  // Cargar modelos del API
  const fetchModelos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/modelos`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      } else {
        toast.error('Error al cargar los modelos');
      }
    } catch (error) {
      console.error('Error fetching modelos:', error);
      toast.error('Error al cargar los modelos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModelos();
  }, [fetchModelos]);

  // Crear opciones de marcas para filtros
  const marcaOptions = Array.from(new Set(tableData.map((modelo) => modelo.marcaNombre).filter(Boolean)))
    .map((marca) => ({ value: marca, label: marca }));

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters: filters.state,
  });

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!(
    filters.state.nombre ||
    filters.state.marca.length ||
    filters.state.status !== 'all'
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== parseInt(id, 10));
      toast.success('¡Modelo eliminado con éxito!');
      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id.toString()));
    toast.success('¡Modelos eliminados con éxito!');
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataFiltered.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.tic.moduloInventario.editarModelo(id));
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

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Lista de Modelos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'TIC', href: paths.dashboard.tic.root },
            { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
            { name: 'Lista de Modelos' },
          ]}
          action={
            tienePermisoCrear && (
              <Button
                component={RouterLink}
                href={paths.dashboard.tic.moduloInventario.crearNuevoModelo}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Nuevo Modelo
              </Button>
            )
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={filters.state.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
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
                                         {tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <ModeloTableToolbar
            filters={filters.state}
            onFilters={(name, value) => {
              table.onResetPage();
              filters.setState({ [name]: value });
            }}
            onResetPage={table.onResetPage}
            marcaOptions={marcaOptions}
          />

          {canReset && (
            <ModeloTableFiltersResult
              filters={filters.state}
              onResetFilters={() => {
                filters.setState({
                  nombre: '',
                  marca: [],
                  status: 'all',
                });
              }}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataFiltered.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataFiltered.map((row) => row.id.toString())
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
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id.toString())
                  )
                }
              />

              <TableBody>
                {loading ? (
                  <TableEmptyRows height={denseHeight} emptyRows={5} />
                ) : (
                  dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ModeloTableRow
                        key={row.id}
                        row={row}
                        onDeleteRow={() => handleDeleteRow(row.id.toString())}
                        onEditRow={() => handleEditRow(row.id.toString())}
                        dense={table.dense}
                      />
                    ))
                )}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar Modelos"
        content={`¿Estás seguro de que quieres eliminar ${table.selected.length} modelo(s)?`}
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
  filters,
}: {
  inputData: ModeloItem[];
  filters: {
    nombre: string;
    marca: string[];
    status: string;
  };
}) {
  const { nombre, marca, status } = filters;

  let filteredData = inputData;

  if (nombre) {
    filteredData = filteredData.filter(
      (modelo) => modelo.nombre.toLowerCase().indexOf(nombre.toLowerCase()) !== -1
    );
  }

  if (marca.length) {
    filteredData = filteredData.filter((modelo) => marca.includes(modelo.marcaNombre));
  }

  if (status !== 'all') {
    // Como no tenemos campo status en ModeloItem, por ahora solo filtramos por 'all'
    // En el futuro se puede agregar el campo status al tipo ModeloItem
  }

  return filteredData;
} 