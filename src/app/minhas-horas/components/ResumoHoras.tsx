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
      {/* Cards de Resumo Geral - Modern Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(130, 112, 255, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(130, 112, 255, 0.35)',
              },
            }}
          >
            <CardContent sx={{ py: 3, px: 3.5 }}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2.5,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TimeIcon sx={{ fontSize: '2rem', color: '#FFFFFF' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      mb: 0.5,
                    }}
                  >
                    Total de Horas Lançadas
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#FFFFFF',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatHours(resumo.total_horas_lancadas)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cards por Cliente - Modern Heading */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#0f172a',
          mb: 2.5,
          letterSpacing: '-0.01em',
        }}
      >
        Resumo por Cliente
      </Typography>

      <Grid container spacing={3}>
        {resumo.contratos.map((contrato) => (
          <Grid item xs={12} key={contrato.contrato_id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                background: '#ffffff',
                border: '1px solid',
                borderColor: 'rgba(226, 232, 240, 0.8)',
                boxShadow: '0 1px 3px rgba(100, 116, 139, 0.06)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(100, 116, 139, 0.12)',
                  borderColor: 'rgba(130, 112, 255, 0.2)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  {/* Header - Modern */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        color: '#0f172a',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {contrato.nome_cliente}
                    </Typography>
                    <Chip
                      label={`${contrato.percentual_usado.toFixed(0)}% usado`}
                      sx={{
                        height: 28,
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        borderRadius: 1.5,
                        background: contrato.percentual_usado > 100
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                      }}
                    />
                  </Box>

                  {/* Progress Bar - Modern */}
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(contrato.percentual_usado, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: 'rgba(226, 232, 240, 0.5)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          background: contrato.percentual_usado > 100
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
                        },
                      }}
                    />
                  </Box>

                  {/* Métricas - Modern Cards */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(130, 112, 255, 0.06)',
                          border: '1px solid rgba(130, 112, 255, 0.15)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Horas Lançadas
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: '#8270FF',
                            mt: 0.5,
                          }}
                        >
                          {formatHours(contrato.horas_lancadas)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: contrato.horas_restantes < 10
                            ? 'rgba(239, 68, 68, 0.06)'
                            : 'rgba(16, 185, 129, 0.06)',
                          border: '1px solid',
                          borderColor: contrato.horas_restantes < 10
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Horas Restantes
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: contrato.horas_restantes < 10 ? '#ef4444' : '#10b981',
                            mt: 0.5,
                          }}
                        >
                          {formatHours(contrato.horas_restantes)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(100, 116, 139, 0.06)',
                          border: '1px solid rgba(100, 116, 139, 0.15)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Total do Mês
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: '#64748b',
                            mt: 0.5,
                          }}
                        >
                          {formatHours(contrato.total_hora_mes)}
                        </Typography>
                      </Box>
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
