export type IAtributoTableFilters = {
  keyword: string;
  tipoEquipo: number[];
  tipoDato: string[];
  obligatorio: string[];
};

export type AtributoItem = {
  id: number;
  nombre: string;
  tipoEquipoId: number;
  tipoEquipoNombre: string;
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