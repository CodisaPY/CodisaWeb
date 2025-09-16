import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

type Props = {
  defaultDense?: boolean;
  defaultOrder?: 'asc' | 'desc';
  defaultOrderBy?: string;
  defaultSelected?: string[];
  defaultRowsPerPage?: number;
  defaultCurrentPage?: number;
};

export function useTable(props?: Props) {
  const [dense, setDense] = useState(!!props?.defaultDense);

  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy || 'name');

  const [order, setOrder] = useState<'asc' | 'desc'>(props?.defaultOrder || 'asc');

  const [page, setPage] = useState(props?.defaultCurrentPage || 0);

  const [rowsPerPage, setRowsPerPage] = useState(props?.defaultRowsPerPage || 5);

  const [selected, setSelected] = useState<string[]>(props?.defaultSelected || []);

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

  const onSelectAllRows = useCallback((checked: boolean, inputValue?: string[]) => {
    if (checked) {
      setSelected(inputValue || []);
      return;
    }
    setSelected([]);
  }, []);

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
    const deletedRow = Math.ceil((dataLength - 1) / rowsPerPage) - 1;
    const newPage = deletedRow < 0 ? 0 : deletedRow;

    setPage(newPage);
  }, [rowsPerPage]);

  const onUpdatePageDeleteRows = useCallback(({ totalRows, totalSelected }: { totalRows: number; totalSelected: number }) => {
    const deletedRows = Math.ceil(totalSelected / rowsPerPage) - 1;
    const newPage = deletedRows < 0 ? 0 : deletedRows;

    setPage(newPage);
  }, [rowsPerPage]);

  const onUpdatePageEditRow = useCallback((dataLength: number) => {
    const editedRow = Math.ceil(dataLength / rowsPerPage) - 1;
    const newPage = editedRow < 0 ? 0 : editedRow;

    setPage(newPage);
  }, [rowsPerPage]);

  return {
    dense,
    order,
    page,
    orderBy,
    rowsPerPage,
    selected,
    onSelectRow,
    onSelectAllRows,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
    onResetPage,
    onUpdatePageDeleteRow,
    onUpdatePageDeleteRows,
    onUpdatePageEditRow,
    setPage,
    setDense,
    setOrder,
    setOrderBy,
    setSelected,
    setRowsPerPage,
  };
} 