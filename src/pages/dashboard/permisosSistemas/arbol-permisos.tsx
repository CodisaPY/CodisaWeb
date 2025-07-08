import type {
  SelectChangeEvent} from '@mui/material';
import { styled } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import axios from 'axios';
import { useState, useEffect } from 'react';

import {
  Box,
  List,
  Chip,
  Stack,
  Alert,
  Select,
  Button,
  Tooltip,
  Checkbox,
  Snackbar,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  ListItemText,
  ListItemButton,
  Collapse,
  Autocomplete,
  TextField,
} from '@mui/material';

import { CONFIG } from 'src/config-global';
import { varAlpha, stylesMode } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';

type PermisoNode = {
  name: string;
  description: string;
  tipo: 'grupo' | 'pantalla';
  composite: boolean;
  children?: PermisoNode[];
  attributes: {
    nombre: string[];
    pantalla_id?: string[];
  };
  acciones?: string[];
};

type SelectedActions = {
  [key: string]: {
    [action: string]: boolean;
  };
};

const ACCIONES_ORDEN = ['view', 'create', 'update', 'delete', 'enable', 'disable', 'permission','password'] as const;

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  color: theme.vars.palette.grey[800],
  [stylesMode.dark]: { color: theme.vars.palette.grey[200] },
  [`& .${treeItemClasses.content}`]: {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    [`& .${treeItemClasses.label}`]: { 
      fontSize: '0.875rem',
      fontWeight: (props: any) => props.isPantalla ? 400 : 600,
    },
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    borderRadius: '50%',
    backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.25),
    [stylesMode.dark]: {
      color: theme.vars.palette.primary.contrastText,
      backgroundColor: theme.vars.palette.primary.dark,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${varAlpha(theme.vars.palette.text.primaryChannel, 0.4)}`,
  },
}));

const getAccionIcon = (accion: string) => {
  switch (accion) {
    case 'view':
      return 'eva:eye-fill';
    case 'create':
      return 'eva:plus-fill';
    case 'update':
      return 'eva:edit-fill';
    case 'delete':
      return 'eva:trash-2-fill';
    case 'enable':
      return 'eva:checkmark-circle-fill';
    case 'disable':
      return 'eva:close-circle-fill';
    case 'permission':
      return 'eva:lock-fill';
    case 'password':
      return 'eva:keypad-fill';
    default:
      return 'eva:alert-circle-fill';
  }
};

const renderAcciones = (
  pantallaId: string,
  acciones: string[],
  selectedActions: SelectedActions
) => {
  if (!acciones || acciones.length === 0) return null;

  const getAccionColor = (accion: string, isSelected: boolean) => {
    if (!isSelected) return 'default';
    
    switch (accion) {
      case 'view':
        return 'primary';
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'error';
      case 'enable':
        return 'info';
      case 'disable':
        return 'error';
      case 'permission':
        return 'secondary';
      case 'password':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAccionStyles = (accion: string, isSelected: boolean, color: string) => {
    const baseStyles = {
      minWidth: '100px',
      '& .MuiChip-deleteIcon': {
        ml: 0.5,
        mr: -0.5,
        '&:hover': {
          color: 'inherit'
        }
      },
      '&.MuiChip-root': {
        bgcolor: isSelected 
          ? `${color}.lighter`
          : 'transparent',
        border: isSelected 
          ? `1px solid ${color}.main`
          : '1px solid',
        borderColor: isSelected 
          ? `${color}.main`
          : 'divider',
        color: isSelected 
          ? `${color}.main`
          : 'text.secondary',
        '&:hover': {
          bgcolor: isSelected 
            ? `${color}.light`
            : 'action.hover'
        }
      }
    };

    // Estilos especiales para acciones específicas
    if (isSelected) {
      switch (accion) {
        case 'delete':
          return {
            ...baseStyles,
            '&.MuiChip-root': {
              ...baseStyles['&.MuiChip-root'],
              bgcolor: 'error.dark',
              borderColor: 'error.main',
              color: 'error.contrastText',
              '&:hover': {
                bgcolor: 'error.main',
              }
            }
          };
        case 'password':
          return {
            ...baseStyles,
            '&.MuiChip-root': {
              ...baseStyles['&.MuiChip-root'],
              bgcolor: 'info.dark',
              borderColor: 'info.main',
              color: 'info.contrastText',
              '&:hover': {
                bgcolor: 'info.main',
              }
            }
          };
        case 'enable':
          return {
            ...baseStyles,
            '&.MuiChip-root': {
              ...baseStyles['&.MuiChip-root'],
              bgcolor: 'success.dark',
              borderColor: 'success.main',
              color: 'success.contrastText',
              '&:hover': {
                bgcolor: 'success.main',
              }
            }
          };
        case 'disable':
          return {
            ...baseStyles,
            '&.MuiChip-root': {
              ...baseStyles['&.MuiChip-root'],
              bgcolor: 'error.dark',
              borderColor: 'error.main',
              color: 'error.contrastText',
              '&:hover': {
                bgcolor: 'error.main',
              }
            }
          };
        default:
          return baseStyles;
      }
    }

    return baseStyles;
  };

  const accionesOrdenadas = [...acciones].sort((a, b) => {
    const indexA = ACCIONES_ORDEN.indexOf(a as typeof ACCIONES_ORDEN[number]);
    const indexB = ACCIONES_ORDEN.indexOf(b as typeof ACCIONES_ORDEN[number]);
    return indexA - indexB;
  });

  return (
    <Stack direction="row" spacing={1} ml={1} alignItems="center">
      {accionesOrdenadas.map((accion) => {
        const isSelected = selectedActions[pantallaId]?.[accion] ?? false;
        const color = getAccionColor(accion, isSelected);
        return (
          <Tooltip key={accion} title={accion}>
            <Chip
              label={accion}
              size="small"
              color={color}
              variant="soft"
              icon={<Iconify width={16} icon={getAccionIcon(accion)} />}
              deleteIcon={
                <Checkbox
                  size="small"
                  checked={isSelected}
                  disabled
                  sx={{ 
                    p: 0,
                    m: 0,
                    '& .MuiSvgIcon-root': { 
                      fontSize: 16,
                      color: isSelected ? 'inherit' : 'text.disabled'
                    }
                  }}
                />
              }
              sx={getAccionStyles(accion, isSelected, color)}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
};

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  groupRole: string;
};

type Props = {
  userData?: UserData;
};

type RoleResponse = {
  success: boolean;
  message: string;
};

type GroupRole = {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
};

type GroupRolesResponse = {
  success: boolean;
  data: GroupRole[];
};

type Usuario = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes?: {
    cargo?: string[];
    sucursal?: string[];
    departamento?: string[];
    [key: string]: string[] | undefined;
  };
  createdTimestamp: number;
  enabled: boolean;
  groupRole: string;
  groupRoleDescription: string;
};

type UsuariosResponse = {
  success?: boolean;
  data?: Usuario[];
} | Usuario[];

const ExpandIcon = () => (
  <Typography component="span" sx={{ fontSize: 20, lineHeight: 1, color: 'text.secondary' }}>
    ▸
  </Typography>
);

const CollapseIcon = () => (
  <Typography component="span" sx={{ fontSize: 20, lineHeight: 1, color: 'text.secondary' }}>
    ▾
  </Typography>
);

export function ArbolPermisos({ userData }: Props) {
  const [treeData, setTreeData] = useState<PermisoNode | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<SelectedActions>({});
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([]);
  const [selectedGroupRole, setSelectedGroupRole] = useState<string>('');
  const [previousGroupRole, setPreviousGroupRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    async function fetchGroupRoles() {
      try {
        const response = await axios.get<GroupRolesResponse>(`${CONFIG.serverUrl}/api/keycloak/groups/roles`);
        if (response.data.success) {
          setGroupRoles(response.data.data);
          // Si el usuario tiene un groupRole, seleccionarlo
          if (userData?.groupRole) {
            setSelectedGroupRole(userData.groupRole);
          }
        }
      } catch (error) {
        console.error('Error al cargar roles de grupo:', error);
        setToast({
          open: true,
          message: 'Error al cargar roles de grupo',
          severity: 'error'
        });
      }
    }
    fetchGroupRoles();
  }, [userData?.groupRole]);

  useEffect(() => {
    async function fetchUsuarios() {
      setLoadingUsuarios(true);
      try {
        const response = await axios.get<UsuariosResponse>(`${CONFIG.serverUrl}/api/keycloak/usuarios`);
        const usuariosData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setToast({
          open: true,
          message: 'Error al cargar usuarios',
          severity: 'error'
        });
      } finally {
        setLoadingUsuarios(false);
      }
    }
    fetchUsuarios();
  }, []);

  useEffect(() => {
    // Inicializar el rol anterior cuando se carga el componente
    if (userData?.groupRole) {
      setPreviousGroupRole(userData.groupRole);
    }
  }, [userData?.groupRole]);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Traer árbol de permisos
        const treeRes = await axios.get(`${CONFIG.serverUrl}/api/keycloak/pantallas/acciones`);
        setTreeData(treeRes.data);

        // 2. Traer roles del usuario
        let userRoles: string[] = [];
        if (userData?.id) {
          const rolesRes = await axios.get(`${CONFIG.serverUrl}/api/keycloak/user/${userData.id}/roles`);
          userRoles = rolesRes.data.map((role: { name: string }) => role.name);
        }

        // 3. Inicializar selectedActions según los roles del usuario
        const initialSelectedActions: SelectedActions = {};
        const initializeActions = (node: PermisoNode) => {
          if (node.tipo === 'pantalla' && node.acciones) {
            const pantallaId = node.attributes.pantalla_id?.[0] || node.name;
            initialSelectedActions[pantallaId] = {};
            node.acciones.forEach(action => {
              const roleName = `${node.name}__${action}`;
              initialSelectedActions[pantallaId][action] = userRoles.includes(roleName);
            });
          }
          node.children?.forEach(initializeActions);
        };
        initializeActions(treeRes.data);
        setSelectedActions(initialSelectedActions);

        // 4. Expandir todos los nodos de grupo por defecto
        const expandedSet = new Set<string>();
        const collectExpandable = (node: PermisoNode) => {
          if (node.children && node.children.length > 0) {
            expandedSet.add(node.name);
            node.children.forEach(collectExpandable);
          }
        };
        collectExpandable(treeRes.data);
        setExpandedItems(expandedSet);
      } catch (err) {
        console.error('Error al cargar árbol de permisos o roles', err);
      }
    }
    fetchData();
  }, [userData?.id]);

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderTree = (node: PermisoNode, nivel: number = 0) => {
    const nombre = Array.isArray(node.attributes.nombre) 
      ? node.attributes.nombre[0] 
      : node.attributes.nombre;
    const pantallaId = node.attributes.pantalla_id?.[0] || node.name;
    const isPantalla = node.tipo === 'pantalla';
    const isExpanded = expandedItems.has(node.name);

    return (
      <List
        key={node.name}
        component="div"
        disablePadding
        sx={{
          pl: nivel * 2,
          '& .MuiListItemButton-root': {
            pl: 2,
            py: 0.5,
          },
        }}
      >
        <ListItemButton
          onClick={() => toggleExpand(node.name)}
          sx={{
            minHeight: 40,
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              bgcolor: isPantalla ? 'transparent' : 'action.hover',
            },
          }}
        >
          {node.children && node.children.length > 0 && (
            <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </Box>
          )}
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isPantalla ? 'normal' : 'bold',
                    color: isPantalla ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {nombre}
                </Typography>
                {isPantalla && node.acciones && renderAcciones(
                  pantallaId,
                  node.acciones,
                  selectedActions
                )}
              </Box>
            }
          />
        </ListItemButton>
        {node.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {node.children.map((child) => renderTree(child, nivel + 1))}
          </Collapse>
        )}
      </List>
    );
  };

  const handleGroupRoleChange = async (event: SelectChangeEvent<string>) => {
    const newGroupRole = event.target.value;
    setSelectedGroupRole(newGroupRole);

    // Limpiar la selección de usuario cuando se cambia rol manualmente
    if (selectedUsuario) {
      setSelectedUsuario(null);
    }

    try {
      // Obtener los roles del grupo seleccionado
      const response = await axios.get(`${CONFIG.serverUrl}/api/keycloak/groups/${newGroupRole}/pantallas`);
      
      // Reinicializar selectedActions
      const initialSelectedActions: SelectedActions = {};
      const initializeActions = (node: PermisoNode) => {
        if (node.tipo === 'pantalla' && node.acciones) {
          const pantallaId = node.attributes.pantalla_id?.[0] || node.name;
          initialSelectedActions[pantallaId] = {};
          node.acciones.forEach(action => {
            const groupRoleNames = response.data.success ? 
              response.data.data.map((role: { name: string }) => role.name) : 
              [];
            const roleName = `${node.name}__${action}`;
            initialSelectedActions[pantallaId][action] = groupRoleNames.includes(roleName);
          });
        }
        node.children?.forEach(initializeActions);
      };

      if (treeData) {
        initializeActions(treeData);
        setSelectedActions(initialSelectedActions);
      }
    } catch (error) {
      console.error('Error al cargar roles del grupo:', error);
      // En caso de error, desasignar todos los roles
      if (treeData) {
        const emptySelectedActions: SelectedActions = {};
        const initializeEmptyActions = (node: PermisoNode) => {
          if (node.tipo === 'pantalla' && node.acciones) {
            const pantallaId = node.attributes.pantalla_id?.[0] || node.name;
            emptySelectedActions[pantallaId] = {};
            node.acciones.forEach(action => {
              emptySelectedActions[pantallaId][action] = false;
            });
          }
          node.children?.forEach(initializeEmptyActions);
        };
        initializeEmptyActions(treeData);
        setSelectedActions(emptySelectedActions);
      }
      setToast({
        open: true,
        message: 'Error al cargar roles del grupo',
        severity: 'error'
      });
    }
  };

  const handleChangeRole = async () => {
    // Solo cambiar rol del usuario actual, no del usuario seleccionado
    if (!userData?.id || !selectedGroupRole) return;

    setIsUpdating(true);
    try {
      // 1. Intentar eliminar el rol actual del usuario
      if (userData.groupRole && userData.groupRole !== 'N/A') {
        try {
          await axios.delete(`${CONFIG.serverUrl}/api/keycloak/user/${userData.id}/roles`, {
            data: {
              roles: [{ name: userData.groupRole }]
            }
          });
        } catch (deleteError) {
          console.warn('No se pudo eliminar el rol anterior:', deleteError);
          // Continuamos con la asignación del nuevo rol aunque falle la eliminación
        }
      }

      // 2. Agregar el nuevo rol
      const response = await axios.post(`${CONFIG.serverUrl}/api/keycloak/user/${userData.id}/roles`, {
        roles: [{ name: selectedGroupRole }]
      });

      if (response.data.success) {
        // Actualizar referencias locales
        setPreviousGroupRole(selectedGroupRole);
        
        // Determinar el mensaje según el origen del cambio
        const successMessage = selectedUsuario 
          ? `Rol adoptado exitosamente de ${selectedUsuario.firstName} ${selectedUsuario.lastName}`
          : `Rol cambiado exitosamente a ${groupRoles.find(gr => gr.name === selectedGroupRole)?.description || selectedGroupRole}`;
        
        setToast({
          open: true,
          message: successMessage,
          severity: 'success'
        });

        // Limpiar selección de usuario después de adoptar su rol
        if (selectedUsuario) {
          setSelectedUsuario(null);
        }
      } else {
        throw new Error(response.data.message || 'Error al actualizar el rol');
      }
    } catch (error) {
      console.error('Error al cambiar el rol:', error);
      setToast({
        open: true,
        message: error instanceof Error ? error.message : 'Error al cambiar el rol',
        severity: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUsuarioSelect = async (usuario: Usuario | null) => {
    setSelectedUsuario(usuario);
    
    // Si se selecciona un usuario, cargar su rol en el selector de grupo
    if (usuario && usuario.groupRole !== 'N/A') {
      setSelectedGroupRole(usuario.groupRole);
      setPreviousGroupRole(usuario.groupRole);
      
      // Cargar los permisos de este usuario
      try {
        const response = await axios.get(`${CONFIG.serverUrl}/api/keycloak/groups/${usuario.groupRole}/pantallas`);
        
        // Reinicializar selectedActions con los permisos del usuario
        const initialSelectedActions: SelectedActions = {};
        const initializeActions = (node: PermisoNode) => {
          if (node.tipo === 'pantalla' && node.acciones) {
            const pantallaId = node.attributes.pantalla_id?.[0] || node.name;
            initialSelectedActions[pantallaId] = {};
            node.acciones.forEach(action => {
              const groupRoleNames = response.data.success ? 
                response.data.data.map((role: { name: string }) => role.name) : 
                [];
              const roleName = `${node.name}__${action}`;
              initialSelectedActions[pantallaId][action] = groupRoleNames.includes(roleName);
            });
          }
          node.children?.forEach(initializeActions);
        };

        if (treeData) {
          initializeActions(treeData);
          setSelectedActions(initialSelectedActions);
        }
      } catch (error) {
        console.error('Error al cargar permisos del usuario:', error);
      }
    } else if (usuario && usuario.groupRole === 'N/A') {
      // Si el usuario no tiene rol, limpiar el selector de grupo
      setSelectedGroupRole('');
      setPreviousGroupRole('');
      
      // Limpiar permisos
      if (treeData) {
        const emptySelectedActions: SelectedActions = {};
        const initializeEmptyActions = (node: PermisoNode) => {
          if (node.tipo === 'pantalla' && node.acciones) {
            const pantallaId = node.attributes.pantalla_id?.[0] || node.name;
            emptySelectedActions[pantallaId] = {};
            node.acciones.forEach(action => {
              emptySelectedActions[pantallaId][action] = false;
            });
          }
          node.children?.forEach(initializeEmptyActions);
        };
        initializeEmptyActions(treeData);
        setSelectedActions(emptySelectedActions);
      }
    } else if (userData?.groupRole) {
      // Si no hay usuario seleccionado, volver a los datos del usuario actual
      setSelectedGroupRole(userData.groupRole);
      setPreviousGroupRole(userData.groupRole);
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        backgroundColor: (theme) => theme.palette.background.default,
        px: 2,
        pt: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ flexGrow: 1 }}>
            <InputLabel id="group-role-select-label">Rol de Grupo</InputLabel>
            <Select
              labelId="group-role-select-label"
              id="group-role-select"
              value={selectedGroupRole}
              label="Rol de Grupo"
              onChange={handleGroupRoleChange}
              sx={{ 
                '& .MuiSelect-select': {
                  py: 1
                }
              }}
            >
              {groupRoles.map((role) => (
                <MenuItem 
                  key={role.id} 
                  value={role.name}
                  sx={{ 
                    py: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Typography variant="subtitle2">{role.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {role.description}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedGroupRole && selectedGroupRole !== userData?.groupRole && (
            <Button
              variant="contained"
              onClick={handleChangeRole}
              disabled={isUpdating}
              sx={{ minWidth: 120 }}
            >
              {isUpdating ? 'Actualizando...' : 
               selectedUsuario ? `Adoptar Rol de ${selectedUsuario.firstName}` : 'Cambiar Rol'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Selector de Usuario */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Autocomplete
            sx={{ flexGrow: 1 }}
            options={usuarios.filter(usuario => usuario.groupRole !== 'N/A' && usuario.enabled)}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            value={selectedUsuario}
            onChange={(event, newValue) => {
              handleUsuarioSelect(newValue);
            }}
            disabled={loadingUsuarios}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar rol por usuario"
                placeholder="Escriba el nombre del usuario..."
                sx={{
                  '& .MuiInputBase-root': {
                    py: 0.5
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} style={{ padding: '12px 16px' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {option.firstName} {option.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{option.username} • {option.email}
                    </Typography>
                    {option.attributes?.cargo && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {option.attributes.cargo[0]}
                        {option.attributes?.sucursal && ` • ${option.attributes.sucursal[0]}`}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={option.groupRoleDescription}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ 
                      maxWidth: 150,
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                </Stack>
              </li>
            )}
            noOptionsText={
              loadingUsuarios 
                ? 'Cargando usuarios...' 
                : usuarios.filter(usuario => usuario.groupRole !== 'N/A' && usuario.enabled).length === 0
                  ? 'No hay usuarios con roles asignados'
                  : 'No se encontraron usuarios'
            }
            filterOptions={(options, { inputValue }) => 
              options.filter(option => {
                const searchText = inputValue.toLowerCase();
                const fullName = `${option.firstName} ${option.lastName}`.toLowerCase();
                const username = option.username.toLowerCase();
                const email = option.email.toLowerCase();
                
                return fullName.includes(searchText) || 
                       username.includes(searchText) || 
                       email.includes(searchText);
              })
            }
          />
        </Stack>
        
        {selectedUsuario && (
          <Alert 
            severity="info" 
            sx={{ mt: 2 }}
            icon={<Iconify icon="eva:eye-fill" />}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">
                  <strong>Consultando:</strong> {selectedUsuario.firstName} {selectedUsuario.lastName} (@{selectedUsuario.username})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedUsuario.email}
                  {selectedUsuario.attributes?.cargo && ` • ${selectedUsuario.attributes.cargo[0]}`}
                  {selectedUsuario.attributes?.sucursal && ` • ${selectedUsuario.attributes.sucursal[0]}`}
                </Typography>
                <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5 }}>
                  📋 Los permisos mostrados son de este usuario - Usa &ldquo;Copiar Rol&rdquo; para adoptarlos
                </Typography>
              </Box>
              <Chip
                label={selectedUsuario.groupRole !== 'N/A' ? selectedUsuario.groupRoleDescription : 'Sin Rol Asignado'}
                size="small"
                color={selectedUsuario.groupRole !== 'N/A' ? 'primary' : 'default'}
                variant={selectedUsuario.groupRole !== 'N/A' ? 'soft' : 'outlined'}
              />
            </Stack>
          </Alert>
        )}
      </Box>

      {treeData ? (
        <Box sx={{ minHeight: 240 }}>
          {renderTree(treeData)}
        </Box>
      ) : (
        <Typography>Cargando árbol de permisos...</Typography>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 