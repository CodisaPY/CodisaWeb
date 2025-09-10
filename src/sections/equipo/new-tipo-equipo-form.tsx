import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, Container, Stack, Button, TextField, Typography } from '@mui/material';

import { z as zod } from 'zod';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CREAR_TIPO_EQUIPO_MUTATION, UPDATE_TIPO_EQUIPO_MUTATION } from 'src/graphql/mutations/tipos-equipo';

import type { TipoEquipoItem } from './tipo-equipo-table-row';

const FormSchema = zod.object({
  nombre: zod.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
});

type FormDataProps = zod.infer<typeof FormSchema>;

type Props = {
  isEdit?: boolean;
  currentTipoEquipo?: TipoEquipoItem;
};

export function NewTipoEquipoForm({ isEdit = false, currentTipoEquipo }: Props) {
  const router = useRouter();

  // Mutation GraphQL para crear tipo de equipo
  const [crearTipoEquipo, { loading: mutationLoading, error: mutationError }] = useMutation(CREAR_TIPO_EQUIPO_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Mutation CREATE_TIPO_EQUIPO ejecutada exitosamente:', data);
      toast.success('Tipo de equipo creado correctamente');
      router.push(paths.dashboard.tic.moduloInventario.listaTiposEquipo);
    },
    onError: (error) => {
      console.error('❌ Error en mutation CREATE_TIPO_EQUIPO:', error);
      toast.error(error.message || 'Error al crear el tipo de equipo');
    },
    refetchQueries: ['TiposEquipo'],
  });

  // Mutation GraphQL para actualizar tipo de equipo
  const [updateTipoEquipo, { loading: updateMutationLoading, error: updateMutationError }] = useMutation(UPDATE_TIPO_EQUIPO_MUTATION, {
    onCompleted: (data) => {
      console.log('✅ Mutation UPDATE_TIPO_EQUIPO ejecutada exitosamente:', data);
      toast.success('Tipo de equipo actualizado correctamente');
      router.push(paths.dashboard.tic.moduloInventario.listaTiposEquipo);
    },
    onError: (error) => {
      console.error('❌ Error en mutation UPDATE_TIPO_EQUIPO:', error);
      toast.error(error.message || 'Error al actualizar el tipo de equipo');
    },
    refetchQueries: ['TiposEquipo'],
  });

  const defaultValues: FormDataProps = useMemo(() => ({
    nombre: currentTipoEquipo?.nombre || '',
  }), [currentTipoEquipo?.nombre]);

  const methods = useForm<FormDataProps>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentTipoEquipo) {
      reset(defaultValues);
    }
  }, [isEdit, currentTipoEquipo, reset, defaultValues]);

  const onSubmit = useCallback(
    async (data: FormDataProps) => {
      try {
        if (isEdit) {
          // Modo edición - GraphQL
          console.log('Actualizando tipo de equipo con GraphQL:', data);
          
          await updateTipoEquipo({
            variables: {
              updateTipoEquipoId: currentTipoEquipo!.id,
              input: {
                nombre: data.nombre,
              }
            }
          });
        } else {
          // Modo creación - GraphQL
          console.log('Creando tipo de equipo con GraphQL:', data);
          
          await crearTipoEquipo({
            variables: {
              input: {
                nombre: data.nombre,
              }
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(
          isEdit 
            ? 'Error al actualizar el tipo de equipo' 
            : 'Error al crear el tipo de equipo'
        );
      }
    },
    [isEdit, currentTipoEquipo, crearTipoEquipo, updateTipoEquipo]
  );

  const handleCancel = useCallback(() => {
    router.push(paths.dashboard.tic.moduloInventario.listaTiposEquipo);
  }, [router]);

  return (
    <DashboardContent>
      <Container maxWidth="md">
        <CustomBreadcrumbs
          heading={isEdit ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo'}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'TIC', href: paths.dashboard.tic.root },
            { name: 'Inventario', href: paths.dashboard.tic.moduloInventario.root },
            { name: 'Tipos de Equipo', href: paths.dashboard.tic.moduloInventario.listaTiposEquipo },
            { name: isEdit ? 'Editar' : 'Nuevo' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Información del Tipo de Equipo
              </Typography>

              <Controller
                name="nombre"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre"
                    placeholder="Ej: Laptop, Desktop, Tablet..."
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || mutationLoading || updateMutationLoading}
                >
                  {isEdit ? 'Actualizar' : 'Crear'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Container>
    </DashboardContent>
  );
} 