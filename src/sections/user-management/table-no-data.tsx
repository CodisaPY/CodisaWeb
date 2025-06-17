import { Box, TableRow, TableCell } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
};

export function TableNoData({ notFound }: Props) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={9}>
          <Box
            sx={{
              py: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:alert-circle-outline" sx={{ mr: 2, width: 24, height: 24 }} />
            No se encontraron resultados
          </Box>
        </TableCell>
      ) : (
        <TableCell colSpan={9} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
} 