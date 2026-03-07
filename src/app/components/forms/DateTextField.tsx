import React, { forwardRef, useCallback, useMemo } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface DateTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * TextField com máscara de data DD/MM/YYYY (padrão brasileiro)
 * Funciona com react-hook-form via Controller
 * Aceita YYYY-MM-DD (formato de API) e exibe DD/MM/YYYY
 */
export const DateTextField = forwardRef<HTMLInputElement, DateTextFieldProps>(
  (
    {
      value = '',
      onChange,
      ...rest
    },
    ref
  ) => {
    // Converte YYYY-MM-DD (API) para DD/MM/YYYY (exibição)
    const displayValue = useMemo(() => {
      if (!value) return '';
      if (value.includes('-')) {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
      }
      return '';
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const cleaned = inputValue.replace(/\D/g, '');

        let formatted = cleaned;
        if (cleaned.length >= 2) {
          formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length >= 4) {
          formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
        }

        // Converte DD/MM/YYYY para YYYY-MM-DD para API
        let apiFormat = '';
        if (cleaned.length === 8) {
          const day = cleaned.slice(0, 2);
          const month = cleaned.slice(2, 4);
          const year = cleaned.slice(4, 8);
          apiFormat = `${year}-${month}-${day}`;
        }

        if (onChange) {
          onChange(apiFormat);
        }

        e.target.value = formatted;
      },
      [onChange]
    );

    return (
      <TextField
        ref={ref}
        {...rest}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="DD/MM/YYYY"
        inputProps={{
          ...rest.inputProps,
          maxLength: 10,
        }}
      />
    );
  }
);

DateTextField.displayName = 'DateTextField';
