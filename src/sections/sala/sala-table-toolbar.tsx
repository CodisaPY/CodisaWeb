import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterStatus: (event: any) => void;
  onResetFilter: VoidFunction;
};

export function SalaTableToolbar({ onFilterName, onFilterStatus, onResetFilter }: Props) {
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleFilterNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    onFilterName(event);
  };

  const handleFilterStatusChange = (event: any) => {
    setFilterStatus(event.target.value);
    onFilterStatus(event);
  };

  const handleReset = () => {
    setFilterName('');
    setFilterStatus('');
    onResetFilter();
  };

  return (
    <Box
      sx={{
        py: 2.5,
        px: 3,
        display: 'flex',
        gap: 2.5,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1}>
        <TextField
          size="small"
          value={filterName}
          onChange={handleFilterNameChange}
          placeholder="Buscar por nombre..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: 1, sm: 260 } }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterStatus}
            label="Estado"
            onChange={handleFilterStatusChange}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="A">Activa</MenuItem>
            <MenuItem value="I">Inactiva</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Button
        size="small"
        color="error"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={handleReset}
        sx={{ px: 1 }}
      >
        Limpiar
      </Button>
    </Box>
  );
}
