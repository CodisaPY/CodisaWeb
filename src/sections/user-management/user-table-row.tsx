import { useEffect, useMemo, useState } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { ROLES } from '@guard/roles.constants';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { MenuPopover } from 'src/components/menu-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { User } from 'src/sections/user-management/hooks/use-get-users';

// ----------------------------------------------------------------------

type Props = {
  row: User;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditRow: VoidFunction;
  onToggleActive: VoidFunction;
};

export function UserTableRow({ row, selected, onSelectRow, onEditRow, onToggleActive }: Props) {
  const { name, email, role, status, createdAt, avatarUrl, department, cargo, sucursal,lastName,firstName } = row;

  const router = useRouter();
  const navigate = useNavigate();

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const confirm = useBoolean();


  const [userRoles, setUserRoles] = useState<string[]>([]); 


const tienePermisoHabilitar = useMemo(
  () => userRoles.includes(ROLES.GENERACION_NUEVO_USUARIO_ENABLE),
  [userRoles]
);
 
useEffect(() => {
  const roles = getRolesFromToken();
  setUserRoles(roles);
}, []);





  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack spacing={0.5}>
              <Link
                component="button"
                variant="subtitle2"
                onClick={onEditRow}
                sx={{ cursor: 'pointer' }}
              >
                {name}
              </Link>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {email}
          </Typography>
        </TableCell>

        <TableCell>{role}</TableCell>

        <TableCell>{department}</TableCell>

        <TableCell>{cargo}</TableCell>

        <TableCell>{sucursal}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'active' && 'success') ||
              (status === 'inactive' && 'error') ||
              'default'
            }
          >
            {status === 'active' ? 'Activo' : 'Inactivo'}
          </Label>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {new Date(createdAt).toLocaleDateString()}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
  <MenuItem
  onClick={() => {
    navigate(`/dashboard/seguridad/usuarios/${row.id}/editar`, { state: { user: row } });
    handleClosePopover();
  }}
>
  <Iconify icon="solar:pen-bold" />
  Editar
</MenuItem>


 
        {
        tienePermisoHabilitar && (
          <MenuItem
          onClick={() => {
            confirm.onTrue();
            handleClosePopover();
          }}
          sx={{ color: status === 'active' ? 'warning.main' : 'success.main' }}
        >
          <Iconify icon={status === 'active' ? 'solar:user-block-bold' : 'solar:user-check-bold'} />
          {status === 'active' ? 'Inactivar' : 'Activar'}
        </MenuItem>
          )} 
 

        



      </MenuPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={status === 'active' ? 'Inactivar usuario' : 'Activar usuario'}
        content={status === 'active' ? '¿Estás seguro que deseas inactivar este usuario?' : '¿Estás seguro que deseas activar este usuario?'}
        action={
          <Button variant="contained" color={status === 'active' ? 'warning' : 'success'} onClick={onToggleActive}>
            {status === 'active' ? 'Inactivar' : 'Activar'}
          </Button>
        }
      />
    </>
  );
} 