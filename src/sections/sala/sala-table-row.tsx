import { useState } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { SalaReunion } from 'src/types/sala';

// ----------------------------------------------------------------------

type Props = {
  row: SalaReunion;
  index: number;
  onDeleteRow: VoidFunction;
  onEditRow: VoidFunction;
  onViewRow: VoidFunction;
};

export function SalaTableRow({ row, index, onDeleteRow, onEditRow, onViewRow }: Props) {
  const [selected, setSelected] = useState(false);
  const confirm = useBoolean();

  const handleSelect = () => {
    setSelected(!selected);
  };

  const handleDelete = () => {
    confirm.onTrue();
  };

  const handleConfirmDelete = () => {
    onDeleteRow();
    confirm.onFalse();
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'A':
        return 'success';
      case 'I':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'A':
        return 'Activa';
      case 'I':
        return 'Inactiva';
      default:
        return estado;
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onChange={handleSelect} />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: row.color,
                border: '1px solid #ccc',
              }}
            />
            <ListItemText
              primary={row.nombre}
              secondary={`ID: ${row.idSala}`}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{ component: 'span', variant: 'caption' }}
            />
          </Box>
        </TableCell>

        <TableCell>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block',
              backgroundColor: (theme) => 
                getEstadoColor(row.estado) === 'success' 
                  ? theme.palette.success.lighter 
                  : getEstadoColor(row.estado) === 'error'
                  ? theme.palette.error.lighter
                  : theme.palette.grey[200],
              color: (theme) => 
                getEstadoColor(row.estado) === 'success' 
                  ? theme.palette.success.darker 
                  : getEstadoColor(row.estado) === 'error'
                  ? theme.palette.error.darker
                  : theme.palette.text.secondary,
            }}
          >
            {getEstadoText(row.estado)}
          </Box>
        </TableCell>

        <TableCell>
          {new Date(row.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </TableCell>

        <TableCell align="right">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Ver detalles">
              <IconButton onClick={onViewRow} color="info">
                <Iconify icon="solar:eye-bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton onClick={onEditRow} color="primary">
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Eliminar">
              <IconButton onClick={handleDelete} color="error">
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar Sala"
        content={`¿Estás seguro de que quieres eliminar la sala "${row.nombre}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        }
      />
    </>
  );
}
