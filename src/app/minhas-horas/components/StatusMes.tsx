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
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import type { StatusMes } from '@/app/types/timesheet';

interface StatusMesProps {
  statusMes?: StatusMes;
  dataEnvio?: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
  motivoReprovacao?: string;
  totalHoras: number;
  valorAprovado?: number;
  onEnviarParaAprovacao?: () => void;
  onDeletarTodosLancamentos?: () => void;
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
  valorAprovado,
  onEnviarParaAprovacao,
  onDeletarTodosLancamentos,
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

  const getGradientByStatus = (status: StatusMes) => {
    switch (status) {
      case 'APROVADO':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'REPROVADO':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'AGUARDANDO_APROVACAO':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default:
        return 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)';
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid',
        borderColor: alpha('#8270FF', 0.15),
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          background: getGradientByStatus(statusMes),
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ pl: 4 }}>
        <Stack spacing={2}>
          {/* Header com Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={config.icon}
                label={config.label}
                size="medium"
                sx={{
                  background: getGradientByStatus(statusMes),
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  px: 1,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '& .MuiChip-icon': {
                    color: '#FFFFFF',
                  },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    background: alpha('#8270FF', 0.08),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total de horas lançadas:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{
                    background: 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {totalHoras.toFixed(2)}h
                  </Typography>
                </Box>

                {statusMes === 'APROVADO' && valorAprovado !== undefined && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      background: alpha('#10b981', 0.08),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Total valor aprovado:
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAprovado)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
              {statusMes !== 'APROVADO' && totalHoras > 0 && onDeletarTodosLancamentos && (
                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    },
                  }}
                  startIcon={<DeleteSweepIcon />}
                  onClick={onDeletarTodosLancamentos}
                  disabled={loading}
                >
                  Excluir Todos os Lançamentos
                </Button>
              )}

              {statusMes === 'PENDENTE_ENVIO' && totalHoras > 0 && (
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)',
                    boxShadow: '0 4px 12px rgba(130, 112, 255, 0.3)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7059e5 0%, #9575e6 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(130, 112, 255, 0.4)',
                    },
                    '&:disabled': {
                      background: alpha('#8270FF', 0.3),
                    },
                  }}
                  startIcon={<SendIcon />}
                  onClick={onEnviarParaAprovacao}
                  disabled={loading}
                >
                  Enviar para Aprovação
                </Button>
              )}
            </Stack>
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
