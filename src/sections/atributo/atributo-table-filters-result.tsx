import type { IAtributoTableFilters } from 'src/types/atributo';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';

import { useCallback } from 'react';
import Chip from '@mui/material/Chip';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type TipoEquipoOption = { id: number; nombre: string };

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  onResetPage: () => void;
  filters: UseSetStateReturn<IAtributoTableFilters>;
  tipoEquipoOptions: TipoEquipoOption[];
};

export function AtributoTableFiltersResult({
  filters,
  onResetPage,
  totalResults,
  sx,
  tipoEquipoOptions,
}: Props) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ keyword: '' });
  }, [filters, onResetPage]);

  const handleRemoveTipoEquipo = useCallback((id: number) => {
    const newValue = filters.state.tipoEquipo.filter((item) => item !== id);
    onResetPage();
    filters.setState({ tipoEquipo: newValue });
  }, [filters, onResetPage]);

  const handleRemoveTipoDato = useCallback((tipo: string) => {
    const newValue = filters.state.tipoDato.filter((item) => item !== tipo);
    onResetPage();
    filters.setState({ tipoDato: newValue });
  }, [filters, onResetPage]);

  const handleRemoveObligatorio = useCallback((valor: string) => {
    const newValue = filters.state.obligatorio.filter((item) => item !== valor);
    onResetPage();
    filters.setState({ obligatorio: newValue });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
    // Limpiar filtros, paginado y densidad guardados en localStorage
    localStorage.removeItem('atributo-filters');
    localStorage.removeItem('atributo-pagination');
    localStorage.removeItem('atributo-dense');
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Tipo de Equipo:" isShow={!!filters.state.tipoEquipo.length}>
        {filters.state.tipoEquipo.map((id) => {
          const nombre = tipoEquipoOptions.find((t) => t.id === id)?.nombre || id;
          return (
            <Chip
              {...chipProps}
              key={id}
              label={nombre}
              onDelete={() => handleRemoveTipoEquipo(id)}
            />
          );
        })}
      </FiltersBlock>

      <FiltersBlock label="Tipo de Dato:" isShow={!!filters.state.tipoDato.length}>
        {filters.state.tipoDato.map((tipo) => (
          <Chip
            {...chipProps}
            key={tipo}
            label={tipo === 'texto' ? 'Texto' : tipo === 'numero' ? 'Número' : tipo}
            onDelete={() => handleRemoveTipoDato(tipo)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Obligatorio:" isShow={!!filters.state.obligatorio.length}>
        {filters.state.obligatorio.map((valor) => (
          <Chip
            {...chipProps}
            key={valor}
            label={valor === 'S' ? 'Sí' : valor === 'N' ? 'No' : valor}
            onDelete={() => handleRemoveObligatorio(valor)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Búsqueda:" isShow={!!filters.state.keyword}>
        <Chip {...chipProps} label={filters.state.keyword} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
} 