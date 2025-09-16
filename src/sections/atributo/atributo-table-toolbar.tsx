import { useRef, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import type { IAtributoTableFilters } from 'src/types/atributo';

type Props = {
  filters: {
    state: IAtributoTableFilters;
    setState: (s: Partial<IAtributoTableFilters>) => void;
    onResetState: () => void;
  };
  onResetPage: () => void;
  onResetFilters?: () => void;
  dense?: boolean;
  onToggleDense?: () => void;
  options: {
    tiposEquipo: { id: number; nombre: string }[];
  };
};

export function AtributoTableToolbar({ filters, options, onResetPage, onResetFilters, dense, onToggleDense }: Props) {
  const popover = usePopover();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleFilterKeyword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      filters.setState({ keyword: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterTipoEquipo = useCallback(
    (event: any) => {
      const newValue =
        typeof event.target.value === 'string'
          ? event.target.value.split(',').map(Number)
          : event.target.value;
      onResetPage();
      filters.setState({ tipoEquipo: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterTipoDato = useCallback(
    (event: any) => {
      const newValue =
        typeof event.target.value === 'string'
          ? event.target.value.split(',')
          : event.target.value;
      onResetPage();
      filters.setState({ tipoDato: newValue });
    },
    [filters, onResetPage]
  );

  const handleFilterObligatorio = useCallback(
    (event: any) => {
      const newValue =
        typeof event.target.value === 'string'
          ? event.target.value.split(',')
          : event.target.value;
      onResetPage();
      filters.setState({ obligatorio: newValue });
    },
    [filters, onResetPage]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel>Tipo de Equipo</InputLabel>
          <Select
            multiple
            value={filters.state.tipoEquipo}
            onChange={handleFilterTipoEquipo}
            input={<OutlinedInput label="Tipo de Equipo" />}
            renderValue={(selected) =>
              selected
                .map(
                  (id: number) =>
                    (options.tiposEquipo || []).find((t) => t.id === id)?.nombre || id
                )
                .join(', ')
            }
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            {(options.tiposEquipo || []).map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.tipoEquipo.includes(option.id)}
                />
                {option.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 160 } }}>
          <InputLabel>Tipo de Dato</InputLabel>
          <Select
            multiple
            value={filters.state.tipoDato}
            onChange={handleFilterTipoDato}
            input={<OutlinedInput label="Tipo de Dato" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="texto">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.state.tipoDato.includes('texto')}
              />
              Texto
            </MenuItem>
            <MenuItem value="numero">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.state.tipoDato.includes('numero')}
              />
              Número
            </MenuItem>
            <MenuItem value="lista">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.state.tipoDato.includes('lista')}
              />
              Lista
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 140 } }}>
          <InputLabel>Obligatorio</InputLabel>
          <Select
            multiple
            value={filters.state.obligatorio}
            onChange={handleFilterObligatorio}
            input={<OutlinedInput label="Obligatorio" />}
            renderValue={(selected) =>
              selected
                .map((v: string) => (v === 'S' ? 'Sí' : 'No'))
                .join(', ')
            }
            MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          >
            <MenuItem value="S">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.state.obligatorio.includes('S')}
              />
              Sí
            </MenuItem>
            <MenuItem value="N">
              <Checkbox
                disableRipple
                size="small"
                checked={filters.state.obligatorio.includes('N')}
              />
              No
            </MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.state.keyword}
            onChange={handleFilterKeyword}
            placeholder="Buscar por nombre o descripción..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {onToggleDense && (
            <Tooltip title={dense ? 'Vista normal' : 'Vista compacta'}>
              <IconButton onClick={onToggleDense}>
                <Iconify icon={dense ? 'eva:expand-fill' : 'eva:collapse-fill'} />
              </IconButton>
            </Tooltip>
          )}

          <IconButton ref={buttonRef} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={buttonRef.current}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <Stack spacing={1} sx={{ p: 1 }}>
          {onResetFilters && (
            <MenuItem
              onClick={() => {
                onResetFilters();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
              Limpiar filtros
            </MenuItem>
          )}
        </Stack>
      </CustomPopover>
    </>
  );
} 