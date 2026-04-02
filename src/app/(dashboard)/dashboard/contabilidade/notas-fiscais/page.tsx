"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Avatar,
  Checkbox,
  IconButton,
  Tooltip,
  Grid,
  Stack,
  alpha,
  Paper,
} from "@mui/material";
import {
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalComColaborador, StatusNotaFiscal } from "@/app/types/fiscal";
import { useAuth } from "@/app/hooks/useAuth";
import { PageHeader, FilterSearch, AccessDenied } from "@/app/shared/components";
import { useTablePagination } from "@/app/shared/hooks";

const statusLabels: Record<StatusNotaFiscal, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  PAGA: "Paga",
};

const statusColors: Record<StatusNotaFiscal, "default" | "warning" | "success" | "error"> = {
  PENDENTE: "warning",
  APROVADA: "success",
  REPROVADA: "error",
  PAGA: "default",
};

// Componente KPI Card
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "#8270FF",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
}) {
  return (
    <Card
      sx={{
        p: 2.5,
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
      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: "2rem",
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

export default function NotasFiscaisPage() {
  const { user } = useAuth();

  // Obter mês/ano inicial - carrega mês anterior se estiver nos primeiros 7 dias
  const getCurrentMonthYear = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    // Se está nos primeiros 7 dias do mês, carrega o mês anterior
    if (dayOfMonth <= 7) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
    }

    // Caso contrário, carrega o mês atual
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Estados
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalComColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMesAno, setFilterMesAno] = useState(getCurrentMonthYear());
  const [selectedNotas, setSelectedNotas] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Hook customizado de paginação
  const [pagination, paginationHandlers] = useTablePagination(50);
  const { page, rowsPerPage, totalItems } = pagination;
  const { handleChangePage, handleChangeRowsPerPage, setTotalItems } = paginationHandlers;

  const isAdmin = user?.userType === "admin";

  const loadNotasFiscais = async () => {
    setLoading(true);
    try {
      const filters: any = { page: page + 1, limit: rowsPerPage };
      if (filterMesAno) filters.mes_referencia = filterMesAno;

      const response = await fiscalService.listAllNotasFiscais(filters);
      setNotasFiscais(response.notas_fiscais || []);
      setTotalItems(response.pagination.total_items);
    } catch (error) {
    // console.error("Erro ao carregar notas fiscais:", error);
      setSnackbarMessage("Erro ao carregar notas fiscais");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadNotasFiscais();
    }
  }, [page, rowsPerPage, filterMesAno, isAdmin]);

  // Handlers de seleção
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(filteredNotasFiscais.map((n) => n.nota_fiscal_id));
      setSelectedNotas(newSelected);
    } else {
      setSelectedNotas(new Set());
    }
  };

  const handleSelectNota = (notaId: string) => {
    const newSelected = new Set(selectedNotas);
    if (newSelected.has(notaId)) {
      newSelected.delete(notaId);
    } else {
      newSelected.add(notaId);
    }
    setSelectedNotas(newSelected);
  };

  // Handler de download individual
  const handleDownloadNota = async (notaId: string, nomeArquivo: string) => {
    try {
      setDownloading(true);
      const blob = await fiscalService.downloadNotaFiscal(notaId);

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbarMessage("Download realizado com sucesso");
      setSnackbarOpen(true);
    } catch (error) {
    // console.error("Erro ao baixar nota fiscal:", error);
      setSnackbarMessage("Erro ao baixar nota fiscal");
      setSnackbarOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  // Handler de download múltiplo
  const handleDownloadSelected = async () => {
    if (selectedNotas.size === 0) {
      setSnackbarMessage("Selecione pelo menos uma nota fiscal");
      setSnackbarOpen(true);
      return;
    }

    try {
      setDownloading(true);

      for (const notaId of Array.from(selectedNotas)) {
        const nota = notasFiscais.find((n) => n.nota_fiscal_id === notaId);
        if (nota) {
          const blob = await fiscalService.downloadNotaFiscal(notaId);

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = nota.arquivo_nome;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Pequeno delay entre downloads
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      setSnackbarMessage(`${selectedNotas.size} nota(s) fiscal(is) baixada(s) com sucesso`);
      setSnackbarOpen(true);
      setSelectedNotas(new Set());
    } catch (error) {
    // console.error("Erro ao baixar notas fiscais:", error);
      setSnackbarMessage("Erro ao baixar algumas notas fiscais");
      setSnackbarOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return "-";
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatMesReferencia = (mesRef: string) => {
    const [ano, mes] = mesRef.split("-");
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const filteredNotasFiscais = notasFiscais.filter((nota) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      nota.colaborador_nome.toLowerCase().includes(searchLower) ||
      nota.nome_cliente.toLowerCase().includes(searchLower) ||
      (nota.empresa_nome && nota.empresa_nome.toLowerCase().includes(searchLower)) ||
      (nota.empresa_cnpj && nota.empresa_cnpj.toLowerCase().includes(searchLower)) ||
      nota.arquivo_nome.toLowerCase().includes(searchLower)
    );
  });

  // Calcular métricas
  const totalNotas = filteredNotasFiscais.length;
  const notasAprovadas = filteredNotasFiscais.filter(n => n.status === "APROVADA").length;
  const notasPendentes = filteredNotasFiscais.filter(n => n.status === "PENDENTE").length;
  const totalSize = filteredNotasFiscais.reduce((sum, n) => sum + n.arquivo_tamanho, 0);

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <Box>
      {/* Header Moderno */}
      <Box sx={{ mb: 4 }}>
        <PageHeader
          title="Notas Fiscais"
          subtitle="Visualize e gerencie todas as notas fiscais dos colaboradores"
          icon={<ReceiptIcon />}
        />
      </Box>

      {/* KPI Cards - Estilo Xero/QuickBooks */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total de Notas"
            value={totalNotas}
            subtitle={`Período: ${formatMesReferencia(filterMesAno)}`}
            icon={ReceiptIcon}
            color="#8270FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Aprovadas"
            value={notasAprovadas}
            subtitle={`${totalNotas > 0 ? Math.round((notasAprovadas / totalNotas) * 100) : 0}% do total`}
            icon={CheckCircleIcon}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pendentes"
            value={notasPendentes}
            subtitle={notasPendentes > 0 ? "Aguardando aprovação" : "Tudo em dia!"}
            icon={ScheduleIcon}
            color={notasPendentes > 0 ? "#f59e0b" : "#10b981"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Armazenamento"
            value={formatFileSize(totalSize)}
            subtitle="Espaço utilizado"
            icon={DescriptionIcon}
            color="#8270FF"
          />
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <FilterSearch
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por colaborador, cliente, empresa..."
              />
            </Box>

            <TextField
              type="month"
              label="Mês/Ano"
              value={filterMesAno}
              onChange={(e) => setFilterMesAno(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            {selectedNotas.size > 0 && (
              <Button
                variant="contained"
                startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <GetAppIcon />}
                onClick={handleDownloadSelected}
                disabled={downloading}
                sx={{
                  bgcolor: "#8270FF",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "#6C5CE7",
                  },
                }}
              >
                Baixar ({selectedNotas.size})
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Tabela Modernizada */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
              <CircularProgress sx={{ color: "#8270FF" }} />
            </Box>
          ) : filteredNotasFiscais.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <ReceiptIcon
                sx={{
                  fontSize: 80,
                  color: alpha("#8270FF", 0.2),
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma nota fiscal encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajuste os filtros ou período para visualizar mais resultados
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: alpha("#8270FF", 0.04),
                        "& th": {
                          borderBottom: `2px solid ${alpha("#8270FF", 0.1)}`,
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedNotas.size > 0 &&
                            selectedNotas.size < filteredNotasFiscais.length
                          }
                          checked={
                            filteredNotasFiscais.length > 0 &&
                            selectedNotas.size === filteredNotasFiscais.length
                          }
                          onChange={handleSelectAll}
                          sx={{
                            color: alpha("#8270FF", 0.3),
                            "&.Mui-checked": {
                              color: "#8270FF",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>Colaborador</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Mês Ref.</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data Envio</TableCell>
                      <TableCell>Tamanho</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredNotasFiscais.map((nota) => (
                      <TableRow
                        key={nota.nota_fiscal_id}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor: alpha("#8270FF", 0.04),
                          },
                          transition: "all 0.2s",
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedNotas.has(nota.nota_fiscal_id)}
                            onChange={() => handleSelectNota(nota.nota_fiscal_id)}
                            sx={{
                              color: alpha("#8270FF", 0.3),
                              "&.Mui-checked": {
                                color: "#8270FF",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              src={nota.colaborador_foto_perfil_url}
                              alt={nota.colaborador_nome}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "#8270FF",
                              }}
                            >
                              {nota.colaborador_nome.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {nota.colaborador_nome}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{nota.nome_cliente}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{nota.empresa_nome || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                            {formatCNPJ(nota.empresa_cnpj || "")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatMesReferencia(nota.mes_referencia)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabels[nota.status]}
                            color={statusColors[nota.status]}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(nota.data_envio)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(nota.arquivo_tamanho)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Baixar nota fiscal">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDownloadNota(nota.nota_fiscal_id, nota.arquivo_nome)
                              }
                              disabled={downloading}
                              sx={{
                                color: "#8270FF",
                                bgcolor: alpha("#8270FF", 0.08),
                                "&:hover": {
                                  bgcolor: alpha("#8270FF", 0.16),
                                },
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
                sx={{
                  borderTop: `1px solid ${alpha("#000", 0.05)}`,
                  "& .MuiTablePagination-select": {
                    borderRadius: 1.5,
                  },
                  "& .MuiTablePagination-actions button": {
                    color: "#8270FF",
                  },
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
