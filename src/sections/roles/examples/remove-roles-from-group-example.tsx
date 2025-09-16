import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useRemoveRolesFromGroup } from 'src/hooks/use-graphql-roles';

export function RemoveRolesFromGroupExample() {
  const [groupName, setGroupName] = useState('');
  const [rolesToRemove, setRolesToRemove] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const { removeRolesFromGroup, loading } = useRemoveRolesFromGroup();

  const handleAddRole = () => {
    if (newRole.trim() && !rolesToRemove.includes(newRole.trim())) {
      setRolesToRemove([...rolesToRemove, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRolesToRemove(rolesToRemove.filter(role => role !== roleToRemove));
  };

  const handleSubmit = async () => {
    if (!groupName || rolesToRemove.length === 0) {
      return;
    }

    try {
      await removeRolesFromGroup({
        variables: {
          groupName,
          input: {
            rolesToRemove,
          },
        },
      });
      
      // Limpiar formulario después de éxito
      setGroupName('');
      setRolesToRemove([]);
    } catch (error) {
      console.error('Error removing roles from group:', error);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Remover Roles de Grupo
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Nombre del Grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Ejemplo: group_rol_infraestructura"
          margin="normal"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Roles a Remover
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Nuevo Rol"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Ejemplo: pantalla__inventario_tic__lista_marcas__view"
            onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
          />
          <Button 
            variant="outlined" 
            onClick={handleAddRole}
            disabled={!newRole.trim()}
          >
            Agregar
          </Button>
        </Box>

        {rolesToRemove.length > 0 && (
          <List dense>
            {rolesToRemove.map((role, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRole(role)}
                  >
                    Remover
                  </Button>
                }
              >
                <ListItemText primary={role} />
              </ListItem>
            ))}
          </List>
        )}

        {rolesToRemove.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No hay roles para remover
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        color="error"
        onClick={handleSubmit}
        disabled={loading || !groupName || rolesToRemove.length === 0}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Removiendo...' : 'Remover Roles del Grupo'}
      </Button>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Ejemplos de roles:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <Chip 
            label="pantalla__inventario_tic__lista_marcas__view" 
            size="small" 
            variant="outlined"
            onClick={() => setNewRole('pantalla__inventario_tic__lista_marcas__view')}
          />
          <Chip 
            label="pantalla__inventario_tic__lista_marcas__create" 
            size="small" 
            variant="outlined"
            onClick={() => setNewRole('pantalla__inventario_tic__lista_marcas__create')}
          />
          <Chip 
            label="pantalla__inventario_tic__lista_marcas__enable" 
            size="small" 
            variant="outlined"
            onClick={() => setNewRole('pantalla__inventario_tic__lista_marcas__enable')}
          />
        </Box>
      </Box>
    </Card>
  );
} 