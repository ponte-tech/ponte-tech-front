'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { ResumoMesResponse } from '@/app/types/timesheet';

interface ResumoHorasProps {
  resumo: ResumoMesResponse;
}

export default function ResumoHoras({ resumo }: ResumoHorasProps) {
  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)}h`;
  };

  return (
    <Box>
      {/* Cards de Resumo Geral */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TimeIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Horas Lançadas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatHours(resumo.total_horas_lancadas)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cards por Cliente */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Resumo por Cliente
      </Typography>

      <Grid container spacing={3}>
        {resumo.contratos.map((contrato) => (
          <Grid item xs={12} key={contrato.contrato_id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      {contrato.nome_cliente}
                    </Typography>
                    <Chip
                      label={`${contrato.percentual_usado.toFixed(0)}% usado`}
                      color={contrato.percentual_usado > 100 ? 'error' : 'primary'}
                      size="small"
                    />
                  </Box>

                  {/* Progress Bar */}
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(contrato.percentual_usado, 100)}
                      color={contrato.percentual_usado > 100 ? 'error' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Métricas */}
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Horas Lançadas
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatHours(contrato.horas_lancadas)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Horas Restantes
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color={contrato.horas_restantes < 10 ? 'error.main' : 'inherit'}>
                        {formatHours(contrato.horas_restantes)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Total do Mês
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatHours(contrato.total_hora_mes)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
