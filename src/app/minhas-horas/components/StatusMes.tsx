'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Send as SendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { StatusMes } from '@/app/types/timesheet';

interface StatusMesProps {
  statusMes?: StatusMes;
  dataEnvio?: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
  motivoReprovacao?: string;
  totalHoras: number;
  onEnviarParaAprovacao?: () => void;
  loading?: boolean;
}

const statusConfig: Record<StatusMes, { label: string; color: 'default' | 'warning' | 'success' | 'error'; icon: React.ReactNode }> = {
  PENDENTE_ENVIO: {
    label: 'Pendente de Envio',
    color: 'default',
    icon: <WarningIcon />,
  },
  AGUARDANDO_APROVACAO: {
    label: 'Aguardando Aprovação',
    color: 'warning',
    icon: <HourglassIcon />,
  },
  APROVADO: {
    label: 'Aprovado',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  REPROVADO: {
    label: 'Reprovado',
    color: 'error',
    icon: <CancelIcon />,
  },
};

export default function StatusMes({
  statusMes = 'PENDENTE_ENVIO',
  dataEnvio,
  dataAprovacao,
  aprovadoPor,
  motivoReprovacao,
  totalHoras,
  onEnviarParaAprovacao,
  loading = false,
}: StatusMesProps) {
  const config = statusConfig[statusMes];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ mb: 3, borderLeft: 4, borderColor: `${config.color}.main` }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header com Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="medium"
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="body2" color="text.secondary">
                Total de horas: <strong>{totalHoras.toFixed(2)}h</strong>
              </Typography>
            </Box>

            {statusMes === 'PENDENTE_ENVIO' && totalHoras > 0 && (
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={onEnviarParaAprovacao}
                disabled={loading}
                sx={{
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5568d3' },
                }}
              >
                Enviar para Aprovação
              </Button>
            )}
          </Box>

          {/* Informações Adicionais */}
          {statusMes === 'PENDENTE_ENVIO' && totalHoras === 0 && (
            <Alert severity="info">
              Adicione lançamentos de horas para poder enviar para aprovação.
            </Alert>
          )}

          {statusMes === 'AGUARDANDO_APROVACAO' && dataEnvio && (
            <Alert severity="info">
              Enviado para aprovação em <strong>{formatDate(dataEnvio)}</strong>. Aguarde a análise do administrador.
            </Alert>
          )}

          {statusMes === 'APROVADO' && (
            <Alert severity="success">
              {dataAprovacao && (
                <>
                  Aprovado em <strong>{formatDate(dataAprovacao)}</strong>
                  {aprovadoPor && ` por ${aprovadoPor}`}.
                </>
              )}
            </Alert>
          )}

          {statusMes === 'REPROVADO' && (
            <Alert severity="error">
              {motivoReprovacao && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Motivo da Reprovação:
                  </Typography>
                  <Typography variant="body2">{motivoReprovacao}</Typography>
                  {dataAprovacao && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Reprovado em {formatDate(dataAprovacao)}
                    </Typography>
                  )}
                </Box>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Corrija os lançamentos e envie novamente para aprovação.
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
