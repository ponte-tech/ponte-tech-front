'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import type { DiaCalendario } from '@/app/types/timesheet';

interface CalendarioHorasProps {
  dias: DiaCalendario[];
  mesAtual: string; // YYYY-MM
  onMesChange: (novoMes: string) => void;
  onDiaClick: (data: string) => void;
}

export default function CalendarioHoras({
  dias,
  mesAtual,
  onMesChange,
  onDiaClick,
}: CalendarioHorasProps) {
  const [, mes] = mesAtual.split('-');
  const mesNome = new Date(`${mesAtual}-01`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    const [ano, mesNum] = mesAtual.split('-').map(Number);
    const novaData = new Date(ano, mesNum - 2, 1);
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
    onMesChange(novoMes);
  };

  const handleNextMonth = () => {
    const [ano, mesNum] = mesAtual.split('-').map(Number);
    const novaData = new Date(ano, mesNum, 1);
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
    onMesChange(novoMes);
  };

  const getDiaSemana = (data: string) => {
    return new Date(data + 'T12:00:00').getDay();
  };

  const primeiroDia = dias.length > 0 ? getDiaSemana(dias[0].data) : 0;

  const renderDia = (dia: DiaCalendario) => {
    const diaNumero = new Date(dia.data + 'T12:00:00').getDate();
    const diaSemana = getDiaSemana(dia.data);
    const isWeekend = diaSemana === 0 || diaSemana === 6;
    const hasLancamentos = dia.lancamentos && dia.lancamentos.length > 0;
    const totalHoras = dia.lancamentos?.reduce(
      (sum, l) => sum + l.duracao_horas_ajustada,
      0
    ) || 0;

    return (
      <Tooltip
        key={dia.data}
        title={
          <Box>
            {dia.e_feriado && <Typography variant="caption">{dia.nome_feriado}</Typography>}
            {hasLancamentos && (
              <Typography variant="caption">
                {dia.lancamentos.length} lançamento(s) - {totalHoras.toFixed(2)}h
              </Typography>
            )}
            {!hasLancamentos && !dia.e_feriado && (
              <Typography variant="caption">Sem lançamentos</Typography>
            )}
          </Box>
        }
      >
        <Box
          onClick={() => onDiaClick(dia.data)}
          sx={{
            position: 'relative',
            cursor: 'pointer',
            minHeight: 80,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            bgcolor: dia.e_feriado
              ? 'error.50'
              : isWeekend
              ? 'grey.100'
              : hasLancamentos
              ? 'success.50'
              : 'background.paper',
            '&:hover': {
              bgcolor: dia.e_feriado
                ? 'error.100'
                : isWeekend
                ? 'grey.200'
                : hasLancamentos
                ? 'success.100'
                : 'action.hover',
            },
          }}
        >
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="body2"
                fontWeight="bold"
                color={isWeekend || dia.e_feriado ? 'error.main' : 'text.primary'}
              >
                {diaNumero}
              </Typography>
              {hasLancamentos && (
                <CheckIcon color="success" sx={{ fontSize: 16 }} />
              )}
              {dia.e_feriado && !hasLancamentos && (
                <EventIcon color="error" sx={{ fontSize: 16 }} />
              )}
            </Box>

            {hasLancamentos && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {totalHoras.toFixed(2)}h
                </Typography>
                {dia.lancamentos.slice(0, 2).map((lanc, idx) => (
                  <Typography
                    key={idx}
                    variant="caption"
                    display="block"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lanc.nome_cliente}
                  </Typography>
                ))}
                {dia.lancamentos.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dia.lancamentos.length - 2} mais
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Card>
      <CardContent>
        {/* Header do Calendário */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" textTransform="capitalize">
            {mesNome}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Dias da Semana */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
            <Grid item xs key={dia}>
              <Typography
                variant="caption"
                fontWeight="bold"
                textAlign="center"
                display="block"
                color="text.secondary"
              >
                {dia}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Grade do Calendário */}
        <Grid container spacing={1}>
          {/* Espaços vazios antes do primeiro dia */}
          {Array.from({ length: primeiroDia }).map((_, idx) => (
            <Grid item xs key={`empty-${idx}`}>
              <Box sx={{ minHeight: 80 }} />
            </Grid>
          ))}

          {/* Dias do mês */}
          {dias.map((dia) => (
            <Grid item xs key={dia.data}>
              {renderDia(dia)}
            </Grid>
          ))}
        </Grid>

        {/* Legenda */}
        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          <Chip
            label="Com lançamentos"
            size="small"
            sx={{ bgcolor: 'success.50' }}
          />
          <Chip
            label="Feriado"
            size="small"
            sx={{ bgcolor: 'error.50' }}
          />
          <Chip
            label="Sem lançamentos"
            size="small"
            sx={{ bgcolor: 'grey.100' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
