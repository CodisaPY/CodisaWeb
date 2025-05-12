import { useState } from 'react';
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, Button, TextField, InputAdornment, Tooltip } from '@mui/material';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    name: string;
    role: string[];
    status: string;
  };
  onFilters: (name: string, value: any) => void;
  roleOptions: {
    value: string;
    label: string;
  }[];
};

export function UserTableToolbar({ filters, onFilters, roleOptions }: Props) {
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters('name', event.target.value);
  };

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Buscar usuario..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <Tooltip title="Filtros">
          <Button
            color={openFilter ? 'primary' : 'inherit'}
            onClick={handleOpenFilter}
            startIcon={<Iconify icon="ic:round-filter-list" />}
          >
            Filtros
          </Button>
        </Tooltip>
      </Stack>
    </Stack>
  );
} 