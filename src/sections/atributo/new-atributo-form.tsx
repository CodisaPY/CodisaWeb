import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@apollo/client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';



import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { GET_ALL_ATRIBUTOS_EQUIPOS_QUERY, TIPOS_EQUIPO_QUERY } from 'src/graphql/queries/equipo';
import { CREATE_ATRIBUTO_MUTATION, UPDATE_ATRIBUTO_MUTATION } from 'src/graphql/mutations/equipo';

// ----------------------------------------------------------------------

type TipoEquipoOption = {
  id: number;
  nombre: string;
};

type AtributoOption = {
  id: number;
  nombre: string;
  descripcionAtributo?: string;
  tipoEquipoId: number;
  tipoDato?: string;
  esObligatorio?: string;
  placeholder?: string;
  opcionesLista?: string;
  atributoDependienteId?: number;
  valorDependiente?: string;
  tipoDependencia?: string;
  tieneDependencia?: boolean;
  opcionesListaArray?: string[];
};

const NewAtributoSchema = zod.object({
  nombre: zod.string().min(1, 'El nombre del atributo es requerido'),
  tipoEquipo: zod.object({
    id: zod.number(),
    nombre: zod.string(),
  }).nullable().refine((val) => val !== null, {
    message: 'El tipo de equipo es requerido'
  }),
  tipoDato: zod.union([
    zod.object({
      value: zod.enum(['texto', 'numero', 'lista']),
      label: zod.string(),
    }),
    zod.string().transform((val) => {
      const label = val === 'numero' ? 'Número' : 
                   val === 'lista' ? 'Lista' : 'Texto';
      return { value: val as 'texto' | 'numero' | 'lista', label };
    })
  ]).nullable().refine((val) => val !== null, {
    message: 'El tipo de dato es requerido',
  }),
  esObligatorio: zod.union([
    zod.object({
      value: zod.enum(['S', 'N']),
      label: zod.string(),
    }),
    zod.string().transform((val) => {
      const label = val === 'S' ? 'Sí' : 'No';
      return { value: val as 'S' | 'N', label };
    })
  ]).nullable().refine((val) => val !== null, {
    message: 'Debe especificar si el campo es obligatorio',
  }),
  placeholder: zod.string().optional(),
  descripcionAtributo: zod.string().optional(),
  opcionesLista: zod.string().optional(),
  tieneDependencia: zod.object({
    value: zod.boolean(),
    label: zod.string(),
  }).nullable().optional(),
  atributoDependienteId: zod.object({
    id: zod.number(),
    nombre: zod.string(),
    descripcionAtributo: zod.string().optional(),
  }).nullable(),
  valorDependiente: zod.string().optional(),
  tipoDependencia: zod.object({
    value: zod.enum(['DIFERENTE', 'IGUAL']),
    label: zod.string(),
  }).nullable().optional(),
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
    opcionesLista?: string;
    atributoDependienteId?: number;
    valorDependiente?: string;
    tieneDependencia?: boolean;
    tipoDependencia?: 'DIFERENTE' | 'IGUAL';
  };
};

export function NewAtributoForm({ currentAtributo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Query GraphQL para atributos
  const { 
    data: atributosData, 
    loading: atributosLoading, 
    error: atributosError 
  } = useQuery(GET_ALL_ATRIBUTOS_EQUIPOS_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('✅ Query GET_ALL_ATRIBUTOS_EQUIPOS ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query GET_ALL_ATRIBUTOS_EQUIPOS:', error);
      toast.error('Error al cargar los atributos');
    }
  });

  // Query GraphQL para tipos de equipo
  const { 
    data: tiposEquipoData, 
    loading: tiposEquipoLoading, 
    error: tiposEquipoError 
  } = useQuery(TIPOS_EQUIPO_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      console.log('✅ Query TIPOS_EQUIPO ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query TIPOS_EQUIPO:', error);
      toast.error('Error al cargar los tipos de equipo');
    }
  });

  // Mutaciones GraphQL para crear y actualizar atributos
  const [createAtributo, { loading: createLoading }] = useMutation(CREATE_ATRIBUTO_MUTATION, {
    onCompleted: (data: any) => {
      console.log('✅ Respuesta de createAtributo:', data);
      if (data?.createAtributo?.success) {
        toast.success(data.createAtributo.message || 'Atributo creado exitosamente');
        reset();
        router.push(paths.dashboard.tic.moduloInventario.listaAtributos);
      } else {
        console.warn('Respuesta inesperada de createAtributo:', data);
        toast.error('Error al crear el atributo');
      }
    },
    onError: (error: any) => {
      console.error('❌ Error completo al crear atributo:', error);
      console.error('❌ Network Error:', error.networkError);
      console.error('❌ GraphQL Errors:', error.graphQLErrors);
      console.error('❌ Message:', error.message);
      
      // Mostrar mensaje más específico
      if (error.networkError) {
        toast.error('Error de conexión al servidor');
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        toast.error(`Error GraphQL: ${error.graphQLErrors[0].message}`);
      } else {
        toast.error('Error al crear el atributo');
      }
    },
  });

  const [updateAtributo, { loading: updateLoading }] = useMutation(UPDATE_ATRIBUTO_MUTATION, {
    onCompleted: (data: any) => {
      console.log('✅ Respuesta de updateAtributo:', data);
      if (data?.updateAtributo?.success) {
        toast.success(data.updateAtributo.message || 'Atributo actualizado exitosamente');
        router.push(paths.dashboard.tic.moduloInventario.listaAtributos);
      } else {
        toast.error('Error al actualizar el atributo');
      }
    },
    onError: (error: any) => {
      console.error('Error al actualizar atributo:', error);
      toast.error('Error al actualizar el atributo');
    },
  });

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

  // Obtener tipos de equipo desde GraphQL
  const tiposEquipo = useMemo(() => tiposEquipoData?.tiposEquipo || [], [tiposEquipoData?.tiposEquipo]);

  const defaultValues: Partial<NewAtributoSchemaType> = {
    nombre: currentAtributo?.nombre || '',
    tipoEquipo: currentAtributo ? {
      id: currentAtributo.tipoEquipoId,
      nombre: currentAtributo.tipoEquipoNombre
    } : undefined,
    tipoDato: currentAtributo?.tipoDato ? {
      value: currentAtributo.tipoDato as 'texto' | 'numero' | 'lista',
      label: currentAtributo.tipoDato === 'numero' ? 'Número' : 
             currentAtributo.tipoDato === 'lista' ? 'Lista' : 'Texto'
    } : undefined,
    esObligatorio: currentAtributo?.esObligatorio ? {
      value: currentAtributo.esObligatorio as 'S' | 'N',
      label: currentAtributo.esObligatorio === 'S' ? 'Sí' : 'No'
    } : undefined,
    placeholder: currentAtributo?.placeholder || '',
    descripcionAtributo: currentAtributo?.descripcionAtributo || '',
    opcionesLista: currentAtributo?.opcionesLista || '',
    tieneDependencia: currentAtributo?.atributoDependienteId && currentAtributo.atributoDependienteId > 0 ? {
      value: true,
      label: 'Sí'
    } : {
      value: false,
      label: 'No'
    },
    atributoDependienteId: null, // Se establecerá después de cargar los atributos
    valorDependiente: currentAtributo?.valorDependiente || '',
    tipoDependencia: currentAtributo?.tipoDependencia ? {
      value: currentAtributo.tipoDependencia as 'DIFERENTE' | 'IGUAL',
      label: currentAtributo.tipoDependencia === 'DIFERENTE' ? 'DIFERENTE - Cuando el atributo dependiente tenga cualquier valor' : 'IGUAL - Cuando el atributo dependiente sea igual al valor especificado'
    } : undefined,
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

  // Cargar atributos cuando cambie el tipo de equipo seleccionado
  const tipoEquipoSelected = methods.watch('tipoEquipo');
  
  // Obtener atributos del tipo de equipo seleccionado usando GraphQL
  const atributosTipoEquipo = useMemo(() => {
    if (!atributosData?.getAllAtributosEquipos || !tipoEquipoSelected?.id) {
      return [];
    }
    
    const atributosFiltrados = atributosData.getAllAtributosEquipos.filter((attr: AtributoOption) => attr.tipoEquipoId === tipoEquipoSelected.id);
    console.log('Atributos filtrados para tipoEquipoId', tipoEquipoSelected.id, ':', atributosFiltrados);
    return atributosFiltrados;
  }, [atributosData?.getAllAtributosEquipos, tipoEquipoSelected?.id]);

  // Cargar atributos cuando cambie el tipo de equipo seleccionado
  useEffect(() => {
    if (tipoEquipoSelected?.id) {
      console.log('Cargando atributos para tipo de equipo:', tipoEquipoSelected.id);
      
      // Resetear solo los campos de dependencia cuando cambie el tipo de equipo
      // No resetear tipoDato ni otros campos principales
      methods.setValue('tieneDependencia', { value: false, label: 'No' });
      methods.setValue('atributoDependienteId', null);
      methods.setValue('valorDependiente', '');
      methods.setValue('tipoDependencia', { value: 'DIFERENTE', label: 'DIFERENTE - Cuando el atributo dependiente tenga cualquier valor' });
    }
  }, [tipoEquipoSelected?.id, methods]);

  // Establecer el atributo dependiente cuando se carguen los atributos del tipo de equipo
  useEffect(() => {
    console.log('useEffect atributo dependiente - currentAtributo:', currentAtributo?.id, 'atributosTipoEquipo.length:', atributosTipoEquipo.length);
    
    if (currentAtributo && atributosTipoEquipo.length > 0 && currentAtributo.atributoDependienteId && currentAtributo.atributoDependienteId > 0) {
      console.log('Buscando atributo dependiente ID:', currentAtributo.atributoDependienteId);
      console.log('Atributos disponibles:', atributosTipoEquipo);
      
      const atributoDependiente = atributosTipoEquipo.find((attr: AtributoOption) => attr.id === currentAtributo.atributoDependienteId);
      console.log('Atributo dependiente encontrado:', atributoDependiente);
      
      if (atributoDependiente) {
        console.log('Estableciendo atributo dependiente:', atributoDependiente);
        methods.setValue('atributoDependienteId', atributoDependiente);
        
        // Verificar que se estableció correctamente
        setTimeout(() => {
          const currentValue = methods.getValues('atributoDependienteId');
          console.log('Valor actual del atributo dependiente después de establecer:', currentValue);
        }, 100);
      } else {
        console.log('❌ No se encontró el atributo dependiente con ID:', currentAtributo.atributoDependienteId);
        console.log('IDs disponibles:', atributosTipoEquipo.map((attr: AtributoOption) => attr.id));
      }
    }
  }, [atributosTipoEquipo, currentAtributo, methods]);

  // Establecer "Tiene Dependencia" cuando se cargue un atributo para editar
  useEffect(() => {
    if (currentAtributo && currentAtributo.atributoDependienteId && currentAtributo.atributoDependienteId > 0) {
      console.log('Estableciendo tiene dependencia como Sí para atributo:', currentAtributo.nombre);
      methods.setValue('tieneDependencia', { value: true, label: 'Sí' });
    }
  }, [currentAtributo, methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      const isEdit = !!currentAtributo;
      
      // Función para limpiar y validar datos antes de enviar
      const cleanValue = (value: any): any => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'object' && value.id !== undefined) return value.id;
        if (typeof value === 'object' && value.value !== undefined) {
          // Mapeo especial para tipoDato: "list" -> "lista"
          if (value.value === 'list') return 'lista';
          return value.value;
        }
        return value;
      };

      // Función especial para limpiar opcionesLista (mantener formato \n)
      const cleanOpcionesLista = (value: any): string => {
        if (!value) return '';
        const cleanVal = cleanValue(value);
        if (typeof cleanVal === 'string') {
          // Mantener formato de saltos de línea (\n) como espera el backend
          return cleanVal
            .split('\n')
            .map(option => option.trim())
            .filter(option => option !== '')
            .join('\n');
        }
        return '';
      };

      // Preparar datos del atributo para GraphQL con limpieza
      const atributoInput = {
        tipoEquipoId: cleanValue(data.tipoEquipo),
        nombre: cleanValue(data.nombre),
        tipoDato: cleanValue(data.tipoDato),
        esObligatorio: cleanValue(data.esObligatorio),
        placeholder: cleanValue(data.placeholder) || '',
        descripcionAtributo: cleanValue(data.descripcionAtributo) || '',
        opcionesLista: cleanOpcionesLista(data.opcionesLista),
        tieneDependencia: cleanValue(data.tieneDependencia) || false,
        atributoDependienteId: cleanValue(data.atributoDependienteId),
        valorDependiente: cleanValue(data.valorDependiente) || '',
        tipoDependencia: cleanValue(data.tipoDependencia) || 'DIFERENTE',
      };

      // Validar que los campos requeridos estén presentes
      if (!atributoInput.tipoEquipoId || !atributoInput.nombre || !atributoInput.tipoDato || !atributoInput.esObligatorio) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }

      // Debug: mostrar cada campo individualmente
      console.log('🔍 DEBUG - Campos individuales:');
      console.log('  - tipoEquipoId:', typeof atributoInput.tipoEquipoId, atributoInput.tipoEquipoId);
      console.log('  - nombre:', typeof atributoInput.nombre, atributoInput.nombre);
      console.log('  - tipoDato:', typeof atributoInput.tipoDato, atributoInput.tipoDato);
      console.log('  - esObligatorio:', typeof atributoInput.esObligatorio, atributoInput.esObligatorio);
      console.log('  - placeholder:', typeof atributoInput.placeholder, atributoInput.placeholder);
      console.log('  - descripcionAtributo:', typeof atributoInput.descripcionAtributo, atributoInput.descripcionAtributo);
      console.log('  - opcionesLista:', typeof atributoInput.opcionesLista, atributoInput.opcionesLista);
      console.log('  - tieneDependencia:', typeof atributoInput.tieneDependencia, atributoInput.tieneDependencia);
      console.log('  - atributoDependienteId:', typeof atributoInput.atributoDependienteId, atributoInput.atributoDependienteId);
      console.log('  - valorDependiente:', typeof atributoInput.valorDependiente, atributoInput.valorDependiente);
      console.log('  - tipoDependencia:', typeof atributoInput.tipoDependencia, atributoInput.tipoDependencia);

      console.log('=== DATOS DETALLADOS ===');
      console.log('Data completo del formulario:', data);
      console.log('tipoDato:', data.tipoDato);
      console.log('esObligatorio:', data.esObligatorio);
      console.log('tieneDependencia:', data.tieneDependencia);
      console.log('atributoDependienteId:', data.atributoDependienteId);
      console.log('tipoDependencia:', data.tipoDependencia);
      console.log('opcionesLista:', data.opcionesLista);
      console.log('opcionesListaArray:', data.tipoDato?.value === 'lista' && data.opcionesLista ? data.opcionesLista.split('\n').filter(option => option.trim() !== '') : 'No aplica');
      console.log('=== FIN DATOS DETALLADOS ===');
      console.log('=== OBJETO ATRIBUTO INPUT ===');
      console.log('atributoInput completo:', JSON.stringify(atributoInput, null, 2));
      console.log('=== FIN OBJETO ATRIBUTO INPUT ===');

      if (isEdit) {
        // Actualizar atributo existente
        console.log('🔄 Ejecutando updateAtributo con variables:', {
          id: currentAtributo.id.toString(),
          input: atributoInput
        });
        await updateAtributo({
          variables: {
            id: currentAtributo.id.toString(),
            input: atributoInput
          }
        });
      } else {
        // Crear nuevo atributo
        console.log('🆕 Ejecutando createAtributo con variables:', {
          input: atributoInput
        });
        console.log('🆕 JSON.stringify del input:', JSON.stringify(atributoInput, null, 2));
        await createAtributo({
          variables: {
            input: atributoInput
          }
        });
      }
      
      // Las mutaciones se encargan de mostrar toasts y redirección
      
    } catch (error) {
      console.error('Error en onSubmit:', error);
      toast.error(currentAtributo ? 'Error al actualizar el atributo' : 'Error al crear el atributo');
    } finally {
      setLoading(false);
    }
  });

  // Mostrar error de carga de datos
  if (tiposEquipoError || atributosError) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {tiposEquipoError?.message || atributosError?.message || 'Error al cargar los datos'}
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
  if (tiposEquipoLoading || atributosLoading) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Box>Cargando datos...</Box>
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
              { value: 'lista', label: 'Lista' },
            ]}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value?.value}
            renderOption={(props, option) => (
              <li {...props}>
                {option.label}
              </li>
            )}
            placeholder="Seleccione el tipo de dato"
            helperText="Seleccione el tipo de dato para el atributo"
          />

          <Field.Autocomplete
            name="esObligatorio"
            label="¿Es Obligatorio? *"
            options={[
              { value: 'S', label: 'Sí' },
              { value: 'N', label: 'No' },
            ]}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value?.value}
            renderOption={(props, option) => (
              <li {...props}>
                {option.label}
              </li>
            )}
            placeholder="Seleccione si es obligatorio"
            helperText="Indique si este campo es obligatorio para el equipo"
          />

          {methods.watch('tipoDato')?.value === 'lista' && (
            <Box sx={{ gridColumn: { sm: 'span 2' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  Opciones de la Lista *
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => {
                    const currentValue = methods.getValues('opcionesLista') || '';
                    const options = currentValue.split('\n').filter(line => line.trim());
                    const newOption = `Nueva Opción ${options.length + 1}`;
                    const newValue = currentValue ? `${currentValue}\n${newOption}` : newOption;
                    methods.setValue('opcionesLista', newValue);
                  }}
                >
                  Nuevo
                </Button>
              </Box>
              
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  minHeight: 120,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {methods.watch('opcionesLista')?.split('\n')
                    .filter(line => line.trim())
                    .map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => {
                          const currentValue = methods.getValues('opcionesLista') || '';
                          const options = currentValue.split('\n').filter(line => line.trim());
                          const newOptions = options.filter((_, i) => i !== index);
                          methods.setValue('opcionesLista', newOptions.join('\n'));
                        }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                </Box>
                <Box
                  component="textarea"
                  placeholder="Escriba una opción y presione Enter para crear un chip..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      
                      if (inputValue && inputValue.trim() !== '') {
                        // Obtener opciones existentes
                        const existingValue = methods.getValues('opcionesLista') || '';
                        const existingOptions = existingValue.split('\n').filter(line => line.trim());
                        
                        // Verificar si la opción ya existe
                        if (!existingOptions.includes(inputValue.trim())) {
                          // Agregar nueva opción
                          const newOptions = [...existingOptions, inputValue.trim()];
                          methods.setValue('opcionesLista', newOptions.join('\n'));
                        }
                        
                        // Limpiar el campo de entrada
                        setInputValue('');
                      }
                    }
                  }}
                  sx={{
                    width: '100%',
                    minHeight: 80,
                    padding: '8px 12px',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    backgroundColor: 'transparent',
                    '&::placeholder': {
                      color: 'text.disabled',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Escriba una opción y presione Enter para convertirla en chip, o use el botón &apos;Nuevo&apos; para agregar opciones automáticamente
                </Typography>
              </Box>
            </Box>
          )}

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

          {tipoEquipoSelected && (
            <>
              <Field.Autocomplete
                name="tieneDependencia"
                label="¿Tiene Dependencia? *"
                options={[
                  { value: true, label: 'Sí' },
                  { value: false, label: 'No' },
                ]}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.label}
                  </li>
                )}
                placeholder="Seleccione si tiene dependencia"
                helperText="Indique si este atributo depende de otro atributo"
              />

              {methods.watch('tieneDependencia')?.value === true && (
                <>
                  <Field.Autocomplete
                    name="atributoDependienteId"
                    label="Atributo Dependiente *"
                    options={atributosTipoEquipo}
                    getOptionLabel={(option) => option.descripcionAtributo || option.nombre}
                    isOptionEqualToValue={(option, value) => option.id === value}
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.descripcionAtributo || option.nombre}
                      </li>
                    )}
                    placeholder="Seleccione el atributo del cual depende"
                    helperText={`Seleccione el atributo que determina si este campo es obligatorio (${atributosTipoEquipo.length} atributos disponibles)`}
                  />

                  <Field.Autocomplete
                    name="tipoDependencia"
                    label="Tipo de Dependencia *"
                    options={[
                      { value: 'DIFERENTE', label: 'DIFERENTE - Cuando el atributo dependiente tenga cualquier valor' },
                      { value: 'IGUAL', label: 'IGUAL - Cuando el atributo dependiente sea igual al valor especificado' },
                    ]}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.label}
                      </li>
                    )}
                    placeholder="Seleccione el tipo de dependencia"
                    helperText="Seleccione cómo debe comportarse la dependencia"
                  />

                  <Field.Text
                    name="valorDependiente"
                    label="Valor Dependiente"
                    placeholder={methods.watch('tipoDependencia')?.value === 'IGUAL' ? 'Ej: LAPTOP, DESKTOP...' : 'Dejar vacío para DIFERENTE'}
                    helperText={methods.watch('tipoDependencia')?.value === 'IGUAL' 
                      ? 'IGUAL: Especifique el valor exacto que debe tener el atributo dependiente' 
                      : 'DIFERENTE: Cuando el atributo dependiente tenga cualquier valor, este atributo será obligatorio'
                    }
                    sx={{ gridColumn: { sm: 'span 2' } }}
                  />
                </>
              )}
            </>
          )}
        </Box>

        {tienePermisoCrear ? (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading || createLoading || updateLoading}
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