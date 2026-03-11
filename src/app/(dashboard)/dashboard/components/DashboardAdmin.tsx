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
  Tabs,
  Tab,
} from "@mui/material";
import {
  People,
  Business,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dashboardService from "@/app/services/dashboardService";
import type { DashboardAdminResponse, FinanceirosPorEmpresaResponse } from "@/app/types/dashboard";

export default function DashboardAdmin() {
  const [dashboard, setDashboard] = useState<DashboardAdminResponse | null>(null);
  const [financeiros, setFinanceiros] = useState<FinanceirosPorEmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardData, financeirosData] = await Promise.all([
        dashboardService.getDashboardAdmin(),
        dashboardService.getFinanceirosPorEmpresa(6), // Últimos 6 meses
      ]);

      setDashboard(dashboardData);
      setFinanceiros(financeirosData);
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

  if (!dashboard || !financeiros) {
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
      title: "Contratos Ativos",
      value: dashboard.qtd_contratos_ativos.toString(),
      subtitle: "em andamento",
      icon: <Business sx={{ fontSize: 32 }} />,
      color: "#06b6d4",
      bgColor: alpha("#06b6d4", 0.1),
    },
  ];

  // Preparar dados para o gráfico
  const formatMes = (mes: string) => {
    const [year, month] = mes.split("-");
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${monthNames[parseInt(month) - 1]}/${year.substring(2)}`;
  };

  // Dados para cada empresa e consolidado
  const getChartData = () => {
    if (selectedTab === financeiros.empresas.length) {
      // Consolidado
      return financeiros.consolidado.meses.map(mes => ({
        mes: formatMes(mes.mes),
        Receitas: mes.receitas,
        "Despesas - Impostos": mes.despesas_impostos,
        "Despesas - Notas": mes.despesas_notas,
      }));
    } else {
      // Empresa específica
      const empresa = financeiros.empresas[selectedTab];
      return empresa.meses.map(mes => ({
        mes: formatMes(mes.mes),
        Receitas: mes.receitas,
        "Despesas - Impostos": mes.despesas_impostos,
        "Despesas - Notas": mes.despesas_notas,
      }));
    }
  };

  const chartData = getChartData();

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
          Dashboard Administrativo
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
          <Grid item xs={12} sm={6} md={6} key={index}>
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

      {/* Gráfico Financeiro por Empresa */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Receitas e Despesas por Mês
        </Typography>

        {/* Tabs para alternar entre empresas */}
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          {financeiros.empresas.map((empresa, index) => (
            <Tab key={empresa.empresa_id} label={empresa.nome_fantasia} />
          ))}
          <Tab label="Consolidado" />
        </Tabs>

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="mes"
              tick={{ fill: "#666", fontSize: 12 }}
              tickLine={{ stroke: "#e0e0e0" }}
            />
            <YAxis
              tick={{ fill: "#666", fontSize: 12 }}
              tickLine={{ stroke: "#e0e0e0" }}
              tickFormatter={(value) =>
                `R$ ${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              formatter={(value: number) =>
                `R$ ${value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              }
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="square"
            />
            <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas - Impostos" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas - Notas" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Legenda adicional */}
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Receitas
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Lançamentos contábeis (notas fiscais emitidas)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Despesas - Impostos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Impostos e taxas da empresa
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Despesas - Notas
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Notas fiscais dos colaboradores
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
