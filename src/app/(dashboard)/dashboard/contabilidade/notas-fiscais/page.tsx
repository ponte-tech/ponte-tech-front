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
} from "@mui/material";
import {
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  Receipt as ReceiptIcon,
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

export default function NotasFiscaisPage() {
  const { user } = useAuth();

  // Obter mês/ano atual
  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
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
  const [pagination, paginationHandlers] = useTablePagination(10);
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
      console.error("Erro ao carregar notas fiscais:", error);
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
      console.error("Erro ao baixar nota fiscal:", error);
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
      console.error("Erro ao baixar notas fiscais:", error);
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

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Notas Fiscais"
        subtitle="Visualize e gerencie todas as notas fiscais dos colaboradores"
        icon={<ReceiptIcon />}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FilterSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por colaborador, cliente, empresa..."
              sx={{ flex: 1, minWidth: 300 }}
            />

            <TextField
              type="month"
              label="Mês/Ano"
              value={filterMesAno}
              onChange={(e) => setFilterMesAno(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            {selectedNotas.size > 0 && (
              <Button
                variant="contained"
                startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <GetAppIcon />}
                onClick={handleDownloadSelected}
                disabled={downloading}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6C5CE7" },
                }}
              >
                Baixar Selecionadas ({selectedNotas.size})
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotasFiscais.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma nota fiscal encontrada
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
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
                        />
                      </TableCell>
                      <TableCell>Colaborador</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Mês Referência</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data Envio</TableCell>
                      <TableCell>Tamanho</TableCell>
                      <TableCell align="center">Download</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredNotasFiscais.map((nota) => (
                      <TableRow key={nota.nota_fiscal_id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedNotas.has(nota.nota_fiscal_id)}
                            onChange={() => handleSelectNota(nota.nota_fiscal_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              src={nota.colaborador_foto_perfil_url}
                              alt={nota.colaborador_nome}
                              sx={{ width: 40, height: 40 }}
                            >
                              {nota.colaborador_nome.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {nota.colaborador_nome}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{nota.nome_cliente}</TableCell>
                        <TableCell>{nota.empresa_nome || "-"}</TableCell>
                        <TableCell>{formatCNPJ(nota.empresa_cnpj || "")}</TableCell>
                        <TableCell>{formatMesReferencia(nota.mes_referencia)}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabels[nota.status]}
                            color={statusColors[nota.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(nota.data_envio)}</TableCell>
                        <TableCell>{formatFileSize(nota.arquivo_tamanho)}</TableCell>
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
                                "&:hover": { bgcolor: "rgba(130, 112, 255, 0.1)" },
                              }}
                            >
                              <DownloadIcon />
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
      />
    </Box>
  );
}
