/**
 * TEMPLATE - Exemplo de Uso do MaskedTextField
 *
 * Este é um template pronto para ser copiado e adaptado
 * em novos formulários que precisem de campos com máscaras.
 *
 * Como usar:
 * 1. Copie este arquivo
 * 2. Renomeie conforme seu formulário
 * 3. Adapte os tipos e labels
 * 4. Remova este comentário
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { MaskedTextField } from './MaskedTextField';
import { useMask } from '@/app/hooks/useMask';

interface FormData {
  phone: string;
  cpf: string;
  cnpj: string;
  cep: string;
}

export default function MaskedFormTemplate() {
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    cpf: '',
    cnpj: '',
    cep: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks de validação
  const { validate: validatePhone } = useMask('phone');
  const { validate: validateCpf } = useMask('cpf');
  const { validate: validateCnpj } = useMask('cnpj');
  const { validate: validateCep } = useMask('cep');

  const handleChange = (field: keyof FormData) => (
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value, // Armazene o valor formatado do MaskedTextField
    }));
    setError(''); // Limpar erros ao digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos
    if (!formData.phone) {
      setError('Telefone é obrigatório');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Telefone inválido');
      return;
    }

    if (!formData.cpf) {
      setError('CPF é obrigatório');
      return;
    }

    if (!validateCpf(formData.cpf)) {
      setError('CPF inválido');
      return;
    }

    if (!formData.cnpj || !validateCnpj(formData.cnpj)) {
      setError('CNPJ inválido');
      return;
    }

    if (!formData.cep || !validateCep(formData.cep)) {
      setError('CEP inválido');
      return;
    }

    // Simular envio ao servidor
    setLoading(true);
    try {
      // Aqui você enviaria os dados ao servidor
      console.log('Enviando dados:', formData);

      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Dados salvos com sucesso! ✅');
      // Opcional: limpar formulário
      // setFormData({ phone: '', cpf: '', cnpj: '', cep: '' });
    } catch (err) {
      setError('Erro ao enviar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600">
            📋 Formulário com Campos Mascarados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Preencha todos os campos com dados válidos
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Campo Telefone */}
            <Grid item xs={12} md={6}>
              <MaskedTextField
                fullWidth
                label="Telefone"
                maskType="phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#8270FF' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Campo CPF */}
            <Grid item xs={12} md={6}>
              <MaskedTextField
                fullWidth
                label="CPF"
                maskType="cpf"
                value={formData.cpf}
                onChange={handleChange('cpf')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: '#8270FF' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Campo CNPJ */}
            <Grid item xs={12} md={6}>
              <MaskedTextField
                fullWidth
                label="CNPJ"
                maskType="cnpj"
                value={formData.cnpj}
                onChange={handleChange('cnpj')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: '#8270FF' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Campo CEP */}
            <Grid item xs={12} md={6}>
              <MaskedTextField
                fullWidth
                label="CEP"
                maskType="cep"
                value={formData.cep}
                onChange={handleChange('cep')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: '#8270FF' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Botão Enviar */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#8270FF',
                  '&:hover': { bgcolor: '#6a5dd9' },
                }}
              >
                {loading ? 'Enviando...' : 'Enviar Formulário'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Debug Info (remover em produção) */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
            <strong>Estado do Formulário (Debug):</strong>
          </Typography>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Box>
      </CardContent>
    </Card>
  );
}
