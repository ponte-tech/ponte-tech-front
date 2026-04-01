'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/hooks/useAuth';
import timesheetService from '@/app/services/timesheetService';
import colaboradoresService from '@/app/services/colaboradoresService';
import CalendarioHoras from '@/app/minhas-horas/components/CalendarioHoras';
import DialogLancamentosDia from '@/app/minhas-horas/components/DialogLancamentosDia';
import type { Apontamento, Contrato } from '@/app/types/timesheet';

const statusConfig = {
  PENDENTE_ENVIO: {
    label: 'Pendente de Envio',
    color: 'default' as const,
    icon: <WarningIcon fontSize="small" />,
  },
  AGUARDANDO_APROVACAO: {
    label: 'Aguardando Aprovação',
    color: 'warning' as const,
    icon: <HourglassIcon fontSize="small" />,
  },
  APROVADO: {
    label: 'Aprovado',
    color: 'success' as const,
    icon: <CheckCircleIcon fontSize="small" />,
  },
  REPROVADO: {
    label: 'Reprovado',
    color: 'error' as const,
    icon: <CancelIcon fontSize="small" />,
  },
};

export default function ColaboradorCalendarioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const colaboradorId = params?.id as string;
  const mesParam = searchParams?.get('mes');

  const [mesAtual, setMesAtual] = useState<string>('');
  const [colaboradorNome, setColaboradorNome] = useState<string>('');
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [statusMes, setStatusMes] = useState<string>('');
  const [dataEnvio, setDataEnvio] = useState<string | undefined>();
  const [dataAprovacao, setDataAprovacao] = useState<string | undefined>();
  const [dataReprovacao, setDataReprovacao] = useState<string | undefined>();
  const [motivoReprovacao, setMotivoReprovacao] = useState<string | undefined>();
  const [valorAprovado, setValorAprovado] = useState<number | undefined>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog de lançamentos do dia
  const [dialogDiaOpen, setDialogDiaOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  // Inicializar mês
  useEffect(() => {
    if (mesParam) {
      setMesAtual(mesParam);
    } else {
      const hoje = new Date();
      const mes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
      setMesAtual(mes);
    }
  }, [mesParam]);

  // Carregar dados do colaborador
  useEffect(() => {
    if (colaboradorId) {
      loadColaboradorNome();
    }
  }, [colaboradorId]);

  // Carregar dados do mês
  useEffect(() => {
    if (mesAtual && colaboradorId && user?.userType === 'admin') {
      loadDados();
    }
  }, [mesAtual, colaboradorId, user]);

  const loadColaboradorNome = async () => {
    try {
      const colaborador = await colaboradoresService.getById(colaboradorId);
      setColaboradorNome(colaborador.nome_completo || 'Colaborador');
    } catch (err) {
      console.error('Erro ao carregar nome do colaborador:', err);
      setColaboradorNome('Colaborador');
    }
  };

  const loadDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const resumo = await timesheetService.getResumoColaborador(colaboradorId, mesAtual);

      // Extrair dados do resumo
      setStatusMes(resumo.status_mes || 'PENDENTE_ENVIO');
      setDataEnvio(resumo.data_envio);
      setDataAprovacao(resumo.data_aprovacao);
      setDataReprovacao(resumo.data_reprovacao);
      setMotivoReprovacao(resumo.motivo_reprovacao);
      setValorAprovado(resumo.total_valor_lancado);

      // Buscar lançamentos do colaborador através da API existente
      // Como não temos endpoint direto, vamos buscar via resumo por contrato
      const todosApontamentos: Apontamento[] = [];

      // Por enquanto, deixaremos vazio até criarmos o endpoint específico
      setApontamentos(todosApontamentos);
      setContratos(resumo.contratos.map(c => ({
        contrato_id: c.contrato_id,
        cliente_id: '',
        user_id: colaboradorId,
        nome_cliente: c.nome_cliente,
        valor_hora: c.valor_hora,
        total_hora_mes: c.total_hora_mes,
        data_inicio: '',
        data_fim: null,
        ativo: true,
        tipo_contrato: c.tipo_contrato || 'valor_hora',
      })));
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.error || 'Erro ao carregar calendário do colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDay = (date: string) => {
    setSelectedDate(date);
    setDialogDiaOpen(true);
  };

  const handleVoltar = () => {
    router.push('/dashboard/timesheet-aprovacoes');
  };

  const formatMes = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mesNum) - 1]} ${ano}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleVoltar} variant="outlined">
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleVoltar}
          variant="outlined"
        >
          Voltar
        </Button>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Calendário de Horas - {colaboradorNome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatMes(mesAtual)}
          </Typography>
        </Box>
        <Chip
          label="Modo Visualização (Admin)"
          color="primary"
          variant="outlined"
        />
      </Stack>

      {/* Status do Mês */}
      {statusMes && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" fontWeight="600">
                  Status do Mês:
                </Typography>
                <Chip
                  icon={statusConfig[statusMes as keyof typeof statusConfig]?.icon}
                  label={statusConfig[statusMes as keyof typeof statusConfig]?.label}
                  color={statusConfig[statusMes as keyof typeof statusConfig]?.color}
                  size="small"
                />
              </Stack>
            </Grid>
            {valorAprovado !== undefined && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Valor Total: <strong>{valorAprovado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </Typography>
              </Grid>
            )}
            {motivoReprovacao && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="caption" fontWeight="bold">
                    Motivo da Reprovação:
                  </Typography>
                  <Typography variant="body2">
                    {motivoReprovacao}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Alerta temporário */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="600" gutterBottom>
          Funcionalidade em Desenvolvimento
        </Typography>
        <Typography variant="body2">
          O calendário detalhado com todos os lançamentos do colaborador estará disponível em breve.
          Por enquanto, você pode visualizar o resumo completo através do botão "Ver Detalhes" na lista de aprovações.
        </Typography>
      </Alert>

      {/* Calendário - Por enquanto vazio */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Calendário de Lançamentos
        </Typography>
        <CalendarioHoras
          mesAtual={mesAtual}
          lancamentos={apontamentos}
          onSelectDay={handleSelectDay}
          readOnly={true}
        />
      </Paper>

      {/* Dialog de Lançamentos do Dia */}
      {selectedDate && (
        <DialogLancamentosDia
          open={dialogDiaOpen}
          onClose={() => setDialogDiaOpen(false)}
          data={selectedDate}
          lancamentos={apontamentos.filter(l => l.data === selectedDate)}
          contratos={contratos}
          readOnly={true}
        />
      )}
    </Box>
  );
}
