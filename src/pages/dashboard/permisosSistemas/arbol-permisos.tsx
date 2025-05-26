import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Chip,
  Stack,
  Checkbox,
  Tooltip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
} from '@mui/material';

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

const ACCIONES_ORDEN = ['view', 'create', 'update', 'enable', 'disable', 'permission'] as const;

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
      case 'enable':
        return 'info';
      case 'disable':
        return 'error';
      case 'permission':
        return 'secondary';
      default:
        return 'default';
    }
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
              sx={{ 
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
              }}
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

export function ArbolPermisos({ userData }: Props) {
  const [treeData, setTreeData] = useState<PermisoNode | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<SelectedActions>({});
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([]);
  const [selectedGroupRole, setSelectedGroupRole] = useState<string>('');
  const [previousGroupRole, setPreviousGroupRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
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
        const response = await axios.get<GroupRolesResponse>('http://localhost:4000/api/keycloak/groups/roles');
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
    // Inicializar el rol anterior cuando se carga el componente
    if (userData?.groupRole) {
      setPreviousGroupRole(userData.groupRole);
    }
  }, [userData?.groupRole]);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Traer árbol de permisos
        const treeRes = await axios.get('http://localhost:4000/api/keycloak/pantallas/acciones');
        setTreeData(treeRes.data);

        // 2. Traer roles del usuario
        let userRoles: string[] = [];
        if (userData?.id) {
          const rolesRes = await axios.get(`http://localhost:4000/api/keycloak/user/${userData.id}/roles`);
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

  const renderTree = (node: PermisoNode, nivel = 0): JSX.Element => {
    const isPantalla = node.tipo === 'pantalla';
    const isExpanded = expandedItems.has(node.name);
    const hasChildren = node.children?.length;
    const nombre = Array.isArray(node.attributes.nombre) 
      ? node.attributes.nombre[0] 
      : node.attributes.nombre;
    const pantallaId = node.attributes.pantalla_id?.[0] || node.name;

    return (
      <Box key={node.name} ml={nivel * 2}>
        <ListItemButton
          onClick={() => !isPantalla && hasChildren && toggleExpand(node.name)}
          sx={{
            borderRadius: 1,
            bgcolor: isPantalla ? 'transparent' : 'action.hover',
            mb: 0.5,
            cursor: isPantalla ? 'default' : 'pointer',
            '&:hover': {
              bgcolor: isPantalla ? 'transparent' : 'action.hover'
            }
          }}
        >
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <Typography fontWeight={isPantalla ? 'normal' : 'bold'}>
                    {nombre}
                  </Typography>
                  {isPantalla && node.acciones && renderAcciones(
                    pantallaId,
                    node.acciones,
                    selectedActions
                  )}
                </Box>
                {hasChildren && !isPantalla && <span>{isExpanded ? '▾' : '▸'}</span>}
              </Box>
            }
            
          />
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List dense disablePadding>
              {node.children?.map((child) => renderTree(child, nivel + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const handleGroupRoleChange = async (event: SelectChangeEvent<string>) => {
    const newGroupRole = event.target.value;
    setSelectedGroupRole(newGroupRole);

    try {
      // Obtener los roles del grupo seleccionado
      const response = await axios.get(`http://localhost:4000/api/keycloak/groups/${newGroupRole}/pantallas`);
      
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
    if (!userData?.id || !selectedGroupRole) return;

    setIsUpdating(true);
    try {
      // 1. Eliminar el rol actual (que ahora es el anterior)
      if (previousGroupRole) {
        await axios.delete(`http://localhost:4000/api/keycloak/user/${userData.id}/roles`, {
          data: {
            roles: [{ name: previousGroupRole }]
          }
        });
      }

      // 2. Agregar el nuevo rol
      const response = await axios.post(`http://localhost:4000/api/keycloak/user/${userData.id}/roles`, {
        roles: [{ name: selectedGroupRole }]
      });

      if (response.data.success) {
        // Actualizar el rol anterior al rol que acabamos de cambiar
        setPreviousGroupRole(selectedGroupRole);
        setToast({
          open: true,
          message: 'Rol actualizado exitosamente',
          severity: 'success'
        });
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
          
          {selectedGroupRole && selectedGroupRole !== previousGroupRole && (
            <Button
              variant="contained"
              onClick={handleChangeRole}
              disabled={isUpdating}
              sx={{ minWidth: 120 }}
            >
              {isUpdating ? 'Actualizando...' : 'Cambiar Rol'}
            </Button>
          )}
        </Stack>
      </Box>

      <List dense sx={{ width: '100%' }}>
        {treeData ? (
          renderTree(treeData)
        ) : (
          <Typography>Cargando árbol de permisos...</Typography>
        )}
      </List>

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