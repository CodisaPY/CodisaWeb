import type { TextFieldProps } from '@mui/material/TextField';

import { Controller, useFormContext } from 'react-hook-form';
import { useState, useCallback } from 'react';

import TextField from '@mui/material/TextField';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
};

export function RHFNumberMasked({ name, helperText, ...other }: Props) {
  const { control } = useFormContext();
  const [displayValue, setDisplayValue] = useState('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, onChange: (value: number) => void) => {
    const inputValue = event.target.value;
    
    // Remover todos los caracteres no numéricos excepto punto decimal
    const numericValue = inputValue.replace(/[^\d.]/g, '');
    
    // Convertir a número
    const numberValue = parseFloat(numericValue) || 0;
    
    // Actualizar el valor del formulario
    onChange(numberValue);
    
    // Actualizar el valor de visualización con formato
    if (numberValue > 0) {
      setDisplayValue(fNumber(numberValue));
    } else {
      setDisplayValue('');
    }
  }, []);

  const handleBlur = useCallback((onChange: (value: number) => void) => {
    // Al perder el foco, asegurar que el valor esté formateado
    const currentValue = parseFloat(displayValue.replace(/[^\d.]/g, '')) || 0;
    onChange(currentValue);
    if (currentValue > 0) {
      setDisplayValue(fNumber(currentValue));
    }
  }, [displayValue]);

  const handleFocus = useCallback(() => {
    // Al obtener el foco, mostrar el valor sin formato para facilitar la edición
    const numericValue = displayValue.replace(/[^\d.]/g, '');
    setDisplayValue(numericValue);
  }, [displayValue]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type="text"
          value={displayValue}
          onChange={(event) => handleChange(event, field.onChange)}
          onBlur={() => handleBlur(field.onChange)}
          onFocus={handleFocus}
          error={!!error}
          helperText={error?.message ?? helperText}
          inputProps={{
            autoComplete: 'off',
            inputMode: 'decimal',
          }}
          {...other}
        />
      )}
    />
  );
} 