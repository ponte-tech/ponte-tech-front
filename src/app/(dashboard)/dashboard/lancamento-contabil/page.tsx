"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Snackbar,
  Alert,
  Button,
  Typography,
  Grid,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import JSZip from "jszip";
import { PageHeader, DeleteDialog } from "@/app/shared/components";
import { Add as AddIcon } from "@mui/icons-material";
import lancamentoContabilService from "@/app/services/lancamentoContabilService";
import empresaService from "@/app/services/empresaService";
import type { LancamentoContabil } from "@/app/types/lancamentoContabil";
import type { Empresa } from "@/app/types/empresa";
import FiltroLancamentos from "./components/FiltroLancamentos";
import TabelaLancamentos from "./components/TabelaLancamentos";
import UploadNotaModal from "./components/UploadNotaModal";
import CreateLancamentoModal from "./components/CreateLancamentoModal";
import { useAuth } from "@/app/hooks/useAuth";

// Componente de KPI Card moderno
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "#8270FF",
  trend
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
  trend?: { value: string; positive: boolean };
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
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Chip
            label={trend.value}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: trend.positive ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1),
              color: trend.positive ? "#10b981" : "#ef4444",
              border: "none",
              "& .MuiChip-label": { px: 1 },
            }}
          />
        )}
      </Stack>
    </Card>
  );
}

export default function LancamentoContabilPage() {
  const { user } = useAuth();

  // Verificar se é o usuário contábil (somente leitura)
  const isContabilUser = user?.email === "contabil@pontetech.com";
  // Estado principal
  const [lancamentos, setLancamentos] = useState<LancamentoContabil[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtro de mês/ano
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const [mesReferencia, setMesReferencia] = useState(currentMonth);

  // Filtro de empresa
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>("");

  // Seleção múltipla
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal de upload
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [lancamentoParaUpload, setLancamentoParaUpload] =
    useState<LancamentoContabil | null>(null);

  // Modal de criação
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Modal de delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lancamentoParaDelete, setLancamentoParaDelete] =
    useState<LancamentoContabil | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Download em lote
  const [downloadingBatch, setDownloadingBatch] = useState(false);

  // Carregar empresas ao montar o componente
  useEffect(() => {
    loadEmpresas();
  }, []);

  // Carregar lançamentos ao mudar o mês
  useEffect(() => {
    loadLancamentos();
  }, [mesReferencia]);

  const loadLancamentos = async () => {
    try {
      setLoading(true);
      const response = await lancamentoContabilService.list({
        mes_referencia: mesReferencia,
      });

      setLancamentos(response.lancamentos || []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      showSnackbar(
        error.response?.data?.message || "Erro ao carregar lançamentos",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await empresaService.list();
      setEmpresas(response.empresas || []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      showSnackbar(
        error.response?.data?.message || "Erro ao carregar empresas",
        "error"
      );
    }
  };

  const handleUploadClick = (lancamento: LancamentoContabil) => {
    setLancamentoParaUpload(lancamento);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    showSnackbar("Nota fiscal enviada com sucesso!", "success");
    loadLancamentos(); // Recarregar lista
    setSelectedIds([]); // Limpar seleção
  };

  const handleCreateSuccess = () => {
    showSnackbar("Lançamento criado com sucesso!", "success");
    loadLancamentos(); // Recarregar lista
  };

  const handleDeleteClick = (lancamento: LancamentoContabil) => {
    setLancamentoParaDelete(lancamento);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!lancamentoParaDelete) return;

    try {
      setDeleting(true);
      await lancamentoContabilService.delete(lancamentoParaDelete.lancamento_id);
      showSnackbar("Lançamento deletado com sucesso!", "success");
      setDeleteDialogOpen(false);
      setLancamentoParaDelete(null);
      loadLancamentos(); // Recarregar lista
      setSelectedIds([]); // Limpar seleção
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setDeleteError(
        error.response?.data?.message || "Erro ao deletar lançamento"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLancamentoParaDelete(null);
    setDeleteError(null);
  };

  const handleDownloadClick = async (lancamento: LancamentoContabil) => {
    if (!lancamento.nota_fiscal_id) {
      showSnackbar("Nota fiscal não encontrada", "error");
      return;
    }

    try {
      const response = await lancamentoContabilService.getDownloadUrl(
        lancamento.lancamento_id
      );

      // Abrir em nova aba
      window.open(response.download_url, "_blank");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      showSnackbar(
        error.response?.data?.message || "Erro ao fazer download",
        "error"
      );
    }
  };

  const handleBatchDownload = async () => {
    if (selectedIds.length === 0) {
      showSnackbar("Selecione ao menos um lançamento", "info");
      return;
    }

    try {
      setDownloadingBatch(true);
      showSnackbar(
        `Baixando ${selectedIds.length} nota(s) fiscal(is)...`,
        "info"
      );

      const zip = new JSZip();
      const selectedLancamentos = lancamentos.filter((l) =>
        selectedIds.includes(l.lancamento_id)
      );

      // Filtrar apenas lançamentos que têm nota fiscal
      const lancamentosComNota = selectedLancamentos.filter(
        (l) => l.nota_fiscal_id
      );

      if (lancamentosComNota.length === 0) {
        showSnackbar("Nenhuma nota fiscal disponível para download", "error");
        return;
      }

      // Baixar cada arquivo
      for (const lancamento of lancamentosComNota) {
        try {
          const response = await lancamentoContabilService.getDownloadUrl(
            lancamento.lancamento_id
          );

          // Buscar o arquivo
          const fileResponse = await fetch(response.download_url);
          const blob = await fileResponse.blob();

          // Adicionar ao ZIP com nome descritivo
          const fileName = `${lancamento.cliente_nome_fantasia}_${lancamento.mes_referencia}.pdf`;
          zip.file(fileName, blob);
        } catch (err) {
          // Ignorar erros individuais e continuar
        }
      }

      // Gerar ZIP e fazer download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `notas_fiscais_${mesReferencia}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSnackbar("Download em lote concluído!", "success");
      setSelectedIds([]); // Limpar seleção
    } catch (err) {
      showSnackbar("Erro ao fazer download em lote", "error");
    } finally {
      setDownloadingBatch(false);
    }
  };

  const handleValorChange = async (lancamentoId: string, valor: number) => {
    try {
      await lancamentoContabilService.updateValorNota(lancamentoId, {
        valor_nota_fiscal: valor,
      });

      // Atualizar na lista local
      setLancamentos(
        lancamentos.map((l) =>
          l.lancamento_id === lancamentoId
            ? { ...l, valor_nota_fiscal: valor }
            : l
        )
      );

      showSnackbar("Valor atualizado com sucesso!", "success");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      showSnackbar(
        error.response?.data?.message || "Erro ao atualizar valor",
        "error"
      );
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrar lançamentos por empresa selecionada
  const lancamentosFiltrados = empresaSelecionada
    ? lancamentos.filter((l) => l.empresa_razao_social === empresaSelecionada)
    : lancamentos;

  // Calcular métricas (KPIs)
  const totalLancamentos = lancamentosFiltrados.length;
  const lancamentosComNota = lancamentosFiltrados.filter(l => l.nota_fiscal_id).length;
  const lancamentosPendentes = lancamentosFiltrados.filter(l => !l.nota_fiscal_id).length;
  const valorTotal = lancamentosFiltrados.reduce((sum, l) => sum + (l.valor_nota_fiscal || 0), 0);

  return (
    <Box>
      {/* Header Moderno */}
      <Box sx={{ mb: 4 }}>
        <PageHeader
          title="Lançamento Contábil"
          description="Gerencie as notas fiscais dos clientes por mês/ano"
          actionButton={{
            label: "Novo Lançamento",
            icon: <AddIcon />,
            onClick: () => setCreateModalOpen(true),
            visible: !isContabilUser,
          }}
        />
      </Box>

      {/* KPI Cards - Estilo Xero/QuickBooks */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total de Lançamentos"
            value={totalLancamentos}
            subtitle={`Período: ${mesReferencia}`}
            icon={ReceiptIcon}
            color="#8270FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Com Nota Fiscal"
            value={lancamentosComNota}
            subtitle={`${totalLancamentos > 0 ? Math.round((lancamentosComNota / totalLancamentos) * 100) : 0}% do total`}
            icon={CheckCircleIcon}
            color="#10b981"
            trend={
              lancamentosComNota === totalLancamentos
                ? { value: "Completo", positive: true }
                : undefined
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pendentes"
            value={lancamentosPendentes}
            subtitle={lancamentosPendentes > 0 ? "Aguardando upload" : "Tudo em dia!"}
            icon={ScheduleIcon}
            color={lancamentosPendentes > 0 ? "#f59e0b" : "#10b981"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Valor Total"
            value={new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
            }).format(valorTotal)}
            subtitle="Somatório do período"
            icon={TrendingUpIcon}
            color="#8270FF"
          />
        </Grid>
      </Grid>

      {/* Filtros e Ações */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <FiltroLancamentos
              mesReferencia={mesReferencia}
              onMesReferenciaChange={setMesReferencia}
              empresaSelecionada={empresaSelecionada}
              onEmpresaChange={setEmpresaSelecionada}
              empresas={empresas.map(e => ({ nome: e.nome_fantasia }))}
            />

            {/* Botão de Download em Lote - Novo Design */}
            {selectedIds.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha("#8270FF", 0.05),
                  borderRadius: 2,
                  border: `1px dashed ${alpha("#8270FF", 0.3)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${selectedIds.length} selecionado(s)`}
                    size="small"
                    sx={{
                      bgcolor: "#8270FF",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Lançamentos prontos para download
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={
                    downloadingBatch ? <CloudDownloadIcon /> : <DownloadIcon />
                  }
                  onClick={handleBatchDownload}
                  disabled={downloadingBatch}
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
                  {downloadingBatch ? "Baixando..." : "Baixar Selecionadas"}
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
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
        <TabelaLancamentos
          lancamentos={lancamentosFiltrados}
          loading={loading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onUploadClick={handleUploadClick}
          onDownloadClick={handleDownloadClick}
          onDeleteClick={isContabilUser ? undefined : handleDeleteClick}
          onValorChange={isContabilUser ? undefined : handleValorChange}
          readOnly={isContabilUser}
        />
      </Card>

      {/* Modal de Criação */}
      <CreateLancamentoModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        defaultMesReferencia={mesReferencia}
      />

      {/* Modal de Upload */}
      <UploadNotaModal
        open={uploadModalOpen}
        lancamento={lancamentoParaUpload}
        onClose={() => {
          setUploadModalOpen(false);
          setLancamentoParaUpload(null);
        }}
        onSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        itemName={lancamentoParaDelete?.cliente_nome_fantasia || ""}
        itemType="o lançamento"
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
      />

      {/* Snackbar Modernizado */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
