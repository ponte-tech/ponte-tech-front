'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import timesheetService from '../services/timesheetService';
import type {
  Contrato,
  MesResponse,
  ResumoMesResponse,
  CreateLancamentoRequest,
} from '../types/timesheet';
import CalendarioHoras from './components/CalendarioHoras';
import FormularioLancamento from './components/FormularioLancamento';
import StatusMes from './components/StatusMes';
import DialogLancamentosDia from './components/DialogLancamentosDia';
import ResumoHoras from './components/ResumoHoras';

export default function MinhasHorasPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [mesAtual, setMesAtual] = useState<string>('');

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [mesData, setMesData] = useState<MesResponse | null>(null);
  const [resumoData, setResumoData] = useState<ResumoMesResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [dialogLancamentosOpen, setDialogLancamentosOpen] = useState(false);
  const [dialogConfirmacaoOpen, setDialogConfirmacaoOpen] = useState(false);
  const [dataInicialForm, setDataInicialForm] = useState<string | undefined>();
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Inicializar mês atual apenas no cliente (evita erro de hydration)
  useEffect(() => {
    const hoje = new Date();
    setMesAtual(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  // Verificar se é colaborador
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/minhas-horas');
      return;
    }

    // Verificar se o perfil atual é colaborador
    if (user && !user.perfil?.includes('colaborador') && !user.perfis?.includes('colaborador')) {
      setError('Acesso negado. Esta área é exclusiva para colaboradores.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [user, isAuthenticated, router]);

  // Carregar contratos
  useEffect(() => {
    const loadContratos = async () => {
      try {
        const data = await timesheetService.getContratos();
        setContratos(data);
      } catch (err) {
        console.error('Erro ao carregar contratos:', err);
        setError('Erro ao carregar contratos. Verifique sua conexão.');
      }
    };

    loadContratos();
  }, []);

  // Carregar dados do mês
  useEffect(() => {
    const loadMesData = async () => {
      if (!mesAtual) return;

      try {
        setLoading(true);
        setError(null);

        const [mesResp, resumoResp] = await Promise.all([
          timesheetService.getMesCalendario(mesAtual),
          timesheetService.getResumoMes(mesAtual),
        ]);

        setMesData(mesResp);
        setResumoData(resumoResp);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do mês. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadMesData();
  }, [mesAtual]);

  const handleMesChange = (novoMes: string) => {
    setMesAtual(novoMes);
  };

  const handleDiaClick = (data: string) => {
    // Verificar se o dia tem lançamentos
    const dia = mesData?.dias.find(d => d.data === data);

    if (dia && dia.lancamentos && dia.lancamentos.length > 0) {
      // Se tem lançamentos, abrir dialog de lançamentos
      setDataSelecionada(data);
      setDialogLancamentosOpen(true);
    } else {
      // Se não tem lançamentos, abrir formulário de novo lançamento
      setDataInicialForm(data);
      setFormOpen(true);
    }
  };

  const handleAddNewFromDialog = () => {
    setDialogLancamentosOpen(false);
    setDataInicialForm(dataSelecionada || undefined);
    setFormOpen(true);
  };

  const handleDeleteLancamento = async (apontamentoId: string) => {
    try {
      await timesheetService.deleteLancamento(apontamentoId);

      // Recarregar dados
      const [mesResp, resumoResp] = await Promise.all([
        timesheetService.getMesCalendario(mesAtual),
        timesheetService.getResumoMes(mesAtual),
      ]);

      setMesData(mesResp);
      setResumoData(resumoResp);
      setRefreshKey(prev => prev + 1);

      setSnackbar({
        open: true,
        message: 'Lançamento excluído com sucesso!',
        severity: 'success',
      });

      // Verificar se ainda há lançamentos no dia
      const dia = mesResp.dias.find(d => d.data === dataSelecionada);
      if (!dia || !dia.lancamentos || dia.lancamentos.length === 0) {
        setDialogLancamentosOpen(false);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      throw new Error(error.response?.data?.message || 'Erro ao excluir lançamento');
    }
  };

  const handleCreateLancamento = async (request: CreateLancamentoRequest) => {
    try {
      await timesheetService.createLancamentos(request);

      // Recarregar dados
      const [mesResp, resumoResp] = await Promise.all([
        timesheetService.getMesCalendario(mesAtual),
        timesheetService.getResumoMes(mesAtual),
      ]);

      setMesData(mesResp);
      setResumoData(resumoResp);
      setRefreshKey(prev => prev + 1);

      setSnackbar({
        open: true,
        message: `${request.lancamentos.length} lançamento(s) criado(s) com sucesso!`,
        severity: 'success',
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao criar lançamento',
        severity: 'error',
      });
      throw err;
    }
  };

  const handleNovoLancamento = () => {
    setDataInicialForm(undefined);
    setFormOpen(true);
  };

  const handleEnviarParaAprovacao = async () => {
    try {
      setLoading(true);
      const resumoAtualizado = await timesheetService.enviarMesParaAprovacao(mesAtual);
      setResumoData(resumoAtualizado);
      setSnackbar({
        open: true,
        message: 'Horas enviadas para aprovação com sucesso!',
        severity: 'success',
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao enviar para aprovação',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarTodosLancamentos = () => {
    setDialogConfirmacaoOpen(true);
  };

  const handleConfirmarDelecao = async () => {
    try {
      setDialogConfirmacaoOpen(false);
      setLoading(true);

      // O backend agora aguarda a propagação da consistência eventual antes de retornar
      await timesheetService.deleteAllLancamentosMes();

      // Recarregar dados
      const [mesResp, resumoResp] = await Promise.all([
        timesheetService.getMesCalendario(mesAtual, true),
        timesheetService.getResumoMes(mesAtual, true),
      ]);

      setMesData(mesResp);
      setResumoData(resumoResp);

      // Incrementar chave de refresh para forçar re-renderização
      setRefreshKey(prev => prev + 1);

      setSnackbar({
        open: true,
        message: 'Todos os lançamentos do mês foram excluídos com sucesso!',
        severity: 'success',
      });
    } catch (err) {
      const error = err as { code?: string; response?: { data?: { message?: string } } };

      let errorMessage = 'Erro ao excluir lançamentos';
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_NETWORK_CHANGED') {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !mesData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Skeleton */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={4}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Skeleton variant="rectangular" width={200} height={42} sx={{ borderRadius: 1 }} />
        </Stack>

        {/* Status Card Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 3, borderRadius: 2 }} />

        {/* Tabs Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 3, borderRadius: 1 }} />

        {/* Calendar/Content Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={500} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Minhas Horas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus lançamentos de horas e acompanhe o progresso
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNovoLancamento}
          disabled={contratos.length === 0}
          sx={{ minWidth: 200 }}
        >
          Novo Lançamento
        </Button>
      </Stack>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {contratos.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Você não possui contratos ativos. Entre em contato com o administrador.
        </Alert>
      )}

      {/* Indicador de Carregamento */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Status do Mês */}
      {resumoData && (
        <StatusMes
          statusMes={resumoData.status_mes}
          dataEnvio={resumoData.data_envio}
          dataAprovacao={resumoData.data_aprovacao}
          aprovadoPor={resumoData.aprovado_por}
          motivoReprovacao={resumoData.motivo_reprovacao}
          totalHoras={resumoData.total_horas_lancadas}
          valorAprovado={resumoData.total_valor_lancado}
          onEnviarParaAprovacao={handleEnviarParaAprovacao}
          onDeletarTodosLancamentos={handleDeletarTodosLancamentos}
          loading={loading}
        />
      )}

      {/* Abas de Navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={abaAtiva}
          onChange={(_, newValue) => setAbaAtiva(newValue)}
          aria-label="abas de navegação"
        >
          <Tab label="Calendário" />
          <Tab label="Resumo" />
        </Tabs>
      </Box>

      {/* Conteúdo das Abas */}
      {abaAtiva === 0 && mesData && (
        <Box key={`calendario-${refreshKey}`}>
          <CalendarioHoras
            dias={mesData.dias}
            mesAtual={mesAtual}
            onMesChange={handleMesChange}
            onDiaClick={handleDiaClick}
          />
        </Box>
      )}

      {abaAtiva === 1 && resumoData && (
        <Box key={`resumo-${refreshKey}`}>
          <ResumoHoras resumo={resumoData} />
        </Box>
      )}

      {/* Dialog de Lançamentos do Dia */}
      {dataSelecionada && mesData && (
        <DialogLancamentosDia
          open={dialogLancamentosOpen}
          onClose={() => setDialogLancamentosOpen(false)}
          data={dataSelecionada}
          lancamentos={
            mesData.dias.find(d => d.data === dataSelecionada)?.lancamentos || []
          }
          onDelete={handleDeleteLancamento}
          onAddNew={handleAddNewFromDialog}
        />
      )}

      {/* Formulário */}
      <FormularioLancamento
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateLancamento}
        contratos={contratos}
        dataInicial={dataInicialForm}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={dialogConfirmacaoOpen}
        onClose={() => setDialogConfirmacaoOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Exclusão de Todos os Lançamentos
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja excluir TODOS os lançamentos do mês atual?
            <br />
            <br />
            <strong>Esta ação não pode ser desfeita!</strong>
            <br />
            <br />
            {resumoData && resumoData.total_horas_lancadas > 0 && (
              <>
                Você está prestes a excluir <strong>{resumoData.total_horas_lancadas.toFixed(2)} horas</strong> de lançamentos.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirmacaoOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmarDelecao} color="error" variant="contained" autoFocus>
            Sim, Excluir Todos
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
}
