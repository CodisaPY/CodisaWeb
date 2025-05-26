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

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type Props = {
  userData?: UserData;
};

type RoleResponse = {
  success: boolean;
  message: string;
};

export function ArbolPermisos({ userData }: Props) {
  const [treeData, setTreeData] = useState<PermisoNode | null>(null);
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
      const getPantallaName = (node: PermisoNode): string | null => {
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
      const logMessage = pantallaName 
        ? `${pantallaName}__${action}`
        : `${pantallaId}__${action}`;

      console.log('Permiso actualizado:', {
        usuario: {
          id: userData?.id,
          nombre: userData?.name,
          email: userData?.email
        },
        permiso: logMessage,
        estado: checked ? 'activado' : 'desactivado'
      });

      // Llamada a la API de permisos
      // await axios.post('http://localhost:4000/api/keycloak/pantallas/acciones/update', {
      //   userId: userData?.id,
      //   pantallaId,
      //   action,
      //   checked
      // });

      // Llamada a la API de roles
      if (userData?.id) {
        const roleName = logMessage;
        const method = checked ? 'post' : 'delete';
        
        try {
          let response;
          if (method === 'post') {
            response = await axios.post<RoleResponse>(`http://localhost:4000/api/keycloak/user/${userData.id}/roles`, {
              roles: [
                {
                  name: roleName
                }
              ]
            });
          } else {
            // Para DELETE, enviamos los datos como query params
            response = await axios.delete<RoleResponse>(`http://localhost:4000/api/keycloak/user/${userData.id}/roles`, {
              data: {
                roles: [
                  {
                    name: roleName
                  }
                ]
              }
            });
          }

         

          if (!response.data.success) {
            throw new Error(response.data.message);
          }

          // Mostrar toast de éxito
          setToast({
            open: true,
            message: response.data.message,
            severity: 'success'
          });

        } catch (roleError) {
          console.error('Error al actualizar el rol:', roleError);
          // Mostrar toast de error con el mensaje específico del servidor si está disponible
          const errorMessage = roleError.response?.data?.message || 
                             (roleError instanceof Error ? roleError.message : 'Error al actualizar el rol');
          
          setToast({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
          // Si falla la actualización del rol, revertimos el cambio del permiso
          throw roleError;
        }
      }
      
    } catch (error) {
      console.error('Error al actualizar el permiso:', error);
      // Mostrar toast de error
      setToast({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar el permiso',
        severity: 'error'
      });
      // Revertir el cambio en el estado si alguna de las APIs falla
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