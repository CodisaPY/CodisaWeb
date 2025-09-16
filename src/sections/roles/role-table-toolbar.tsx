import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    name: string;
    composite: string;
  };
  onFilters: (name: string, value: any) => void;
};

export function RoleTableToolbar({ filters, onFilters }: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters('name', event.target.value);
  };

  const handleFilterComposite = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilters('composite', event.target.checked ? 'true' : 'false');
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />

          <input
            placeholder="Buscar rol..."
            value={filters.name}
            onChange={handleFilterName}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
            }}
          />
        </Stack>

        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="ic:round-filter-list" />}
          onClick={handleOpen}
        >
          Filtros
        </Button>
      </Stack>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, py: 2 }}
        >
          <Typography variant="h6">Filtros</Typography>

          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tipo de Rol
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.composite === 'true'}
                    onChange={handleFilterComposite}
                  />
                }
                label="Roles Compuestos"
              />
            </FormGroup>
          </div>
        </Stack>
      </Drawer>
    </>
  );
} 