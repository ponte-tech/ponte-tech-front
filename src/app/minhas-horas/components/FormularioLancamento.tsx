'use client';

import React, { useState } from 'react';
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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Lançamento de Horas</DialogTitle>
        <DialogContent>
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

            {/* Tipo de Lançamento */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Tipo de Lançamento
              </Typography>
              <ToggleButtonGroup
                value={tipoLancamento}
                exclusive
                onChange={(_, value) => value && setTipoLancamento(value)}
                fullWidth
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
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || contratosAtivos.length === 0}
          >
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
