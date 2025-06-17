import { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { ArbolModulos } from './components/arbol-modulos';
import { ConfiguracionEstadosPorPantalla } from './components/configuracion-estados';

   
export function ConfiguracionAutorizacionesFirmasForm() {
  const [pantallaSeleccionada, setPantallaSeleccionada] = useState<string | null>(null);

  return (
    <Box display="flex" gap={4}>
      <Box width="30%">
 
        <ArbolModulos
        onSelectPantalla={(pantalla) => {
          const pantallaId = pantalla.attributes?.pantalla_id?.[0];
          if (pantallaId) {
            setPantallaSeleccionada(pantallaId);
          }
        }}
      />
      </Box>

      <Box flexGrow={1}>
        {pantallaSeleccionada ? (
          <ConfiguracionEstadosPorPantalla pantallaId ={pantallaSeleccionada} />
        ) : (
          <Typography variant="body2">  </Typography>
        )}
      </Box>
    </Box>
  );
}
