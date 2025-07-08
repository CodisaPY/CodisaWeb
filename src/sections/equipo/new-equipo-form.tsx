import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@guard/roles.constants';
import { useMemo, useState, useEffect } from 'react';
import { getRolesFromToken } from '@guard/role-utils';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
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

type MarcaOption = {
  id: number;
  nombre: string;
};

type ModeloOption = {
  id: number;
  nombre: string;
  marcaId: number;
  marcaNombre: string;
};

type AtributoEquipo = {
  id: number;
  tipoEquipoId: number;
  nombre: string;
  tipoDato: string;
  esObligatorio: string;
  placeholder?: string;
  descripcionAtributo?: string;
};

type CreateEquipoResponse = {
  success: boolean;
  message: string;
  equipoId: string;
};

// Schema dinámico que se construirá según los atributos
const createEquipoSchema = (atributos: AtributoEquipo[]) => {
  const atributosSchema: Record<string, any> = {};
  
  atributos.forEach((atributo) => {
    if (atributo.tipoDato === 'numero') {
      // Schema para números
      const numberSchema = zod.union([
        zod.number().positive(`${atributo.nombre} debe ser un número positivo`),
        zod.string().transform((val) => {
          const num = parseFloat(val);
          if (Number.isNaN(num)) throw new Error(`${atributo.nombre} debe ser un número válido`);
          return num;
        })
      ]);
      
      atributosSchema[atributo.nombre] = atributo.esObligatorio === 'S' 
        ? numberSchema
        : numberSchema.optional();
    } else {
      // Schema para texto
      const textSchema = zod.string();
      
      atributosSchema[atributo.nombre] = atributo.esObligatorio === 'S' 
        ? textSchema.min(1, `${atributo.nombre} es requerido`)
        : textSchema.optional();
    }
  });

  return zod.object({
    // Campos generales obligatorios
    tipoEquipo: zod.object({
      id: zod.number(),
      nombre: zod.string(),
    }).nullable().refine((val) => val !== null, {
      message: 'El tipo de equipo es requerido'
    }),
    marca: zod.object({
      id: zod.number(),
      nombre: zod.string(),
    }).nullable().refine((val) => val !== null, {
      message: 'La marca es requerida'
    }),
    modelo: zod.object({
      id: zod.number(),
      nombre: zod.string(),
    }).nullable().refine((val) => val !== null, {
      message: 'El modelo es requerido'
    }),
    numeroSerie: zod.string().min(1, 'El número de serie es requerido'),
    fechaAdquisicion: zod.string().min(1, 'La fecha de adquisición es requerida'),
    observaciones: zod.string().optional(),
    
    // Campos dinámicos según tipo de equipo
    atributosDinamicos: zod.object(atributosSchema).optional(),
  });
};

type NewEquipoSchemaType = {
  tipoEquipo: { id: number; nombre: string; } | null;
  marca: { id: number; nombre: string; } | null;
  modelo: { id: number; nombre: string; } | null;
  numeroSerie: string;
  fechaAdquisicion: string;
  observaciones?: string;
  atributosDinamicos?: Record<string, string>;
};

// ----------------------------------------------------------------------

type Props = {
  currentEquipo?: {
    id: number;
    tipoEquipoId: number;
    tipoEquipoNombre: string;
  };
};

export function NewEquipoForm({ currentEquipo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipoOption[]>([]);
  const [marcas, setMarcas] = useState<MarcaOption[]>([]);
  const [modelos, setModelos] = useState<ModeloOption[]>([]);
  const [atributos, setAtributos] = useState<AtributoEquipo[]>([]);
  const [atributosFiltrados, setAtributosFiltrados] = useState<AtributoEquipo[]>([]);
  const [equipoSchema, setEquipoSchema] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.EQUIPO_INVENTARIO_TIC_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        // Cargar tipos de equipo
        const tiposResponse = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/tipos-equipo`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });
        if (!tiposResponse.ok) {
          throw new Error(`Error al cargar tipos de equipo: ${tiposResponse.status}`);
        }
        const tiposData = await tiposResponse.json();
        setTiposEquipo(tiposData);

        // Cargar marcas
        const marcasResponse = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/marcas`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });
        if (!marcasResponse.ok) {
          throw new Error(`Error al cargar marcas: ${marcasResponse.status}`);
        }
        const marcasData = await marcasResponse.json();
        setMarcas(marcasData);

        // Cargar modelos
        const modelosResponse = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/modelos`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });
        if (!modelosResponse.ok) {
          throw new Error(`Error al cargar modelos: ${modelosResponse.status}`);
        }
        const modelosData = await modelosResponse.json();
        setModelos(modelosData);

        // Cargar atributos
        const atributosResponse = await fetch(`${CONFIG.springServerUrl}/backend-linker/api/atributos`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });
        if (!atributosResponse.ok) {
          throw new Error(`Error al cargar atributos: ${atributosResponse.status}`);
        }
        const atributosData = await atributosResponse.json();
        setAtributos(atributosData);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setDataError(error instanceof Error ? error.message : 'Error desconocido al cargar los datos');
        toast.error('Error al cargar los datos');
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const defaultValues: Partial<NewEquipoSchemaType> = {
    tipoEquipo: currentEquipo ? {
      id: currentEquipo.tipoEquipoId,
      nombre: currentEquipo.tipoEquipoNombre
    } : null,
    marca: null,
    modelo: null,
    numeroSerie: '',
    fechaAdquisicion: '',
    observaciones: '',
    atributosDinamicos: {},
  };

  const methods = useForm<NewEquipoSchemaType>({
    resolver: equipoSchema ? zodResolver(equipoSchema) : undefined,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  // Watch values for dependencies
  const tipoEquipoSelected = watch('tipoEquipo');
  const marcaSelected = watch('marca');

  // Filtrar atributos cuando cambia el tipo de equipo
  useEffect(() => {
    const tipoEquipoId = tipoEquipoSelected?.id;
    if (tipoEquipoId && atributos.length > 0) {
      const filteredAtributos = atributos.filter(attr => attr.tipoEquipoId === tipoEquipoId);
      setAtributosFiltrados(filteredAtributos);
      
      // Crear schema dinámico
      const schema = createEquipoSchema(filteredAtributos);
      setEquipoSchema(schema);
    } else {
      setAtributosFiltrados([]);
      setEquipoSchema(null);
    }
  }, [tipoEquipoSelected, atributos]);

  // Actualizar el resolver cuando cambia el schema
  useEffect(() => {
    if (equipoSchema) {
      methods.clearErrors();
      // Re-validar el formulario con el nuevo schema
      methods.trigger();
    }
  }, [equipoSchema, methods]);

  // Filtrar modelos por marca seleccionada
  const modelosFiltrados = useMemo(() => {
    const marcaId = marcaSelected?.id;
    if (!marcaId) return [];
    return modelos.filter(modelo => modelo.marcaId === marcaId);
  }, [marcaSelected, modelos]);

  // Limpiar modelo cuando cambia la marca
  useEffect(() => {
    if (marcaSelected) {
      const modeloActual = methods.getValues('modelo');
      if (modeloActual) {
        // Buscar el modelo actual en la lista completa para obtener su marcaId
        const modeloCompleto = modelos.find(m => m.id === modeloActual.id);
        if (modeloCompleto && modeloCompleto.marcaId !== marcaSelected.id) {
          methods.setValue('modelo', null);
          methods.clearErrors('modelo');
        }
      }
    }
  }, [marcaSelected, methods, modelos]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      const isEdit = !!currentEquipo;
      
      // Preparar datos del equipo
      const equipoData = {
        ...(isEdit && { id: currentEquipo.id }), // Solo incluir ID si es edición
        tipoEquipoId: data.tipoEquipo!.id,
        marcaId: data.marca!.id,
        modeloId: data.modelo!.id,
        numeroSerie: data.numeroSerie,
        fechaAdquisicion: data.fechaAdquisicion,
        observaciones: data.observaciones || '',
        // Agregar atributos dinámicos si existen
        ...(data.atributosDinamicos || {}),
      };

      const url = isEdit 
        ? `${CONFIG.springServerUrl}/backend-linker/api/equipos/${currentEquipo.id}`
        : `${CONFIG.springServerUrl}/backend-linker/api/equipos`;
      
      const method = isEdit ? 'PUT' : 'POST';

      console.log(`${method} URL:`, url);
      console.log(`${method} Data:`, equipoData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(equipoData),
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success(`Equipo ${isEdit ? 'actualizado' : 'creado'} exitosamente`);
        if (!isEdit) reset();
        router.push(paths.dashboard.tic.moduloInventario.listaEquipos);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        toast.error(errorData.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el equipo`);
      }
    } catch (error) {
      console.error(error);
      toast.error(currentEquipo ? 'Error al actualizar el equipo' : 'Error al crear el equipo');
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
        <Typography>Cargando datos...</Typography>
      </Card>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Campos Generales */}
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
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
            helperText="Seleccione el tipo de equipo que desea registrar"
          />

          <Field.Autocomplete
            name="marca"
            label="Marca *"
            options={marcas}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderOption={(props, option) => (
              <li {...props}>
                {option.nombre}
              </li>
            )}
            placeholder="Seleccione una marca"
            helperText="Seleccione la marca del equipo"
          />

          <Field.Autocomplete
            name="modelo"
            label="Modelo *"
            options={modelosFiltrados}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderOption={(props, option) => (
              <li {...props}>
                {option.nombre}
              </li>
            )}
            placeholder="Seleccione un modelo"
            helperText="Seleccione el modelo del equipo"
            disabled={!marcaSelected}
          />

          <Field.Text
            name="numeroSerie"
            label="Número de Serie *"
            placeholder="Ejemplo: SN123456789"
            helperText="Ingrese el número de serie del equipo"
          />

          <Field.DatePicker
            name="fechaAdquisicion"
            label="Fecha de Adquisición *"
          />

          <Field.Text
            name="observaciones"
            label="Observaciones"
            placeholder="Observaciones adicionales..."
            helperText="Observaciones opcionales sobre el equipo"
            multiline
            rows={3}
            sx={{ gridColumn: { sm: 'span 2' } }}
          />
        </Box>

        {/* Campos Dinámicos según Tipo de Equipo */}
        {atributosFiltrados.length > 0 && (
          <>
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Información Específica del {tipoEquipoSelected?.nombre}
              </Typography>
            </Box>
            
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              {atributosFiltrados.map((atributo) => {
                // Usar placeholder de la API o fallback a uno genérico
                const getPlaceholder = () => {
                  if (atributo.placeholder) {
                    return atributo.placeholder;
                  }
                  
                  // Fallback para atributos sin placeholder definido
                  switch (atributo.nombre.toUpperCase()) {
                    case 'MAC':
                      return 'Ej: 00:11:22:33:44:55';
                    case 'PROCESADOR':
                      return 'Ej: Intel Core i7-12700H';
                    case 'IMEI':
                      return 'Ej: 123456789012345';
                    case 'NROTELEFONO':
                      return 'Ej: +54911234567';
                    case 'DIRECCION_IP':
                      return 'Ej: 192.168.1.100';
                    case 'USUARIO_ADMIN':
                      return 'Ej: admin';
                    case 'CLAVE_ADMIN':
                      return 'Ej: admin123';
                    case 'TIPOSOFTWARE':
                      return 'Ej: Windows, Office, Kaspersky, Power BI';
                    case 'VERSION':
                      return 'Ej: Windows 11 Pro, Office 365';
                    case 'CLAVE':
                      return 'Ej: ABCD-1234-EFGH-5678';
                    case 'TIPOLICENCIA':
                      return 'Ej: OEM, Retail, Volumen, Suscripción';
                    case 'FECHACOMPRA':
                      return 'Ej: 2023-06-15';
                    case 'FECHAEXPIRACION':
                      return 'Ej: 2025-06-15 (o vacío si es perpetua)';
                    case 'POTENCIA_NOMINAL':
                      return 'Ej: 950';
                    case 'UNIDAD_POTENCIA':
                      return 'Ej: VA';
                    case 'TIPO_UPS':
                      return 'Ej: Online, Line-Interactive, Offline';
                    case 'VOLTAJE_ENTRADA':
                      return 'Ej: 220';
                    case 'VOLTAJE_SALIDA':
                      return 'Ej: 220';
                    case 'TIPO_BATERIA':
                      return 'Ej: AGM, Litio, Plomo-ácido';
                    case 'CANTIDAD_CANALES':
                      return 'Ej: 16';
                    case 'CANTIDAD_DISCOS':
                      return 'Ej: 2';
                    case 'CAPACIDAD_TOTAL':
                      return 'Ej: 4000 GB';
                    case 'TIPO_DISCO':
                      return 'Ej: HDD, SSD, SATA';
                    case 'SALIDA_VIDEO':
                      return 'Ej: HDMI, VGA, BNC';
                    case 'CANTIDADACTIVACIONES':
                      return 'Ej: 1, 5, ilimitadas';
                                          default:
                        return `Ingrese ${atributo.descripcionAtributo?.toLowerCase() || atributo.nombre.toLowerCase()}`;
                  }
                };

                return atributo.tipoDato === 'numero' ? (
                  <Field.NumberMasked
                    key={atributo.id}
                    name={`atributosDinamicos.${atributo.descripcionAtributo}`}
                    label={`${atributo.descripcionAtributo}${atributo.esObligatorio === 'S' ? ' *' : ''}`}
                    placeholder={getPlaceholder()}
                    helperText={atributo.descripcionAtributo || `${atributo.nombre} del equipo${atributo.esObligatorio === 'S' ? ' (requerido)' : ' (opcional)'}`}
                  />
                ) : (
                  <Field.Text
                    key={atributo.id}
                    name={`atributosDinamicos.${atributo.descripcionAtributo}`}
                    label={`${atributo.descripcionAtributo}${atributo.esObligatorio === 'S' ? ' *' : ''}`}
                    placeholder={getPlaceholder()}
                    helperText={atributo.descripcionAtributo || `${atributo.nombre} del equipo${atributo.esObligatorio === 'S' ? ' (requerido)' : ' (opcional)'}`}
                  />
                );
              })}
            </Box>
          </>
        )}

        {tienePermisoCrear ? (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
            disabled={!methods.formState.isValid}
            sx={{ ml: 'auto' }}
          >
            {currentEquipo ? 'Actualizar Equipo' : 'Crear Equipo'}
          </LoadingButton>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No tienes permisos para crear o editar equipos.
          </Alert>
        )}
      </Card>
    </Form>
  );
} 