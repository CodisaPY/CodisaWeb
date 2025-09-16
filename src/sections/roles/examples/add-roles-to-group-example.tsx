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
import { useAddRolesToGroup } from 'src/hooks/use-graphql-roles';

export function AddRolesToGroupExample() {
  const [groupName, setGroupName] = useState('');
  const [rolesToAdd, setRolesToAdd] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const { addRolesToGroup, loading } = useAddRolesToGroup();

  const handleAddRole = () => {
    if (newRole.trim() && !rolesToAdd.includes(newRole.trim())) {
      setRolesToAdd([...rolesToAdd, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRolesToAdd(rolesToAdd.filter(role => role !== roleToRemove));
  };

  const handleSubmit = async () => {
    if (!groupName || rolesToAdd.length === 0) {
      return;
    }

    try {
      await addRolesToGroup({
        variables: {
          groupName,
          roles: rolesToAdd,
        },
      });
      
      // Limpiar formulario después de éxito
      setGroupName('');
      setRolesToAdd([]);
    } catch (error) {
      console.error('Error adding roles to group:', error);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Agregar Roles a Grupo
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
          Roles a Agregar
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

        {rolesToAdd.length > 0 && (
          <List dense>
            {rolesToAdd.map((role, index) => (
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

        {rolesToAdd.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No hay roles agregados
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !groupName || rolesToAdd.length === 0}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Agregando...' : 'Agregar Roles al Grupo'}
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