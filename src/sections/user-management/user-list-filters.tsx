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
    role: string[];
    status: string;
  };
  onFilters: (name: string, value: any) => void;
  onResetFilters: VoidFunction;
  roleOptions: {
    value: string;
    label: string;
  }[];
};

export function UserListFilters({ filters, onFilters, onResetFilters, roleOptions }: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterRoles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const checked = event.target.checked;

    const roles = checked
      ? [...filters.role, value]
      : filters.role.filter((role) => role !== value);

    onFilters('role', roles);
  };

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Iconify
            icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
          />
        }
        onClick={handleOpen}
        sx={{ typography: 'subtitle2' }}
      >
        Filtros
      </Button>

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
              Rol
            </Typography>

            <FormGroup>
              {roleOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={filters.role.includes(option.value)}
                      onChange={handleFilterRoles}
                      value={option.value}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </div>

          <Button
            fullWidth
            color="inherit"
            variant="outlined"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Limpiar
          </Button>
        </Stack>
      </Drawer>
    </>
  );
} 