import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { CREAR_MARCA_MUTATION, UPDATE_MARCA_MUTATION } from 'src/graphql/mutations/marcas';

// ----------------------------------------------------------------------

type CreateMarcaResponse = {
  success: boolean;
  message: string;
  marcaId: string;
};

const NewMarcaSchema = zod.object({
  nombre: zod.string().min(1, 'El nombre de la marca es requerido'),
});

type NewMarcaSchemaType = zod.infer<typeof NewMarcaSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentMarca?: {
    id: number;
    nombre: string;
  };
};

export function NewMarcaForm({ currentMarca }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Mutation GraphQL para crear marcas
  const [crearMarca, { loading: mutationLoading, error: mutationError }] = useMutation(CREAR_MARCA_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Mutation CREATE_MARCA ejecutada exitosamente:', data);
      toast.success('Marca creada exitosamente');
      router.push(paths.dashboard.tic.moduloInventario.listaMarcas);
    },
    onError: (error) => {
      console.error('❌ Error en mutation CREATE_MARCA:', error);
      toast.error(error.message || 'Error al crear la marca');
    },
    refetchQueries: ['Marcas'],
    update: (cache, { data: mutationData }) => {
      if (mutationData?.createMarca) {
        // Invalidar la caché de marcas
        cache.evict({ fieldName: 'marcas' });
        cache.gc();
      }
    },
  });

  // Mutation GraphQL para actualizar marcas
  const [updateMarca, { loading: updateMutationLoading, error: updateMutationError }] = useMutation(UPDATE_MARCA_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Mutation UPDATE_MARCA ejecutada exitosamente:', data);
      toast.success('Marca actualizada exitosamente');
      router.push(paths.dashboard.tic.moduloInventario.listaMarcas);
    },
    onError: (error) => {
      console.error('❌ Error en mutation UPDATE_MARCA:', error);
      toast.error(error.message || 'Error al actualizar la marca');
    },
    refetchQueries: ['Marcas'],
    update: (cache, { data: mutationData }) => {
      if (mutationData?.updateMarca) {
        // Invalidar la caché de marcas
        cache.evict({ fieldName: 'marcas' });
        cache.gc();
      }
    },
  });

  const tienePermisoCrear = useMemo(
    () =>
      [
        ROLES.MARCA_INVENTARIO_TIC_CREATE,
        ROLES.MARCA_INVENTARIO_TIC_VIEW,
      ].some((r) => userRoles.includes(r)),
    [userRoles]
  );

  const tienePermisoEditar = useMemo(
    () => userRoles.includes(ROLES.LISTA_MARCAS_INVENTARIO_TIC_UPDATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  const defaultValues: Partial<NewMarcaSchemaType> = {
    nombre: currentMarca?.nombre || '',
  };

  const methods = useForm<NewMarcaSchemaType>({
    resolver: zodResolver(NewMarcaSchema),
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
      
      const isEdit = !!currentMarca;
      
      if (isEdit) {
        // Modo edición - GraphQL
        console.log('Actualizando marca con GraphQL:', data);
        
        await updateMarca({
          variables: {
            updateMarcaId: currentMarca.id,
            input: {
              nombre: data.nombre,
            }
          }
        });
      } else {
        // Modo creación - GraphQL
        console.log('Creando marca con GraphQL:', data);
        
        await crearMarca({
          variables: {
            input: {
              nombre: data.nombre,
            }
          }
        });
        
        // Reset del formulario después de crear exitosamente
        reset();
      }
    } catch (error) {
      console.error(error);
      toast.error(currentMarca ? 'Error al actualizar la marca' : 'Error al crear la marca');
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
            sm: 'repeat(1, 1fr)',
          }}
        >
          <Field.Text
            name="nombre"
            label="Nombre de la marca"
            placeholder="Ejemplo: Samsung, Apple, LG..."
            required
            helperText="Ingrese el nombre de la marca del equipo"
          />
        </Box>

        {(tienePermisoCrear || (currentMarca && tienePermisoEditar)) && (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading || mutationLoading || updateMutationLoading}
            disabled={!methods.formState.isValid}
            sx={{ ml: 'auto' }}
          >
            {currentMarca ? 'Actualizar Marca' : 'Crear Marca'}
          </LoadingButton>
        )}
      </Card>
    </Form>
  );
} 