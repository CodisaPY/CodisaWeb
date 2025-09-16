import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@apollo/client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { MARCAS_QUERY } from 'src/graphql/queries/marcas';
import { CREAR_MODELO_MUTATION, UPDATE_MODELO_MUTATION } from 'src/graphql/mutations/modelos';

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

  // Query GraphQL para obtener marcas
  const { data: marcasData, loading: marcasLoading, error: marcasError } = useQuery(MARCAS_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('✅ Query MARCAS ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query MARCAS:', error);
    }
  });

  // Mutation GraphQL para crear modelos
  const [crearModelo, { loading: mutationLoading, error: mutationError }] = useMutation(CREAR_MODELO_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Mutation CREATE_MODELO ejecutada exitosamente:', data);
      toast.success('Modelo creado exitosamente');
      router.push(paths.dashboard.tic.moduloInventario.listaModelos);
    },
    onError: (error) => {
      console.error('❌ Error en mutation CREATE_MODELO:', error);
      toast.error(error.message || 'Error al crear el modelo');
    },
    refetchQueries: ['Modelos'],
  });

  // Mutation GraphQL para actualizar modelos
  const [updateModelo, { loading: updateMutationLoading, error: updateMutationError }] = useMutation(UPDATE_MODELO_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Mutation UPDATE_MODELO ejecutada exitosamente:', data);
      toast.success('Modelo actualizado exitosamente');
      router.push(paths.dashboard.tic.moduloInventario.listaModelos);
    },
    onError: (error) => {
      console.error('❌ Error en mutation UPDATE_MODELO:', error);
      toast.error(error.message || 'Error al actualizar el modelo');
    },
    refetchQueries: ['Modelos'],
  });

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

  // Procesar datos de marcas desde GraphQL
  const marcas = useMemo(() => marcasData?.marcas || [], [marcasData?.marcas]);

  // Manejar errores de GraphQL
  useEffect(() => {
    if (marcasError) {
      console.error('Error fetching marcas:', marcasError);
      toast.error('Error al cargar las marcas');
    }
  }, [marcasError]);

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
        // Modo edición - GraphQL
        console.log('Actualizando modelo con GraphQL:', data);
        
        await updateModelo({
          variables: {
            updateModeloId: currentModelo.id,
            input: {
              nombre: data.nombre,
              marcaId: data.marca!.id,
            }
          }
        });
      } else {
        // Modo creación - GraphQL
        console.log('Creando modelo con GraphQL:', data);
        
        await crearModelo({
          variables: {
            input: {
              nombre: data.nombre,
              marcaId: data.marca!.id,
            }
          }
        });
        
        // Reset del formulario después de crear exitosamente
        reset();
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
            loading={isSubmitting || loading || marcasLoading || mutationLoading || updateMutationLoading}
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