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
  LinearProgress,
} from "@mui/material";
import {
  AccessTime,
  AttachMoney,
  CheckCircle,
  Business,
  Receipt,
} from "@mui/icons-material";
import dashboardService from "@/app/services/dashboardService";
import type { DashboardColaboradorResponse } from "@/app/types/dashboard";

export default function DashboardColaborador() {
  const [dashboard, setDashboard] = useState<DashboardColaboradorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardColaborador();

      // Verificar se os dados estão vazios e mostrar aviso
      if (!data || Object.keys(data).length === 0) {
    // console.warn("⚠️ [DASHBOARD] Backend retornou dados vazios!");
        setError("O endpoint do dashboard ainda não está retornando dados. Verifique o backend.");
        return;
      }

      setDashboard(data);
    } catch (err: any) {
    // console.error("❌ [DASHBOARD] Erro ao carregar dashboard:", err);
    // console.error("❌ [DASHBOARD] Response data:", err.response?.data);
    // console.error("❌ [DASHBOARD] Status code:", err.response?.status);

      // Verificar se é erro 404 ou 500
      if (err.response?.status === 404) {
        setError("Endpoint do dashboard não encontrado. O backend pode não estar implementado ainda.");
      } else if (err.response?.status >= 500) {
        setError("Erro no servidor ao carregar dashboard. Verifique os logs do backend.");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Erro ao carregar dashboard");
      }
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
      title: "Horas Lançadas",
      value: `${(dashboard.horas_lancadas || 0).toFixed(1)}h`,
      subtitle: `de ${(dashboard.horas_contratadas || 0).toFixed(1)}h contratadas`,
      icon: <AccessTime sx={{ fontSize: 32 }} />,
      color: "#8270FF",
      bgColor: alpha("#8270FF", 0.1),
    },
    {
      title: "Progresso Mensal",
      value: `${(dashboard.percentual_lancado || 0).toFixed(0)}%`,
      subtitle: "do total contratado",
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: "#10b981",
      bgColor: alpha("#10b981", 0.1),
    },
    {
      title: "Valor Estimado",
      value: `R$ ${(dashboard.valor_estimado_mes || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      subtitle: "para este mês",
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      color: "#f59e0b",
      bgColor: alpha("#f59e0b", 0.1),
    },
    {
      title: "Contratos Ativos",
      value: (dashboard.qtd_contratos_ativos || 0).toString(),
      subtitle: "contratos em andamento",
      icon: <Business sx={{ fontSize: 32 }} />,
      color: "#06b6d4",
      bgColor: alpha("#06b6d4", 0.1),
    },
  ];

  const statusColors: Record<string, string> = {
    PENDENTE_ENVIO: "#6b7280",
    AGUARDANDO_APROVACAO: "#f59e0b",
    APROVADO: "#10b981",
    REPROVADO: "#ef4444",
  };

  return (
    <Box>
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
          Dashboard - {dashboard.mes_atual || new Date().toISOString().slice(0, 7)}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
          }}
        >
          Resumo das suas atividades e horas trabalhadas
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
        {/* Status do Fechamento */}
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Status do Fechamento
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: statusColors[dashboard.status_fechamento || "PENDENTE_ENVIO"] || "#6b7280",
                  mr: 2,
                }}
              />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {(dashboard.status_fechamento || "PENDENTE_ENVIO").replace(/_/g, " ")}
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Progresso das Horas
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(dashboard.percentual_lancado || 0, 100)}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: alpha("#8270FF", 0.1),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#8270FF",
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {(dashboard.horas_lancadas || 0).toFixed(1)}h de {(dashboard.horas_contratadas || 0).toFixed(1)}h
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Notas Fiscais */}
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
              <Grid item xs={6}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                    {dashboard.notas_fiscais?.pendentes || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981" }}>
                    {dashboard.notas_fiscais?.aprovadas || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprovadas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#06b6d4" }}>
                    {dashboard.notas_fiscais?.pagas || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pagas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#8270FF" }}>
                    {dashboard.notas_fiscais?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
