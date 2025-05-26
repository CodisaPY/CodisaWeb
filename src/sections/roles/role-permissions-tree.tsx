import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Collapse,
  Chip,
  Stack,
  Checkbox,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';

type Permission = {
  name: string;
  description: string;
  tipo: 'grupo' | 'pantalla';
  composite: boolean;
  children?: Permission[];
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
  selectedActions: SelectedActions,
  onActionChange: (pantallaId: string, action: string, checked: boolean) => void
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
        const isSelected = selectedActions[pantallaId]?.[accion] ?? true;
        const color = getAccionColor(accion, isSelected);
        return (
          <Tooltip key={accion} title={accion}>
            <Chip
              label={accion}
              size="small"
              color={color}
              variant="soft"
              clickable
              onClick={() => onActionChange(pantallaId, accion, !isSelected)}
              deleteIcon={
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onActionChange(pantallaId, accion, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
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
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
};

type Props = {
  roleId?: string;
  roleName?: string;
  onPermissionsChange?: (permissions: string[]) => void;
};

type RoleResponse = {
  success: boolean;
  message: string;
};

export function RolePermissionsTree({ roleId, roleName, onPermissionsChange }: Props) {
 // console.log('RolePermissionsTree props:', { roleId, roleName, onPermissionsChange });

  const [treeData, setTreeData] = useState<Permission | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<SelectedActions>({});
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

  // Función para inicializar todas las acciones como no seleccionadas
  const initializeAllActionsAsUnselected = (node: Permission) => {
    const actions: SelectedActions = {};
    
    const processNode = (currentNode: Permission) => {
      if (currentNode.tipo === 'pantalla' && currentNode.acciones) {
        const pantallaId = currentNode.attributes.pantalla_id?.[0] || currentNode.name;
        actions[pantallaId] = {};
        currentNode.acciones.forEach(action => {
          actions[pantallaId][action] = false;
        });
      }
      currentNode.children?.forEach(processNode);
    };

    processNode(node);
    return actions;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Traer árbol de permisos
        const treeRes = await axios.get('http://localhost:4000/api/keycloak/pantallas/acciones');
        console.log('Tree data received:', treeRes.data);
        
        if (!treeRes.data) {
          throw new Error('No se recibieron datos del árbol de permisos');
        }

        setTreeData(treeRes.data);

        // 2. Inicializar todas las acciones como no seleccionadas
        const unselectedActions = initializeAllActionsAsUnselected(treeRes.data);
        setSelectedActions(unselectedActions);

        // 3. Si hay roleName, traer los permisos del rol
        if (roleName) {
          try {
            console.log('Fetching permissions for role:', roleName);
            const rolePermissionsRes = await axios.get(`http://localhost:4000/api/keycloak/groups/${roleName}/pantallas`);
            console.log('Role permissions response:', rolePermissionsRes.data);

            if (!rolePermissionsRes.data.success) {
              console.warn('La respuesta de permisos no fue exitosa:', rolePermissionsRes.data);
              return;
            }

            // Actualizar selectedActions con los permisos del rol
            const rolePermissions = rolePermissionsRes.data.data || [];
            console.log('Role permissions array:', rolePermissions);

            if (!Array.isArray(rolePermissions)) {
              console.warn('Los permisos no son un array:', rolePermissions);
              return;
            }

            const updatedActions = { ...unselectedActions };

            // Procesar cada permiso del rol
            rolePermissions.forEach((permission: { name: string }) => {
              if (!permission.name) {
                console.warn('Permiso sin nombre:', permission);
                return;
              }

              // El formato del nombre es "pantalla__roles__crear_nuevo_rol__view"
              const parts = permission.name.split('__');
              const action = parts.pop(); // Último elemento es la acción (view, create, etc)
              const pantallaId = parts.join('__'); // Todo lo demás es el ID de la pantalla

              console.log('Processing permission:', {
                fullName: permission.name,
                parts,
                action,
                pantallaId,
                exists: pantallaId ? !!updatedActions[pantallaId] : false
              });

              if (pantallaId && action && updatedActions[pantallaId]) {
                updatedActions[pantallaId][action] = true;
              } else {
                console.warn('Permission not mapped:', {
                  pantallaId,
                  action,
                  exists: pantallaId ? !!updatedActions[pantallaId] : false,
                  availablePantallas: Object.keys(updatedActions)
                });
              }
            });

            console.log('Final updated actions:', updatedActions);
            setSelectedActions(updatedActions);
          } catch (roleError) {
            console.error('Error al cargar permisos del rol:', roleError);
            // No lanzamos el error, solo mostramos un toast y continuamos con las acciones no seleccionadas
            setToast({
              open: true,
              message: 'No se pudieron cargar los permisos del rol. Mostrando permisos sin asignar.',
              severity: 'warning'
            });
          }
        }

        // 4. Expandir todos los nodos de grupo por defecto
        try {
          const expandedSet = new Set<string>();
          const collectExpandable = (node: Permission) => {
            if (!node) {
              console.warn('Nodo nulo encontrado al expandir');
              return;
            }
            if (node.children && node.children.length > 0) {
              expandedSet.add(node.name);
              node.children.forEach(collectExpandable);
            }
          };
          collectExpandable(treeRes.data);
          console.log('Nodos expandibles encontrados:', Array.from(expandedSet));
          setExpandedItems(expandedSet);
        } catch (expandError) {
          console.error('Error al expandir nodos:', expandError);
          // No lanzamos el error, solo mostramos un toast
          setToast({
            open: true,
            message: 'Error al expandir el árbol de permisos',
            severity: 'warning'
          });
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setToast({
          open: true,
          message: 'Error al cargar los datos del árbol de permisos',
          severity: 'error'
        });
      }
    }
    fetchData();
  }, [roleName]);

  const handleActionChange = async (pantallaId: string, action: string, checked: boolean) => {
    // Actualizar el estado local
    setSelectedActions(prev => ({
      ...prev,
      [pantallaId]: {
        ...prev[pantallaId],
        [action]: checked
      }
    }));

    try {
      const getPantallaName = (node: Permission): string | null => {
        if (node.attributes.pantalla_id?.[0] === pantallaId) {
          return node.name;
        }
        if (node.children) {
          const result = node.children
            .map(child => getPantallaName(child))
            .find(name => name !== null);
          return result || null;
        }
        return null;
      };

      const pantallaName = treeData ? getPantallaName(treeData) : null;
      const permissionName = pantallaName 
        ? `${pantallaName}__${action}`
        : `${pantallaId}__${action}`;

      console.log('Actualizando permiso:', {
        roleName,
        permissionName,
        checked
      });

      if (roleName) {
        const endpoint = `http://localhost:4000/api/keycloak/groups/${roleName}/roles`;
        const method = checked ? 'post' : 'delete';
        
        const response = await axios({
          method,
          url: endpoint,
          data: {
            rolesToAdd: checked ? [permissionName] : [],
            rolesToRemove: !checked ? [permissionName] : []
          }
        });

        if (response.data.success) {
          setToast({
            open: true,
            message: `Permiso ${checked ? 'agregado' : 'removido'} correctamente`,
            severity: 'success'
          });

          if (onPermissionsChange) {
            onPermissionsChange([permissionName]);
          }
        } else {
          throw new Error(response.data.message || 'Error al actualizar el permiso');
        }
      }

    } catch (error) {
      console.error('Error al actualizar el permiso:', error);
      setToast({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar el permiso',
        severity: 'error'
      });
      // Revertir el cambio en el estado si hay error
      setSelectedActions(prev => ({
        ...prev,
        [pantallaId]: {
          ...prev[pantallaId],
          [action]: !checked
        }
      }));
    }
  };

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

  const renderTree = (node: Permission, nivel = 0): JSX.Element => {
    const isPantalla = node.tipo === 'pantalla';
    const isExpanded = expandedItems.has(node.name);
    const hasChildren = node.children?.length;
    const nombre = Array.isArray(node.attributes.nombre) 
      ? node.attributes.nombre[0] 
      : node.attributes.nombre;
    const pantallaId = node.attributes.pantalla_id?.[0] || node.name;

    // Si es una pantalla o tiene hijos, renderizar el nodo
    if (isPantalla || hasChildren) {
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
                      selectedActions,
                      handleActionChange
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
    }

    // Si no es pantalla ni tiene hijos, solo mostrar el nombre
    return (
      <Box key={node.name} ml={nivel * 2}>
        <ListItemButton
          sx={{
            borderRadius: 1,
            mb: 0.5,
            cursor: 'default',
            '&:hover': {
              bgcolor: 'transparent'
            }
          }}
        >
          <ListItemText
            primary={
              <Typography>
                {nombre}
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    );
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