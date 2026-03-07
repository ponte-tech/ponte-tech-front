import React, { forwardRef, useCallback, useMemo } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useMask, MaskType, getMaskPlaceholder } from '@/app/hooks/useMask';

interface MaskedTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  maskType: MaskType;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * TextField component with input mask
 * Funciona com react-hook-form via Controller
 * Supports: phone, cpf, cnpj, cep, date
 */
export const MaskedTextField = forwardRef<HTMLInputElement, MaskedTextFieldProps>(
  (
    {
      maskType,
      value = '',
      onChange,
      placeholder,
      helperText,
      ...rest
    },
    ref
  ) => {
    const { format, unformat } = useMask(maskType);

    // Formata o valor sempre que ele muda
    const displayValue = useMemo(() => {
      return format(value);
    }, [value, format]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formatted = format(inputValue);

        if (onChange) {
          onChange(formatted);
        }

        // Atualiza o valor do input para a versão formatada
        e.target.value = formatted;
      },
      [format, onChange]
    );

    return (
      <TextField
        ref={ref}
        {...rest}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder || getMaskPlaceholder(maskType)}
        helperText={helperText}
        inputProps={{
          ...rest.inputProps,
          maxLength: maskType === 'phone' ? 15 : maskType === 'cpf' ? 14 : maskType === 'cnpj' ? 18 : maskType === 'cep' ? 9 : 10,
        }}
      />
    );
  }
);

MaskedTextField.displayName = 'MaskedTextField';
