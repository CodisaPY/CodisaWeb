import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type TableFilters = {
  name: string;
  role: string[];
  cargo: string[];
  sucursal: string[];
  status: string;
};

export type TableOrder = 'asc' | 'desc';

export type TableOrderBy = string;

export type TableProps = {
  page: number;
  order: TableOrder;
  orderBy: TableOrderBy;
  rowsPerPage: number;
  selected: string[];
  filters: TableFilters;
  dense: boolean;
};

export function useTable(defaultOrderBy = 'name') {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [order, setOrder] = useState<TableOrder>('asc');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<TableFilters>({
    name: '',
    role: [],
    cargo: [],
    sucursal: [],
    status: '',
  });
  const [dense, setDense] = useState(false);

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback(
    (id: string) => {
      const selectedIndex = selected.indexOf(id);

      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
    },
    [selected]
  );

  const onSelectAllRows = useCallback(
    (checked: boolean, newSelecteds: string[]) => {
      if (checked) {
        setSelected(newSelecteds);
        return;
      }
      setSelected([]);
    },
    []
  );

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const onChangeDense = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onUpdatePageDeleteRow = useCallback((dataLength: number) => {
    const deleted = selected.length;

    const pageAfterDelete = Math.max(0, Math.ceil((dataLength - deleted) / rowsPerPage) - 1);

    setPage(pageAfterDelete);
    setSelected([]);
  }, [selected.length, rowsPerPage]);

  const onUpdatePageDeleteRows = useCallback(
    ({ totalRowsInPage, totalRowsFiltered }: { totalRowsInPage: number; totalRowsFiltered: number }) => {
      const totalSelected = selected.length;

      const pageAfterDelete = Math.max(0, Math.ceil((totalRowsFiltered - totalSelected) / rowsPerPage) - 1);

      setPage(pageAfterDelete);
      setSelected([]);
    },
    [selected.length, rowsPerPage]
  );

  const onUpdateFilters = useCallback((newFilters: TableFilters) => {
    setFilters(newFilters);
  }, []);

  return {
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
    filters,
    dense,
    onSort,
    onSelectRow,
    onSelectAllRows,
    onChangePage,
    onChangeRowsPerPage,
    onChangeDense,
    onResetPage,
    onUpdatePageDeleteRow,
    onUpdatePageDeleteRows,
    onUpdateFilters,
  };
} 