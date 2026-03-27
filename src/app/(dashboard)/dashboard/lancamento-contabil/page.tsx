"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Snackbar,
  Alert,
  Button,
  Typography,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import JSZip from "jszip";
import { PageHeader, DeleteDialog } from "@/app/shared/components";
import { Add as AddIcon } from "@mui/icons-material";
import lancamentoContabilService from "@/app/services/lancamentoContabilService";
import type { LancamentoContabil } from "@/app/types/lancamentoContabil";
import FiltroMesAno from "./components/FiltroMesAno";
import TabelaLancamentos from "./components/TabelaLancamentos";
import UploadNotaModal from "./components/UploadNotaModal";
import CreateLancamentoModal from "./components/CreateLancamentoModal";
import { useAuth } from "@/app/hooks/useAuth";

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

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Lançamento Contábil"
        description="Gerencie as notas fiscais dos clientes por mês/ano"
        actionButton={{
          label: "Novo Lançamento",
          icon: <AddIcon />,
          onClick: () => setCreateModalOpen(true),
          visible: !isContabilUser, // Ocultar botão para usuário contábil
        }}
      />

      {/* Filtro de Mês/Ano */}
      <FiltroMesAno
        mesReferencia={mesReferencia}
        onMesReferenciaChange={setMesReferencia}
      />

      {/* Botão de Download em Lote */}
      {selectedIds.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={
              downloadingBatch ? <CloudDownloadIcon /> : <DownloadIcon />
            }
            onClick={handleBatchDownload}
            disabled={downloadingBatch}
          >
            {downloadingBatch
              ? "Baixando..."
              : `Baixar ${selectedIds.length} Selecionada(s)`}
          </Button>
        </Box>
      )}

      {/* Tabela */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <TabelaLancamentos
          lancamentos={lancamentos}
          loading={loading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onUploadClick={handleUploadClick}
          onDownloadClick={handleDownloadClick}
          onDeleteClick={isContabilUser ? undefined : handleDeleteClick} // Remover delete para contábil
          onValorChange={isContabilUser ? undefined : handleValorChange} // Remover edição de valor para contábil
          readOnly={isContabilUser} // Passar flag de somente leitura
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
