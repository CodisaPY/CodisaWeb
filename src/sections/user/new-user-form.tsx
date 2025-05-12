import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

type Sucursal = {
  name: string;
  description: string;
  composite: boolean;
  tipo: string;
  attributes: Record<string, any>;
  children?: Sucursal[];
};

type Cargo = {
  name: string;
  description: string;
};

type CreateUserResponse = {
  success: boolean;
  message: string;
  userId: string;
};

const NewUserSchema = zod.object({
  username: zod.string().min(1, 'El nombre de usuario es requerido'),
  email: zod.string().min(1, 'El email es requerido').email('Email inválido'),
  firstName: zod.string().min(1, 'El nombre es requerido'),
  lastName: zod.string().min(1, 'El apellido es requerido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  sucursal: zod.object({
    name: zod.string(),
    description: zod.string()
  }).nullable().refine((val) => val !== null, {
    message: 'La sucursal es requerida'
  }),
  cargo: zod.object({
    name: zod.string(),
    description: zod.string()
  }).nullable().refine((val) => val !== null, {
    message: 'El cargo es requerido'
  }),
});

type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

// ----------------------------------------------------------------------

export function NewUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const password = useBoolean();

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/keycloak/sucursales/tree');
        const data = await response.json();
        if (data.children) {
          setSucursales(data.children);
        }
      } catch (error) {
        console.error('Error al obtener sucursales:', error);
        toast.error('Error al cargar las sucursales');
      }
    };

    fetchSucursales();
  }, []);

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/keycloak/cargos/tree');
        const data = await response.json();

        // Función recursiva para extraer todos los cargos que comienzan con "cargo_"
        const extractCargos = (node: any): Cargo[] => {
          let cargosList: Cargo[] = [];
          if (node.tipo === 'cargo' && node.name.startsWith('cargo_')) {
            cargosList.push({ name: node.name, description: node.description });
          }
          if (Array.isArray(node.children)) {
            node.children.forEach((child: any) => {
              cargosList = cargosList.concat(extractCargos(child));
            });
          }
          return cargosList;
        };

        const cargosFiltrados = extractCargos(data);
        setCargos(cargosFiltrados);
      } catch (error) {
        console.error('Error al obtener cargos:', error);
        toast.error('Error al cargar los cargos');
      }
    };

    fetchCargos();
  }, []);

  const defaultValues: Partial<NewUserSchemaType> = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    sucursal: undefined,
    cargo: undefined,
  };

  const methods = useForm<NewUserSchemaType>({
    resolver: zodResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      const userData = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        sucursal: data.sucursal?.name,
        enabled: true,
        emailVerified: false,
        attributes: {
          cargo: [data.cargo?.name],
        },
      };

      const response = await fetch('http://localhost:4000/api/keycloak/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result: CreateUserResponse = await response.json();

      if (result.success) {
        toast.success('Usuario creado exitosamente');
        reset();
        router.push(paths.dashboard.seguridad.moduloUsuarios.listaUsuario);
      } else {
        toast.error(result.message || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <Field.Text
            name="username"
            label="Nombre de usuario"
            required
          />

          <Field.Text
            name="email"
            label="Email"
            required
          />

          <Field.Text
            name="firstName"
            label="Nombre"
            required
          />

          <Field.Text
            name="lastName"
            label="Apellido"
            required
          />

          <Field.Text
            name="password"
            label="Contraseña"
            type={password.value ? 'text' : 'password'}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Field.Autocomplete
            name="sucursal"
            label="Sucursal"
            options={sucursales}
            getOptionLabel={(option) => option.description}
            isOptionEqualToValue={(option, value) => option.name === value?.name}
            renderOption={(props, option) => (
              <li {...props}>
                {option.description}
              </li>
            )}
          />

          <Field.Autocomplete
            name="cargo"
            label="Cargo"
            options={cargos}
            getOptionLabel={(option) => option.description}
            isOptionEqualToValue={(option, value) => option.name === value?.name}
            renderOption={(props, option) => (
              <li {...props}>
                {option.description}
              </li>
            )}
          />
        </Box>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting || loading}
          disabled={!methods.formState.isValid}
          sx={{ ml: 'auto' }}
        >
          Crear Usuario
        </LoadingButton>
      </Card>
    </Form>
  );
} 