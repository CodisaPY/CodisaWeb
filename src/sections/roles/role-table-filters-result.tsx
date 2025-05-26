import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: {
    name: string;
    composite: string;
  };
  onResetFilters: VoidFunction;
  results: number;
};

export function RoleTableFiltersResult({ filters, onResetFilters, results, sx, ...other }: Props) {
  const handleRemoveKeyword = () => {
    onResetFilters();
  };

  return (
    <Stack spacing={1.5} direction="row" flexWrap="wrap" alignItems="center" sx={{ ...sx }} {...other}>
      {!!filters.name && (
        <Block label="Nombre:">
          <Chip size="small" label={filters.name} onDelete={handleRemoveKeyword} />
        </Block>
      )}

      {filters.composite !== 'all' && (
        <Block label="Tipo:">
          <Chip
            size="small"
            label={filters.composite === 'true' ? 'Roles Compuestos' : 'Roles Simples'}
            onDelete={handleRemoveKeyword}
          />
        </Block>
      )}

      <Button
        color="error"
        onClick={onResetFilters}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Limpiar
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = {
  label: string;
  children: React.ReactNode;
};

function Block({ label, children }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
      }}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
} 