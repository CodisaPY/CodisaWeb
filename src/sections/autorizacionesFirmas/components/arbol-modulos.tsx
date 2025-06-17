import axios from 'axios';
import { useState, useEffect } from 'react';

import {
  Box,
  List,
  Divider,
  Collapse,
  Typography,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { CONFIG } from 'src/config-global';

type ModuloNode = {
  name: string;
  description: string;
  tipo: 'grupo' | 'pantalla';
  composite: boolean;
  children?: ModuloNode[];
  attributes: {
    nombre: string;
    pantalla_id?: string;
  };
};

type Props = {
  onSelectPantalla: (pantalla: ModuloNode) => void;
};

const filtrarSoloPantallasView = (node: ModuloNode): ModuloNode | null => {
  if (node.tipo === 'pantalla') {
    return node.name.endsWith('__view') ? node : null;
  }

  if (node.children) {
    const hijosFiltrados = node.children
      .map(filtrarSoloPantallasView)
      .filter((n): n is ModuloNode => n !== null);

    if (hijosFiltrados.length > 0) {
      return {
        ...node,
        children: hijosFiltrados,
      };
    }
  }

  return null;
};

export function ArbolModulos({ onSelectPantalla }: Props) {
  const [treeData, setTreeData] = useState<ModuloNode | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    axios
      .get(`${CONFIG.serverUrl}/api/keycloak/modulos/tree`)
      .then((res) => {
        const filtrado = filtrarSoloPantallasView(res.data);
        setTreeData(filtrado);
      })
      .catch((err) => console.error('Error al cargar árbol de módulos', err));
  }, []);

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
  

  const renderTree = (node: ModuloNode, nivel = 0): JSX.Element => {
    const isPantalla = node.tipo === 'pantalla';
    const isExpanded = expandedItems.has(node.name);
    const hasChildren = node.children?.length;

    return (
      <Box key={node.name} ml={nivel * 2}>
        <ListItemButton
          onClick={() =>
            isPantalla ? onSelectPantalla(node) : hasChildren && toggleExpand(node.name)
          }
          sx={{
            borderRadius: 1,
            bgcolor: isPantalla ? 'transparent' : 'action.hover',
            mb: 0.5,
          }}
        >
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={isPantalla ? 'normal' : 'bold'}>
                  {node.attributes.nombre}
                </Typography>
                {hasChildren && <span>{isExpanded ? '▾' : '▸'}</span>}
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
        overflow: 'auto',
        borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.default,
        px: 2,
        pt: 2,
      }}
    >
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
  Pantallas del sistema
</Typography>

      <Divider sx={{ mb: 2 }} />
      <List dense>{treeData ? renderTree(treeData) : <Typography>Cargando árbol...</Typography>}</List>
    </Box>
  );
}
