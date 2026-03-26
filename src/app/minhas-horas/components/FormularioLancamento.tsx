'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  Chip,
  Typography,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import type { Contrato, CreateLancamentoRequest } from '@/app/types/timesheet';

interface FormularioLancamentoProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLancamentoRequest) => Promise<void>;
  contratos: Contrato[];
  dataInicial?: string;
}

export default function FormularioLancamento({
  open,
  onClose,
  onSubmit,
  contratos,
  dataInicial,
}: FormularioLancamentoProps) {
  const [contratoId, setContratoId] = useState('');
  const [tipoLancamento, setTipoLancamento] = useState<'unico' | 'multiplo'>('unico');
  const [dataUnica, setDataUnica] = useState<Date | null>(
    dataInicial ? new Date(dataInicial + 'T12:00:00') : new Date()
  );
  const [dataInicio, setDataInicio] = useState<Date | null>(new Date());
  const [dataFim, setDataFim] = useState<Date | null>(new Date());
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar dataUnica quando dataInicial ou open mudar
  useEffect(() => {
    if (open && dataInicial) {
      setDataUnica(new Date(dataInicial + 'T12:00:00'));
    } else if (open && !dataInicial) {
      setDataUnica(new Date());
    }
  }, [open, dataInicial]);

  const handleSubmit = async () => {
    setError(null);

    // Validações
    if (!contratoId) {
      setError('Selecione um cliente');
      return;
    }

    if (tipoLancamento === 'unico' && !dataUnica) {
      setError('Selecione uma data');
      return;
    }

    if (tipoLancamento === 'multiplo' && (!dataInicio || !dataFim)) {
      setError('Selecione as datas de início e fim');
      return;
    }

    if (!horaInicio || !horaFim) {
      setError('Preencha hora de início e fim');
      return;
    }

    // Validar se hora fim é maior que hora início
    const [hi, mi] = horaInicio.split(':').map(Number);
    const [hf, mf] = horaFim.split(':').map(Number);
    if (hi * 60 + mi >= hf * 60 + mf) {
      setError('Hora de término deve ser maior que hora de início');
      return;
    }

    try {
      setLoading(true);

      // Gerar lista de datas
      const datas: string[] = [];
      if (tipoLancamento === 'unico') {
        datas.push(dataUnica!.toISOString().split('T')[0]);
      } else {
        const inicio = new Date(dataInicio!);
        const fim = new Date(dataFim!);
        const current = new Date(inicio);

        while (current <= fim) {
          // Pular fins de semana
          const diaSemana = current.getDay();
          if (diaSemana !== 0 && diaSemana !== 6) {
            datas.push(current.toISOString().split('T')[0]);
          }
          current.setDate(current.getDate() + 1);
        }
      }

      // Montar request
      const request: CreateLancamentoRequest = {
        lancamentos: datas.map((data) => ({
          contrato_id: contratoId,
          data,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          observacao: observacao || undefined,
        })),
      };

      await onSubmit(request);

      // Limpar form
      setContratoId('');
      setDataUnica(new Date());
      setDataInicio(new Date());
      setDataFim(new Date());
      setHoraInicio('09:00');
      setHoraFim('18:00');
      setObservacao('');
      setTipoLancamento('unico');

      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao criar lançamento');
    } finally {
      setLoading(false);
    }
  };

  const contratosAtivos = contratos.filter((c) => c.status === 'ativo');
  const totalDias =
    tipoLancamento === 'multiplo' && dataInicio && dataFim
      ? Math.max(
          0,
          Array.from(
            { length: Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1 },
            (_, i) => {
              const d = new Date(dataInicio);
              d.setDate(d.getDate() + i);
              return d.getDay();
            }
          ).filter((day) => day !== 0 && day !== 6).length
        )
      : 1;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          },
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            py: 2.5,
            px: 3,
            background: 'rgba(248, 250, 252, 0.5)',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#0f172a',
              letterSpacing: '-0.01em',
            }}
          >
            Novo Lançamento de Horas
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Cliente */}
            <FormControl fullWidth required>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={contratoId}
                onChange={(e) => setContratoId(e.target.value)}
                label="Cliente"
              >
                {contratosAtivos.map((contrato) => (
                  <MenuItem key={contrato.contrato_id} value={contrato.contrato_id}>
                    {contrato.nome_cliente} - R$ {contrato.valor_hora.toFixed(2)}/h
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tipo de Lançamento - Modern */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  mb: 1.5,
                }}
              >
                Tipo de Lançamento
              </Typography>
              <ToggleButtonGroup
                value={tipoLancamento}
                exclusive
                onChange={(_, value) => value && setTipoLancamento(value)}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 1.25,
                    borderRadius: 2,
                    border: '1.5px solid rgba(226, 232, 240, 0.8)',
                    color: '#64748b',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
                      color: '#FFFFFF',
                      borderColor: '#8270FF',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6b5ce0 0%, #5a4dcc 100%)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(130, 112, 255, 0.04)',
                      borderColor: '#8270FF',
                    },
                  },
                }}
              >
                <ToggleButton value="unico">Dia Único</ToggleButton>
                <ToggleButton value="multiplo">Múltiplos Dias</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Datas */}
            {tipoLancamento === 'unico' ? (
              <DatePicker
                label="Data"
                value={dataUnica}
                onChange={setDataUnica}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { fullWidth: true, required: true },
                }}
              />
            ) : (
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Data Início"
                  value={dataInicio}
                  onChange={setDataInicio}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
                <DatePicker
                  label="Data Fim"
                  value={dataFim}
                  onChange={setDataFim}
                  format="dd/MM/yyyy"
                  minDate={dataInicio || undefined}
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </Stack>
            )}

            {tipoLancamento === 'multiplo' && totalDias > 0 && (
              <Alert severity="info">
                Serão criados {totalDias} lançamento(s) (excluindo fins de semana)
              </Alert>
            )}

            {/* Horários */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Hora Início"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hora Fim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* Observação */}
            <TextField
              label="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: '1px solid rgba(226, 232, 240, 0.8)',
            justifyContent: 'space-between',
            background: 'rgba(248, 250, 252, 0.5)',
          }}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.938rem',
              color: '#64748b',
              px: 3,
              py: 1.25,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(100, 116, 139, 0.08)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || contratosAtivos.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.938rem',
              px: 4,
              py: 1.25,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
              boxShadow: '0 2px 8px rgba(130, 112, 255, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6b5ce0 0%, #5a4dcc 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(130, 112, 255, 0.4)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: 'rgba(130, 112, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.6)',
              },
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
