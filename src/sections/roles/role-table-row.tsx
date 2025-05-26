import { useEffect, useMemo, useState } from 'react';
import { getRolesFromToken } from '@guard/role-utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { ROLES } from '@guard/roles.constants';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { MenuPopover } from 'src/components/menu-popover';

import { Role } from './hooks/use-get-roles';

// ----------------------------------------------------------------------

type Props = {
  row: Role;
  onEditRow: VoidFunction;
  dense?: boolean;
};

export function RoleTableRow({ row, onEditRow, dense = false }: Props) {
  const { id, name, description, composite, clientRole } = row;

  const router = useRouter();
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const tienePermisoEditar = useMemo(
    () => userRoles.includes(ROLES.LISTA_ROLES_UPDATE),
    [userRoles]
  );

  const tienePermisoConfiguracion = useMemo(
    () => userRoles.includes(ROLES.LISTA_ROLES_UPDATE) || userRoles.includes(ROLES.LISTA_ROLES_PERMISSION),
    [userRoles]
  );

  const tienePermisoAgregarRolesSistema = useMemo(
    () => userRoles.includes(ROLES.LISTA_ROLES_PERMISSION),
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
      <TableRow
        hover
        sx={{
          '& td': dense
            ? {
                py: 0.15,
                px: 0.5,
              }
            : {
                py: 0.5,
              },
        }}
      >
        <TableCell
          sx={{
            width: dense ? 140 : 180,
            position: 'sticky',
            left: 0,
            zIndex: 2,
            backgroundColor: 'background.paper',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: 'divider',
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5,
            }}
          >
            {name}
          </Typography>
        </TableCell>

        <TableCell sx={{ width: dense ? 140 : 180 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5,
            }}
          >
            {description}
          </Typography>
        </TableCell>

        <TableCell sx={{ width: dense ? 80 : 100 }}>
          <Label
            variant="soft"
            color={composite ? 'success' : 'default'}
            sx={{
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5,
            }}
          >
            {composite ? 'Sí' : 'No'}
          </Label>
        </TableCell>

        <TableCell sx={{ width: dense ? 80 : 100 }}>
          <Label
            variant="soft"
            color={clientRole ? 'info' : 'default'}
            sx={{
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5,
            }}
          >
            {clientRole ? 'Sí' : 'No'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ width: dense ? 24 : 32 }}>
          {tienePermisoConfiguracion && (
            <IconButton
              color={openPopover ? 'primary' : 'default'}
              onClick={handleOpenPopover}
              size="small"
              sx={{ p: dense ? 0.15 : 0.5 }}
            >
              <Iconify icon="eva:more-vertical-fill" width={dense ? 12 : 16} />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: dense ? 120 : 140 }}
      >
        {tienePermisoEditar && (
          <MenuItem
            onClick={() => {
              router.push(paths.dashboard.seguridad.moduloRoles.listaRol);
              handleClosePopover();
            }}
            sx={{
              fontSize: dense ? '0.65rem' : '0.75rem',
              py: dense ? 0.35 : 0.75,
              minHeight: dense ? 'auto' : 'auto',
            }}
          >
            <Iconify
              icon="solar:pen-bold"
              width={dense ? 12 : 16}
              sx={{ mr: dense ? 0.5 : 0.75 }}
            />
            Editar rol
          </MenuItem>
        )}

        {tienePermisoAgregarRolesSistema && (
          <MenuItem
            onClick={() => {
              navigate(paths.dashboard.seguridad.moduloRoles.permisos, {
                state: {
                  role: {
                    id,
                    name,
                    description,
                    composite,
                    clientRole
                  }
                }
              });
              handleClosePopover();
            }}
            sx={{
              fontSize: dense ? '0.65rem' : '0.75rem',
              py: dense ? 0.35 : 0.75,
              minHeight: dense ? 'auto' : 'auto',
            }}
          >
            <Iconify
              icon="solar:key-bold"
              width={dense ? 12 : 16}
              sx={{ mr: dense ? 0.5 : 0.75 }}
            />
            Permisos
          </MenuItem>
        )}
      </MenuPopover>
    </>
  );
} 