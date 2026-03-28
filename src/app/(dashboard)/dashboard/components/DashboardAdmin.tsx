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
  TextField,
} from "@mui/material";
import {
  People,
  Business,
  TrendingUp,
  TrendingDown,
  AccountBalance,
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
  LabelList,
} from 'recharts';
import dashboardService from "@/app/services/dashboardService";
import type { DashboardAdminResponse, FinanceirosPorEmpresaResponse } from "@/app/types/dashboard";
import { formatCNPJ } from "@/app/utils/cnpjValidator";

export default function DashboardAdmin() {
  const [dashboard, setDashboard] = useState<DashboardAdminResponse | null>(null);
  const [financeiros, setFinanceiros] = useState<FinanceirosPorEmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Consolidado, 1+ = Empresas

  // Estado para o filtro de mês do resumo financeiro
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

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
    // console.error("Erro ao carregar dashboard:", err);
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
      title: "Clientes Ativos",
      value: dashboard.clientes.ativos.toString(),
      subtitle: `${dashboard.clientes.total} total`,
      icon: <Business sx={{ fontSize: 32 }} />,
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

  // Preparar dados para o gráfico
  const formatMes = (mes: string) => {
    const [year, month] = mes.split("-");
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${monthNames[parseInt(month) - 1]}/${year.substring(2)}`;
  };

  // Formatar valor para label nas barras
  const formatLabel = (value: number) => {
    if (value === 0) return "";
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  // Dados para cada empresa e consolidado
  const getChartData = () => {
    if (selectedTab === 0) {
      // Consolidado (tab 0)
      return financeiros.consolidado.meses.map(mes => ({
        mes: formatMes(mes.mes),
        Receitas: mes.receitas,
        "Despesas - Impostos": mes.despesas_impostos,
        "Despesas - Notas": mes.despesas_notas,
      }));
    } else {
      // Empresa específica (tab 1, 2, 3...)
      const empresa = financeiros.empresas[selectedTab - 1];
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
          <Grid item xs={12} sm={6} md={4} key={index}>
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

      {/* Resumo Financeiro por Empresa */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Resumo Financeiro
          </Typography>

          {/* Filtro de Mês */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              minWidth: 200,
            }}
          >
            <TextField
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(130, 112, 255, 0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(130, 112, 255, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8270FF',
                      borderWidth: 2,
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Card Consolidado */}
          {(() => {
            // Encontrar dados do mês selecionado
            const mesAtualConsolidado = financeiros.consolidado.meses.find(m => m.mes === selectedMonth) ||
                                        financeiros.consolidado.meses[financeiros.consolidado.meses.length - 1];
            const receitasTotal = mesAtualConsolidado?.receitas || 0;
            const despesasTotal = (mesAtualConsolidado?.despesas_notas || 0) + (mesAtualConsolidado?.despesas_impostos || 0);
            const resultadoTotal = receitasTotal - despesasTotal;
            const isPositivoTotal = resultadoTotal >= 0;

            return (
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "3px solid",
                    borderColor: isPositivoTotal ? "#10b981" : "#ef4444",
                    bgcolor: isPositivoTotal ? alpha("#10b981", 0.08) : alpha("#ef4444", 0.08),
                    background: isPositivoTotal
                      ? `linear-gradient(135deg, ${alpha("#10b981", 0.12)} 0%, ${alpha("#10b981", 0.04)} 100%)`
                      : `linear-gradient(135deg, ${alpha("#ef4444", 0.12)} 0%, ${alpha("#ef4444", 0.04)} 100%)`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3 }}>
                      {/* Título */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: isPositivoTotal ? alpha("#10b981", 0.2) : alpha("#ef4444", 0.2),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2,
                          }}
                        >
                          <AccountBalance sx={{ color: isPositivoTotal ? "#10b981" : "#ef4444", fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Consolidado Geral
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Soma de todas as empresas
                          </Typography>
                        </Box>
                      </Box>

                      {/* Valores em linha */}
                      <Box sx={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                        {/* Receitas */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Receitas
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
                            {receitasTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </Typography>
                        </Box>

                        {/* Menos */}
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                          -
                        </Typography>

                        {/* Despesas */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Despesas
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#ef4444" }}>
                            {despesasTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            (Notas: {(mesAtualConsolidado?.despesas_notas || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} +
                            Impostos: {(mesAtualConsolidado?.despesas_impostos || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                          </Typography>
                        </Box>

                        {/* Igual */}
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                          =
                        </Typography>

                        {/* Resultado */}
                        <Box
                          sx={{
                            bgcolor: isPositivoTotal ? alpha("#10b981", 0.15) : alpha("#ef4444", 0.15),
                            borderRadius: 2,
                            p: 2,
                            minWidth: 180,
                            textAlign: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                            {isPositivoTotal ? (
                              <TrendingUp sx={{ color: "#10b981", fontSize: 24 }} />
                            ) : (
                              <TrendingDown sx={{ color: "#ef4444", fontSize: 24 }} />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Resultado
                            </Typography>
                          </Box>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: isPositivoTotal ? "#10b981" : "#ef4444",
                            }}
                          >
                            {resultadoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })()}

          {/* Cards por Empresa */}
          {financeiros.empresas.map((empresa) => {
            // Encontrar dados do mês selecionado
            const mesAtual = empresa.meses.find(m => m.mes === selectedMonth) ||
                            empresa.meses[empresa.meses.length - 1];
            const receitas = mesAtual?.receitas || 0;
            const despesas = (mesAtual?.despesas_notas || 0) + (mesAtual?.despesas_impostos || 0);
            const resultado = receitas - despesas;
            const isPositivo = resultado >= 0;

            return (
              <Grid item xs={12} md={6} key={empresa.empresa_id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: isPositivo ? alpha("#10b981", 0.3) : alpha("#ef4444", 0.3),
                    bgcolor: isPositivo ? alpha("#10b981", 0.05) : alpha("#ef4444", 0.05),
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                      borderColor: isPositivo ? "#10b981" : "#ef4444",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Nome da Empresa */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: isPositivo ? alpha("#10b981", 0.2) : alpha("#ef4444", 0.2),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1.5,
                          }}
                        >
                          <AccountBalance sx={{ color: isPositivo ? "#10b981" : "#ef4444", fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                          {empresa.nome_fantasia}
                        </Typography>
                      </Box>
                      {empresa.cnpj && (
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                          {formatCNPJ(empresa.cnpj)}
                        </Typography>
                      )}
                    </Box>

                    {/* Valores */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Receitas:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#10b981" }}>
                          {receitas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Despesas:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#ef4444" }}>
                          {despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          borderTop: "2px solid",
                          borderColor: "divider",
                          pt: 1,
                          mt: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {isPositivo ? (
                            <TrendingUp sx={{ color: "#10b981", fontSize: 20 }} />
                          ) : (
                            <TrendingDown sx={{ color: "#ef4444", fontSize: 20 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Resultado:
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isPositivo ? "#10b981" : "#ef4444",
                          }}
                        >
                          {resultado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Subtotal de Despesas */}
                    <Box
                      sx={{
                        bgcolor: alpha("#64748b", 0.08),
                        borderRadius: 1,
                        p: 1.5,
                        mt: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Detalhamento das Despesas:
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          • Notas Fiscais:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {(mesAtual?.despesas_notas || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          • Impostos:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {(mesAtual?.despesas_impostos || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

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
          <Tab label="Consolidado" />
          {financeiros.empresas.map((empresa, index) => (
            <Tab key={empresa.empresa_id} label={empresa.nome_fantasia} />
          ))}
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
            <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="Receitas"
                position="top"
                formatter={formatLabel}
                style={{ fill: "#10b981", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
            <Bar dataKey="Despesas - Impostos" fill="#ef4444" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="Despesas - Impostos"
                position="top"
                formatter={formatLabel}
                style={{ fill: "#ef4444", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
            <Bar dataKey="Despesas - Notas" fill="#f59e0b" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="Despesas - Notas"
                position="top"
                formatter={formatLabel}
                style={{ fill: "#f59e0b", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
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
                  Soma dos lançamentos contábeis do mês
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Despesas - Impostos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total de impostos lançados no mês
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Despesas - Notas
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Horas trabalhadas × valor hora dos colaboradores
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
