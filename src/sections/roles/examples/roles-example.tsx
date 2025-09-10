import React, { useState } from 'react';

import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { 
  useCreateRole, 
  useUpdateRole, 
  useDeleteRole 
} from 'src/hooks/use-graphql-roles';

import { useGetRoles } from '../hooks/use-get-roles';

export function RolesExample() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Usar el hook GraphQL para roles
  const { roles, loading, error, refetch } = useGetRoles();
  const { createRole, loading: creating } = useCreateRole();
  const { updateRole, loading: updating } = useUpdateRole();
  const { deleteRole, loading: deleting } = useDeleteRole();

  const handleCreateRole = async () => {
    try {
      await createRole({
        variables: {
          input: {
            name: formData.name,
            description: formData.description,
            attributes: {
              name: [formData.description]
            }
          },
        },
      });
      setOpenCreateDialog(false);
      setFormData({ name: '', description: '' });
      refetch();
    } catch (createError) {
      console.error('Error creating role:', createError);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    try {
      await updateRole({
        variables: {
          input: {
            id: selectedRole.id,
            name: formData.name,
            description: formData.description,
            attributes: {
              name: [formData.description]
            }
          },
        },
      });
      setOpenEditDialog(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '' });
      refetch();
    } catch (updateError) {
      console.error('Error updating role:', updateError);
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    try {
      await deleteRole({
        variables: {
          roleName,
        },
      });
      refetch();
    } catch (deleteError) {
      console.error('Error deleting role:', deleteError);
    }
  };

  const handleEditClick = (role: any) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
    });
    setOpenEditDialog(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar roles: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Gestión de Roles ({roles.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Crear Rol
          </Button>
        </Box>

        <List>
          {roles.map((role) => (
            <ListItem
              key={role.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton
                    onClick={() => handleEditClick(role)}
                    color="primary"
                  >
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteRole(role.name)}
                    color="error"
                    disabled={deleting}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={role.name}
                secondary={role.description}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                {role.composite && (
                  <Chip label="Compuesto" size="small" color="primary" />
                )}
                {role.clientRole && (
                  <Chip label="Cliente" size="small" color="secondary" />
                )}
              </Box>
            </ListItem>
          ))}
        </List>

        {roles.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No se encontraron roles
          </Typography>
        )}
      </Card>

      {/* Dialog para crear rol */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Rol</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Rol"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateRole} 
            variant="contained"
            disabled={creating || !formData.name}
          >
            {creating ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar rol */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Rol</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Rol"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleUpdateRole} 
            variant="contained"
            disabled={updating || !formData.name}
          >
            {updating ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 