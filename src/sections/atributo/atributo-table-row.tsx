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
  opcionesLista?: string;
  opcionesListaArray?: string[];
  atributoDependienteId?: number;
  valorDependiente?: string;
  tipoDependencia?: string;
  tieneDependencia?: boolean;
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
      // Llamar directamente a la función del componente padre que maneja la mutación GraphQL
      await onDeleteRow();
    } catch (error) {
      console.error('Error deleting atributo:', error);
      toast.error('Error al eliminar el atributo');
    } finally {
      setLoading(false);
    }
  }, [onDeleteRow]);

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
            primary={
              row.tipoDato === 'numero' ? 'Número' : 
              row.tipoDato === 'lista' ? 'Lista' : 'Texto'
            }
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
            primary={
              (() => {
                if (row.tipoDato === 'lista') {
                  // Usar array si está disponible y no está vacío
                  if (row.opcionesListaArray && Array.isArray(row.opcionesListaArray) && row.opcionesListaArray.length > 0) {
                    return row.opcionesListaArray.join(', ');
                  }
                  
                  // Fallback: usar string
                  if (row.opcionesLista && typeof row.opcionesLista === 'string') {
                    const opciones = row.opcionesLista
                      .split('\n')
                      .map(opcion => opcion.trim())
                      .filter(opcion => opcion !== '');
                    return opciones.length > 0 ? opciones.join(', ') : 'Sin opciones definidas';
                  }
                  
                  return 'Sin opciones definidas';
                }
                return '-';
              })()
            }
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