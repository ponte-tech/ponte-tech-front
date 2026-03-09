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
  Tabs,
  Tab,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Assessment as AssessmentIcon,
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
import ResumoHoras from './components/ResumoHoras';
import FormularioLancamento from './components/FormularioLancamento';

export default function MinhasHorasPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tabAtual, setTabAtual] = useState(0);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [mesData, setMesData] = useState<MesResponse | null>(null);
  const [resumoData, setResumoData] = useState<ResumoMesResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [dataInicialForm, setDataInicialForm] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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
    setDataInicialForm(data);
    setFormOpen(true);
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

  if (loading && !mesData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabAtual} onChange={(_, v) => setTabAtual(v)}>
          <Tab icon={<CalendarIcon />} label="Calendário" />
          <Tab icon={<AssessmentIcon />} label="Resumo" />
        </Tabs>
      </Paper>

      {/* Conteúdo */}
      <Box>
        {tabAtual === 0 && mesData && (
          <CalendarioHoras
            dias={mesData.dias}
            mesAtual={mesAtual}
            onMesChange={handleMesChange}
            onDiaClick={handleDiaClick}
          />
        )}

        {tabAtual === 1 && resumoData && (
          <ResumoHoras resumo={resumoData} />
        )}
      </Box>

      {/* Formulário */}
      <FormularioLancamento
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateLancamento}
        contratos={contratos}
        dataInicial={dataInicialForm}
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
    </Container>
  );
}
