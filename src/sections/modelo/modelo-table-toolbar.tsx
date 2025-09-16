import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    nombre: string;
    marca: string[];
    status: string;
  };
  onFilters: (name: string, value: any) => void;
  onResetPage: () => void;
  marcaOptions: {
    value: string;
    label: string;
  }[];
};

export function ModeloTableToolbar({ filters, onFilters, onResetPage, marcaOptions }: Props) {

  const handleFilterNombre = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      onFilters('nombre', event.target.value);
    },
    [onFilters, onResetPage]
  );

  const handleFilterMarca = useCallback(
    (newValue: string[]) => {
      onResetPage();
      onFilters('marca', newValue);
    },
    [onFilters, onResetPage]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{ p: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.nombre}
            onChange={handleFilterNombre}
            placeholder="Buscar modelo..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Marca</InputLabel>
            <Select
              multiple
              value={filters.marca}
              onChange={(event) => handleFilterMarca(event.target.value as string[])}
              input={<OutlinedInput label="Filtrar por Marca" />}
              renderValue={(selected) => 
                selected.length === 0 
                  ? 'Todas las marcas' 
                  : selected.length === 1 
                    ? selected[0] 
                    : `${selected.length} marcas seleccionadas`
              }
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 300 }
                }
              }}
            >
              {marcaOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox 
                    checked={filters.marca.includes(option.value)}
                    sx={{ mr: 1 }}
                  />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>


    </>
  );
} 