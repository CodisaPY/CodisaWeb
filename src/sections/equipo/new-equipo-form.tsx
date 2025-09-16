import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
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
import { MARCAS_QUERY } from 'src/graphql/queries/marcas';
import { MODELOS_QUERY } from 'src/graphql/queries/modelos';
import { TIPOS_EQUIPO_QUERY } from 'src/graphql/queries/tipos-equipo';
import { GET_ALL_ATRIBUTOS_EQUIPOS_QUERY } from 'src/graphql/queries/equipo';

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
  opcionesLista?: string;
  opcionesListaArray?: string[];
  atributoDependienteId?: number;
  valorDependiente?: string;
  tipoDependencia?: string;
  tieneDependencia?: boolean;
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
    const fieldName = atributo.descripcionAtributo || atributo.nombre;
    
    if (atributo.tipoDato === 'numero') {
      // Schema para números - aceptar tanto string como number
      const numberSchema = zod.union([
        zod.number().positive(`${fieldName} debe ser un número positivo`),
        zod.string().min(1, `${fieldName} es requerido`).transform((val) => {
          const num = parseFloat(val.replace(',', '.'));
          if (Number.isNaN(num)) throw new Error(`${fieldName} debe ser un número válido`);
          return num;
        })
      ]);
      
      atributosSchema[fieldName] = atributo.esObligatorio === 'S' 
        ? numberSchema
        : zod.union([
            zod.number().optional(),
            zod.string().optional().transform((val) => {
              if (val === '' || val === null || val === undefined) return undefined;
              const num = parseFloat(val.replace(',', '.'));
              if (Number.isNaN(num)) throw new Error(`${fieldName} debe ser un número válido`);
              return num;
            })
          ]);
    } else if (atributo.tipoDato === 'lista') {
      // Schema para lista - puede ser string o objeto
      atributosSchema[fieldName] = atributo.esObligatorio === 'S' 
        ? zod.union([
            zod.string().min(1, `${fieldName} es requerido`),
            zod.object({
              value: zod.string().min(1, `${fieldName} es requerido`),
              label: zod.string(),
            }).transform((obj) => obj.value),
            zod.null().transform(() => '')
          ])
        : zod.union([
            zod.string().optional().transform((val) => val === '' ? undefined : val),
            zod.object({
              value: zod.string(),
              label: zod.string(),
            }).optional().transform((obj) => obj?.value || undefined),
            zod.null().optional().transform(() => undefined)
          ]);
    } else {
      // Schema para texto
      atributosSchema[fieldName] = atributo.esObligatorio === 'S' 
        ? zod.string().min(1, `${fieldName} es requerido`)
        : zod.string().optional().transform((val) => val === '' ? undefined : val);
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
  atributosDinamicos?: Record<string, string | number>;
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


  // Crear el resolver dinámicamente
  const resolver = useMemo(() => 
    equipoSchema ? zodResolver(equipoSchema) : undefined
  , [equipoSchema]);

  const tienePermisoCrear = useMemo(
    () => userRoles.includes(ROLES.EQUIPO_INVENTARIO_TIC_CREATE),
    [userRoles]
  );

  useEffect(() => {
    const roles = getRolesFromToken();
    setUserRoles(roles);
  }, []);

  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Query GraphQL para marcas
  const { 
    data: marcasData, 
    loading: marcasLoading, 
    error: marcasError 
  } = useQuery(MARCAS_QUERY, {
    onCompleted: (data) => {
      console.log('✅ Query MARCAS ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query MARCAS:', error);
    }
  });

  // Query GraphQL para modelos
  const { 
    data: modelosData, 
    loading: modelosLoading, 
    error: modelosError 
  } = useQuery(MODELOS_QUERY, {
    onCompleted: (data) => {
      console.log('✅ Query MODELOS ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query MODELOS:', error);
    }
  });

  // Query GraphQL para tipos de equipo
  const { 
    data: tiposData, 
    loading: tiposLoading, 
    error: tiposError 
  } = useQuery(TIPOS_EQUIPO_QUERY, {
    onCompleted: (data) => {
      console.log('✅ Query TIPOS_EQUIPO ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query TIPOS_EQUIPO:', error);
    }
  });

  // Query GraphQL para atributos del equipo
  const { 
    data: atributosData, 
    loading: atributosLoading, 
    error: atributosError 
  } = useQuery(GET_ALL_ATRIBUTOS_EQUIPOS_QUERY, {
    onCompleted: (data) => {
      console.log('✅ Query GET_ALL_ATRIBUTOS_EQUIPOS ejecutada exitosamente:', data);
    },
    onError: (error) => {
      console.error('❌ Error en query GET_ALL_ATRIBUTOS_EQUIPOS:', error);
    }
  });

  // Cargar datos iniciales (REST para el resto)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        // Cargar atributos desde GraphQL
        if (atributosData?.getAllAtributosEquipos) {
          setAtributos(atributosData.getAllAtributosEquipos);
          console.log('=== ATRIBUTOS CARGADOS DESDE GRAPHQL ===');
          console.log('atributosData:', atributosData.getAllAtributosEquipos);
          console.log('Cantidad de atributos:', atributosData.getAllAtributosEquipos.length);
          console.log('Ejemplo de atributo:', atributosData.getAllAtributosEquipos[0]);
          console.log('=== FIN ATRIBUTOS ===');
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setDataError(error instanceof Error ? error.message : 'Error desconocido al cargar los datos');
        toast.error('Error al cargar los datos');
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [atributosData]);

  // Actualizar marcas con datos de GraphQL
  useEffect(() => {
    if (marcasData?.marcas) {
      setMarcas(marcasData.marcas);
    }
  }, [marcasData]);

  // Actualizar modelos con datos de GraphQL
  useEffect(() => {
    if (modelosData?.modelos) {
      setModelos(modelosData.modelos);
    }
  }, [modelosData]);

  // Actualizar tipos de equipo con datos de GraphQL
  useEffect(() => {
    if (tiposData?.tiposEquipo) {
      setTiposEquipo(tiposData.tiposEquipo);
    }
  }, [tiposData]);

  // Manejar errores de GraphQL para marcas
  useEffect(() => {
    if (marcasError) {
      console.error('Error fetching marcas:', marcasError);
      toast.error('Error al cargar las marcas');
    }
  }, [marcasError]);

  // Manejar errores de GraphQL para modelos
  useEffect(() => {
    if (modelosError) {
      console.error('Error fetching modelos:', modelosError);
      toast.error('Error al cargar los modelos');
    }
  }, [modelosError]);

  // Manejar errores de GraphQL para tipos de equipo
  useEffect(() => {
    if (tiposError) {
      console.error('Error fetching tipos de equipo:', tiposError);
      toast.error('Error al cargar los tipos de equipo');
    }
  }, [tiposError]);

  // Manejar errores de GraphQL para atributos
  useEffect(() => {
    if (atributosError) {
      console.error('Error fetching atributos:', atributosError);
      toast.error('Error al cargar los atributos');
    }
  }, [atributosError]);

  // Estado de carga combinado
  const isLoading = dataLoading || marcasLoading || modelosLoading || tiposLoading || atributosLoading;

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
    atributosDinamicos: {} as Record<string, string | number>,
  };

  const methods = useForm<NewEquipoSchemaType>({
    resolver,
    defaultValues,
    mode: 'onChange', // Validar en tiempo real
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
  const atributosDinamicos = watch('atributosDinamicos');
  
  // Log simple para verificar que watch está funcionando
  console.log('🔄 WATCH - atributosDinamicos cambió:', atributosDinamicos);
  
  // Log directo de dependencias cada vez que cambie
  if (atributosDinamicos && atributosFiltrados.length > 0) {
    console.log('🔍 ANÁLISIS DIRECTO DE DEPENDENCIAS:');
    
    // Buscar atributos que dependen de otros
    const atributosConDependencias = atributosFiltrados.filter(attr => attr.atributoDependienteId && attr.atributoDependienteId > 0);
    console.log('Atributos con dependencias:', atributosConDependencias.map(attr => `${attr.nombre} (ID: ${attr.id}) -> depende de ID: ${attr.atributoDependienteId}`));
    
    // Buscar atributos de los que dependen otros
    const atributosDeLosQueDependen = atributosFiltrados.filter(attr => 
      atributosFiltrados.some(dep => dep.atributoDependienteId === attr.id)
    );
    console.log('Atributos de los que dependen otros:', atributosDeLosQueDependen.map(attr => {
      const dependientes = atributosFiltrados.filter(dep => dep.atributoDependienteId === attr.id);
      return `${attr.nombre} (ID: ${attr.id}) -> tiene ${dependientes.length} dependientes: ${dependientes.map(dep => dep.nombre).join(', ')}`;
    }));
    
         // Verificar el estado actual de las dependencias
     atributosDeLosQueDependen.forEach(attr => {
       const dependientes = atributosFiltrados.filter(dep => dep.atributoDependienteId === attr.id);
       const valorPrincipal = atributosDinamicos[attr.descripcionAtributo || attr.nombre];
       console.log(`\n🔍 Verificando dependientes de ${attr.nombre} (ID: ${attr.id}):`);
       console.log(`  Dependientes encontrados:`, dependientes.map(dep => `${dep.nombre} (ID: ${dep.id})`));
       console.log(`  Valor principal: ${valorPrincipal}`);
       
       const algunoDependienteTieneValor = dependientes.some(dep => {
         const valor = atributosDinamicos[dep.descripcionAtributo || dep.nombre];
         console.log(`    Verificando dependiente ${dep.nombre}: valor=${valor}, tipo=${typeof valor}`);
         
         if (valor === null || valor === undefined) {
           console.log(`    -> ${dep.nombre}: null/undefined, retornando false`);
           return false;
         }
         if (typeof valor === 'string') {
           const tieneValor = valor.trim() !== '';
           console.log(`    -> ${dep.nombre}: string "${valor}", tieneValor=${tieneValor}`);
           return tieneValor;
         }
         if (typeof valor === 'number') {
           const tieneValor = valor !== 0; // 0 se considera como valor vacío
           console.log(`    -> ${dep.nombre}: number ${valor}, tieneValor=${tieneValor}`);
           return tieneValor;
         }
         console.log(`    -> ${dep.nombre}: otro tipo, retornando ${!!valor}`);
         return valor;
       });
      
      console.log(`${attr.nombre}: valor=${valorPrincipal}, dependientes con valor=${algunoDependienteTieneValor}`);
    });
  }

  // Filtrar atributos cuando cambia el tipo de equipo
  useEffect(() => {
    const tipoEquipoId = tipoEquipoSelected?.id;
    console.log('=== FILTRANDO ATRIBUTOS ===');
    console.log('tipoEquipoId:', tipoEquipoId);
    console.log('atributos.length:', atributos.length);
    console.log('atributos:', atributos);
    
    if (tipoEquipoId && atributos.length > 0) {
      const filteredAtributos = atributos.filter(attr => attr.tipoEquipoId === tipoEquipoId);
      console.log('filteredAtributos:', filteredAtributos);
      console.log('Cantidad de atributos filtrados:', filteredAtributos.length);
      
      setAtributosFiltrados(filteredAtributos);
      
      // Crear schema dinámico
      const schema = createEquipoSchema(filteredAtributos);
      setEquipoSchema(schema);
      
      // Inicializar todos los campos de atributos dinámicos con valores apropiados
      const atributosDinamicosIniciales: Record<string, string | number> = {};
      filteredAtributos.forEach((atributo) => {
        const fieldName = atributo.descripcionAtributo || atributo.nombre;
        // Asegurar que el valor nunca sea undefined
        const currentValue = methods.getValues(`atributosDinamicos.${fieldName}`);
        console.log(`🔍 Inicializando ${fieldName}:`, {
          currentValue,
          tipo: typeof currentValue,
          esUndefined: currentValue === undefined,
          esNull: currentValue === null,
          esStringVacio: currentValue === ''
        });
        // Todos los campos empiezan como string vacío para consistencia en la validación
        atributosDinamicosIniciales[fieldName] = currentValue !== undefined ? currentValue : '';
        
        console.log(`Inicializando campo ${fieldName}:`, {
          tipoDato: atributo.tipoDato,
          valorInicial: atributosDinamicosIniciales[fieldName],
          currentValue
        });
      });
      
      console.log('atributosDinamicosIniciales:', atributosDinamicosIniciales);
      
      // Actualizar los valores del formulario
      console.log('🔧 ANTES DE SETVALUE - atributosDinamicosIniciales:', atributosDinamicosIniciales);
      methods.setValue('atributosDinamicos', atributosDinamicosIniciales);
      console.log('✅ ATRIBUTOS DINÁMICOS INICIALIZADOS:', atributosDinamicosIniciales);
      
      // Verificar si CAPACIDAD_RAM está en los valores iniciales
      if (atributosDinamicosIniciales['Capacidad RAM'] !== undefined) {
        console.log('🔍 CAPACIDAD_RAM en inicialización:', atributosDinamicosIniciales['Capacidad RAM']);
      }
    } else {
      console.log('No hay tipoEquipoId o atributos vacíos');
      setAtributosFiltrados([]);
      setEquipoSchema(null);
      // Limpiar atributos dinámicos cuando no hay tipo de equipo seleccionado
      methods.setValue('atributosDinamicos', {});
    }
    console.log('=== FIN FILTRADO ===');
  }, [tipoEquipoSelected, atributos, methods]);

  // Re-validar cuando cambia el schema
  useEffect(() => {
    if (equipoSchema) {
      // Limpiar errores y re-validar
      methods.clearErrors();
      methods.trigger();
    }
  }, [equipoSchema, methods]);

  // Re-validar cuando cambian los valores de atributos dinámicos
  useEffect(() => {
    console.log('🔄 RE-VALIDANDO CAMPOS DINÁMICOS');
    console.log('equipoSchema:', !!equipoSchema);
    console.log('atributosDinamicos:', atributosDinamicos);
    
    if (equipoSchema && atributosDinamicos) {
      // Re-validar solo los campos de atributos dinámicos
      Object.keys(atributosDinamicos).forEach(fieldName => {
        console.log(`  - Re-validando campo: ${fieldName}`);
        methods.trigger(`atributosDinamicos.${fieldName}`);
      });
    }
  }, [atributosDinamicos, equipoSchema, methods]);

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

    // Función para verificar si un atributo debe ser obligatorio basado en dependencias
  const verificarDependencias = useMemo(() => {
    console.log('🔄 EJECUTANDO verificarDependencias - useMemo se re-ejecutó');
    console.log('=== VERIFICANDO DEPENDENCIAS ===');
    console.log('atributosFiltrados.length:', atributosFiltrados.length);
    console.log('atributosDinamicos:', atributosDinamicos);
    
    if (!atributosFiltrados.length || !atributosDinamicos) {
      console.log('No hay atributos filtrados o atributosDinamicos, retornando true');
      return true;
    }

        const resultado = atributosFiltrados.every((atributo) => {
      console.log(`Verificando atributo: ${atributo.nombre} (ID: ${atributo.id})`);
      console.log(`  - atributoDependienteId: ${atributo.atributoDependienteId}`);
      
      // Si el atributo tiene dependencia
      if (atributo.atributoDependienteId && atributo.atributoDependienteId > 0) {
        const atributoDependiente = atributosFiltrados.find(attr => attr.id === atributo.atributoDependienteId);
        console.log(`  - Atributo dependiente encontrado:`, atributoDependiente);
        
        if (atributoDependiente) {
          const valorDependiente = atributosDinamicos[atributoDependiente.descripcionAtributo || atributoDependiente.nombre];
          const valorActual = atributosDinamicos[atributo.descripcionAtributo || atributo.nombre];
          
          console.log(`  - Valor dependiente:`, valorDependiente);
          console.log(`  - Valor actual:`, valorActual);
          
          // Verificar si el atributo dependiente tiene valor
          const tieneValorDependiente = (() => {
            if (valorDependiente === null || valorDependiente === undefined) {
              return false;
            }
            if (typeof valorDependiente === 'string') {
              return valorDependiente.trim() !== '';
            }
            if (typeof valorDependiente === 'number') {
              return valorDependiente !== 0; // 0 se considera como valor vacío
            }
            if (valorDependiente) {
              return true; // Para objetos, arrays, etc.
            }
            return false;
          })();
          
          // Verificar si el atributo actual tiene valor
          const tieneValorActual = (() => {
            if (valorActual === null || valorActual === undefined) {
              return false;
            }
            if (typeof valorActual === 'string') {
              return valorActual.trim() !== '';
            }
            if (typeof valorActual === 'number') {
              return valorActual !== 0; // 0 se considera como valor vacío
            }
            if (valorActual) {
              return true; // Para objetos, arrays, etc.
            }
            return false;
          })();
          
          console.log(`  - tieneValorDependiente:`, tieneValorDependiente);
          console.log(`  - tieneValorActual:`, tieneValorActual);
          
          // LÓGICA FLEXIBLE: Permitir que funcione con solo uno de los campos lleno
          // Si el atributo actual tiene valor pero el dependiente no, NO es un error
          if (tieneValorActual && !tieneValorDependiente) {
            console.log(`✅ Atributo ${atributo.nombre} (ID: ${atributo.id}) tiene valor pero su dependiente ${atributoDependiente.nombre} (ID: ${atributoDependiente.id}) está vacío - esto es válido`);
          }
          
          // Si el atributo dependiente tiene valor y el actual es obligatorio, verificar que tenga valor
          if (tieneValorDependiente && atributo.esObligatorio === 'S' && !tieneValorActual) {
            console.log(`❌ Atributo ${atributo.nombre} (ID: ${atributo.id}) es obligatorio por dependencia pero está vacío`);
            return false;
          }
          
          // Si ambos tienen valor, es válido
          if (tieneValorActual && tieneValorDependiente) {
            console.log(`✅ Ambos atributos tienen valor: ${atributo.nombre} y ${atributoDependiente.nombre}`);
          }
          
          // Si ninguno tiene valor, es válido (si no son obligatorios)
          if (!tieneValorActual && !tieneValorDependiente) {
            console.log(`✅ Ningún atributo tiene valor: ${atributo.nombre} y ${atributoDependiente.nombre} - esto es válido si no son obligatorios`);
          }
        }
      } else {
        console.log(`  - No tiene dependencia`);
      }
      
      return true;
    });
    
    console.log('✅ VERIFICAR DEPENDENCIAS RESULTADO:', resultado);
    return resultado;
  }, [atributosFiltrados, atributosDinamicos]);

  // Verificación adicional: si un atributo dependiente tiene valor, el atributo del que depende también debe tener valor
  const verificarDependenciasInversas = useMemo(() => {
    console.log('🔄 EJECUTANDO verificarDependenciasInversas - useMemo se re-ejecutó');
    console.log('🔄 EJECUTANDO verificarDependenciasInversas - INICIO DE FUNCIÓN');
    console.log('=== VERIFICANDO DEPENDENCIAS INVERSAS ===');
    console.log('atributosFiltrados.length:', atributosFiltrados.length);
    console.log('atributosDinamicos:', atributosDinamicos);
    
    // Debug específico para CAPACIDAD_RAM
    if (atributosDinamicos && atributosDinamicos['Capacidad RAM'] !== undefined) {
      console.log('🔍 DEBUG ESPECÍFICO CAPACIDAD_RAM:');
      console.log('  - Valor:', atributosDinamicos['Capacidad RAM']);
      console.log('  - Tipo:', typeof atributosDinamicos['Capacidad RAM']);
      console.log('  - Es string vacío:', atributosDinamicos['Capacidad RAM'] === '');
      console.log('  - Es null:', atributosDinamicos['Capacidad RAM'] === null);
      console.log('  - Es undefined:', atributosDinamicos['Capacidad RAM'] === undefined);
    }
    
    if (!atributosFiltrados.length || !atributosDinamicos) {
      console.log('No hay atributos filtrados o atributosDinamicos, retornando true');
      return true;
    }

    const resultado = atributosFiltrados.every((atributo) => {
      console.log(`🔍 Verificando dependencias inversas para: ${atributo.nombre} (ID: ${atributo.id})`);
      
      // Buscar si hay otros atributos que dependan de este
      const atributosQueDependen = atributosFiltrados.filter(attr => 
        attr.atributoDependienteId === atributo.id && attr.atributoDependienteId > 0
      );
      
      console.log(`  - Atributos que dependen de este:`, atributosQueDependen.map(attr => `${attr.nombre} (ID: ${attr.id})`));
      
      if (atributosQueDependen.length > 0) {
        const valorActual = atributosDinamicos[atributo.descripcionAtributo || atributo.nombre];
        console.log(`  - Valor actual del atributo:`, valorActual);
        
        // Verificar si el atributo actual tiene valor
        const tieneValorActual = (() => {
          console.log(`    🔍 Verificando valor de ${atributo.nombre}:`, {
            valor: valorActual,
            tipo: typeof valorActual,
            esNull: valorActual === null,
            esUndefined: valorActual === undefined,
            esStringVacio: valorActual === '',
            esStringConEspacios: typeof valorActual === 'string' ? valorActual.trim() === '' : false
          });
          
          if (valorActual === null || valorActual === undefined) {
            return false;
          }
          if (typeof valorActual === 'string') {
            return valorActual.trim() !== '';
          }
          if (typeof valorActual === 'number') {
            return valorActual !== 0; // 0 se considera como valor vacío
          }
          if (typeof valorActual === 'object' && valorActual !== null) {
            // Para objetos (como los de Autocomplete), verificar si tienen valor
            const obj = valorActual as { value?: any };
            return obj.value !== undefined && obj.value !== null && obj.value !== '';
          }
          if (valorActual) {
            return true; // Para otros tipos
          }
          return false;
        })();
        
        console.log(`  - tieneValorActual:`, tieneValorActual);
        
        // Verificar si alguno de los atributos que dependen tiene valor
        const algunoDependienteTieneValor = atributosQueDependen.some(attrDependiente => {
          const valorDependiente = atributosDinamicos[attrDependiente.descripcionAtributo || attrDependiente.nombre];
          console.log(`    - Valor de ${attrDependiente.nombre}:`, valorDependiente);
          console.log(`    🔍 Verificando valor de dependiente ${attrDependiente.nombre}:`, {
            valor: valorDependiente,
            tipo: typeof valorDependiente,
            esNull: valorDependiente === null,
            esUndefined: valorDependiente === undefined,
            esStringVacio: valorDependiente === '',
            esStringConEspacios: typeof valorDependiente === 'string' ? valorDependiente.trim() === '' : false
          });
          
          if (valorDependiente === null || valorDependiente === undefined) {
            return false;
          }
          if (typeof valorDependiente === 'string') {
            return valorDependiente.trim() !== '';
          }
          if (typeof valorDependiente === 'number') {
            return valorDependiente !== 0; // 0 se considera como valor vacío
          }
          if (typeof valorDependiente === 'object' && valorDependiente !== null) {
            // Para objetos (como los de Autocomplete), verificar si tienen valor
            const obj = valorDependiente as { value?: any };
            return obj.value !== undefined && obj.value !== null && obj.value !== '';
          }
          if (valorDependiente) {
            console.log(`    ✅ ${attrDependiente.nombre} tiene valor: true`);
            return true;
          }
          console.log(`    ❌ ${attrDependiente.nombre} no tiene valor: false`);
          return false;
        });
        
        console.log(`  - algunoDependienteTieneValor:`, algunoDependienteTieneValor);
        
        // Verificar si todos los dependientes tienen valor
        const todosDependientesTienenValor = atributosQueDependen.every(attrDependiente => {
          const valorDependiente = atributosDinamicos[attrDependiente.descripcionAtributo || attrDependiente.nombre];
          if (valorDependiente === null || valorDependiente === undefined) {
            return false;
          }
          if (typeof valorDependiente === 'string') {
            return valorDependiente.trim() !== '';
          }
          if (typeof valorDependiente === 'number') {
            return valorDependiente !== 0;
          }
          if (typeof valorDependiente === 'object' && valorDependiente !== null) {
            const obj = valorDependiente as { value?: any };
            return obj.value !== undefined && obj.value !== null && obj.value !== '';
          }
          return !!valorDependiente;
        });
        
        console.log(`  - todosDependientesTienenValor:`, todosDependientesTienenValor);
        
        // LÓGICA DE DEPENDENCIAS: 
        // 1. Si algún dependiente tiene valor, el atributo principal es obligatorio
        // 2. Si el atributo principal tiene valor, todos los dependientes deben tener valor
        console.log(`  🔍 CONDICIÓN 1: algunoDependienteTieneValor=${algunoDependienteTieneValor} && !tieneValorActual=${!tieneValorActual} = ${algunoDependienteTieneValor && !tieneValorActual}`);
        console.log(`  🔍 CONDICIÓN 2: tieneValorActual=${tieneValorActual} && !todosDependientesTienenValor=${!todosDependientesTienenValor} = ${tieneValorActual && !todosDependientesTienenValor}`);
        
        // CONDICIÓN 1: Si algún dependiente tiene valor, el padre debe tener valor
        console.log(`🔍 EVALUANDO CONDICIÓN 1 para ${atributo.nombre}:`);
        console.log(`  - algunoDependienteTieneValor: ${algunoDependienteTieneValor}`);
        console.log(`  - !tieneValorActual: ${!tieneValorActual}`);
        console.log(`  - Condición: ${algunoDependienteTieneValor && !tieneValorActual}`);
        
        if (algunoDependienteTieneValor && !tieneValorActual) {
          console.log(`❌ Atributo ${atributo.nombre} (ID: ${atributo.id}) está vacío pero tiene atributos dependientes con valor, por lo tanto es obligatorio:`, 
            atributosQueDependen.map(attr => `${attr.nombre} (ID: ${attr.id})`).join(', '));
          console.log(`🔴 RETORNANDO FALSE - Validación falló para ${atributo.nombre}`);
          return false;
        }
        
        console.log(`✅ CONDICIÓN 1 PASÓ para ${atributo.nombre}`);
        
        // CONDICIÓN 2: Si el padre tiene valor, todos los dependientes deben tener valor
        if (tieneValorActual && !todosDependientesTienenValor) {
          console.log(`❌ Atributo ${atributo.nombre} (ID: ${atributo.id}) tiene valor pero no todos sus dependientes tienen valor:`, 
            atributosQueDependen.map(attr => `${attr.nombre} (ID: ${attr.id})`).join(', '));
          console.log(`🔴 RETORNANDO FALSE - Validación falló para ${atributo.nombre}`);
          return false;
        }
        
        console.log(`✅ Condiciones pasaron para ${atributo.nombre}, continuando...`);
        
        // Si ambos tienen valor, es válido
        if (tieneValorActual && todosDependientesTienenValor) {
          console.log(`✅ Ambos atributos tienen valor: ${atributo.nombre} y todos sus dependientes`);
        }
        
        // Si ninguno tiene valor, es válido (si no son obligatorios)
        if (!tieneValorActual && !algunoDependienteTieneValor) {
          console.log(`✅ Ningún atributo tiene valor: ${atributo.nombre} y sus dependientes - esto es válido si no son obligatorios`);
        }
        
        console.log(`✅ ${atributo.nombre} - Validación pasó, retornando true`);
        return true;
      }
      
      console.log(`  - No hay atributos que dependan de este`);
      console.log(`✅ ${atributo.nombre} - Validación pasó (sin dependientes), retornando true`);
      return true;
    });
    
    console.log('✅ VERIFICAR DEPENDENCIAS INVERSAS RESULTADO:', resultado);
    console.log('🔍 RESULTADO FINAL DE VERIFICAR DEPENDENCIAS INVERSAS:', resultado);
    console.log('🔴 FINAL useMemo verificarDependenciasInversas:', resultado);
    return resultado;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atributosFiltrados, ...(atributosDinamicos ? Object.values(atributosDinamicos) : [])]);

    // Debug: Monitorear cambios en el estado del formulario
  useEffect(() => {
    console.log('=== FORM STATE CHANGED ===');
    console.log('isValid:', methods.formState.isValid);
    console.log('errors:', methods.formState.errors);
    console.log('verificarDependencias:', verificarDependencias);
    console.log('verificarDependenciasInversas:', verificarDependenciasInversas);
    console.log('current values:', methods.getValues());
    
    // Debug específico para campos básicos
    const values = methods.getValues();
    console.log('=== CAMPOS BÁSICOS ===');
    console.log('numeroSerie:', values.numeroSerie, 'tipo:', typeof values.numeroSerie);
    console.log('fechaAdquisicion:', values.fechaAdquisicion, 'tipo:', typeof values.fechaAdquisicion);
    console.log('tipoEquipo:', values.tipoEquipo);
    console.log('marca:', values.marca);
    console.log('modelo:', values.modelo);
    
    // Debug específico para atributos dinámicos
    console.log('=== ATRIBUTOS DINÁMICOS ===');
    if (values.atributosDinamicos) {
      Object.entries(values.atributosDinamicos).forEach(([key, value]) => {
        console.log(`${key}:`, value, 'tipo:', typeof value);
      });
    }
    
    // Debug específico para dependencias
    console.log('=== DEPENDENCIAS ===');
    console.log('atributosDinamicos:', values.atributosDinamicos);
    console.log('atributosDinamicos tipo:', typeof values.atributosDinamicos);
    console.log('atributosFiltrados:', atributosFiltrados.map(attr => ({
      id: attr.id,
      nombre: attr.nombre,
      descripcionAtributo: attr.descripcionAtributo,
      atributoDependienteId: attr.atributoDependienteId,
      esObligatorio: attr.esObligatorio,
      tipoDato: attr.tipoDato
    })));
    
    // Debug específico para dependencias
    console.log('=== ANÁLISIS DE DEPENDENCIAS ===');
    console.log('🔍 Analizando dependencias de atributos...');
    
    // 1. Mostrar todos los atributos que tienen dependencias (atributoDependienteId > 0)
    const atributosConDependencias = atributosFiltrados.filter(attr => attr.atributoDependienteId && attr.atributoDependienteId > 0);
    console.log('📋 ATRIBUTOS CON DEPENDENCIAS:');
    atributosConDependencias.forEach(attr => {
      console.log(`  - ${attr.nombre} (ID: ${attr.id}) -> depende de ID: ${attr.atributoDependienteId}`);
    });
    
    // 2. Mostrar todos los atributos de los que dependen otros
    const atributosDeLosQueDependen = atributosFiltrados.filter(attr => 
      atributosFiltrados.some(dep => dep.atributoDependienteId === attr.id)
    );
    console.log('📋 ATRIBUTOS DE LOS QUE DEPENDEN OTROS:');
    atributosDeLosQueDependen.forEach(attr => {
      const dependientes = atributosFiltrados.filter(dep => dep.atributoDependienteId === attr.id);
      console.log(`  - ${attr.nombre} (ID: ${attr.id}) -> tiene ${dependientes.length} dependientes:`, 
        dependientes.map(dep => `${dep.nombre} (ID: ${dep.id})`));
    });
    
    // 3. Verificar si todos los dependientes están completados
    console.log('🔍 VERIFICACIÓN DE DEPENDIENTES COMPLETADOS:');
    atributosDeLosQueDependen.forEach(attr => {
      const dependientes = atributosFiltrados.filter(dep => dep.atributoDependienteId === attr.id);
      console.log(`\n📊 Verificando ${attr.nombre} (ID: ${attr.id}):`);
      
      // Verificar si el atributo principal tiene valor
      const valorPrincipal = values.atributosDinamicos?.[attr.descripcionAtributo || attr.nombre];
      const tieneValorPrincipal = valorPrincipal && valorPrincipal !== '' && valorPrincipal !== null && valorPrincipal !== undefined;
      console.log(`  - ${attr.nombre} tiene valor: ${tieneValorPrincipal} (${valorPrincipal})`);
      
      // Verificar cada dependiente
      dependientes.forEach(dep => {
        const valorDependiente = values.atributosDinamicos?.[dep.descripcionAtributo || dep.nombre];
        const tieneValorDependiente = valorDependiente && valorDependiente !== '' && valorDependiente !== null && valorDependiente !== undefined;
        console.log(`  - ${dep.nombre} (ID: ${dep.id}) tiene valor: ${tieneValorDependiente} (${valorDependiente})`);
      });
      
      // Verificar si todos los dependientes están completados
      const todosDependientesCompletados = dependientes.every(dep => {
        const valor = values.atributosDinamicos?.[dep.descripcionAtributo || dep.nombre];
        return valor && valor !== '' && valor !== null && valor !== undefined;
      });
      
      console.log(`  ✅ Todos los dependientes completados: ${todosDependientesCompletados}`);
      
      // Verificar si algún dependiente está completado
      const algunoDependienteCompletado = dependientes.some(dep => {
        const valor = values.atributosDinamicos?.[dep.descripcionAtributo || dep.nombre];
        return valor && valor !== '' && valor !== null && valor !== undefined;
      });
      
      console.log(`  🔄 Algún dependiente completado: ${algunoDependienteCompletado}`);
    });
    
    // Debug detallado de cada atributo dinámico
    if (values.atributosDinamicos) {
      console.log('=== VALORES DETALLADOS DE ATRIBUTOS ===');
      Object.entries(values.atributosDinamicos).forEach(([key, value]) => {
        console.log(`${key}:`, {
          valor: value,
          tipo: typeof value,
          esNull: value === null,
          esUndefined: value === undefined,
          esStringVacio: value === ''
        });
      });
    }
  }, [methods.formState.isValid, methods.formState.errors, verificarDependencias, verificarDependenciasInversas, methods, atributosFiltrados]);

  // Forzar re-ejecución de verificaciones cuando cambien los valores de atributos dinámicos
  useEffect(() => {
    console.log('🔄 VALORES DE ATRIBUTOS DINÁMICOS CAMBIARON');
    console.log('atributosDinamicos:', atributosDinamicos);
    console.log('tipo de atributosDinamicos:', typeof atributosDinamicos);
    console.log('es null:', atributosDinamicos === null);
    console.log('es undefined:', atributosDinamicos === undefined);
    
    // Log específico para verificar si CAPACIDAD_RAM cambió sin que se haya modificado directamente
    if (atributosDinamicos && atributosDinamicos['Capacidad RAM'] !== undefined) {
      console.log('🔍 CAPACIDAD_RAM actual:', atributosDinamicos['Capacidad RAM']);
    }
    
    if (!atributosDinamicos) {
      console.log('❌ atributosDinamicos es null o undefined, no se pueden analizar dependencias');
      return;
    }
    
    // Logs específicos de dependencias en tiempo real
    console.log('=== ANÁLISIS DE DEPENDENCIAS EN TIEMPO REAL ===');
    console.log('🔍 Analizando dependencias de atributos...');
    
    // 1. Mostrar todos los atributos que tienen dependencias (atributoDependienteId > 0)
    const atributosConDependencias = atributosFiltrados.filter(attr => attr.atributoDependienteId && attr.atributoDependienteId > 0);
    console.log('📋 ATRIBUTOS CON DEPENDENCIAS:');
    atributosConDependencias.forEach(attr => {
      console.log(`  - ${attr.nombre} (ID: ${attr.id}) -> depende de ID: ${attr.atributoDependienteId}`);
    });
    
    // 2. Mostrar todos los atributos de los que dependen otros
    const atributosDeLosQueDependen = atributosFiltrados.filter(attr => 
      atributosFiltrados.some(dep => dep.atributoDependienteId === attr.id)
    );
    console.log('📋 ATRIBUTOS DE LOS QUE DEPENDEN OTROS:');
    atributosDeLosQueDependen.forEach(attr => {
      const dependientes = atributosFiltrados.filter(dep => dep.atributoDependienteId === attr.id);
      console.log(`  - ${attr.nombre} (ID: ${attr.id}) -> tiene ${dependientes.length} dependientes:`, 
        dependientes.map(dep => `${dep.nombre} (ID: ${dep.id})`));
    });
    
    // 3. Verificar si todos los dependientes están completados
    console.log('🔍 VERIFICACIÓN DE DEPENDIENTES COMPLETADOS:');
    atributosDeLosQueDependen.forEach(attr => {
      const dependientes = atributosFiltrados.filter(dep => dep.atributoDependienteId === attr.id);
      console.log(`\n📊 Verificando ${attr.nombre} (ID: ${attr.id}):`);
      
      // Verificar si el atributo principal tiene valor
      const valorPrincipal = atributosDinamicos[attr.descripcionAtributo || attr.nombre];
      const tieneValorPrincipal = valorPrincipal && valorPrincipal !== '' && valorPrincipal !== null && valorPrincipal !== undefined;
      console.log(`  - ${attr.nombre} tiene valor: ${tieneValorPrincipal} (${valorPrincipal})`);
      
      // Verificar cada dependiente
      dependientes.forEach(dep => {
        const valorDependiente = atributosDinamicos[dep.descripcionAtributo || dep.nombre];
        const tieneValorDependiente = valorDependiente && valorDependiente !== '' && valorDependiente !== null && valorDependiente !== undefined;
        console.log(`  - ${dep.nombre} (ID: ${dep.id}) tiene valor: ${tieneValorDependiente} (${valorDependiente})`);
      });
      
      // Verificar si todos los dependientes están completados
      const todosDependientesCompletados = dependientes.every(dep => {
        const valor = atributosDinamicos[dep.descripcionAtributo || dep.nombre];
        return valor && valor !== '' && valor !== null && valor !== undefined;
      });
      
      console.log(`  ✅ Todos los dependientes completados: ${todosDependientesCompletados}`);
      
      // Verificar si algún dependiente está completado
      const algunoDependienteCompletado = dependientes.some(dep => {
        const valor = atributosDinamicos[dep.descripcionAtributo || dep.nombre];
        return valor && valor !== '' && valor !== null && valor !== undefined;
      });
      
      console.log(`  🔄 Algún dependiente completado: ${algunoDependienteCompletado}`);
    });
    
    // Debug detallado de cada atributo dinámico
    console.log('=== VALORES DETALLADOS DE ATRIBUTOS ===');
    Object.entries(atributosDinamicos).forEach(([key, value]) => {
      console.log(`${key}:`, {
        valor: value,
        tipo: typeof value,
        esNull: value === null,
        esUndefined: value === undefined,
        esStringVacio: value === ''
      });
    });
    
    // Forzar re-validación del formulario
    methods.trigger();
  }, [atributosDinamicos, atributosFiltrados, methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      const isEdit = !!currentEquipo;
      
      // Filtrar atributos dinámicos para remover valores vacíos
      const atributosFiltradosParaEnvio = data.atributosDinamicos ? 
        Object.entries(data.atributosDinamicos).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string | number>) : {};
      
      // Preparar datos del equipo
      const equipoData = {
        ...(isEdit && { id: currentEquipo.id }), // Solo incluir ID si es edición
        tipoEquipoId: data.tipoEquipo!.id,
        marcaId: data.marca!.id,
        modeloId: data.modelo!.id,
        numeroSerie: data.numeroSerie,
        fechaAdquisicion: data.fechaAdquisicion,
        observaciones: data.observaciones || '',
        // Agregar atributos dinámicos filtrados
        ...atributosFiltradosParaEnvio,
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
  if (isLoading) {
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
            onChange={(event, newValue) => {
              methods.setValue('tipoEquipo', newValue, { shouldValidate: true });
            }}
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
            onChange={(event, newValue) => {
              methods.setValue('marca', newValue, { shouldValidate: true });
            }}
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
            onChange={(event, newValue) => {
              methods.setValue('modelo', newValue, { shouldValidate: true });
            }}
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
              {!verificarDependencias && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Algunos campos se han vuelto obligatorios debido a las dependencias de atributos. Complete los campos marcados con * para continuar.
                </Alert>
              )}
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
                // Verificar si este atributo es obligatorio por dependencia
                const esObligatorioPorDependencia = () => {
                  if (!atributo.atributoDependienteId || atributo.atributoDependienteId <= 0) return false;
                  
                  const atributoDependiente = atributosFiltrados.find(attr => attr.id === atributo.atributoDependienteId);
                  if (!atributoDependiente) return false;
                  
                  const valorDependiente = atributosDinamicos?.[atributoDependiente.descripcionAtributo || atributoDependiente.nombre];
                  
                  // Verificar si el valor existe y no está vacío
                  if (valorDependiente === null || valorDependiente === undefined) {
                    return false;
                  }
                  if (typeof valorDependiente === 'string') {
                    return valorDependiente.trim() !== '';
                  }
                  if (typeof valorDependiente === 'number') {
                    return true; // Cualquier número válido (incluyendo 0) se considera válido
                  }
                  if (typeof valorDependiente === 'object' && valorDependiente !== null) {
                    // Para objetos (como los de Autocomplete), verificar si tienen valor
                    const obj = valorDependiente as { value?: any };
                    return obj.value !== undefined && obj.value !== null && obj.value !== '';
                  }
                  if (valorDependiente) {
                    return true; // Para otros tipos
                  }
                  
                  return false;
                };

                // Verificar si este atributo es obligatorio porque otros dependen de él
                const esObligatorioPorDependientes = () => {
                  // Buscar si hay otros atributos que dependan de este
                  const atributosQueDependen = atributosFiltrados.filter(attr => 
                    attr.atributoDependienteId === atributo.id && attr.atributoDependienteId > 0
                  );
                  
                  if (atributosQueDependen.length === 0) return false;
                  
                  // Verificar si alguno de los atributos que dependen tiene valor
                  return atributosQueDependen.some(attrDependiente => {
                    const valorDependiente = atributosDinamicos?.[attrDependiente.descripcionAtributo || attrDependiente.nombre];
                    
                    if (valorDependiente === null || valorDependiente === undefined) {
                      return false;
                    }
                    if (typeof valorDependiente === 'string') {
                      return valorDependiente.trim() !== '';
                    }
                    if (typeof valorDependiente === 'number') {
                      return true;
                    }
                    if (typeof valorDependiente === 'object' && valorDependiente !== null) {
                      const obj = valorDependiente as { value?: any };
                      return obj.value !== undefined && obj.value !== null && obj.value !== '';
                    }
                    if (valorDependiente) {
                      return true;
                    }
                    return false;
                  });
                };

                const esObligatorio = atributo.esObligatorio === 'S' || esObligatorioPorDependencia() || esObligatorioPorDependientes();
                
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

                // Crear opciones para el tipo lista
                const getOpcionesLista = () => {
                  if (atributo.tipoDato === 'lista') {
                    // Procesar opcionesListaArray si está disponible pero está mal formateado
                    if (atributo.opcionesListaArray && atributo.opcionesListaArray.length > 0) {
                      // Si el array tiene un solo string con saltos de línea, procesarlo
                      if (atributo.opcionesListaArray.length === 1 && 
                          typeof atributo.opcionesListaArray[0] === 'string' && 
                          atributo.opcionesListaArray[0].includes('\n')) {
                        
                        // El backend devolvió algo como ["HOLA\nMUNDO\nDSAS"] en lugar de ["HOLA", "MUNDO", "DSAS"]
                        const opcionesProcesadas = atributo.opcionesListaArray[0]
                          .split('\n')
                          .map(opcion => opcion.trim())
                          .filter(opcion => opcion !== '')
                          .map(opcion => ({
                            value: opcion,
                            label: opcion
                          }));
                        
                        console.log(`🔄 Opciones reprocesadas desde array mal formateado para ${atributo.nombre}:`, opcionesProcesadas);
                        return opcionesProcesadas;
                      }
                      
                      // Si el array está bien formateado, usarlo directamente
                      return atributo.opcionesListaArray.map(opcion => ({
                        value: opcion,
                        label: opcion
                      }));
                    }
                    
                    // Fallback: procesar el string opcionesLista si no hay array o está vacío
                    if (atributo.opcionesLista) {
                      const opcionesProcesadas = atributo.opcionesLista
                        .split('\n')
                        .map(opcion => opcion.trim())
                        .filter(opcion => opcion !== '')
                        .map(opcion => ({
                          value: opcion,
                          label: opcion
                        }));
                      
                      console.log(`🔄 Opciones procesadas desde string para ${atributo.nombre}:`, opcionesProcesadas);
                      return opcionesProcesadas;
                    }
                  }
                  return [];
                };

                if (atributo.tipoDato === 'numero') {
                  return (
                    <Field.NumberMasked
                      key={atributo.id}
                      name={`atributosDinamicos.${atributo.descripcionAtributo}`}
                      label={`${atributo.descripcionAtributo}${esObligatorio ? ' *' : ''}`}
                      placeholder={getPlaceholder()}
                      helperText={atributo.descripcionAtributo || `${atributo.nombre} del equipo${esObligatorio ? ' (requerido)' : ' (opcional)'}`}
                    />
                  );
                }
                
                if (atributo.tipoDato === 'lista') {
                  const opciones = getOpcionesLista();
                  const currentValue = atributosDinamicos?.[atributo.descripcionAtributo || atributo.nombre];
                  
                  // Encontrar la opción correspondiente al valor actual
                  const selectedOption = currentValue ? opciones.find(opt => opt.value === currentValue) : null;
                  
                  return (
                    <Field.Autocomplete
                      key={atributo.id}
                      name={`atributosDinamicos.${atributo.descripcionAtributo}`}
                      label={`${atributo.descripcionAtributo}${esObligatorio ? ' *' : ''}`}
                      options={opciones}
                      value={selectedOption || null}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') {
                          return option;
                        }
                        return option.label;
                      }}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        if (typeof value === 'string') {
                          return option.value === value;
                        }
                        if (typeof value === 'object' && value !== null) {
                          return option.value === value.value;
                        }
                        return false;
                      }}
                      onChange={(event, newValue) => {
                        // Guardar solo el valor, no el objeto completo
                        const valueToSave = newValue ? newValue.value : '';
                        console.log(`🔄 CAMBIANDO VALOR DE ${atributo.descripcionAtributo}:`, {
                          newValue,
                          valueToSave,
                          atributoId: atributo.id,
                          atributoNombre: atributo.nombre
                        });
                        methods.setValue(`atributosDinamicos.${atributo.descripcionAtributo}`, valueToSave, { shouldValidate: true });
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.label}
                        </li>
                      )}
                      placeholder="Seleccione una opción"
                      helperText={atributo.descripcionAtributo || `${atributo.nombre} del equipo${esObligatorio ? ' (requerido)' : ' (opcional)'}`}
                    />
                  );
                }
                
                return (
                  <Field.Text
                    key={atributo.id}
                    name={`atributosDinamicos.${atributo.descripcionAtributo}`}
                    label={`${atributo.descripcionAtributo}${esObligatorio ? ' *' : ''}`}
                    placeholder={getPlaceholder()}
                    helperText={atributo.descripcionAtributo || `${atributo.nombre} del equipo${esObligatorio ? ' (requerido)' : ' (opcional)'}`}
                  />
                );
              })}
            </Box>
          </>
        )}

        {/* Alertas de dependencias */}
        {(!verificarDependencias || !verificarDependenciasInversas) && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Hay campos con dependencias que no se cumplen. Por favor, completa los campos requeridos.
          </Alert>
        )}

        {tienePermisoCrear ? (
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting || loading}
            disabled={!methods.formState.isValid || !verificarDependencias || !verificarDependenciasInversas}
            onClick={() => {
              console.log('=== DEBUG FORM STATE ===');
              console.log('formState.isValid:', methods.formState.isValid);
              console.log('verificarDependencias:', verificarDependencias);
              console.log('verificarDependenciasInversas:', verificarDependenciasInversas);
              console.log('formState.errors:', methods.formState.errors);
              console.log('current values:', methods.getValues());
              console.log('atributosDinamicos:', atributosDinamicos);
              console.log('=== END DEBUG ===');
            }}
            sx={{ ml: 'auto' }}
          >
            {currentEquipo ? 'Actualizar Equipo' : 'Crear Equipo'}
          </LoadingButton>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No tienes permisos para crear o editar equipos.
          </Alert>
        )}
        
        {/* Debug adicional */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Debug Info:
          </Typography>
          <Typography variant="body2">
            formState.isValid: {methods.formState.isValid ? 'true' : 'false'}
          </Typography>
          <Typography variant="body2">
            verificarDependencias: {verificarDependencias ? 'true' : 'false'}
          </Typography>
          <Typography variant="body2">
            verificarDependenciasInversas: {verificarDependenciasInversas ? 'true' : 'false'}
          </Typography>
          <Typography variant="body2">
            Botón deshabilitado: {(!methods.formState.isValid || !verificarDependencias || !verificarDependenciasInversas) ? 'true' : 'false'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
            Valores actuales de atributos:
          </Typography>
          {atributosDinamicos && Object.entries(atributosDinamicos).map(([key, value]) => (
            <Typography key={key} variant="body2" sx={{ ml: 2 }}>
              {key}: &quot;{value}&quot; (tipo: {typeof value})
            </Typography>
          ))}
        </Box>
      </Card>
    </Form>
  );
} 