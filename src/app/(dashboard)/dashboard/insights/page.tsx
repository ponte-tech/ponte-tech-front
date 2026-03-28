"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  alpha,
  Autocomplete,
  Chip,
  Avatar,
  Skeleton,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { insightsService } from "@/app/services/insightsService";
import type {
  InsightsData,
  TasksByClient,
  TasksByAnalyst,
  TasksByStatus,
  TimelineData,
  AnalystTimeByStatus,
} from "@/app/types/insights";
import { useAuth } from "@/app/hooks/useAuth";

export default function InsightsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedClients, setSelectedClients] = useState<{id: string, name: string}[]>([]);
  const [selectedAnalysts, setSelectedAnalysts] = useState<{id: string, name: string}[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("all");

  // Dados
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [tasksByClient, setTasksByClient] = useState<TasksByClient[]>([]);
  const [tasksByAnalyst, setTasksByAnalyst] = useState<TasksByAnalyst[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [analystTimeByStatus, setAnalystTimeByStatus] = useState<AnalystTimeByStatus[]>([]);

  // Options para filtros
  const [clients, setClients] = useState<{id: string, name: string}[]>([]);
  const [analysts, setAnalysts] = useState<{id: string, name: string}[]>([]);
  const [boards, setBoards] = useState<{id: string, name: string}[]>([]);

  // Cores modernas e suaves
  const COLORS = ['#8270FF', '#FF6B9D', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

  useEffect(() => {
    loadFiltersData();
    loadInsights();
  }, [user]);

  const loadFiltersData = async () => {
    try {
      // Skip if user is not loaded yet
      if (!user) {
        return;
      }

      // Load boards, clients and analysts for all users (admin and colaborador)
      // These endpoints are now accessible by both profiles
      const [boardsData, clientsData, analystsData] = await Promise.all([
        insightsService.getBoards(),
        insightsService.getClients(),
        insightsService.getAnalysts(),
      ]);

      setBoards(boardsData);
      setClients(clientsData);
      setAnalysts(analystsData);
    } catch (err) {
    // console.error("Erro ao carregar dados dos filtros:", err);
    }
  };

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Para múltiplos IDs, enviar como string separada por vírgula
      const filters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        clientId: selectedClients.length > 0 ? selectedClients.map(c => c.id).join(',') : undefined,
        analystId: selectedAnalysts.length > 0 ? selectedAnalysts.map(a => a.id).join(',') : undefined,
        boardId: selectedBoard !== "all" ? selectedBoard : undefined,
      };

      const [insights, byClient, byAnalyst, byStatus, timelineData, analystTimeData] = await Promise.all([
        insightsService.getInsights(filters),
        insightsService.getTasksByClient(filters),
        insightsService.getTasksByAnalyst(filters),
        insightsService.getTasksByStatus(filters),
        insightsService.getTimeline(filters),
        insightsService.getAnalystTimeByStatus(filters),
      ]);

      // Extrair dados do formato {success: true, data: {...}}
      const insightsData = insights?.data || insights;
      const clientData = byClient?.data || byClient;
      const analystData = byAnalyst?.data || byAnalyst;
      const statusData = byStatus?.data || byStatus;
      const timelineDataExtracted = timelineData?.data || timelineData;
      const analystTimeDataExtracted = analystTimeData?.data || analystTimeData;

      setInsightsData(insightsData);
      setTasksByClient(Array.isArray(clientData) ? clientData : []);
      setTasksByAnalyst(Array.isArray(analystData) ? analystData : []);
      setTasksByStatus(Array.isArray(statusData) ? statusData : []);
      setTimeline(Array.isArray(timelineDataExtracted) ? timelineDataExtracted : []);
      setAnalystTimeByStatus(Array.isArray(analystTimeDataExtracted) ? analystTimeDataExtracted : []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar insights");
      setTasksByClient([]);
      setTasksByAnalyst([]);
      setTasksByStatus([]);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadInsights();
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedClients([]);
    setSelectedAnalysts([]);
    setSelectedBoard("all");
    // Recarregar insights após limpar filtros
    setTimeout(() => loadInsights(), 0);
  };

  const KPICard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    index
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: any;
    color: string;
    index: number;
  }) => (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                mb: 1.5,
                fontSize: "0.813rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.primary",
                fontSize: "2rem",
              }}
            >
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {change >= 0 ? (
                  <TrendingUpIcon sx={{ color: "#10b981", fontSize: 18 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: "#ef4444", fontSize: 18 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: change >= 0 ? "#10b981" : "#ef4444",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs período anterior
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
            }}
          >
            <Icon sx={{ color: "white", fontSize: 28 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: "linear-gradient(135deg, #8270FF 0%, #6B5FCC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2rem",
            }}
          >
            Insights de Demandas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "0.938rem" }}>
            Análises e métricas de produtividade do Kanban
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background: "white",
          }}
        >
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <FilterListIcon sx={{ color: "#8270FF" }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.125rem" }}>
                Filtros
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Data Início"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#8270FF",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Data Fim"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#8270FF",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Autocomplete
                  multiple
                  size="small"
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  value={selectedClients}
                  onChange={(_, newValue) => setSelectedClients(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      placeholder="Selecione clientes..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.id}
                        label={option.name}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{ bgcolor: alpha("#8270FF", 0.1), color: "#8270FF" }}
                      />
                    ))
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#8270FF",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Autocomplete
                  multiple
                  size="small"
                  options={analysts}
                  getOptionLabel={(option) => option.name}
                  value={selectedAnalysts}
                  onChange={(_, newValue) => setSelectedAnalysts(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Colaborador"
                      placeholder="Selecione colaboradores..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.id}
                        label={option.name}
                        size="small"
                        avatar={
                          <Avatar
                            src={option.foto_perfil_url || ""}
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: option.foto_perfil_url ? "transparent" : "#FF6B9D",
                              fontSize: "0.65rem",
                              fontWeight: 600,
                            }}
                          >
                            {!option.foto_perfil_url && option.name?.substring(0, 2).toUpperCase()}
                          </Avatar>
                        }
                        {...getTagProps({ index })}
                        sx={{ bgcolor: alpha("#FF6B9D", 0.1), color: "#FF6B9D" }}
                      />
                    ))
                  }
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={option.foto_perfil_url || ""}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: option.foto_perfil_url ? "transparent" : "#FF6B9D",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {!option.foto_perfil_url && option.name?.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            {option.name}
                          </Typography>
                        </Box>
                      </li>
                    );
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#8270FF",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Board</InputLabel>
                  <Select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    label="Board"
                    sx={{
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8270FF",
                      },
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {boards.map((board) => (
                      <MenuItem key={board.id} value={board.id}>
                        {board.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} mt={3}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<FilterListIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  background: "linear-gradient(135deg, #8270FF 0%, #6B5FCC 100%)",
                  boxShadow: `0 4px 14px ${alpha("#8270FF", 0.4)}`,
                  "&:hover": {
                    background: "linear-gradient(135deg, #6B5FCC 0%, #5A4EAA 100%)",
                    boxShadow: `0 6px 20px ${alpha("#8270FF", 0.5)}`,
                  },
                }}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  borderColor: alpha("#8270FF", 0.3),
                  color: "#8270FF",
                  "&:hover": {
                    borderColor: "#8270FF",
                    background: alpha("#8270FF", 0.05),
                  },
                }}
              >
                Limpar
              </Button>
            </Stack>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha("#ef4444", 0.3),
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <>
            {/* KPIs Skeleton */}
            <Grid container spacing={3} mb={4}>
              {[1, 2, 3, 4].map((index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={140}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Chart Skeletons - Simplified */}
            {[1, 2].map((index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                width="100%"
                height={500}
                sx={{ mb: 4, borderRadius: 3 }}
              />
            ))}
          </>
        ) : (
          <>
            {/* KPIs */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total de Tasks"
                  value={insightsData?.total_tasks || 0}
                  change={insightsData?.total_tasks_change}
                  icon={AssignmentIcon}
                  color="#8270FF"
                  index={0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Tasks Finalizadas"
                  value={insightsData?.completed_tasks || 0}
                  change={insightsData?.completed_tasks_change}
                  icon={CheckCircleIcon}
                  color="#10b981"
                  index={1}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Em Andamento"
                  value={insightsData?.in_progress_tasks || 0}
                  icon={ScheduleIcon}
                  color="#f59e0b"
                  index={2}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Taxa de Conclusão"
                  value={`${insightsData?.completion_rate || 0}%`}
                  change={insightsData?.completion_rate_change}
                  icon={TrendingUpIcon}
                  color="#06b6d4"
                  index={3}
                />
              </Grid>
            </Grid>

            {/* Gráfico - Tasks por Cliente */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "white",
              }}
            >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={3}
                  sx={{ fontSize: "1.25rem", color: "text.primary" }}
                >
                  Tasks por Cliente
                </Typography>
                <Box sx={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tasksByClient} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="client_name" tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }} />
                      <YAxis tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const clientIndex = tasksByClient.findIndex(c => c.client_id === data.client_id);
                            const clientColor = COLORS[clientIndex % COLORS.length];
                            return (
                              <Box
                                sx={{
                                  backgroundColor: "white",
                                  borderRadius: "12px",
                                  border: "1px solid #e2e8f0",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  p: 2,
                                }}
                              >
                                <Typography variant="body2" fontWeight={600} mb={1}>
                                  {data.client_name || "Cliente"}
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: clientColor }} />
                                    <Typography variant="body2" fontSize="0.85rem">
                                      Criadas: {data.created}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: clientColor, opacity: 0.7 }} />
                                    <Typography variant="body2" fontSize="0.85rem">
                                      Finalizadas: {data.completed}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, pt: 0.5, borderTop: "1px solid #e2e8f0" }}>
                                    <Typography variant="body2" fontSize="0.85rem" fontWeight={600}>
                                      Total: {data.total}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 14, paddingTop: 10, fontWeight: 500 }} />
                      <Bar dataKey="created" name="Criadas" radius={[8, 8, 0, 0]}>
                        {tasksByClient.map((entry, index) => (
                          <Cell key={`cell-created-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                      <Bar dataKey="completed" name="Finalizadas" radius={[8, 8, 0, 0]}>
                        {tasksByClient.map((entry, index) => (
                          <Cell key={`cell-completed-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.7} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Gráfico - Tasks por Colaborador */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "white",
              }}
            >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={3}
                  sx={{ fontSize: "1.25rem", color: "text.primary" }}
                >
                  Tasks por Colaborador
                </Typography>
                <Box sx={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tasksByAnalyst} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <defs>
                        {tasksByAnalyst.map((analyst, index) => (
                          <linearGradient key={`gradient-${index}`} id={`colorAnalyst${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                            <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="analyst_name"
                        height={120}
                        interval={0}
                        tick={({ x, y, payload }) => {
                          const analyst = tasksByAnalyst.find(a => a.analyst_name === payload.value);
                          const colaborador = analysts.find(a => a.id === analyst?.analyst_id);
                          const analystIndex = tasksByAnalyst.findIndex(a => a.analyst_name === payload.value);
                          const analystColor = COLORS[analystIndex % COLORS.length];

                          const maxLength = 12;
                          const name = payload.value || "";
                          const truncatedName = name.length > maxLength
                            ? name.substring(0, maxLength) + "..."
                            : name;

                          return (
                            <g transform={`translate(${x},${y})`}>
                              {/* Avatar */}
                              <foreignObject x={-16} y={0} width={32} height={32}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: (colaborador as any)?.foto_perfil_url ? 'transparent' : analystColor,
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  border: '2px solid white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  {(colaborador as any)?.foto_perfil_url ? (
                                    <img
                                      src={(colaborador as any).foto_perfil_url}
                                      alt={name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <span>{name?.charAt(0)?.toUpperCase() || "?"}</span>
                                  )}
                                </div>
                              </foreignObject>
                              {/* Nome */}
                              <text
                                x={0}
                                y={45}
                                fill="#475569"
                                fontSize={11}
                                fontWeight={500}
                                textAnchor="middle"
                              >
                                {truncatedName}
                              </text>
                            </g>
                          );
                        }}
                      />
                      <YAxis tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const analystIndex = tasksByAnalyst.findIndex(a => a.analyst_id === data.analyst_id);
                            const analystColor = COLORS[analystIndex % COLORS.length];

                            // Buscar colaborador para pegar foto usando analysts state
                            const colaborador = analysts.find(a => a.id === data.analyst_id);

                            return (
                              <Box
                                sx={{
                                  backgroundColor: "white",
                                  borderRadius: "12px",
                                  border: "1px solid #e2e8f0",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  p: 2,
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                                  <Avatar
                                    src={(colaborador as any)?.foto_perfil_url || ""}
                                    alt={data.analyst_name}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: (colaborador as any)?.foto_perfil_url ? "transparent" : analystColor,
                                      color: "white",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {!(colaborador as any)?.foto_perfil_url && (data.analyst_name?.charAt(0)?.toUpperCase() || "?")}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight={600}>
                                    {data.analyst_name || "Colaborador"}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: analystColor }} />
                                    <Typography variant="body2" fontSize="0.85rem">
                                      Finalizadas: {data.completed}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: analystColor, opacity: 0.6 }} />
                                    <Typography variant="body2" fontSize="0.85rem">
                                      Em Andamento: {data.in_progress}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, pt: 0.5, borderTop: "1px solid #e2e8f0" }}>
                                    <Typography variant="body2" fontSize="0.85rem" fontWeight={600}>
                                      Total: {data.total}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="total" radius={[8, 8, 0, 0]} name="Total de Tasks">
                        {tasksByAnalyst.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorAnalyst${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Tempo Médio por Status de Cada Analista */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: "1.25rem", color: "text.primary", fontWeight: 600, mb: 3 }}
              >
                ⏱️ Tempo Médio por Status - Performance dos Analistas
              </Typography>

              {analystTimeByStatus.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">Nenhum dado disponível</Typography>
                </Box>
              ) : (
                <Box>
                  {/* Gráfico de Barras Horizontais Empilhadas */}
                  <Box sx={{ width: "100%", height: 400, mb: 4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analystTimeByStatus}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} label={{ value: 'Dias', position: 'insideBottom', offset: -5 }} />
                        <YAxis
                          type="category"
                          dataKey="analyst_name"
                          width={150}
                          tick={({ x, y, payload }) => {
                            const analyst = analystTimeByStatus.find(a => a.analyst_name === payload.value);
                            return (
                              <g transform={`translate(${x},${y})`}>
                                <foreignObject x={-140} y={-20} width={130} height={40}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    height: '100%'
                                  }}>
                                    <div style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      overflow: 'hidden',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: analyst?.foto_perfil_url ? 'transparent' : '#8270FF',
                                      color: 'white',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      flexShrink: 0
                                    }}>
                                      {analyst?.foto_perfil_url ? (
                                        <img
                                          src={analyst.foto_perfil_url}
                                          alt={payload.value}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <span>{payload.value?.charAt(0)?.toUpperCase() || "?"}</span>
                                      )}
                                    </div>
                                    <div style={{
                                      fontSize: '11px',
                                      fontWeight: 500,
                                      color: '#475569',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {payload.value}
                                    </div>
                                  </div>
                                </foreignObject>
                              </g>
                            );
                          }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const analyst = payload[0].payload as any;
                              return (
                                <Box
                                  sx={{
                                    bgcolor: "white",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    p: 2,
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, pb: 1.5, borderBottom: "1px solid #e2e8f0" }}>
                                    <Avatar
                                      src={analyst.foto_perfil_url || ""}
                                      alt={analyst.analyst_name}
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: analyst.foto_perfil_url ? "transparent" : "#8270FF",
                                        color: "white",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {!analyst.foto_perfil_url && analyst.analyst_name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {analyst.analyst_name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {analyst.total_tasks} tasks • {analyst.avg_total_time_days.toFixed(1)} dias total
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Stack spacing={1}>
                                    {analyst.status_metrics.map((metric: any, idx: number) => (
                                      <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: COLORS[idx % COLORS.length] }} />
                                          <Typography variant="body2" fontSize="0.8rem">
                                            {metric.status_name}
                                          </Typography>
                                        </Box>
                                        <Typography variant="body2" fontSize="0.8rem" fontWeight={600}>
                                          {metric.avg_time_days.toFixed(1)}d
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                </Box>
                              );
                            }
                            return null;
                          }}
                        />
                        {/* Barras empilhadas para cada status */}
                        {analystTimeByStatus.length > 0 &&
                          analystTimeByStatus[0].status_metrics.map((_, statusIdx) => {
                            const statusName = analystTimeByStatus[0].status_metrics[statusIdx]?.status_name;
                            return (
                              <Bar
                                key={statusIdx}
                                dataKey={(data: any) => {
                                  const metric = data.status_metrics.find((m: any) => m.status_name === statusName);
                                  return metric ? metric.avg_time_days : 0;
                                }}
                                stackId="a"
                                fill={COLORS[statusIdx % COLORS.length]}
                                name={statusName}
                                radius={statusIdx === 0 ? [8, 0, 0, 8] : statusIdx === analystTimeByStatus[0].status_metrics.length - 1 ? [0, 8, 8, 0] : [0, 0, 0, 0]}
                              />
                            );
                          })
                        }
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          formatter={(value) => <span style={{ fontSize: "12px", color: "#475569" }}>{value}</span>}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Cards de Detalhes */}
                  <Grid container spacing={2}>
                    {analystTimeByStatus.map((analyst) => (
                      <Grid item xs={12} md={6} lg={4} key={analyst.analyst_id}>
                        <Card
                          elevation={0}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: "12px",
                            transition: "all 0.3s",
                            "&:hover": {
                              borderColor: "#8270FF",
                              boxShadow: "0 4px 12px rgba(130, 112, 255, 0.15)",
                            },
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                              <Avatar
                                src={analyst.foto_perfil_url || ""}
                                alt={analyst.analyst_name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: analyst.foto_perfil_url ? "transparent" : "#8270FF",
                                  color: "white",
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                }}
                              >
                                {!analyst.foto_perfil_url && analyst.analyst_name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" fontWeight={600} noWrap>
                                  {analyst.analyst_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {analyst.total_tasks} tasks
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{
                              bgcolor: alpha("#8270FF", 0.08),
                              borderRadius: "8px",
                              p: 1.5,
                              mb: 2,
                              textAlign: "center"
                            }}>
                              <Typography variant="h5" fontWeight={700} color="#8270FF">
                                {analyst.avg_total_time_days.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                dias em média
                              </Typography>
                            </Box>

                            <Stack spacing={1}>
                              {analyst.status_metrics.slice(0, 3).map((metric, idx) => (
                                <Box key={idx}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                    <Typography variant="caption" fontSize="0.75rem">
                                      {metric.status_name}
                                    </Typography>
                                    <Typography variant="caption" fontSize="0.75rem" fontWeight={600}>
                                      {metric.avg_time_days.toFixed(1)}d
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      height: 4,
                                      borderRadius: "2px",
                                      bgcolor: alpha(COLORS[idx % COLORS.length], 0.2),
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        height: "100%",
                                        width: `${(metric.avg_time_days / analyst.avg_total_time_days) * 100}%`,
                                        bgcolor: COLORS[idx % COLORS.length],
                                        borderRadius: "2px",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>

            {/* Gráfico - Distribuição por Status */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "white",
              }}
            >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={3}
                  sx={{ fontSize: "1.25rem", color: "text.primary" }}
                >
                  Distribuição por Status
                </Typography>
                <Box sx={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <Pie
                        data={tasksByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={140}
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {tasksByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          backgroundColor: "white",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 14, paddingTop: 10, fontWeight: 500 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Gráfico - Timeline */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "white",
              }}
            >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={3}
                  sx={{ fontSize: "1.25rem", color: "text.primary" }}
                >
                  Timeline de Criação de Tasks
                </Typography>
                <Box sx={{ width: "100%", height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeline} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="lineCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8270FF" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#8270FF" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="lineCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }} />
                      <YAxis tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          backgroundColor: "white",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 14, paddingTop: 10, fontWeight: 500 }} />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#8270FF"
                        strokeWidth={3}
                        name="Criadas"
                        dot={{ fill: "#8270FF", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Finalizadas"
                        dot={{ fill: "#10b981", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Métricas de Produtividade */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "white",
              }}
            >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={4}
                  sx={{ fontSize: "1.125rem", color: "text.primary" }}
                >
                  Métricas de Produtividade
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        borderRadius: 2.5,
                        background: alpha("#8270FF", 0.05),
                        border: `1px solid ${alpha("#8270FF", 0.1)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 16px ${alpha("#8270FF", 0.15)}`,
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          color: "#8270FF",
                          mb: 1,
                          fontSize: "2.25rem",
                        }}
                      >
                        {insightsData?.avg_time_to_complete || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Tempo Médio de Conclusão
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (dias)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        borderRadius: 2.5,
                        background: alpha("#10b981", 0.05),
                        border: `1px solid ${alpha("#10b981", 0.1)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 16px ${alpha("#10b981", 0.15)}`,
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          color: "#10b981",
                          mb: 1,
                          fontSize: "2.25rem",
                        }}
                      >
                        {insightsData?.avg_tasks_per_analyst || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Média de Tasks
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        por Analista
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        borderRadius: 2.5,
                        background: alpha("#f59e0b", 0.05),
                        border: `1px solid ${alpha("#f59e0b", 0.1)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 16px ${alpha("#f59e0b", 0.15)}`,
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          color: "#f59e0b",
                          mb: 1,
                          fontSize: "2.25rem",
                        }}
                      >
                        {insightsData?.tasks_created_this_week || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Tasks Criadas
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Esta Semana
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        borderRadius: 2.5,
                        background: alpha("#06b6d4", 0.05),
                        border: `1px solid ${alpha("#06b6d4", 0.1)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 16px ${alpha("#06b6d4", 0.15)}`,
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          color: "#06b6d4",
                          mb: 1,
                          fontSize: "2.25rem",
                        }}
                      >
                        {insightsData?.tasks_completed_this_week || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Tasks Finalizadas
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Esta Semana
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}
