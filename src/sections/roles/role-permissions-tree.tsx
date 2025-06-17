import axios from 'axios';
import { useState, useEffect } from 'react';

import {
  Box,
  List,
  Chip,
  Stack,
  Alert,
  Tooltip,
  Collapse,
  Checkbox,
  Snackbar,
  Typography,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';

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

const ACCIONES_ORDEN = ['view', 'create', 'update', 'delete', 'enable', 'disable', 'permission','password'] as const;

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
              sx={getAccionStyles(accion, isSelected, color)}
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
        const treeRes = await axios.get(`${CONFIG.serverUrl}/api/keycloak/pantallas/acciones`);
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
            const rolePermissionsRes = await axios.get(`${CONFIG.serverUrl}/api/keycloak/groups/${roleName}/pantallas`);
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
        const endpoint = `${CONFIG.serverUrl}/api/keycloak/groups/${roleName}/roles`;
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

  const renderTree = (node: Permission, nivel = 0): JSX.Element => {
    const isPantalla = node.tipo === 'pantalla';
    const isExpanded = expandedItems.has(node.name);
    const hasChildren = node.children?.length;
    const nombre = Array.isArray(node.attributes.nombre) 
      ? node.attributes.nombre[0] 
      : node.attributes.nombre;
    const pantallaId = node.attributes.pantalla_id?.[0] || node.name;

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
          onClick={() => !isPantalla && hasChildren && toggleExpand(node.name)}
          sx={{
            minHeight: 40,
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              bgcolor: isPantalla ? 'transparent' : 'action.hover',
            },
          }}
        >
          {hasChildren && !isPantalla && (
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
                  selectedActions,
                  handleActionChange
                )}
              </Box>
            }
          />
        </ListItemButton>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {node.children?.map((child) => renderTree(child, nivel + 1))}
          </Collapse>
        )}
      </List>
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