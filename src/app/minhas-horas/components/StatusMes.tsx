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
        background: '#ffffff',
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(100, 116, 139, 0.06)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(100, 116, 139, 0.12)',
          borderColor: 'rgba(130, 112, 255, 0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: getGradientByStatus(statusMes),
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
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: 36,
                  px: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                  '& .MuiChip-icon': {
                    color: '#FFFFFF',
                    fontSize: '1.125rem',
                  },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    background: 'rgba(130, 112, 255, 0.06)',
                    border: '1px solid rgba(130, 112, 255, 0.15)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                    Total de horas:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: '#8270FF',
                    }}
                  >
                    {totalHoras.toFixed(2)}h
                  </Typography>
                </Box>

                {statusMes === 'APROVADO' && valorAprovado !== undefined && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                      Valor aprovado:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        color: '#10b981',
                      }}
                    >
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAprovado)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5}>
              {statusMes !== 'APROVADO' && totalHoras > 0 && onDeletarTodosLancamentos && (
                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2.5,
                    height: 40,
                    borderWidth: '1.5px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderWidth: '1.5px',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                    },
                  }}
                  startIcon={<DeleteSweepIcon sx={{ fontSize: '1.125rem' }} />}
                  onClick={onDeletarTodosLancamentos}
                  disabled={loading}
                >
                  Excluir Todos
                </Button>
              )}

              {statusMes === 'PENDENTE_ENVIO' && totalHoras > 0 && (
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
                    boxShadow: '0 2px 8px rgba(130, 112, 255, 0.25)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2.5,
                    height: 40,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6b5ce0 0%, #5a4dcc 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(130, 112, 255, 0.35)',
                    },
                    '&:disabled': {
                      background: 'rgba(130, 112, 255, 0.3)',
                    },
                  }}
                  startIcon={<SendIcon sx={{ fontSize: '1.125rem' }} />}
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
