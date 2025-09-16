import type { AtributoItem, IAtributoTableFilters } from 'src/types/atributo';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
import { GET_ALL_ATRIBUTOS_EQUIPOS_QUERY, TIPOS_EQUIPO_QUERY } from 'src/graphql/queries/equipo';
import { DELETE_ATRIBUTO_MUTATION } from 'src/graphql/mutations/equipo';
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
  { id: 'opcionesLista', label: 'Opciones de Lista', width: 150 },
  { id: 'descripcionAtributo', label: 'Descripción', width: 200 },
  { id: '', width: 88 },
];

export function AtributoListView() {
  const table = useTable({
    defaultRowsPerPage: 5,
  });

  const router = useRouter();
  const confirm = useState(false);

  // Queries GraphQL
  const { data: atributosData, loading: atributosLoading, error: atributosError, refetch: refetchAtributos } = useQuery(GET_ALL_ATRIBUTOS_EQUIPOS_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const { data: tiposEquipoData, loading: tiposEquipoLoading, error: tiposEquipoError } = useQuery(TIPOS_EQUIPO_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Mutación para eliminar atributo
  const [deleteAtributo, { loading: deleteLoading }] = useMutation(DELETE_ATRIBUTO_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Atributo eliminado exitosamente:', data);
      toast.success('¡Atributo eliminado con éxito!');
      refetchAtributos();
    },
    onError: (error) => {
      console.error('Error al eliminar atributo:', error);
      toast.error('Error al eliminar el atributo');
    },
  });



  // Procesar datos de atributos
  const tableData = useMemo(() => {
    if (!atributosData?.getAllAtributosEquipos) return [];
    
    const tiposEquipo = tiposEquipoData?.tiposEquipo || [];
    
    return atributosData.getAllAtributosEquipos.map((atributo: any) => {
      // Procesar opciones de lista para atributos de tipo 'lista'
      let opcionesListaArray = atributo.opcionesListaArray;
      
      if (atributo.tipoDato === 'lista') {
        // Debug: mostrar información del atributo
        console.log(`Procesando atributo lista: ${atributo.nombre}`, {
          opcionesListaArray: atributo.opcionesListaArray,
          opcionesLista: atributo.opcionesLista,
          placeholder: atributo.placeholder
        });
        
        // Si opcionesListaArray está vacío pero opcionesLista tiene contenido, procesar el string
        if ((!opcionesListaArray || opcionesListaArray.length === 0) && atributo.opcionesLista) {
          opcionesListaArray = atributo.opcionesLista
            .split('\n')
            .map((opcion: string) => opcion.trim())
            .filter((opcion: string) => opcion !== '');
          console.log(`Opciones procesadas desde string para ${atributo.nombre}:`, opcionesListaArray);
        }
        
        // Si opcionesListaArray tiene contenido pero está mal formateado (array con un solo string)
        if (opcionesListaArray && opcionesListaArray.length === 1 && typeof opcionesListaArray[0] === 'string' && opcionesListaArray[0].includes('\n')) {
          // El backend devolvió algo como ["HOLA\nMUNDO\nDSAS"] en lugar de ["HOLA", "MUNDO", "DSAS"]
          opcionesListaArray = opcionesListaArray[0]
            .split('\n')
            .map((opcion: string) => opcion.trim())
            .filter((opcion: string) => opcion !== '');
          console.log(`Opciones reprocesadas desde array mal formateado para ${atributo.nombre}:`, opcionesListaArray);
        }
        
        // Si aún no hay opciones, intentar con el placeholder como opción por defecto
        if (!opcionesListaArray || opcionesListaArray.length === 0) {
          opcionesListaArray = atributo.placeholder ? [atributo.placeholder] : [];
          console.log(`Usando placeholder como opción para ${atributo.nombre}:`, opcionesListaArray);
        }
        
        console.log(`Opciones finales para ${atributo.nombre}:`, opcionesListaArray);
      }
      
      return {
        ...atributo,
        tipoEquipoNombre: tiposEquipo.find((t: any) => t.id === atributo.tipoEquipoId)?.nombre || atributo.tipoEquipoId,
        opcionesListaArray: opcionesListaArray || [],
      };
    });
  }, [atributosData?.getAllAtributosEquipos, tiposEquipoData?.tiposEquipo]);

  // Procesar tipos de equipo
  const tiposEquipo = useMemo(() => tiposEquipoData?.tiposEquipo || [], [tiposEquipoData?.tiposEquipo]);

  const filters = useSetState<IAtributoTableFilters>({
    keyword: '',
    tipoEquipo: [],
    tipoDato: [],
    obligatorio: [],
  });

  // Manejar errores de las queries GraphQL
  useEffect(() => {
    if (atributosError) {
      console.error('Error fetching atributos:', atributosError);
      toast.error('Error al cargar los atributos');
    }
  }, [atributosError]);

  useEffect(() => {
    if (tiposEquipoError) {
      console.error('Error fetching tipos de equipo:', tiposEquipoError);
      toast.error('Error al cargar los tipos de equipo');
    }
  }, [tiposEquipoError]);

  // Función para limpiar filtros
  const handleResetFilters = useCallback(() => {
    filters.onResetState();
    // Resetear a la primera página cuando se limpien los filtros
    table.onChangePage(null, 0);
  }, [filters, table]);

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
        (item: AtributoItem) =>
          item.nombre.toLowerCase().includes(filterValues.keyword.toLowerCase()) ||
          (item.descripcionAtributo?.toLowerCase() || '').includes(filterValues.keyword.toLowerCase())
      );
    }
    if (filterValues.tipoEquipo.length) {
      data = data.filter((item: AtributoItem) => filterValues.tipoEquipo.includes(item.tipoEquipoId));
    }
    if (filterValues.tipoDato.length) {
      data = data.filter((item: AtributoItem) => filterValues.tipoDato.includes(item.tipoDato));
    }
    if (filterValues.obligatorio.length) {
      data = data.filter((item: AtributoItem) => filterValues.obligatorio.includes(item.esObligatorio));
    }
    return data;
  }

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  // Ajustar la página cuando cambie rowsPerPage para evitar páginas inválidas
  useEffect(() => {
    const maxPage = Math.ceil(dataFiltered.length / table.rowsPerPage) - 1;
    if (table.page > maxPage && maxPage >= 0) {
      const newPage = Math.max(0, maxPage);
      table.onChangePage(null, newPage);
    }
  }, [table.rowsPerPage, dataFiltered.length, table]);

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const canReset =
    !!filters.state.keyword || filters.state.tipoEquipo.length > 0 || filters.state.tipoDato.length > 0 || filters.state.obligatorio.length > 0;
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Acciones de fila
  const handleDeleteRow = useCallback(
    async (id: number) => {
      try {
        await deleteAtributo({ variables: { deleteAtributoId: id } });
        // La mutación se encarga de mostrar el toast y hacer refetch
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        // El error ya se maneja en onError de la mutación
        console.error('Error en handleDeleteRow:', error);
      }
    },
    [deleteAtributo, dataInPage.length, table]
  );

  const handleEditRow = useCallback(
    (id: number) => {
      const atributo = tableData.find((item: AtributoItem) => item.id.toString() === id.toString());
      if (atributo) {
        // Para atributos de tipo lista, usar el array procesado si está disponible, sino el string original
        let opcionesListaValue = '';
        if (atributo.tipoDato === 'lista') {
          if (atributo.opcionesListaArray && atributo.opcionesListaArray.length > 0) {
            opcionesListaValue = atributo.opcionesListaArray.join('\n');
          } else if (atributo.opcionesLista) {
            opcionesListaValue = atributo.opcionesLista;
          } else if (atributo.placeholder) {
            opcionesListaValue = atributo.placeholder;
          }
        }
        
        const editUrl = `${paths.dashboard.tic.moduloInventario.editarAtributo(id.toString())}?nombre=${encodeURIComponent(atributo.nombre)}&tipoEquipoId=${atributo.tipoEquipoId}&tipoEquipoNombre=${encodeURIComponent(atributo.tipoEquipoNombre)}&tipoDato=${atributo.tipoDato}&esObligatorio=${atributo.esObligatorio}&placeholder=${encodeURIComponent(atributo.placeholder || '')}&descripcionAtributo=${encodeURIComponent(atributo.descripcionAtributo || '')}&opcionesLista=${encodeURIComponent(opcionesListaValue)}&tieneDependencia=${atributo.tieneDependencia || false}&atributoDependienteId=${atributo.atributoDependienteId || ''}&valorDependiente=${encodeURIComponent(atributo.valorDependiente || '')}`;
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
          {atributosLoading && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Iconify icon="eos-icons:loading" sx={{ fontSize: 24, color: 'text.secondary' }} />
              <Box sx={{ mt: 1, typography: 'body2', color: 'text.secondary' }}>
                Cargando atributos...
              </Box>
            </Box>
          )}
          {!atributosLoading && (
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
          page={Math.min(table.page, Math.max(0, Math.ceil(dataFiltered.length / table.rowsPerPage) - 1))}
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
            disabled={deleteLoading}
            onClick={() => {
              confirm[1](false);
            }}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        }
      />
    </Container>
  );
} 