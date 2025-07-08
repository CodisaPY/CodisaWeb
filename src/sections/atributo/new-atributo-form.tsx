import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type TipoEquipoOption = {
  id: number;
  nombre: string;
};

const NewAtributoSchema = zod.object({
  nombre: zod.string().min(1, 'El nombre del atributo es requerido'),
  tipoEquipo: zod.object({
    id: zod.number(),
    nombre: zod.string(),
  }).nullable().refine((val) => val !== null, {
    message: 'El tipo de equipo es requerido'
  }),
  tipoDato: zod.object({
    value: zod.enum(['texto', 'numero']),
    label: zod.string(),
  }).nullable().refine((val) => val !== null, {
    message: 'El tipo de dato es requerido',
  }),
  esObligatorio: zod.object({
    value: zod.enum(['S', 'N']),
    label: zod.string(),
  }).nullable().refine((val) => val !== null, {
    message: 'Debe especificar si el campo es obligatorio',
  }),
  placeholder: zod.string().optional(),
  descripcionAtributo: zod.string().optional(),
});

type NewAtributoSchemaType = zod.infer<typeof NewAtributoSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentAtributo?: {
    id: number;
    nombre: string;
    tipoEquipoId: number;
    tipoEquipoNombre: string;
    tipoDato: string;
    esObligatorio: string;
    placeholder?: string;
    descripcionAtributo?: string;
  };
};

export function NewAtributoForm({ currentAtributo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipoOption[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const tienePermisoCrear = useMemo(
    () =>
      [
        ROLES.ATRIBUTO_INVENTARIO_TIC_CREATE,
        ROLES.ATRIBUTO_INVENTARIO_TIC_VIEW,
      ].some((r) => userRoles.includes(r)),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  // Cargar tipos de equipo
  useEffect(() => {
    const fetchTiposEquipo = async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        const response = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/tipos-equipo`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error al cargar tipos de equipo: ${response.status}`);
        }

        const data = await response.json();
        setTiposEquipo(data);
      } catch (error) {
        console.error('Error fetching tipos de equipo:', error);
        setDataError(error instanceof Error ? error.message : 'Error desconocido al cargar los datos');
        toast.error('Error al cargar los tipos de equipo');
      } finally {
        setDataLoading(false);
      }
    };

    fetchTiposEquipo();
  }, []);

  const defaultValues: Partial<NewAtributoSchemaType> = {
    nombre: currentAtributo?.nombre || '',
    tipoEquipo: currentAtributo ? {
      id: currentAtributo.tipoEquipoId,
      nombre: currentAtributo.tipoEquipoNombre
    } : undefined,
    tipoDato: currentAtributo?.tipoDato ? {
      value: currentAtributo.tipoDato as 'texto' | 'numero',
      label: currentAtributo.tipoDato === 'numero' ? 'Número' : 'Texto'
    } : undefined,
    esObligatorio: currentAtributo?.esObligatorio ? {
      value: currentAtributo.esObligatorio as 'S' | 'N',
      label: currentAtributo.esObligatorio === 'S' ? 'Sí' : 'No'
    } : undefined,
    placeholder: currentAtributo?.placeholder || '',
    descripcionAtributo: currentAtributo?.descripcionAtributo || '',
  };

  const methods = useForm<NewAtributoSchemaType>({
    resolver: zodResolver(NewAtributoSchema),
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
      
      const isEdit = !!currentAtributo;
      
      // Preparar datos del atributo
      const atributoData = {
        ...(isEdit && { id: currentAtributo.id }),
        tipoEquipoId: data.tipoEquipo!.id,
        nombre: data.nombre,
        tipoDato: data.tipoDato!.value,
        esObligatorio: data.esObligatorio!.value,
        placeholder: data.placeholder || '',
        descripcionAtributo: data.descripcionAtributo || '',
      };

      const url = isEdit 
        ? `${CONFIG.springServerUrl}/backend-linker/api/atributos/${currentAtributo.id}`
        : `${CONFIG.springServerUrl}/backend-linker/api/atributos`;
      
      const method = isEdit ? 'PUT' : 'POST';

      console.log(`${method} URL:`, url);
      console.log(`${method} Data:`, atributoData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(atributoData),
      });

      if (response.ok) {
        toast.success(`Atributo ${isEdit ? 'actualizado' : 'creado'} exitosamente`);
        if (!isEdit) reset();
        router.push(paths.dashboard.tic.moduloInventario.listaAtributos);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        toast.error(errorData.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el atributo`);
      }
    } catch (error) {
      console.error(error);
      toast.error(currentAtributo ? 'Error al actualizar el atributo' : 'Error al crear el atributo');
    } finally {
      setLoading(false);
    }
  });

  // Mostrar error de carga de datos
  if (dataError) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {dataError}
        </Alert>
        <LoadingButton
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </LoadingButton>
      </Card>
    );
  }

  // Mostrar loading mientras cargan los datos
  if (dataLoading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Box>Cargando tipos de equipo...</Box>
      </Card>
    );
  }

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
            label="Nombre del Atributo *"
            placeholder="Ejemplo: MEMORIA_RAM, MAC, PROCESADOR, IMEI..."
            helperText="Ingrese el nombre del atributo del equipo (use guión bajo para separar palabras)"
            inputProps={{
              pattern: '[A-Za-z0-9_]+',
              style: { textTransform: 'uppercase' },
              onKeyPress: (e) => {
                // Permitir solo letras, números y guión bajo
                const allowedChars = /[A-Za-z0-9_]/;
                if (!allowedChars.test(e.key)) {
                  e.preventDefault();
                }
              },
              onPaste: (e) => {
                // Prevenir pegar texto con espacios y convertir a mayúsculas
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text');
                const cleanText = pastedText.replace(/[^A-Za-z0-9_]/g, '').toUpperCase();
                const target = e.target as HTMLInputElement;
                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                const currentValue = target.value;
                const newValue = currentValue.substring(0, start) + cleanText + currentValue.substring(end);
                target.value = newValue;
                target.setSelectionRange(start + cleanText.length, start + cleanText.length);
              },
              onChange: (e) => {
                // Convertir a mayúsculas mientras se escribe
                const target = e.target as HTMLInputElement;
                target.value = target.value.toUpperCase();
              }
            }}
          />

          <Field.Autocomplete
            name="tipoEquipo"
            label="Tipo de Equipo *"
            options={tiposEquipo}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderOption={(props, option) => (
              <li {...props}>
                {option.nombre}
              </li>
            )}
            placeholder="Seleccione un tipo de equipo"
            helperText="Seleccione el tipo de equipo para este atributo"
          />

          <Field.Autocomplete
            name="tipoDato"
            label="Tipo de Dato *"
            options={[
              { value: 'texto', label: 'Texto' },
              { value: 'numero', label: 'Número' },
            ]}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value}
            renderOption={(props, option) => (
              <li {...props}>
                {option.label}
              </li>
            )}
            placeholder="Seleccione el tipo de dato"
            helperText="Seleccione si el atributo es texto o número"
          />

          <Field.Autocomplete
            name="esObligatorio"
            label="¿Es Obligatorio? *"
            options={[
              { value: 'S', label: 'Sí' },
              { value: 'N', label: 'No' },
            ]}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value}
            renderOption={(props, option) => (
              <li {...props}>
                {option.label}
              </li>
            )}
            placeholder="Seleccione si es obligatorio"
            helperText="Indique si este campo es obligatorio para el equipo"
          />

          <Field.Text
            name="placeholder"
            label="Placeholder/Ejemplo"
            placeholder="Ej: 192.168.1.100, Intel Core i7, ABCD-1234..."
            helperText="Ejemplo de valor que se mostrará como placeholder en el formulario de equipos"
            multiline
            rows={2}
            sx={{ gridColumn: { sm: 'span 2' } }}
          />

          <Field.Text
            name="descripcionAtributo"
            label="Descripción del Atributo"
            placeholder="Ej: Dirección MAC del dispositivo de red, Procesador principal del equipo..."
            helperText="Descripción detallada del atributo para documentación"
            multiline
            rows={3}
            sx={{ gridColumn: { sm: 'span 2' } }}
          />
        </Box>

        {tienePermisoCrear ? (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
            disabled={!methods.formState.isValid}
            sx={{ ml: 'auto' }}
          >
            {currentAtributo ? 'Actualizar Atributo' : 'Crear Atributo'}
          </LoadingButton>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No tienes permisos para crear o editar atributos.
          </Alert>
        )}
      </Card>
    </Form>
  );
} 