import { useState } from 'react';

import { Stack, Button, Select, Tooltip, MenuItem, Checkbox, TextField, InputLabel, FormControl, OutlinedInput, InputAdornment } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    name: string;
    role: string[];
    cargo   : string[];
    sucursal: string[];
    status: string;
  };
  onFilters: (name: string, value: any) => void;
  roleOptions: {
    value: string;
    label: string;
  }[];
  cargoOptions: {
    value: string;
    label: string;
  }[];
  sucursalOptions: {
    value: string;
    label: string;
  }[];
};

export function UserTableToolbar({ filters, onFilters, roleOptions, cargoOptions, sucursalOptions }: Props) {
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

        {/* Select de Rol */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            multiple
            value={filters.role}
            onChange={(e) => onFilters('role', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Rol" />}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={filters.role.includes(option.value)} />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select de Cargo */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Cargo</InputLabel>
          <Select
            multiple
            value={filters.cargo}
            onChange={(e) => onFilters('position', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Cargo" />}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {cargoOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={filters.cargo.includes(option.value)} />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select de Sucursal */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Sucursal</InputLabel>
          <Select
            multiple
            value={filters.sucursal}
            onChange={(e) => onFilters('sucursal', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Sucursal" />}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {sucursalOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={filters.sucursal.includes(option.value)} />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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