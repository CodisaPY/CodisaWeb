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

  const tienePermisoCrear = useMemo(
    () =>
      [
        ROLES.MARCA_INVENTARIO_TIC_CREATE,
        ROLES.MARCA_INVENTARIO_TIC_VIEW,
      ].some((r) => userRoles.includes(r)),
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
        // Modo edición - PUT
        const marcaData = {
          id: currentMarca.id,
          nombre: data.nombre,
        };

        const url = `${CONFIG.springServerUrl}/backend-linker/api/marcas/${currentMarca.id}`;
        console.log('PUT URL:', url);
        console.log('PUT Data:', marcaData);

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(marcaData),
        });

        if (response.ok) {
          toast.success('Marca actualizada exitosamente');
          router.push(paths.dashboard.tic.moduloInventario.listaMarcas);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al actualizar la marca');
        }
      } else {
        // Modo creación - POST
        const marcaData = {
          id: 1, // El endpoint requiere un id, usaremos 1 por defecto o generamos uno
          nombre: data.nombre,
        };

        const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/marcas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(marcaData),
        });

        if (response.ok) {
          toast.success('Marca creada exitosamente');
          reset();
          router.push(paths.dashboard.tic.moduloInventario.listaMarcas);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al crear la marca');
        }
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

        {tienePermisoCrear && (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
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