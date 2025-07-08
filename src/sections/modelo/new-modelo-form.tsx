import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type MarcaOption = {
  id: number;
  nombre: string;
};

type CreateModeloResponse = {
  success: boolean;
  message: string;
  modeloId: string;
};

const NewModeloSchema = zod.object({
  nombre: zod.string().min(1, 'El nombre del modelo es requerido'),
  marca: zod.object({
    id: zod.number(),
    nombre: zod.string(),
  }).nullable().refine((val) => val !== null, {
    message: 'La marca es requerida'
  }),
});

type NewModeloSchemaType = zod.infer<typeof NewModeloSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentModelo?: {
    id: number;
    nombre: string;
    marcaId: number;
    marcaNombre: string;
  };
};

export function NewModeloForm({ currentModelo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<MarcaOption[]>([]);

  const tienePermisoCrear = useMemo(
    () =>
      [
        ROLES.MODELO_INVENTARIO_TIC_CREATE,
        ROLES.MODELO_INVENTARIO_TIC_VIEW,
      ].some((r) => userRoles.includes(r)),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  // Cargar marcas para el select
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/marcas`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMarcas(data);
        } else {
          toast.error('Error al cargar las marcas');
        }
      } catch (error) {
        console.error('Error fetching marcas:', error);
        toast.error('Error al cargar las marcas');
      }
    };

    fetchMarcas();
  }, []);

  const defaultValues: Partial<NewModeloSchemaType> = {
    nombre: currentModelo?.nombre || '',
    marca: currentModelo ? {
      id: currentModelo.marcaId,
      nombre: currentModelo.marcaNombre
    } : undefined,
  };

  const methods = useForm<NewModeloSchemaType>({
    resolver: zodResolver(NewModeloSchema),
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
      
      const isEdit = !!currentModelo;
      
      if (isEdit) {
        // Modo edición - PUT
        const modeloData = {
          id: currentModelo.id,
          nombre: data.nombre,
          marcaId: data.marca!.id,
        };

        const url = `${CONFIG.springServerUrl}/backend-linker/api/modelos/${currentModelo.id}`;
        console.log('PUT URL:', url);
        console.log('PUT Data:', modeloData);

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(modeloData),
        });

        if (response.ok) {
          toast.success('Modelo actualizado exitosamente');
          router.push(paths.dashboard.tic.moduloInventario.listaModelos);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al actualizar el modelo');
        }
      } else {
        // Modo creación - POST
        const modeloData = {
          id: 1, // El endpoint puede requerir un id
          nombre: data.nombre,
          marcaId: data.marca!.id,
        };

        const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/modelos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(modeloData),
        });

        if (response.ok) {
          toast.success('Modelo creado exitosamente');
          reset();
          router.push(paths.dashboard.tic.moduloInventario.listaModelos);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al crear el modelo');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(currentModelo ? 'Error al actualizar el modelo' : 'Error al crear el modelo');
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
            name="nombre"
            label="Nombre del modelo"
            placeholder="Ejemplo: Galaxy S24, MacBook Pro..."
            required
            helperText="Ingrese el nombre del modelo del equipo"
          />

          <Field.Autocomplete
            name="marca"
            label="Marca"
            options={marcas}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderOption={(props, option) => (
              <li {...props}>
                {option.nombre}
              </li>
            )}
            placeholder="Seleccione una marca"
            helperText="Seleccione la marca del modelo"
          />
        </Box>

        {tienePermisoCrear && (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
            disabled={!methods.formState.isValid}
            sx={{ ml: 'auto' }}
          >
            {currentModelo ? 'Actualizar Modelo' : 'Crear Modelo'}
          </LoadingButton>
        )}
      </Card>
    </Form>
  );
} 