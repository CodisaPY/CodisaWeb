import { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { toast } from 'src/components/snackbar';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export type AtributoItem = {
  id: number;
  nombre: string;
  tipoEquipoId: number;
  tipoEquipoNombre: string;
  tipoDato: string;
  esObligatorio: string;
  placeholder?: string;
  descripcionAtributo?: string;
};

type Props = {
  row: AtributoItem;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  dense?: boolean;
};

export function AtributoTableRow({ row, onEditRow, onDeleteRow, dense }: Props) {
  const confirm = useBoolean();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/atributos/${row.id}`, {
        method: 'DELETE',
        headers: { accept: '*/*' },
      });
      
      if (response.ok) {
        onDeleteRow();
        toast.success('Atributo eliminado exitosamente');
      } else {
        console.error('Error en respuesta de eliminación:', response.status, response.statusText);
        toast.error('Error al eliminar el atributo');
      }
    } catch (error) {
      console.error('Error deleting atributo:', error);
      toast.error('Error al eliminar el atributo');
    } finally {
      setLoading(false);
    }
  }, [onDeleteRow, row.id]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <TableRow hover>
        <TableCell size={dense ? 'small' : 'medium'}>{row.id}</TableCell>

        <TableCell size={dense ? 'small' : 'medium'}>
          <ListItemText
            primary={row.nombre}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell size={dense ? 'small' : 'medium'}>
          <ListItemText
            primary={row.tipoEquipoNombre}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell size={dense ? 'small' : 'medium'}>
          <ListItemText
            primary={row.tipoDato === 'numero' ? 'Número' : 'Texto'}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell size={dense ? 'small' : 'medium'}>
          <ListItemText
            primary={row.esObligatorio === 'S' ? 'Sí' : 'No'}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell size={dense ? 'small' : 'medium'}>
          <ListItemText
            primary={row.placeholder || '-'}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell size={dense ? 'small' : 'medium'}>
          <ListItemText
            primary={row.descripcionAtributo || '-'}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell size={dense ? 'small' : 'medium'} align="right">
          <IconButton onClick={handleMenuOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            handleMenuClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Eliminar
        </MenuItem>
      </Popover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Está seguro que desea eliminar este atributo?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        }
      />
    </>
  );
} 