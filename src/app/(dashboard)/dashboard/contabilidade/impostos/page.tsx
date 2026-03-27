"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Card,
  Snackbar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Stack,
  alpha,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  CloudDownload as CloudDownloadIcon,
  Assessment as AssessmentIcon,
  Paid as PaidIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import impostoService from "@/app/services/impostoService";
import type { Imposto } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import { PageHeader, FilterSearch, TableActionButtons, TableAction, AccessDenied, DeleteDialog } from "@/app/shared/components";
import { useAuth } from "@/app/hooks/useAuth";

// Componente KPI Card reutilizável
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

export default function ImpostosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [impostos, setImpostos] = useState<Imposto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mesReferencia, setMesReferencia] = useState(getCurrentMonth());

  const isColaborador = user?.userType === "colaborador";

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Download
  const [downloadingImpostoId, setDownloadingImpostoId] = useState<string | null>(null);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [impostoToDelete, setImpostoToDelete] = useState<Imposto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadImpostos();
  }, [mesReferencia]);

  function getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  const loadImpostos = async () => {
    try {
      setLoading(true);
      const response = await impostoService.list(mesReferencia);
      setImpostos(response.impostos || []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao carregar impostos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAnexos = async (imposto: Imposto) => {
    if (!imposto.anexos || imposto.anexos.length === 0) {
      setSnackbarMessage("Nenhum anexo disponível para download");
      setSnackbarOpen(true);
      return;
    }

    try {
      setDownloadingImpostoId(imposto.imposto_id);

      // Se houver apenas 1 anexo, fazer download direto
      if (imposto.anexos.length === 1) {
        const anexo = imposto.anexos[0];
        const response = await impostoService.getAnexoDownloadUrl(
          imposto.imposto_id,
          imposto.empresa_id,
          anexo.s3_key
        );
        window.open(response.download_url, "_blank");
        setSnackbarMessage("Download iniciado!");
        setSnackbarOpen(true);
      } else {
        // Múltiplos anexos: criar ZIP
        setSnackbarMessage(`Preparando download de ${imposto.anexos.length} arquivo(s)...`);
        setSnackbarOpen(true);

        const zip = new JSZip();

        for (const anexo of imposto.anexos) {
          try {
            const response = await impostoService.getAnexoDownloadUrl(
              imposto.imposto_id,
              imposto.empresa_id,
              anexo.s3_key
            );

            // Buscar o arquivo
            const fileResponse = await fetch(response.download_url);
            const blob = await fileResponse.blob();

            // Adicionar ao ZIP com nome que inclui tipo de imposto
            const tipoLabel = getTipoImpostoLabel(anexo.tipo_imposto || "OUTROS");
            const fileName = `${tipoLabel}_${anexo.nome_arquivo}`;
            zip.file(fileName, blob);
          } catch (err) {
            console.error("Erro ao baixar anexo:", anexo.nome_arquivo, err);
            // Continuar com os outros arquivos
          }
        }

        // Gerar ZIP e fazer download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `impostos_${imposto.mes_referencia}_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSnackbarMessage("Download concluído!");
        setSnackbarOpen(true);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(
        error.response?.data?.message || "Erro ao fazer download dos anexos"
      );
      setSnackbarOpen(true);
    } finally {
      setDownloadingImpostoId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMesReferencia = (mesRef: string): string => {
    const [year, month] = mesRef.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const getTipoImpostoLabel = (tipo: string): string => {
    const tipoObj = TIPOS_IMPOSTO.find((t) => t.value === tipo);
    return tipoObj?.label || tipo;
  };

  const getColorForTipo = (tipo: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      IRPJ: "primary",
      CSLL: "secondary",
      PIS: "info",
      COFINS: "info",
      ISS: "success",
      ICMS: "warning",
      IPI: "warning",
      INSS: "error",
      FGTS: "error",
      SIMPLES_NACIONAL: "success",
      HONORARIOS_CONTABEIS: "primary",
      OUTROS: "default",
    };
    return colorMap[tipo] || "default";
  };

  const filteredImpostos = impostos.filter(
    (imposto) =>
      imposto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imposto.tipo_imposto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (imposto: Imposto) => {
    setImpostoToDelete(imposto);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!impostoToDelete) return;

    try {
      setDeleting(true);
      await impostoService.delete(impostoToDelete.imposto_id, impostoToDelete.empresa_id);

      // Remove da lista local
      setImpostos(impostos.filter(i => i.imposto_id !== impostoToDelete.imposto_id));

      setDeleteDialogOpen(false);
      setImpostoToDelete(null);
      setSnackbarMessage("Imposto excluído com sucesso");
      setSnackbarOpen(true);
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || error.message || "Erro ao excluir imposto");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setImpostoToDelete(null);
    setDeleteError(null);
  };

  const getTableActions = (imposto: Imposto): TableAction[] => {
    const actions: TableAction[] = [
      {
        type: "view",
        onClick: () => router.push(`/dashboard/contabilidade/impostos/${imposto.imposto_id}?empresa_id=${imposto.empresa_id}`),
        tooltip: "Ver detalhes",
      },
    ];

    // Adicionar download se houver anexos
    if (imposto.anexos && imposto.anexos.length > 0) {
      actions.push({
        type: "download",
        onClick: () => handleDownloadAnexos(imposto),
        tooltip: "Baixar anexos",
      });
    }

    // Adicionar ação de exclusão
    actions.push({
      type: "delete",
      onClick: () => handleDeleteClick(imposto),
      tooltip: "Excluir imposto",
    });

    return actions;
  };

  // Gerar lista de meses para o select (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      options.push({ value, label });
    }
    return options;
  };

  // Calcular métricas (KPIs)
  const totalImpostos = filteredImpostos.length;
  const valorTotal = filteredImpostos.reduce((sum, i) => sum + i.valor, 0);
  const totalAnexos = filteredImpostos.reduce((sum, i) => sum + (i.anexos?.length || 0), 0);
  const tiposUnicos = new Set(filteredImpostos.map(i => i.tipo_imposto)).size;

  // Bloquear acesso para colaboradores
  if (isColaborador) {
    return <AccessDenied />;
  }

  return (
    <Box>
      {/* Header Moderno */}
      <Box sx={{ mb: 4 }}>
        <PageHeader
          title="Lançamento de Impostos"
          description="Gerencie os impostos cadastrados por empresa e período"
          actionButton={{
            label: "Cadastrar Imposto",
            icon: <AddIcon />,
            onClick: () => router.push("/dashboard/contabilidade/impostos/novo"),
            visible: true,
          }}
        />
      </Box>

      {/* KPI Cards - Estilo Xero/QuickBooks */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total de Impostos"
            value={totalImpostos}
            subtitle={`Período: ${formatMesReferencia(mesReferencia)}`}
            icon={AssessmentIcon}
            color="#8270FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Valor Total"
            value={formatCurrency(valorTotal)}
            subtitle="Somatório do período"
            icon={PaidIcon}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Tipos Cadastrados"
            value={tiposUnicos}
            subtitle="Categorias diferentes"
            icon={CalendarIcon}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Anexos"
            value={totalAnexos}
            subtitle="Documentos disponíveis"
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
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Mês de Referência</InputLabel>
              <Select
                value={mesReferencia}
                label="Mês de Referência"
                onChange={(e) => setMesReferencia(e.target.value)}
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.12)",
                  },
                }}
              >
                {generateMonthOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1 }}>
              <FilterSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Pesquisar por descrição ou tipo de imposto..."
              />
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Table Modernizada */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha("#8270FF", 0.04),
                  "& th": {
                    borderBottom: `2px solid ${alpha("#8270FF", 0.1)}`,
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Tipo de Imposto</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Mês Referência</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Anexos</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Data Cadastro</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: "#8270FF" }} />
                  </TableCell>
                </TableRow>
              ) : filteredImpostos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <AssessmentIcon
                        sx={{
                          fontSize: 80,
                          color: alpha("#8270FF", 0.2),
                          mb: 2,
                        }}
                      />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Nenhum imposto encontrado
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Comece cadastrando seu primeiro imposto
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push("/dashboard/contabilidade/impostos/novo")}
                        sx={{
                          bgcolor: "#8270FF",
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 3,
                          "&:hover": {
                            bgcolor: "#6C5CE7",
                          },
                        }}
                      >
                        Cadastrar Primeiro Imposto
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredImpostos.map((imposto) => (
                  <TableRow
                    key={imposto.imposto_id}
                    onClick={() => router.push(`/dashboard/contabilidade/impostos/${imposto.imposto_id}?empresa_id=${imposto.empresa_id}`)}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha("#8270FF", 0.04),
                        cursor: "pointer",
                      },
                      transition: "all 0.2s",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {imposto.descricao}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTipoImpostoLabel(imposto.tipo_imposto)}
                        color={getColorForTipo(imposto.tipo_imposto)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatMesReferencia(imposto.mes_referencia)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#10b981">
                        {formatCurrency(imposto.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {imposto.anexos && imposto.anexos.length > 0 ? (
                        <Chip
                          icon={downloadingImpostoId === imposto.imposto_id ? <CircularProgress size={14} sx={{ color: "#8270FF" }} /> : <CloudDownloadIcon />}
                          label={`${imposto.anexos.length} arquivo(s)`}
                          size="small"
                          variant="outlined"
                          onClick={() => handleDownloadAnexos(imposto)}
                          disabled={downloadingImpostoId === imposto.imposto_id}
                          sx={{
                            cursor: "pointer",
                            borderColor: alpha("#8270FF", 0.3),
                            color: "#8270FF",
                            fontWeight: 600,
                            borderRadius: 1.5,
                            "&:hover": {
                              bgcolor: alpha("#8270FF", 0.08),
                              borderColor: "#8270FF",
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(imposto.data_cadastro)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <TableActionButtons actions={getTableActions(imposto)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        itemName={impostoToDelete?.descricao || ""}
        itemType="o imposto"
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
