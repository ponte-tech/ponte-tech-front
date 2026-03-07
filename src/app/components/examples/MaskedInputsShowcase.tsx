/**
 * Showcase Component para Masked Inputs
 * Demonstra todos os tipos de máscaras disponíveis
 *
 * Uso: <MaskedInputsShowcase />
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { MaskedTextField } from '../forms/MaskedTextField';

interface MaskDemo {
  type: 'phone' | 'cpf' | 'cnpj' | 'cep' | 'date';
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const maskDemos: MaskDemo[] = [
  {
    type: 'phone',
    label: 'Telefone',
    placeholder: '(11) 98765-4321',
    icon: <PhoneIcon />,
    color: '#8270FF',
    description: 'Formato: (XX) XXXXX-XXXX',
  },
  {
    type: 'cpf',
    label: 'CPF',
    placeholder: '123.456.789-00',
    icon: <BadgeIcon />,
    color: '#411EFE',
    description: 'Formato: XXX.XXX.XXX-XX',
  },
  {
    type: 'cnpj',
    label: 'CNPJ',
    placeholder: '12.345.678/0001-99',
    icon: <BusinessIcon />,
    color: '#E363EB',
    description: 'Formato: XX.XXX.XXX/XXXX-XX',
  },
  {
    type: 'cep',
    label: 'CEP',
    placeholder: '01310-100',
    icon: <LocationIcon />,
    color: '#1565C0',
    description: 'Formato: XXXXX-XXX',
  },
  {
    type: 'date',
    label: 'Data',
    placeholder: '31/12/2024',
    icon: <EventIcon />,
    color: '#2E7D32',
    description: 'Formato: XX/XX/XXXX',
  },
];

export default function MaskedInputsShowcase() {
  const [values, setValues] = useState<Record<string, string>>({
    phone: '',
    cpf: '',
    cnpj: '',
    cep: '',
    date: '',
  });

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎭 Campos com Máscara (Masked Inputs)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Demonstração de todos os tipos de máscaras disponíveis na aplicação
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Grid de Exemplos */}
      <Grid container spacing={3}>
        {maskDemos.map((demo) => (
          <Grid item xs={12} md={6} key={demo.type}>
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Título com Ícone */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `rgba(${parseInt(demo.color.slice(1, 3), 16)}, ${parseInt(demo.color.slice(3, 5), 16)}, ${parseInt(demo.color.slice(5, 7), 16)}, 0.1)`,
                    }}
                  >
                    <Box sx={{ color: demo.color, display: 'flex' }}>
                      {demo.icon}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {demo.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {demo.description}
                    </Typography>
                  </Box>
                </Box>

                {/* Campo Mascarado */}
                <MaskedTextField
                  fullWidth
                  maskType={demo.type}
                  value={values[demo.type] || ''}
                  onChange={(formatted) => {
                    setValues((prev) => ({
                      ...prev,
                      [demo.type]: formatted,
                    }));
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ color: demo.color, display: 'flex' }}>
                          {demo.icon}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  placeholder={demo.placeholder}
                  sx={{ mt: 2 }}
                />

                {/* Info do Valor */}
                {values[demo.type] && (
                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'rgba(0,0,0,0.02)',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Valor armazenado (sem formatação):
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        fontFamily: 'monospace',
                        color: demo.color,
                        fontWeight: 600,
                      }}
                    >
                      {values[demo.type]}
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Informações */}
      <Card
        sx={{
          mt: 4,
          p: 3,
          bgcolor: 'rgba(130, 112, 255, 0.05)',
          border: '1px solid rgba(130, 112, 255, 0.2)',
        }}
      >
        <Typography variant="h6" fontWeight="600" gutterBottom>
          💡 Informações Importantes
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Armazenamento:</strong> Os valores são armazenados sem
              formatação (apenas números) para facilitar validação e envio ao
              servidor.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Exibição:</strong> Os campos exibem os valores formatados
              automaticamente enquanto o usuário digita.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Validação:</strong> Use o hook{' '}
              <code>useMask</code> para validar valores antes de
              submeter: <code>const {'{'}validate{'}'} = useMask('cpf');</code>
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Integração:</strong> Todos os formulários da Dashboard já
              utilizam esses campos mascarados.
            </Typography>
          </li>
        </Box>
      </Card>

      {/* Resumo de Valores */}
      <Card sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          📋 Resumo dos Valores Preenchidos
        </Typography>
        <Paper
          sx={{
            mt: 2,
            p: 2,
            bgcolor: '#f5f5f5',
            fontFamily: 'monospace',
            overflow: 'auto',
            maxHeight: 300,
          }}
        >
          <pre>
            {JSON.stringify(
              {
                dados_capturados: values,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )}
          </pre>
        </Paper>
      </Card>
    </Box>
  );
}
