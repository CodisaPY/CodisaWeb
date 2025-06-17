import type { User } from 'src/sections/user-management/hooks/use-get-users';

import { useNavigate } from 'react-router-dom';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { getRolesFromToken } from '@guard/role-utils';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { MenuPopover } from 'src/components/menu-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: User;
  onEditRow: VoidFunction;
  onToggleActive: VoidFunction;
  dense?: boolean;
};

export function UserTableRow({ row, onEditRow, onToggleActive, dense = false }: Props) {
  const { name, email, role, status, createdAt, avatarUrl, cargo, sucursal, lastName, firstName } = row;

  const router = useRouter();
  const navigate = useNavigate();

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const confirm = useBoolean();


  const [userRoles, setUserRoles] = useState<string[]>([]); 


  const tienePermisoHabilitar = useMemo(
    () => userRoles.includes(ROLES.LISTA_USUARIOS_ENABLE),
    [userRoles]
  );

  const tienePermisoDeshabilitar = useMemo(
    () => userRoles.includes(ROLES.LISTA_USUARIOS_DISABLE),
    [userRoles]
  );
  
  const tienePermisoEditar = useMemo(
    () => userRoles.includes(ROLES.LISTA_USUARIOS_UPDATE),
    [userRoles]
  );
 
  
  const tienePermisoConfiguracion = useMemo(
    () =>
      [
        ROLES.LISTA_USUARIOS_PERMISSION,
        ROLES.LISTA_USUARIOS_UPDATE,
        ROLES.LISTA_USUARIOS_ENABLE,
        ROLES.LISTA_USUARIOS_DISABLE,
      ].some((r) => userRoles.includes(r)),
    [userRoles]
  );

  const tienePermisoCambiarPass = useMemo(
    () => userRoles.includes(ROLES.LISTA_USUARIOS_PASSWORD),
    [userRoles]
  );

useEffect(() => {
  const roles = getRolesFromToken();
  console.log(roles);
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
          '& td': dense ? { 
            py: 0.15, 
            px: 0.5 
          } : { 
            py: 0.5 
          } 
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
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {`${firstName} ${lastName}`}
          </Typography>
        </TableCell>

        <TableCell sx={{ width: dense ? 140 : 180 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.disabled', 
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {email}
          </Typography>
        </TableCell>

        <TableCell sx={{ width: dense ? 80 : 100 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {role}
          </Typography>
        </TableCell>
 

        <TableCell sx={{ width: dense ? 80 : 100 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {cargo}
          </Typography>
        </TableCell>

        <TableCell sx={{ width: dense ? 80 : 100 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {sucursal}
          </Typography>
        </TableCell>

        <TableCell sx={{ width: dense ? 60 : 80 }}>
          <Label
            variant="soft"
            color={
              (status === 'active' && 'success') ||
              (status === 'inactive' && 'error') ||
              'default'
            }
            sx={{ 
              py: dense ? 0.1 : 0.25,
              px: dense ? 0.4 : 0.75,
              fontSize: dense ? '0.6rem' : '0.7rem',
              minWidth: dense ? 0 : 'auto',
              height: dense ? 'auto' : 'auto',
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {status === 'active' ? 'Activo' : 'Inactivo'}
          </Label>
        </TableCell>

        <TableCell sx={{ width: dense ? 80 : 100 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.disabled', 
              fontSize: dense ? '0.65rem' : '0.75rem',
              lineHeight: dense ? 1 : 1.5
            }}
          >
            {new Date(createdAt).toLocaleDateString()}
          </Typography>
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
          </IconButton>) }
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
            navigate(`/dashboard/seguridad/usuarios/${row.id}/editar`, { state: { user: row } });
            handleClosePopover();
          }}
          sx={{ 
            fontSize: dense ? '0.65rem' : '0.75rem', 
            py: dense ? 0.35 : 0.75,
            minHeight: dense ? 'auto' : 'auto'
          }}
        >
          <Iconify 
            icon="solar:pen-bold" 
            width={dense ? 12 : 16} 
            sx={{ mr: dense ? 0.5 : 0.75 }} 
          />
          Editar datos
        </MenuItem>
        )}

        {tienePermisoCambiarPass && (
          <MenuItem
            onClick={() => {
              navigate('/dashboard/seguridad/cambioPass', { 
                state: { 
                  user: {
                    id: row.id,
                    name: `${firstName} ${lastName}`
                  },
                  from: 'user-table'
                } 
              });
              handleClosePopover();
            }}
            sx={{ 
              fontSize: dense ? '0.65rem' : '0.75rem', 
              py: dense ? 0.35 : 0.75,
              minHeight: dense ? 'auto' : 'auto'
            }}
          >
            <Iconify 
              icon="solar:lock-password-bold" 
              width={dense ? 12 : 16} 
              sx={{ mr: dense ? 0.5 : 0.75 }} 
            />
            Cambiar clave
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            navigate('/dashboard/seguridad/usuarios/permisos', { 
              state: { 
                user: {
                  id: row.id,
                  name: `${firstName} ${lastName}`,
                  email,
                  role,
                  status,
                  groupRole: row.groupRole 
                }
              } 
            });
            handleClosePopover();
          }}
          sx={{ 
            fontSize: dense ? '0.65rem' : '0.75rem', 
            py: dense ? 0.35 : 0.75,
            minHeight: dense ? 'auto' : 'auto'
          }}
        >
          <Iconify 
            icon="solar:shield-keyhole-bold" 
            width={dense ? 12 : 16} 
            sx={{ mr: dense ? 0.5 : 0.75 }} 
          />
          Permisos
        </MenuItem>

        {status === 'active' && tienePermisoDeshabilitar && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              handleClosePopover();
            }}
            sx={{ 
              color: 'warning.main',
              fontSize: dense ? '0.65rem' : '0.75rem',
              py: dense ? 0.35 : 0.75,
              minHeight: dense ? 'auto' : 'auto'
            }}
          >
            <Iconify 
              icon="solar:user-block-bold"
              width={dense ? 12 : 16}
              sx={{ mr: dense ? 0.5 : 0.75 }}
            />
            Inactivar
          </MenuItem>
        )}

        {status === 'inactive' && tienePermisoHabilitar && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              handleClosePopover();
            }}
            sx={{ 
              color: 'success.main',
              fontSize: dense ? '0.65rem' : '0.75rem',
              py: dense ? 0.35 : 0.75,
              minHeight: dense ? 'auto' : 'auto'
            }}
          >
            <Iconify 
              icon="solar:user-check-bold"
              width={dense ? 12 : 16}
              sx={{ mr: dense ? 0.5 : 0.75 }}
            />
            Activar
          </MenuItem>
        )}
      </MenuPopover>

      {((status === 'active' && tienePermisoDeshabilitar) || (status === 'inactive' && tienePermisoHabilitar)) && (
        <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title={status === 'active' ? 'Inactivar usuario' : 'Activar usuario'}
          content={status === 'active' ? '¿Estás seguro que deseas inactivar este usuario?' : '¿Estás seguro que deseas activar este usuario?'}
          action={
            <Button
              variant="contained"
              color={status === 'active' ? 'warning' : 'success'}
              onClick={onToggleActive}
            >
              {status === 'active' ? 'Inactivar' : 'Activar'}
            </Button>
          }
        />
      )}
    </>
  );
} 