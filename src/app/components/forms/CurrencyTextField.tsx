import React, { forwardRef, useCallback, useMemo } from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

interface CurrencyTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (value: number) => void;
  prefix?: string;
}

/**
 * TextField com máscara de moeda em formato brasileiro (R$ 1.234,56)
 * Funciona com react-hook-form via Controller
 * Aceita entrada com ponto OU vírgula como separador decimal
 * Envia valor numérico (ex: 1234.56) para a API
 */
export const CurrencyTextField = forwardRef<HTMLInputElement, CurrencyTextFieldProps>(
  (
    {
      value = '',
      onChange,
      prefix = 'R$ ',
      ...rest
    },
    ref
  ) => {
    const formatCurrencyValue = (inputValue: string): { formatted: string; numeric: number } => {
      let processedValue = inputValue.trim();

      // Aceita vírgula OU ponto como separador decimal
      if (processedValue.includes(',')) {
        processedValue = processedValue.replace(',', '.');
      }

      // Remove tudo exceto dígitos e ponto
      const parts = processedValue.split('.');
      const intPart = parts[0]?.replace(/\D/g, '') || '0';
      const decPart = parts.length > 1 ? parts[parts.length - 1]?.replace(/\D/g, '').slice(0, 2) : '00';

      const fullNum = intPart + decPart;
      const cleanNum = fullNum.replace(/\D/g, '');

      if (!cleanNum || cleanNum === '0') {
        return { formatted: '0,00', numeric: 0 };
      }

      const centavos = (cleanNum.slice(-2) || '00').padStart(2, '0');
      let reais = cleanNum.slice(0, -2) || '0';

      reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      const formatted = reais + ',' + centavos;
      const numeric = parseFloat(reais.replace(/\./g, '') + '.' + centavos);

      return { formatted, numeric };
    };

    const displayValue = useMemo(() => {
      if (!value && value !== 0) return '';
      const numValue = typeof value === 'string' ? value : value.toString();
      return formatCurrencyValue(numValue).formatted;
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const { formatted, numeric } = formatCurrencyValue(inputValue);

        if (onChange) {
          onChange(numeric);
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
        placeholder="0,00"
        InputProps={{
          ...rest.InputProps,
          startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
        }}
        inputProps={{
          ...rest.inputProps,
          maxLength: 20,
        }}
      />
    );
  }
);

CurrencyTextField.displayName = 'CurrencyTextField';
