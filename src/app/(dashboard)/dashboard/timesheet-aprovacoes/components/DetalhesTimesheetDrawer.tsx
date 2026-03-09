'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import timesheetService from '@/app/services/timesheetService';
import type { ResumoMesResponse, ResumoContratoMes } from '@/app/types/timesheet';
import NotasFiscaisSection from './NotasFiscaisSection';

interface DetalhesTimesheetDrawerProps {
  open: boolean;
  onClose: () => void;
  colaboradorId: string | null;
  colaboradorNome: string;
  mes: string;
}

export default function DetalhesTimesheetDrawer({
  open,
  onClose,
  colaboradorId,
  colaboradorNome,
  mes,
}: DetalhesTimesheetDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState<ResumoMesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && colaboradorId) {
      loadResumo();
    }
  }, [open, colaboradorId, mes]);

  const loadResumo = async () => {
    if (!colaboradorId) return;

    try {
      setLoading(true);
      setError(null);

      // TODO: Remover mock quando backend estiver pronto
      // const data = await timesheetService.getResumoColaborador(colaboradorId, mes);

      // Dados MOCK temporários
      const mockResumo: ResumoMesResponse = {
        mes: mes,
        contratos: [
          {
            contrato_id: 'c1',
            nome_cliente: 'Cliente A',
            valor_hora: 100,
            total_hora_mes: 80,
            horas_lancadas: 75,
            horas_restantes: 5,
            valor_total_lancado: 7500,
            percentual_usado: 93.75,
          },
          {
            contrato_id: 'c2',
            nome_cliente: 'Cliente B',
            valor_hora: 120,
            total_hora_mes: 88,
            horas_lancadas: 85,
            horas_restantes: 3,
            valor_total_lancado: 10200,
            percentual_usado: 96.59,
          },
        ],
        total_horas_lancadas: 160,
        total_valor_lancado: 17700,
        status_mes: 'AGUARDANDO_APROVACAO',
        data_envio: '2026-03-08T10:00:00Z',
      };

      setResumo(mockResumo);
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
      setError('Erro ao carregar detalhes do timesheet');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMes = (mesStr: string) => {
    const [ano, mesNum] = mesStr.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mesNum) - 1]} ${ano}`;
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 100) return 'success';
    if (percentual >= 75) return 'primary';
    if (percentual >= 50) return 'warning';
    return 'error';
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600 },
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Detalhes do Timesheet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {colaboradorNome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatMes(mes)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : resumo ? (
          <Stack spacing={3}>
            {/* Resumo Geral */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WorkIcon sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        Total de Horas
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      {resumo.total_horas_lancadas.toFixed(2)}h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        Valor Total
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="#10b981">
                      {formatCurrency(resumo.total_valor_lancado)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Status do Mês */}
            {resumo.status_mes && (
              <Card sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircleIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight="600">
                      Status do Mês
                    </Typography>
                  </Box>
                  <Chip
                    label={resumo.status_mes.replace(/_/g, ' ')}
                    color={
                      resumo.status_mes === 'APROVADO' ? 'success' :
                      resumo.status_mes === 'REPROVADO' ? 'error' :
                      resumo.status_mes === 'AGUARDANDO_APROVACAO' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                  {resumo.motivo_reprovacao && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="caption" fontWeight="bold">
                        Motivo da Reprovação:
                      </Typography>
                      <Typography variant="body2">
                        {resumo.motivo_reprovacao}
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contratos */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Contratos
              </Typography>

              {resumo.contratos.length === 0 ? (
                <Alert severity="info">
                  Nenhum contrato ativo neste período.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {resumo.contratos.map((contrato) => (
                    <Card key={contrato.contrato_id} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          {contrato.nome_cliente}
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Valor/hora
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(contrato.valor_hora)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Horas Contratadas
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {contrato.total_hora_mes.toFixed(2)}h
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Horas Lançadas
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {contrato.horas_lancadas.toFixed(2)}h
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Valor Lançado
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(contrato.valor_total_lancado)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Progress Bar */}
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progresso
                            </Typography>
                            <Typography variant="caption" fontWeight="600">
                              {contrato.percentual_usado.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(contrato.percentual_usado, 100)}
                            color={getProgressColor(contrato.percentual_usado)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          {contrato.horas_restantes > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Restam {contrato.horas_restantes.toFixed(2)}h
                            </Typography>
                          )}
                          {contrato.horas_restantes < 0 && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                              Excedido em {Math.abs(contrato.horas_restantes).toFixed(2)}h
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Notas Fiscais */}
            {colaboradorId && (
              <Box>
                <NotasFiscaisSection
                  colaboradorId={colaboradorId}
                  mes={mes}
                />
              </Box>
            )}
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
}
