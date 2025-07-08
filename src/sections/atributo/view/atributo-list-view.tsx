import type { AtributoItem, IAtributoTableFilters } from 'src/types/atributo';

import { useState, useEffect, useCallback } from 'react';
import { useSetState } from 'src/hooks/use-set-state';
import { useTable, emptyRows, rowInPage, getComparator, TableNoData, TableEmptyRows, TableHeadCustom, TableSelectedAction, TablePaginationCustom } from 'src/components/table';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Card, Box, Button, Table, TableBody, Container, Tooltip, IconButton } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { CONFIG } from 'src/config-global';
import { AtributoTableRow } from '../atributo-table-row';
import { AtributoTableToolbar } from '../atributo-table-toolbar';
import { AtributoTableFiltersResult } from '../atributo-table-filters-result';
 
const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 80 },
  { id: 'nombre', label: 'Nombre', width: 150 },
  { id: 'tipoEquipo', label: 'Tipo de Equipo', width: 140 },
  { id: 'tipoDato', label: 'Tipo de Dato', width: 100 },
  { id: 'esObligatorio', label: 'Obligatorio', width: 80 },
  { id: 'placeholder', label: 'Ejemplo', width: 150 },
  { id: 'descripcionAtributo', label: 'Descripción', width: 200 },
  { id: '', width: 88 },
];

export function AtributoListView() {
  // Función para obtener filtros guardados del localStorage
  const getStoredFilters = (): IAtributoTableFilters => {
    try {
      const stored = localStorage.getItem('atributo-filters');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error al cargar filtros guardados:', error);
    }
    return {
      keyword: '',
      tipoEquipo: [],
      tipoDato: [],
      obligatorio: [],
    };
  };

  // Función para guardar filtros en localStorage
  const saveFilters = (filters: IAtributoTableFilters) => {
    try {
      localStorage.setItem('atributo-filters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error al guardar filtros:', error);
    }
  };

  // Función para obtener paginado guardado del localStorage
  const getStoredPagination = () => {
    try {
      const stored = localStorage.getItem('atributo-pagination');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error al cargar paginado guardado:', error);
    }
    return {
      page: 0,
      rowsPerPage: 5,
    };
  };

  // Función para guardar paginado en localStorage
  const savePagination = (page: number, rowsPerPage: number) => {
    try {
      localStorage.setItem('atributo-pagination', JSON.stringify({ page, rowsPerPage }));
    } catch (error) {
      console.error('Error al guardar paginado:', error);
    }
  };

  const storedPagination = getStoredPagination();
  const table = useTable({
    defaultRowsPerPage: storedPagination.rowsPerPage,
  });

  // Establecer la página inicial si hay una guardada
  useEffect(() => {
    if (storedPagination.page > 0) {
      table.onChangePage(null, storedPagination.page);
    }
  }, [storedPagination.page, table]);



  const router = useRouter();
  const confirm = useState(false);
  const [tableData, setTableData] = useState<AtributoItem[]>([]);
  const [tiposEquipo, setTiposEquipo] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useSetState<IAtributoTableFilters>(getStoredFilters());

  // Guardar filtros cuando cambien
  useEffect(() => {
    saveFilters(filters.state);
  }, [filters.state]);

  // Guardar paginado cuando cambie
  useEffect(() => {
    savePagination(table.page, table.rowsPerPage);
  }, [table.page, table.rowsPerPage]);



  // Función para limpiar filtros y paginado guardados
  const handleResetFilters = useCallback(() => {
    filters.onResetState();
    localStorage.removeItem('atributo-filters');
    localStorage.removeItem('atributo-pagination');
  }, [filters]);

  // Cargar tipos de equipo para los filtros
  useEffect(() => {
    fetch(`${CONFIG.springServerUrl}/backend-linker/api/tipos-equipo`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Tipos de equipo cargados:', data);
        setTiposEquipo(data);
      })
      .catch((error) => {
        console.error('Error cargando tipos de equipo:', error);
        setTiposEquipo([]);
      });
  }, []);

  // Cargar atributos
  const fetchAtributos = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Cargando atributos...');
      const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/atributos`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Atributos cargados:', data);
        // Mapear tipoEquipoNombre
        const dataWithTipoEquipo = data.map((a: any) => ({
          ...a,
          tipoEquipoNombre: tiposEquipo.find((t) => t.id === a.tipoEquipoId)?.nombre || a.tipoEquipoId,
        }));
        console.log('Atributos con tipo de equipo:', dataWithTipoEquipo);
        setTableData(dataWithTipoEquipo);
      } else {
        console.error('Error en respuesta de atributos:', response.status, response.statusText);
        toast.error('Error al cargar los atributos');
      }
    } catch (error) {
      console.error('Error cargando atributos:', error);
      toast.error('Error al cargar los atributos');
    } finally {
      setLoading(false);
    }
  }, [tiposEquipo]);

  useEffect(() => {
    // Cargar atributos independientemente de si los tipos de equipo están disponibles
    fetchAtributos();
  }, [fetchAtributos]);

  // Filtros y ordenamiento
  function applyFilter({ 
    inputData, 
    comparator, 
    filters: filterValues 
  }: { 
    inputData: AtributoItem[]; 
    comparator: (a: any, b: any) => number; 
    filters: IAtributoTableFilters; 
  }) {
    let data = [...inputData];
    data.sort(comparator);
    if (filterValues.keyword) {
      data = data.filter(
        (item) =>
          item.nombre.toLowerCase().includes(filterValues.keyword.toLowerCase()) ||
          (item.descripcionAtributo?.toLowerCase() || '').includes(filterValues.keyword.toLowerCase())
      );
    }
    if (filterValues.tipoEquipo.length) {
      data = data.filter((item) => filterValues.tipoEquipo.includes(item.tipoEquipoId));
    }
    if (filterValues.tipoDato.length) {
      data = data.filter((item) => filterValues.tipoDato.includes(item.tipoDato));
    }
    if (filterValues.obligatorio.length) {
      data = data.filter((item) => filterValues.obligatorio.includes(item.esObligatorio));
    }
    return data;
  }

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const canReset =
    !!filters.state.keyword || filters.state.tipoEquipo.length > 0 || filters.state.tipoDato.length > 0 || filters.state.obligatorio.length > 0;
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Acciones de fila
  const handleDeleteRow = useCallback(
    (id: number) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('¡Atributo eliminado con éxito!');
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );



  const handleEditRow = useCallback(
    (id: number) => {
      const atributo = tableData.find((item) => item.id.toString() === id.toString());
      if (atributo) {
        const editUrl = `${paths.dashboard.tic.moduloInventario.editarAtributo(id.toString())}?nombre=${encodeURIComponent(atributo.nombre)}&tipoEquipoId=${atributo.tipoEquipoId}&tipoEquipoNombre=${encodeURIComponent(atributo.tipoEquipoNombre)}&tipoDato=${atributo.tipoDato}&esObligatorio=${atributo.esObligatorio}&placeholder=${encodeURIComponent(atributo.placeholder || '')}&descripcionAtributo=${encodeURIComponent(atributo.descripcionAtributo || '')}`;
        router.push(editUrl);
      }
    },
    [router, tableData]
  );

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Lista de Atributos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'TIC', href: paths.dashboard.tic.root },
          { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
          { name: 'Lista de atributos' },
        ]}
        action={
          <Button
            href={paths.dashboard.tic.moduloInventario.crearNuevoAtributo}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nuevo Atributo
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card>
        <AtributoTableToolbar
          filters={filters}
          onResetPage={table.onResetPage}
          onResetFilters={handleResetFilters}
          options={{ tiposEquipo }}
        />
        {canReset && (
          <AtributoTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            tipoEquipoOptions={tiposEquipo}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}
        <Box sx={{ position: 'relative' }}>
          {loading && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Iconify icon="eos-icons:loading" sx={{ fontSize: 24, color: 'text.secondary' }} />
              <Box sx={{ mt: 1, typography: 'body2', color: 'text.secondary' }}>
                Cargando atributos...
              </Box>
            </Box>
          )}
          {!loading && (
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <AtributoTableRow
                        key={row.id}
                        row={row}
                        dense={table.dense}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}
                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />
                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          )}
        </Box>
        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
      <ConfirmDialog
        open={confirm[0]}
        onClose={() => confirm[1](false)}
        title="Eliminar"
        content={
          <>
            ¿Está seguro que desea eliminar este atributo?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm[1](false);
            }}
          >
            Eliminar
          </Button>
        }
      />
    </Container>
  );
} 