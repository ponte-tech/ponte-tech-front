'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Snackbar,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
  Grid,
  Checkbox,
  Badge,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  HourglassEmpty as HourglassIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  DownloadForOffline as DownloadIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/hooks/useAuth';
import timesheetService from '@/app/services/timesheetService';
import fiscalService from '@/app/services/fiscalService';
import { FilterSearch } from '@/app/shared/components';
import type { ColaboradorTimesheetStatus, StatusMes } from '@/app/types/timesheet';
import type { NotaFiscal } from '@/app/types/fiscal';
import DetalhesTimesheetDrawer from './components/DetalhesTimesheetDrawer';

const statusConfig: Record<StatusMes, { label: string; color: 'default' | 'warning' | 'success' | 'error'; icon: React.ReactNode }> = {
  PENDENTE_ENVIO: {
    label: 'Pendente',
    color: 'default',
    icon: <WarningIcon fontSize="small" />,
  },
  AGUARDANDO_APROVACAO: {
    label: 'Aguardando',
    color: 'warning',
    icon: <HourglassIcon fontSize="small" />,
  },
  APROVADO: {
    label: 'Aprovado',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
  },
  REPROVADO: {
    label: 'Reprovado',
    color: 'error',
    icon: <CancelIcon fontSize="small" />,
  },
};

export default function TimesheetAprovacoesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState<ColaboradorTimesheetStatus[]>([]);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Notas fiscais por colaborador
  const [notasFiscaisPorColaborador, setNotasFiscaisPorColaborador] = useState<Record<string, NotaFiscal[]>>({});
  const [loadingNotas, setLoadingNotas] = useState(false);

  // Seleção múltipla
  const [selectedColaboradores, setSelectedColaboradores] = useState<Set<string>>(new Set());

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusMes | ''>('');

  // Dialogs
  const [dialogAprovacao, setDialogAprovacao] = useState(false);
  const [dialogReprovacao, setDialogReprovacao] = useState(false);
  const [dialogPagamentoLote, setDialogPagamentoLote] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorTimesheetStatus | null>(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState('');

  // Drawer de detalhes
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerColaborador, setDrawerColaborador] = useState<{ id: string; nome: string } | null>(null);

  // Feedback
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Verificar se é admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.userType !== 'admin') {
      setError('Acesso negado. Esta área é exclusiva para administradores.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [user, isAuthenticated, router]);

  // Carregar colaboradores
  useEffect(() => {
    if (user?.userType === 'admin') {
      loadColaboradores();
    }
  }, [user, mesAtual]);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API to list colaboradores with timesheet status
      // This will also auto-create missing fechamento records for the selected month
      const data = await timesheetService.listarColaboradoresTimesheet(mesAtual);

      setColaboradores(data.colaboradores);

      // Carregar notas fiscais de cada colaborador
      await loadNotasFiscais(data.colaboradores);
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err);
      setError('Erro ao carregar lista de colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const loadNotasFiscais = async (colabs: ColaboradorTimesheetStatus[]) => {
    setLoadingNotas(true);
    const notasMap: Record<string, NotaFiscal[]> = {};

    try {
      // Buscar notas fiscais em paralelo para todos os colaboradores
      const promises = colabs.map(async (colab) => {
        try {
          const notas = await fiscalService.listNotasFiscaisByColaborador(colab.colaborador_id, mesAtual);
          notasMap[colab.colaborador_id] = notas;
        } catch (err) {
          console.error(`Erro ao carregar notas de ${colab.nome_completo}:`, err);
          notasMap[colab.colaborador_id] = [];
        }
      });

      await Promise.all(promises);
      setNotasFiscaisPorColaborador(notasMap);
    } catch (err) {
      console.error('Erro ao carregar notas fiscais:', err);
    } finally {
      setLoadingNotas(false);
    }
  };

  // Filtrar colaboradores
  const colaboradoresFiltrados = colaboradores.filter((colab) => {
    const matchSearch = colab.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || colab.status_mes === filterStatus;
    return matchSearch && matchStatus;
  });

  // Estatísticas
  const stats = {
    total: colaboradores.length,
    pendentes: colaboradores.filter(c => c.status_mes === 'PENDENTE_ENVIO').length,
    aguardando: colaboradores.filter(c => c.status_mes === 'AGUARDANDO_APROVACAO').length,
    aprovados: colaboradores.filter(c => c.status_mes === 'APROVADO').length,
    reprovados: colaboradores.filter(c => c.status_mes === 'REPROVADO').length,
  };

  // Handlers
  const handleVerDetalhes = (colaborador: ColaboradorTimesheetStatus) => {
    setDrawerColaborador({
      id: colaborador.colaborador_id,
      nome: colaborador.nome_completo,
    });
    setDrawerOpen(true);
  };

  const handleAprovar = (colaborador: ColaboradorTimesheetStatus) => {
    setSelectedColaborador(colaborador);
    setDialogAprovacao(true);
  };

  const handleReprovar = (colaborador: ColaboradorTimesheetStatus) => {
    setSelectedColaborador(colaborador);
    setMotivoReprovacao('');
    setDialogReprovacao(true);
  };

  const confirmAprovar = async () => {
    if (!selectedColaborador) return;

    try {
      await timesheetService.aprovarMes(selectedColaborador.colaborador_id, selectedColaborador.mes);

      // Atualizar lista
      await loadColaboradores();

      setSnackbar({
        open: true,
        message: `Timesheet de ${selectedColaborador.nome_completo} aprovado com sucesso!`,
        severity: 'success',
      });
      setDialogAprovacao(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao aprovar timesheet',
        severity: 'error',
      });
    }
  };

  const confirmReprovar = async () => {
    if (!selectedColaborador || !motivoReprovacao.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe o motivo da reprovação',
        severity: 'error',
      });
      return;
    }

    try {
      await timesheetService.reprovarMes(
        selectedColaborador.colaborador_id,
        selectedColaborador.mes,
        motivoReprovacao
      );

      // Atualizar lista
      await loadColaboradores();

      setSnackbar({
        open: true,
        message: `Timesheet de ${selectedColaborador.nome_completo} reprovado com sucesso!`,
        severity: 'success',
      });
      setDialogReprovacao(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao reprovar timesheet',
        severity: 'error',
      });
    }
  };

  // Handlers de seleção múltipla
  const handleSelectColaborador = (colaboradorId: string) => {
    const newSelected = new Set(selectedColaboradores);
    if (newSelected.has(colaboradorId)) {
      newSelected.delete(colaboradorId);
    } else {
      newSelected.add(colaboradorId);
    }
    setSelectedColaboradores(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedColaboradores.size === colaboradoresFiltrados.length) {
      setSelectedColaboradores(new Set());
    } else {
      setSelectedColaboradores(new Set(colaboradoresFiltrados.map(c => c.colaborador_id)));
    }
  };

  // Ações em lote
  const handleDownloadNotasLote = async () => {
    const notasParaDownload: NotaFiscal[] = [];

    selectedColaboradores.forEach((colaboradorId) => {
      const notas = notasFiscaisPorColaborador[colaboradorId] || [];
      notas.forEach(nota => {
        if (nota.arquivo_url) {
          notasParaDownload.push(nota);
        }
      });
    });

    if (notasParaDownload.length === 0) {
      setSnackbar({
        open: true,
        message: 'Nenhuma nota fiscal disponível para download nos colaboradores selecionados',
        severity: 'error',
      });
      return;
    }

    // Download each one
    for (const nota of notasParaDownload) {
      if (nota.arquivo_url) {
        window.open(nota.arquivo_url, '_blank');
        // Small delay to prevent browser blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setSnackbar({
      open: true,
      message: `Iniciando download de ${notasParaDownload.length} nota(s) fiscal(is)`,
      severity: 'success',
    });
  };

  const handlePagarNotasLote = () => {
    const notasAprovadas: NotaFiscal[] = [];

    selectedColaboradores.forEach((colaboradorId) => {
      const notas = notasFiscaisPorColaborador[colaboradorId] || [];
      notas.forEach(nota => {
        if (nota.status === 'APROVADA') {
          notasAprovadas.push(nota);
        }
      });
    });

    if (notasAprovadas.length === 0) {
      setSnackbar({
        open: true,
        message: 'Nenhuma nota fiscal aprovada para pagamento nos colaboradores selecionados',
        severity: 'error',
      });
      return;
    }

    setDialogPagamentoLote(true);
  };

  const confirmPagamentoLote = async () => {
    const notasAprovadas: NotaFiscal[] = [];

    selectedColaboradores.forEach((colaboradorId) => {
      const notas = notasFiscaisPorColaborador[colaboradorId] || [];
      notas.forEach(nota => {
        if (nota.status === 'APROVADA') {
          notasAprovadas.push(nota);
        }
      });
    });

    try {
      // Marcar todas como pagas em paralelo
      await Promise.all(
        notasAprovadas.map(nota => fiscalService.marcarNotaComoPaga(nota.nota_fiscal_id))
      );

      // Recarregar notas fiscais
      await loadNotasFiscais(colaboradores);

      setSnackbar({
        open: true,
        message: `${notasAprovadas.length} nota(s) fiscal(is) marcada(s) como paga(s) com sucesso!`,
        severity: 'success',
      });
      setDialogPagamentoLote(false);
      setSelectedColaboradores(new Set());
    } catch (err) {
      console.error('Erro ao marcar notas como pagas:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao marcar notas como pagas',
        severity: 'error',
      });
    }
  };

  const getNotasResumo = (colaboradorId: string) => {
    const notas = notasFiscaisPorColaborador[colaboradorId] || [];
    return {
      total: notas.length,
      pendente: notas.filter(n => n.status === 'PENDENTE').length,
      aprovada: notas.filter(n => n.status === 'APROVADA').length,
      paga: notas.filter(n => n.status === 'PAGA').length,
      reprovada: notas.filter(n => n.status === 'REPROVADA').length,
    };
  };

  // Download de notas de um colaborador específico
  const handleDownloadNotasColaborador = async (colaboradorId: string) => {
    const notas = notasFiscaisPorColaborador[colaboradorId] || [];
    const notasComUrl = notas.filter(n => n.arquivo_url);

    if (notasComUrl.length === 0) {
      setSnackbar({
        open: true,
        message: 'Nenhuma nota fiscal disponível para download',
        severity: 'error',
      });
      return;
    }

    // Download each one
    for (const nota of notasComUrl) {
      if (nota.arquivo_url) {
        window.open(nota.arquivo_url, '_blank');
        // Small delay to prevent browser blocking multiple downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setSnackbar({
      open: true,
      message: `Iniciando download de ${notasComUrl.length} nota(s) fiscal(is)`,
      severity: 'success',
    });
  };

  const formatMes = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
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

  // Gerar opções de meses (últimos 12 meses)
  const getMesesOptions = () => {
    const options = [];
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      options.push(mes);
    }
    return options;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Aprovação de Timesheet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as aprovações de horas dos colaboradores
          </Typography>
        </Box>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estatísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PeopleIcon sx={{ color: '#667eea', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  Total
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  Pendentes
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="text.secondary">
                {stats.pendentes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HourglassIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  Aguardando
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.aguardando}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  Aprovados
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.aprovados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  Reprovados
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.reprovados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <FilterSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar colaborador..."
            />

            <TextField
              select
              label="Mês"
              value={mesAtual}
              onChange={(e) => setMesAtual(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              {getMesesOptions().map((mes) => (
                <MenuItem key={mes} value={mes}>
                  {formatMes(mes)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusMes | '')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDENTE_ENVIO">Pendente</MenuItem>
              <MenuItem value="AGUARDANDO_APROVACAO">Aguardando</MenuItem>
              <MenuItem value="APROVADO">Aprovado</MenuItem>
              <MenuItem value="REPROVADO">Reprovado</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Ações em lote */}
      {selectedColaboradores.size > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#f0f7ff', borderColor: '#667eea' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="body1" fontWeight="600">
                {selectedColaboradores.size} colaborador(es) selecionado(s)
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadNotasLote}
                  size="small"
                >
                  Baixar Notas Fiscais
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PaymentIcon />}
                  onClick={handlePagarNotasLote}
                  size="small"
                >
                  Marcar como Pagas
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={3}>
            Colaboradores ({colaboradoresFiltrados.length})
          </Typography>

          {colaboradoresFiltrados.length === 0 ? (
            <Alert severity="info">
              Nenhum colaborador encontrado com os filtros aplicados.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedColaboradores.size > 0 && selectedColaboradores.size < colaboradoresFiltrados.length}
                        checked={selectedColaboradores.size === colaboradoresFiltrados.length && colaboradoresFiltrados.length > 0}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell><strong>Colaborador</strong></TableCell>
                    <TableCell align="center"><strong>Contratos</strong></TableCell>
                    <TableCell align="center"><strong>Horas Lançadas</strong></TableCell>
                    <TableCell align="center"><strong>Horas Contratadas</strong></TableCell>
                    <TableCell align="center"><strong>Progresso</strong></TableCell>
                    <TableCell align="center"><strong>Notas Fiscais</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colaboradoresFiltrados.map((colab) => {
                    const notasResumo = getNotasResumo(colab.colaborador_id);
                    const isSelected = selectedColaboradores.has(colab.colaborador_id);

                    return (
                      <TableRow key={colab.colaborador_id} hover selected={isSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectColaborador(colab.colaborador_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {colab.nome_completo}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={colab.qtd_contratos_ativos}
                            size="small"
                            color={colab.qtd_contratos_ativos > 0 ? 'primary' : 'default'}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="600">
                            {colab.total_horas_lancadas.toFixed(2)}h
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2">
                            {colab.total_horas_contratadas.toFixed(2)}h
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ minWidth: 120, px: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" fontWeight="600">
                                {colab.percentual_lancado.toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(colab.percentual_lancado, 100)}
                              color={getProgressColor(colab.percentual_lancado)}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          {loadingNotas ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                              <Badge badgeContent={notasResumo.total} color="primary">
                                <ReceiptIcon fontSize="small" />
                              </Badge>
                              <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                                {notasResumo.pendente > 0 && (
                                  <Chip label={`${notasResumo.pendente}P`} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                                )}
                                {notasResumo.aprovada > 0 && (
                                  <Chip label={`${notasResumo.aprovada}A`} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                                )}
                                {notasResumo.paga > 0 && (
                                  <Chip label={`${notasResumo.paga}$`} size="small" color="info" sx={{ height: 20, fontSize: '0.7rem' }} />
                                )}
                                {notasResumo.reprovada > 0 && (
                                  <Chip label={`${notasResumo.reprovada}R`} size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                                )}
                              </Stack>
                            </Stack>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            icon={statusConfig[colab.status_mes].icon}
                            label={statusConfig[colab.status_mes].label}
                            color={statusConfig[colab.status_mes].color}
                            size="small"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Ver detalhes">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleVerDetalhes(colab)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {notasResumo.total > 0 && (
                              <Tooltip title="Baixar Notas Fiscais">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleDownloadNotasColaborador(colab.colaborador_id)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {colab.status_mes === 'AGUARDANDO_APROVACAO' && (
                              <>
                                <Tooltip title="Aprovar">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleAprovar(colab)}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Reprovar">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleReprovar(colab)}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Aprovação */}
      <Dialog open={dialogAprovacao} onClose={() => setDialogAprovacao(false)}>
        <DialogTitle>Aprovar Timesheet</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja aprovar o timesheet de <strong>{selectedColaborador?.nome_completo}</strong> referente ao mês de <strong>{selectedColaborador && formatMes(selectedColaborador.mes)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Total de horas: <strong>{selectedColaborador?.total_horas_lancadas.toFixed(2)}h</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAprovacao(false)}>Cancelar</Button>
          <Button onClick={confirmAprovar} variant="contained" color="success" startIcon={<CheckCircleIcon />}>
            Confirmar Aprovação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Reprovação */}
      <Dialog open={dialogReprovacao} onClose={() => setDialogReprovacao(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reprovar Timesheet</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Informe o motivo da reprovação do timesheet de <strong>{selectedColaborador?.nome_completo}</strong>:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivo da Reprovação"
            value={motivoReprovacao}
            onChange={(e) => setMotivoReprovacao(e.target.value)}
            sx={{ mt: 2 }}
            required
            placeholder="Ex: Horas lançadas fora do período permitido, faltam evidências, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogReprovacao(false)}>Cancelar</Button>
          <Button onClick={confirmReprovar} variant="contained" color="error" startIcon={<CancelIcon />}>
            Confirmar Reprovação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento em Lote */}
      <Dialog open={dialogPagamentoLote} onClose={() => setDialogPagamentoLote(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Marcar Notas Fiscais como Pagas</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Deseja marcar todas as notas fiscais aprovadas dos colaboradores selecionados como pagas?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Esta ação irá marcar todas as notas fiscais com status <strong>APROVADA</strong> como <strong>PAGA</strong>.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {selectedColaboradores.size} colaborador(es) selecionado(s)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPagamentoLote(false)}>Cancelar</Button>
          <Button onClick={confirmPagamentoLote} variant="contained" color="success" startIcon={<PaymentIcon />}>
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer de Detalhes */}
      <DetalhesTimesheetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        colaboradorId={drawerColaborador?.id || null}
        colaboradorNome={drawerColaborador?.nome || ''}
        mes={mesAtual}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
