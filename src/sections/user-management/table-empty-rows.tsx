import { TableRow, TableCell } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  height: number;
  emptyRows: number;
};

export function TableEmptyRows({ emptyRows, height }: Props) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        height: height * emptyRows,
      }}
    >
      <TableCell colSpan={9} />
    </TableRow>
  );
} 