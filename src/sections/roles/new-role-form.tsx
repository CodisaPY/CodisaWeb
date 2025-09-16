import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRolesFromToken } from '@guard/role-utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useCreateRole } from 'src/hooks/use-graphql-roles';

// ----------------------------------------------------------------------

const NewRoleSchema = zod.object({
  name: zod.string().min(1, 'El ID del rol es requerido'),
  description: zod.string().min(1, 'La descripción del rol es requerida'),
});

type NewRoleSchemaType = zod.infer<typeof NewRoleSchema>;

// ----------------------------------------------------------------------

export function NewRoleForm() {
  const router = useRouter();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const { createRole, loading } = useCreateRole();

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.GENERACION_NUEVO_ROL_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  const methods = useForm<NewRoleSchemaType>({
    resolver: zodResolver(NewRoleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createRole({
        variables: {
          input: {
            name: data.name,
            description: data.description,
            attributes: {
              name: [data.description]
            }
          },
        },
      });
      
      reset();
      router.push(paths.dashboard.seguridad.moduloRoles.listaRol);
    } catch (createError) {
      console.error('Error creating role:', createError);
      // El error ya se maneja en el hook useCreateRole
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
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
            name="name"
            label="ID del rol"
            placeholder="Ejemplo: admin_sistema"
            required
            helperText="Ingrese el identificador único del rol (sin espacios ni caracteres especiales)"
          />

          <Field.Text
            name="description"
            label="Descripción del rol"
            placeholder="Ejemplo: Administrador del sistema"
            required
            helperText="Ingrese una descripción clara del rol"
          />
        </Box>

        {tienePermisoCrear && (
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting || loading}
              disabled={!methods.formState.isValid}
            >
              Registrar
            </LoadingButton>
          </Stack>
        )}
      </Card>
    </Form>
  );
} 