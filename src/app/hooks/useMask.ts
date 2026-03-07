export type MaskType = 'phone' | 'cpf' | 'cnpj' | 'cep' | 'date' | 'currency';


/**
 * Hook to format and unmask values
 */
export const useMask = (type: MaskType) => {
  const format = (value: string): string => {
    if (!value) return '';

    // Remove non-numeric characters
    let cleaned = value.replace(/\D/g, '');

    // Apply mask pattern based on type
    switch (type) {
      case 'phone':
        if (cleaned.length <= 10) {
          return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        }
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

      case 'cpf':
        return cleaned
          .slice(0, 11)
          .replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');

      case 'cnpj':
        return cleaned
          .slice(0, 14)
          .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');

      case 'cep':
        return cleaned
          .slice(0, 8)
          .replace(/(\d{5})(\d{0,3})/, '$1-$2');

      case 'date':
        return cleaned
          .slice(0, 8)
          .replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');

      case 'currency': {
        // Aceita vírgula OU ponto como separador decimal
        let processedValue = value;

        // Converte vírgula para ponto para processamento interno
        if (value.includes(',')) {
          processedValue = value.replace(',', '.');
        }

        // Remove tudo exceto dígitos e o ponto decimal
        const parts = processedValue.split('.');
        const intPart = parts[0]?.replace(/\D/g, '') || '0';
        const decPart = parts[1]?.replace(/\D/g, '') || '';

        const fullNum = intPart + decPart;
        const cleanNum = fullNum.replace(/\D/g, '');

        if (!cleanNum) return '0,00';

        // Os 2 últimos dígitos são centavos
        const centavos = (cleanNum.slice(-2) || '00').padStart(2, '0');
        let reais = cleanNum.slice(0, -2) || '0';

        // Formata a parte inteira com pontos de milhar
        reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return reais + ',' + centavos;
      }

      default:
        return value;
    }
  };

  const unformat = (value: string): string => {
    if (type === 'currency') {
      // "1.234,56" → "1234.56" (para parseFloat)
      const cleanNum = value.replace(/\D/g, '');
      if (!cleanNum) return '0.00';

      const decPart = cleanNum.slice(-2) || '00';
      const intPart = cleanNum.slice(0, -2) || '0';
      return intPart + '.' + decPart;
    }
    return value.replace(/\D/g, '');
  };

  const validate = (value: string): boolean => {
    const cleaned = unformat(value);

    switch (type) {
      case 'phone':
        return cleaned.length >= 10;

      case 'cpf':
        return cleaned.length === 11;

      case 'cnpj':
        return cleaned.length === 14;

      case 'cep':
        return cleaned.length === 8;

      case 'date':
        return cleaned.length === 8;

      case 'currency':
        return cleaned.length >= 1;

      default:
        return true;
    }
  };

  return { format, unformat, validate };
};

/**
 * Get placeholder for mask type
 */
export const getMaskPlaceholder = (type: MaskType): string => {
  const placeholders: Record<MaskType, string> = {
    phone: '(11) 98765-4321',
    cpf: '000.000.000-00',
    cnpj: '00.000.000/0000-00',
    cep: '01310-100',
    date: '31/12/2024',
    currency: '0,00',
  };
  return placeholders[type];
};
