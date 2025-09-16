import type { IUserItem } from 'src/types/user';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRolesFromToken } from '@guard/role-utils';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form'; // Ya lo tienes
import { ROLES } from '@guard/roles.constants';

import { useModuloActual } from 'src/hooks/useModuloActual'; // <--- importar el hook

export type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

export const NewUserSchema = zod.object({
  avatarUrl: schemaHelper.file({ message: { required_error: 'Avatar is required!' } }),
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  country: schemaHelper.objectOrNull<string | null>({
    message: { required_error: 'Country is required!' }, 
  }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  company: zod.string().min(1, { message: 'Company is required!' }),
  state: zod.string().min(1, { message: 'State is required!' }),
  city: zod.string().min(1, { message: 'City is required!' }),
  role: zod.string().min(1, { message: 'Role is required!' }),
  zipCode: zod.string().min(1, { message: 'Zip code is required!' }),
  // Not required
  status: zod.string(),
  isVerified: zod.boolean(),
});

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
};
export function RegistroPtc({ currentUser }: Props) {
  const [userRoles, setUserRoles] = useState<string[]>([]); // ✅ única y dentro del componente
  const moduloActual = useModuloActual(); // ✅ también dentro del componente

  const tienePermisoCrear = useMemo(() => {
    if (moduloActual === 'TIC') {
      return userRoles.includes(ROLES.GENERACION_SOLICITUD_TIC_NUEVO_EQUIPO_CREATE);
    }
    if (moduloActual === 'COMERCIAL') {
      return userRoles.includes(ROLES.GENERACION_SOLICITUD_COMERCIAL_NUEVO_EQUIPO_CREATE);
    }
    return false;
  }, [moduloActual, userRoles]);

  const router = useRouter();

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  const defaultValues = useMemo(
    () => ({
      status: currentUser?.status || '',
      avatarUrl: currentUser?.avatarUrl || null,
      isVerified: currentUser?.isVerified || true,
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      country: currentUser?.country || '',
      state: currentUser?.state || '',
      city: currentUser?.city || '',
      address: currentUser?.address || '',
      zipCode: currentUser?.zipCode || '',
      company: currentUser?.company || '',
      role: currentUser?.role || '',
    }),
    [currentUser]
  );

  const methods = useForm<NewUserSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
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
              <Field.Text name="name" label="Full name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="phoneNumber" label="Phone number" />

              <Field.CountrySelect
                fullWidth
                name="country"
                label="Country"
                placeholder="Choose a country"
              />

              <Field.Text name="state" label="State/region" />
              <Field.Text name="city" label="City" />
              <Field.Text name="address" label="Address" />
              <Field.Text name="zipCode" label="Zip/codes" />
              <Field.Text name="company" label="Company" />
              <Field.Text name="role" label="Role" />
            </Box>

            {tienePermisoCrear && (
              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? 'Registrar' : 'Save changes'}
                </LoadingButton>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
