import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { SalaReunion, SalaReunionInput } from 'src/types/sala';
import { CREATE_SALA_MUTATION, UPDATE_SALA_MUTATION } from 'src/graphql/mutations/salas';
import { GET_ALL_SALAS_QUERY } from 'src/graphql/queries/salas';

// ----------------------------------------------------------------------

const salaSchema = zod.object({
  nombre: zod.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  color: zod.string().min(1, 'El color es requerido'),
});

type SalaSchemaType = zod.infer<typeof salaSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentSala?: SalaReunion;
};

export function SalaForm({ currentSala }: Props) {
  const router = useRouter();
  const isEdit = !!currentSala;

  const [createSala, { loading: createLoading }] = useMutation(CREATE_SALA_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Sala creada exitosamente:', data);
      toast.success('Sala creada exitosamente');
      router.push(paths.dashboard.salaReserva.moduloReferenciales.listaSalas);
    },
    onError: (error) => {
      console.error('❌ Error al crear sala:', error);
      toast.error('Error al crear la sala');
    },
    refetchQueries: [{ query: GET_ALL_SALAS_QUERY }],
    awaitRefetchQueries: true,
    update: (cache, { data }) => {
      if (data?.createSalaReunion) {
        try {
          const existingData = cache.readQuery({ query: GET_ALL_SALAS_QUERY }) as any;
          if (existingData?.getAllSalasReuniones) {
            cache.writeQuery({
              query: GET_ALL_SALAS_QUERY,
              data: {
                getAllSalasReuniones: [...existingData.getAllSalasReuniones, data.createSalaReunion],
              },
            });
          }
        } catch (error) {
          console.log('Cache update failed, will refetch:', error);
        }
      }
    },
  });

  const [updateSala, { loading: updateLoading }] = useMutation(UPDATE_SALA_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Sala actualizada exitosamente:', data);
      toast.success('Sala actualizada exitosamente');
      router.push(paths.dashboard.salaReserva.moduloReferenciales.listaSalas);
    },
    onError: (error) => {
      console.error('❌ Error al actualizar sala:', error);
      toast.error('Error al actualizar la sala');
    },
    refetchQueries: [{ query: GET_ALL_SALAS_QUERY }],
    awaitRefetchQueries: true,
    update: (cache, { data }) => {
      if (data?.updateSalaReunion) {
        try {
          const existingData = cache.readQuery({ query: GET_ALL_SALAS_QUERY }) as any;
          if (existingData?.getAllSalasReuniones) {
            const updatedSalas = existingData.getAllSalasReuniones.map((sala: SalaReunion) =>
              sala.idSala === data.updateSalaReunion.idSala ? data.updateSalaReunion : sala
            );
            cache.writeQuery({
              query: GET_ALL_SALAS_QUERY,
              data: {
                getAllSalasReuniones: updatedSalas,
              },
            });
          }
        } catch (error) {
          console.log('Cache update failed, will refetch:', error);
        }
      }
    },
  });

  const defaultValues: SalaSchemaType = {
    nombre: currentSala?.nombre || '',
    color: currentSala?.color || '#1976d2',
  };

  const methods = useForm<SalaSchemaType>({
    resolver: zodResolver(salaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data: SalaSchemaType) => {
    try {
      const salaInput: SalaReunionInput = {
        nombre: data.nombre.trim(),
        color: data.color,
        estado: isEdit ? currentSala?.estado || 'A' : 'A',
      };

      console.log('📝 Datos de la sala:', salaInput);

      if (isEdit) {
        await updateSala({
          variables: {
            idSala: currentSala.idSala,
            input: salaInput,
          },
        });
      } else {
        await createSala({
          variables: {
            input: salaInput,
          },
        });
      }
    } catch (error) {
      console.error('Error en el submit:', error);
      toast.error(isEdit ? 'Error al actualizar la sala' : 'Error al crear la sala');
    }
  });

  const handleCancel = () => {
    router.push(paths.dashboard.salaReserva.moduloReferenciales.listaSalas);
  };

  const loading = createLoading || updateLoading || isSubmitting;

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {isEdit ? 'Editar Sala' : 'Nueva Sala'}
        </Typography>

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
            label="Nombre de la Sala *"
            placeholder="Ej: Sala de Conferencias A"
            helperText="Ingrese el nombre descriptivo de la sala"
            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
          />

          <Field.Text
            name="color"
            label="Color de la Sala *"
            type="color"
            helperText="Seleccione un color para identificar la sala"
            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={loading}
          >
            {isEdit ? 'Actualizar Sala' : 'Crear Sala'}
          </LoadingButton>
        </Box>
      </Card>
    </Form>
  );
}
