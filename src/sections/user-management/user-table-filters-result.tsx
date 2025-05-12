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
    role: string[];
    status: string;
  };
  onResetFilters: VoidFunction;
  results: number;
};

export function UserTableFiltersResult({ filters, onResetFilters, results, ...other }: Props) {
  const handleRemoveKeyword = () => {
    onResetFilters();
  };

  const handleRemoveRole = (inputValue: string) => {
    const newValue = filters.role.filter((item) => item !== inputValue);
    onResetFilters();
  };

  const handleRemoveStatus = () => {
    onResetFilters();
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultados encontrados
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.name.length && (
          <Block label="Nombre:">
            <Chip size="small" label={filters.name} onDelete={handleRemoveKeyword} />
          </Block>
        )}

        {!!filters.role.length && (
          <Block label="Rol:">
            {filters.role.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveRole(item)}
              />
            ))}
          </Block>
        )}

        {filters.status !== 'all' && (
          <Block label="Estado:">
            <Chip size="small" label={filters.status} onDelete={handleRemoveStatus} />
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