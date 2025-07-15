'use client';

import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
} from '@mui/material';
import { useState } from 'react';

const FILTERS = [
  {
    key: 'modalidade',
    label: 'Modalidade',
    options: ['Remoto', 'Híbrido', 'Presencial'],
  },
  {
    key: 'contratacao',
    label: 'Forma de contratação',
    options: ['PJ', 'CLT', 'Cooperado'],
  },
  {
    key: 'contrato',
    label: 'Contrato',
    options: ['Tempo indeterminado', 'Escopo fechado'],
  },
  {
    key: 'categoria',
    label: 'Categorias de vaga',
    options: [
      'Back end',
      'Front end',
      'Fullstack',
      'Mobile',
      'Devops',
      'Scrum master',
      'Product owner',
    ],
  },
  {
    key: 'nivel',
    label: 'Nível',
    options: [
      'Estágio',
      'Trainee',
      'Júnior',
      'Pleno',
      'Sênior',
      'Especialista',
    ],
  },
];

type FiltersSectionProps = {
  onFiltroChange: (filtro: any) => void;
};

export default function FiltersSection({ onFiltroChange }: FiltersSectionProps) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>(
    () => Object.fromEntries(FILTERS.map(f => [f.key, new Set()]))
  );

  const isAnyFilterSelected = Object.values(selected).some(set => set.size > 0);

  const handleChange = (filterKey: string, option: string) => {
    setSelected(prev => {
      const newSet = new Set(prev[filterKey]);
      if (newSet.has(option)) {
        newSet.delete(option);
      } else {
        newSet.add(option);
      }
      const updated = { ...prev, [filterKey]: newSet };
      onFiltroChange(updated);
      return updated;
    });
  };

  const handleClear = () => {
    const cleared = Object.fromEntries(FILTERS.map(f => [f.key, new Set()])) as Record<string, Set<string>>;
    setSelected(cleared);
    onFiltroChange(cleared);
  };

  return (
    <Box
      component="aside"
      role="complementary"
      aria-label="Filtros de busca"
      sx={{
        bgcolor: '#FEFEFE',
        width: '100%',
        p: { xs: '32px 16px', md: '32px 24px' },
        borderRadius: '16px',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'flex-start',
        minHeight: 400,
      }}
    >
      <Typography 
        component="h3" 
        fontFamily="'Sora', sans-serif"
        fontWeight={600} 
        fontSize={28}
        lineHeight="36px"
        color="#292929"
        mb={0}
        alignSelf="stretch"
      >
        Filtro
      </Typography>

      {FILTERS.map(filter => (
        <Box key={filter.key} component="fieldset" sx={{ border: 'none', p: 0, m: 0, width: '100%' }}>
          <Typography 
            component="legend" 
            fontFamily="'Sora', sans-serif"
            fontWeight={600} 
            fontSize={filter.key === 'modalidade' ? 18 : { xs: 14, md: 16 }}
            lineHeight={filter.key === 'modalidade' ? '24px' : undefined}
            color="#292929"
            mb={1}
            alignSelf="stretch"
          >
            {filter.label}
          </Typography>
          <FormGroup sx={{ gap: '8px' }}>
            {filter.options.map(option => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    size="small"
                    checked={selected[filter.key].has(option)}
                    onChange={() => handleChange(filter.key, option)}
                    sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                  />
                }
                label={
                  <Typography fontFamily="'Sora', sans-serif" fontSize={filter.key === 'modalidade' ? 16 : { xs: 13, md: 14 }} color="#292929">
                    {option}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>
      ))}

      <Divider sx={{ my: 1, alignSelf: 'stretch' }} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          mt: 'auto',
        }}
      >
        <Button
          variant="text"
          disabled={!isAnyFilterSelected}
          color="inherit"
          size="medium"
          sx={{
            textTransform: 'none',
            fontFamily: "'Sora', sans-serif",
            fontSize: 16,
            fontWeight: 400,
            color: !isAnyFilterSelected ? '#A9A9A9' : '#292929',
            p: 0,
            minHeight: 'auto',
            '&:hover': {
              bgcolor: 'transparent',
              textDecoration: isAnyFilterSelected ? 'underline' : 'none',
              color: '#8270FF',
            },
          }}
          onClick={handleClear}
        >
          Limpar filtro
        </Button>
      </Box>
    </Box>
  );
}
