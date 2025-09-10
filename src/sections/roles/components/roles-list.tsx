import React from 'react';

import { Box, Card, Typography, List, ListItem, ListItemText, Chip, CircularProgress, Alert } from '@mui/material';

import { useGetRoles } from '../hooks/use-get-roles';

export function RolesList() {
  const { roles, loading, error } = useGetRoles();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Lista de Roles ({roles.length})
      </Typography>
      
      <List>
        {roles.map((role) => (
          <ListItem key={role.id} divider>
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
  );
} 