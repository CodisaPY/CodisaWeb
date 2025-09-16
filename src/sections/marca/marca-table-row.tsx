import { useRef, useMemo, useState, useEffect } from 'react';
import { ROLES } from '@guard/roles.constants';
import { getRolesFromToken } from '@guard/role-utils';

import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export type MarcaItem = {
  id: number;
  nombre: string;
};

type Props = {
  row: MarcaItem;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  dense?: boolean;
};

export function MarcaTableRow({ row, onEditRow, onDeleteRow, dense }: Props) {
  const popover = usePopover();
  const confirmDelete = useBoolean();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const tienePermisoUpdate = useMemo(
    () => userRoles.includes(ROLES.LISTA_MARCAS_INVENTARIO_TIC_UPDATE),
    [userRoles]
  );

  const tienePermisoDelete = useMemo(
    () => userRoles.includes(ROLES.LISTA_MARCAS_INVENTARIO_TIC_DISABLE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  const handleDelete = () => {
    onDeleteRow();
    confirmDelete.onFalse();
  };

  return (
    <>
      <TableRow hover selected={false}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" noWrap>
            {row.id}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" noWrap>
            {row.nombre}
          </Typography>
        </TableCell>

        <TableCell>
          <Label variant="soft" color="success">
            Activo
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          <IconButton
            ref={buttonRef}
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={buttonRef.current}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          {tienePermisoUpdate && (
            <MenuItem 
              onClick={() => {
                onEditRow();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Editar
            </MenuItem>
          )}

          {tienePermisoDelete && (
            <MenuItem 
              onClick={() => {
                confirmDelete.onTrue();
                popover.onClose();
              }} 
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              Eliminar
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Eliminar marca"
        content={`¿Estás seguro que deseas eliminar la marca "${row.nombre}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        }
      />
    </>
  );
} 