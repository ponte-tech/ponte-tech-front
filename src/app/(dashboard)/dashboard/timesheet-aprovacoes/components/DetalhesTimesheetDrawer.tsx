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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import timesheetService from '@/app/services/timesheetService';
import type { ResumoMesResponse, ResumoContratoMes, MesResponse } from '@/app/types/timesheet';
import NotasFiscaisSection from './NotasFiscaisSection';
import CalendarioHoras from '@/app/minhas-horas/components/CalendarioHoras';
import DialogLancamentosDia from '@/app/minhas-horas/components/DialogLancamentosDia';

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
  const [mesData, setMesData] = useState<MesResponse | null>(null);
  const [loadingCalendario, setLoadingCalendario] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Dialog de lançamentos do dia
  const [dialogDiaOpen, setDialogDiaOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (open && colaboradorId) {
      // Resetar estados quando abre o drawer ou troca de colaborador
      setResumo(null);
      setMesData(null);
      setCurrentTab(0);
      setError(null);

      loadResumo();
    }
  }, [open, colaboradorId, mes]);

  const loadResumo = async () => {
    if (!colaboradorId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await timesheetService.getResumoColaborador(colaboradorId, mes);
      setResumo(data);
    } catch (err) {
    // console.error('Erro ao carregar resumo:', err);
      setError('Erro ao carregar detalhes do timesheet');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendario = async () => {
    if (!colaboradorId) return;

    try {
      setLoadingCalendario(true);
      const data = await timesheetService.getMesColaborador(colaboradorId, mes);
      setMesData(data);
    } catch (err) {
    // console.error('Erro ao carregar calendário:', err);
      // Não mostra erro aqui para não atrapalhar a visualização do resumo
    } finally {
      setLoadingCalendario(false);
    }
  };

  // Carregar calendário quando a aba de calendário é aberta ou quando colaborador/mês muda
  useEffect(() => {
    if (currentTab === 1 && colaboradorId && open) {
      // Recarregar sempre que trocar de aba ou mudar colaborador/mês
      loadCalendario();
    }
  }, [currentTab, colaboradorId, mes, open]);

  const handleSelectDay = (date: string) => {
    setSelectedDate(date);
    setDialogDiaOpen(true);
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
          width: { xs: '100%', sm: 800, md: 1000, lg: 1200 },
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

        {/* Tabs */}
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Resumo" />
          <Tab label="Calendário" />
        </Tabs>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : resumo ? (
          <>
            {/* Tab 0: Resumo */}
            {currentTab === 0 && (
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {contrato.nome_cliente}
                          </Typography>
                          {contrato.tipo_contrato && (
                            <Chip
                              label={contrato.tipo_contrato === "fechado" ? "Horas Fechadas" : "Valor por Hora"}
                              size="small"
                              sx={{
                                bgcolor: contrato.tipo_contrato === "fechado" ? "#8270FF" : "#f59e0b",
                                color: "#FFFFFF",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                        </Box>

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
            )}

            {/* Tab 1: Calendário */}
            {currentTab === 1 && (
              <Box>
                {loadingCalendario ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : mesData ? (
                  <Card variant="outlined">
                    <CardContent>
                      <CalendarioHoras
                        dias={mesData.dias}
                        mesAtual={mes}
                        onMesChange={() => {}} // Read-only, não permite mudança de mês
                        onDiaClick={handleSelectDay}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info">
                    <Typography variant="body2">
                      Não foi possível carregar o calendário. Tente novamente.
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </>
        ) : null}
      </Box>

      {/* Dialog de Lançamentos do Dia */}
      {selectedDate && mesData && (
        <DialogLancamentosDia
          open={dialogDiaOpen}
          onClose={() => setDialogDiaOpen(false)}
          data={selectedDate}
          lancamentos={
            mesData.dias.find(d => d.data === selectedDate)?.lancamentos || []
          }
          onDelete={async () => {}} // Read-only mode
          onAddNew={() => {}} // Read-only mode
        />
      )}
    </Drawer>
  );
}
