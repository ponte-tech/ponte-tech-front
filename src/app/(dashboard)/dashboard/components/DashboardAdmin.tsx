"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People,
  AccessTime,
  Receipt,
  Business,
  CheckCircle,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import dashboardService from "@/app/services/dashboardService";
import type { DashboardAdminResponse } from "@/app/types/dashboard";

export default function DashboardAdmin() {
  const [dashboard, setDashboard] = useState<DashboardAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // TEMPORÁRIO: Usar dados mockados devido a problema de configuração no backend
      // O endpoint /api/admin/* está retornando 403 devido a configuração incorreta no API Gateway
      console.warn('⚠️ [DASHBOARD ADMIN] Usando dados mockados - Backend com problema de configuração');

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Dados mockados para demonstração
      const mockData: DashboardAdminResponse = {
        mes_atual: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        colaboradores: {
          ativos: 12,
          total: 15
        },
        timesheet: {
          aguardando_aprovacao: 8,
          aprovados: 145,
          reprovados: 3,
          total_horas_aprovadas: 1280
        },
        notas_fiscais: {
          total: 45,
          pendentes_aprovacao: 5,
          aprovadas_aguardando_pagamento: 12,
          pagas: 28
        },
        qtd_contratos_ativos: 18,
        custo_total_mes: 185600.00
      };

      setDashboard(mockData);

      // Tentar carregar dados reais (comentado até backend ser corrigido)
      /*
      const data = await dashboardService.getDashboardAdmin();
      setDashboard(data);
      */
    } catch (err: any) {
      console.error("Erro ao carregar dashboard:", err);
      setError(err.response?.data?.error || "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboard) {
    return null;
  }

  const stats = [
    {
      title: "Colaboradores Ativos",
      value: dashboard.colaboradores.ativos.toString(),
      subtitle: `${dashboard.colaboradores.total} total`,
      icon: <People sx={{ fontSize: 32 }} />,
      color: "#8270FF",
      bgColor: alpha("#8270FF", 0.1),
    },
    {
      title: "Aguardando Aprovação",
      value: dashboard.timesheet.aguardando_aprovacao.toString(),
      subtitle: "timesheets pendentes",
      icon: <Schedule sx={{ fontSize: 32 }} />,
      color: "#f59e0b",
      bgColor: alpha("#f59e0b", 0.1),
    },
    {
      title: "Horas Aprovadas",
      value: `${dashboard.timesheet.total_horas_aprovadas.toFixed(1)}h`,
      subtitle: "no mês atual",
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: "#10b981",
      bgColor: alpha("#10b981", 0.1),
    },
    {
      title: "Contratos Ativos",
      value: dashboard.qtd_contratos_ativos.toString(),
      subtitle: "em andamento",
      icon: <Business sx={{ fontSize: 32 }} />,
      color: "#06b6d4",
      bgColor: alpha("#06b6d4", 0.1),
    },
  ];

  return (
    <Box>
      {/* Alerta temporário sobre dados mockados */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Modo demonstração:</strong> Exibindo dados mockados. O endpoint do backend admin está temporariamente indisponível devido a configuração incorreta no API Gateway.
      </Alert>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#202031",
            mb: 0.5,
          }}
        >
          Dashboard Administrativo - {dashboard.mes_atual}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
          }}
        >
          Visão geral das operações e métricas da empresa
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                  borderColor: stat.color,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#202031",
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    mb: 0.5,
                  }}
                >
                  {stat.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Timesheets Summary */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <AccessTime sx={{ mr: 1, color: "#8270FF" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status dos Timesheets
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                    {dashboard.timesheet.aguardando_aprovacao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aguardando
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981" }}>
                    {dashboard.timesheet.aprovados}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprovados
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#ef4444" }}>
                    {dashboard.timesheet.reprovados}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reprovados
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notas Fiscais Summary */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Receipt sx={{ mr: 1, color: "#8270FF" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notas Fiscais
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                    {dashboard.notas_fiscais.pendentes_aprovacao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#06b6d4" }}>
                    {dashboard.notas_fiscais.aprovadas_aguardando_pagamento}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprovadas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981" }}>
                    {dashboard.notas_fiscais.pagas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pagas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#8270FF" }}>
                    {dashboard.notas_fiscais.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Notas
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Financeiro */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Custo Total do Mês
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                R$ {dashboard.custo_total_mes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                Baseado nas horas aprovadas e valores dos contratos
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
