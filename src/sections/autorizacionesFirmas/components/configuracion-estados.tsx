import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,FormControl,Select, InputLabel,MenuItem
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import ListSubheader from '@mui/material/ListSubheader';

import { Iconify } from 'src/components/iconify';
 
type Estado = {
  id: number;
  descripcion: string;
  pantallaId: string;
  orden: number;
  codigoEstado: string;
  requiereFirma: string;
  tipoAutorizacion: string;
  cuerpoTemplate: string;
  enviarCorreo: string;
  tipoDestino:number;
  descripcionTipoDestino:String
};

type Props = {
  pantallaId: string;
};
  
type CargoOGrupo = {
  name: string;
  description: string;
};
// Objeto con nombre y correo
type UsuarioCorreo = {
  username?: string; // 👈 ahora es opcional
  email: string;
  firstName: string;
  lastName: string;
};

export function ConfiguracionEstadosPorPantalla({ pantallaId }: Props) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<Estado | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [checkedEnviarCorreo, setCheckedEnviarCorreo] = useState(false);

  const [tiposDestino, setTiposDestino] = useState<{ id: number; codigo: string; descripcion: string }[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
// Hook dentro de tu componente
const [cargos, setCargos] = useState<CargoOGrupo[]>([]);
const [gruposCargos, setGruposCargos] = useState<CargoOGrupo[]>([]);
const [tipoDestinoSeleccionado, setTipoDestinoSeleccionado] = useState<number | ''>('');

const [destinoSeleccionado, setDestinoSeleccionado] = useState<string | string[]>('');
const [usuariosSugeridos, setUsuariosSugeridos] = useState<UsuarioCorreo[]>([]);

useEffect(() => {
  axios
    .get('http://localhost:4000/api/keycloak/usuarios-por-roles?roles=cargos_todos')
    .then((res) => setUsuariosSugeridos(res.data))
    .catch((err) => console.error('Error al obtener usuarios:', err));
}, []);

useEffect(() => {
  const obtenerCargosYGrupos = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/keycloak/cargos/tree');
      const data = res.data;

      const extraerNodos = (nodo: any): CargoOGrupo[] => {
        const resultados: CargoOGrupo[] = [];

        if (nodo.name?.startsWith('cargo_') || nodo.name?.startsWith('cargos_')) {
          resultados.push({
            name: nodo.name,
            description: nodo.description,
          });
        }

        if (nodo.children) {
          nodo.children.forEach((child: any) => {
            resultados.push(...extraerNodos(child));
          });
        }

        return resultados;
      };

      const todos = extraerNodos(data);
      const soloCargos = todos.filter((n) => n.name.startsWith('cargo_'));
      const soloGrupos = todos.filter((n) => n.name.startsWith('cargos_'));

      setCargos(soloCargos);
      setGruposCargos(soloGrupos);
    } catch (error) {
      console.error('Error al obtener los cargos y grupos:', error);
    }
  };

  obtenerCargosYGrupos();
}, []);


useEffect(() => {
  axios
    .get(`http://192.168.0.198:9003/backend-linker/api/firma-autorizacion?pantallaId=${pantallaId}`, {
      params: {  },
    })
    .then((res) => {
      console.log('Datos de firma-autorizacion:', res.data); // 👈 log acá
      setEstados(res.data);
    })
    .catch((err) => console.error('Error al obtener estados:', err));
}, [pantallaId]);


  useEffect(() => {
    axios
      .get('http://192.168.0.198:9003/backend-linker/api/tipos-autorizacion-firma')
      .then((res) => setTiposDestino(res.data))
      .catch((err) => console.error('Error al obtener tipos de destino:', err));
  }, []);

  
  const abrirModal = (estado: Estado) => {
    setEstadoSeleccionado(estado);
    setTipoSeleccionado(estado.tipoDestino?.toString() || '');
    setCheckedEnviarCorreo(estado.enviarCorreo === 'S');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEstadoSeleccionado(null);
  };
// Función para generar color aleatorio
const getRandomColor = () => {
  const colors = [
    '#FF5722', '#3F51B5', '#009688', '#9C27B0',
    '#E91E63', '#4CAF50', '#FFC107', '#795548',
    '#607D8B', '#00BCD4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

  return (
    <Card>
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {estados.map((estado) => (
            <Card key={estado.id} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {estado.descripcion}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}> <strong>Orden:</strong>  {estado.orden}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Tipo de autorización:</strong> {estado.tipoAutorizacion || '—'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Requiere firma:</strong>  {estado.requiereFirma === 'S' ? 'Sí' : 'No'}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => abrirModal(estado)}>
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>

      <Dialog open={modalAbierto} onClose={cerrarModal} fullWidth maxWidth="sm">
      <DialogTitle>Configurar autorización de firmas</DialogTitle>
<DialogContent>
  <Box mb={2}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      ¿Requiere firma?
    </Typography>
    <Checkbox
      checked={estadoSeleccionado?.requiereFirma === 'S'}
      onChange={(e) => {
        const nuevoValor = e.target.checked ? 'S' : 'N';
        setEstadoSeleccionado((prev) =>
          prev ? { ...prev, requiereFirma: nuevoValor } : prev
        );
      }}
    />
  </Box>

  {estadoSeleccionado?.requiereFirma === 'S' && (
    <>
      <TextField
        select
        fullWidth
        margin="normal"
        label="Tipo de autorización"
        value={tipoDestinoSeleccionado}
        onChange={(e) => setTipoDestinoSeleccionado(Number(e.target.value))}
        SelectProps={{ native: true }}
      >
        <option value=""> </option>
        {tiposDestino.map((tipo) => (
          <option key={tipo.id} value={tipo.id}>
            {tipo.descripcion}
          </option>
        ))}
      </TextField>

      {/* SELECT SEGÚN TIPO DESTINO */}
      {tipoDestinoSeleccionado === 2 && (
        <TextField
          select
          fullWidth
          margin="normal"
          label="Cargo"
          value={destinoSeleccionado}
          onChange={(e) => setDestinoSeleccionado(e.target.value)}
          SelectProps={{ native: true }}
        >
          <option value=""> </option>
          {cargos.map((c) => (
            <option key={c.name} value={c.name}>
              {c.description}
            </option>
          ))}
        </TextField>
      )}

      {tipoDestinoSeleccionado === 3 && (
        <TextField
          select
          fullWidth
          margin="normal"
          label="Grupo de cargos"
          value={destinoSeleccionado}
          onChange={(e) => setDestinoSeleccionado(e.target.value)}
          SelectProps={{ native: true }}
        >
          <option value=""> </option>
          {gruposCargos.map((g) => (
            <option key={g.name} value={g.name}>
              {g.description}
            </option>
          ))}
        </TextField>
      )}

{tipoDestinoSeleccionado === 1 && (
  <Autocomplete
    multiple
    freeSolo
    options={usuariosSugeridos}
    getOptionLabel={(option) =>
      typeof option === 'string' ? option : `${option.firstName} ${option.lastName}`
    }
    value={
      Array.isArray(destinoSeleccionado)
        ? usuariosSugeridos.filter((u) => destinoSeleccionado.includes(u.email))
        : []
 
    
    }
    onChange={(event, newValue) => {
      const correos = newValue.map((val: any) =>
        typeof val === 'string' ? val : val.email
      );
      setDestinoSeleccionado(correos);
    }}
    renderInput={(params) => (
      <TextField {...params} label="Usuarios" margin="normal" />
    )}
    renderOption={(props, option) => (
      <li {...props}>
        <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ width: 30, height: 30, bgcolor: getRandomColor(), fontSize: 12 }}>
        {
  (option.firstName && option.lastName)
    ? `${option.firstName[0].toUpperCase()}${option.lastName[0].toUpperCase()}`
    : option.email[0].toUpperCase()
}          </Avatar>
          <Box>
            <Typography variant="body2">{option.firstName} {option.lastName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email}
            </Typography>
          </Box>
        </Box>
      </li>
    )}
    ListboxProps={{
      style: { maxHeight: 300 },
    }}
    renderGroup={(params) => (
      <li key={params.key}>
<ListSubheader>Contactos sugeridos</ListSubheader>
        {params.children}
      </li>
    )}
    
  />
)}
 
    </>
  )}
</DialogContent>
<DialogActions>
    <Button onClick={cerrarModal}>Cancelar</Button>
    <Button variant="contained" onClick={cerrarModal}>Guardar</Button>
  </DialogActions>
  </Dialog>
    </Card>
  );
}
