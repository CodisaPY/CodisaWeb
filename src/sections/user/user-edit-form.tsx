import axios from 'axios';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

const EditUserSchema = zod.object({
  email: zod.string().email({ message: 'Email inválido' }),
  firstName: zod.string().min(1, { message: 'Nombre requerido' }),
  lastName: zod.string().min(1, { message: 'Apellido requerido' }),
  sucursal: zod.object({ name: zod.string(), description: zod.string() }),
  cargo: zod.object({ name: zod.string(), description: zod.string() }),
});

export type EditUserSchemaType = zod.infer<typeof EditUserSchema>;

type Sucursal = { name: string; description: string; };
type Cargo = { name: string; description: string; };

type Props = {
  initialValues: EditUserSchemaType;
  userId: string;
  onSuccess?: () => void;
};

export default function UserEditForm({ initialValues, userId, onSuccess }: Props) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const router = useRouter();

  const methods = useForm<EditUserSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(EditUserSchema),
    defaultValues: initialValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (sucursales.length && cargos.length && initialValues) {
      const sucursalSeleccionada = sucursales.find(
        (s) => s.name === (typeof initialValues.sucursal === 'string' ? initialValues.sucursal : initialValues.sucursal.name)
      );
      const cargoSeleccionado = cargos.find(
        (c) => c.name === (typeof initialValues.cargo === 'string' ? initialValues.cargo : initialValues.cargo.name)
      );
      reset({
        ...initialValues,
        sucursal: sucursalSeleccionada || undefined,
        cargo: cargoSeleccionado || undefined,
      });
    }
  }, [sucursales, cargos, initialValues, reset]);

  useEffect(() => {
    fetch(`${CONFIG.serverUrl}/api/keycloak/sucursales/tree`)
      .then(res => res.json())
      .then(data => setSucursales(data.children || []));
  }, []);

  useEffect(() => {
    fetch(`${CONFIG.serverUrl}/api/keycloak/cargos/tree`)
      .then(res => res.json())
      .then(data => {
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
        setCargos(extractCargos(data));
      });
  }, []);

  useEffect(() => {
    reset(initialValues);
    console.log('Objeto recibido en el formulario de edición:', initialValues);
  }, [initialValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.put(`${CONFIG.serverUrl}/api/keycloak/user/${userId}`, {
        ...data,
        firstName: data.firstName,
        lastName: data.lastName,
        sucursal: data.sucursal.name,
        cargo: data.cargo.name,
      });
      router.push(paths.dashboard.seguridad.moduloUsuarios.listaUsuario);

      toast.success('Usuario actualizado correctamente');
      if (onSuccess) onSuccess();

    } catch (error) {
      toast.error('Error al actualizar el usuario');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            >
              <Field.Text name="email" label="Email" />
              <Field.Text name="firstName" label="Nombre" />
              <Field.Text name="lastName" label="Apellido" />
              <Field.Autocomplete
                name="sucursal"
                label="Sucursal"
                options={sucursales}
                getOptionLabel={(option) => option.description}
                isOptionEqualToValue={(option, value) => option.name === value?.name}
                renderOption={(props, option) => (
                  <li {...props}>{option.description}</li>
                )}
              />
              <Field.Autocomplete
                name="cargo"
                label="Cargo"
                options={cargos}
                getOptionLabel={(option) => option.description}
                isOptionEqualToValue={(option, value) => option.name === value?.name}
                renderOption={(props, option) => (
                  <li {...props}>{option.description}</li>
                )}
              />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Guardar cambios
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
} 