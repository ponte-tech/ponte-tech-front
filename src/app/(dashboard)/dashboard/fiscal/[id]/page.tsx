"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalResponse } from "@/app/types/api";
import { formatCurrency, formatDate, formatDateTime, formatMonthYear, formatFileSize } from "@/app/utils/format-utils";
import StatusChip from "../../components/StatusChip";
import FileUploadArea from "../../components/FileUploadArea";

export default function NotaFiscalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nota, setNota] = useState<NotaFiscalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadNota = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fiscalService.getNota(id);
      setNota(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar nota fiscal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNota();
  }, [loadNota]);

  const handleDeleteNota = async () => {
    setActionLoading(true);
    try {
      await fiscalService.deleteNota(id);
      router.push("/dashboard/fiscal");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir nota fiscal";
      setError(message);
      setActionLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteFileId) return;
    setActionLoading(true);
    try {
      await fiscalService.deleteFile(id, deleteFileId);
      setDeleteFileId(null);
      setSuccess("Arquivo excluído com sucesso!");
      loadNota();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir arquivo";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadFile = (arquivoId: string) => {
    const url = fiscalService.getDownloadUrl(id, arquivoId);
    window.open(url, "_blank");
  };

  const handleUploadFiles = async () => {
    if (newFiles.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      newFiles.forEach((file) => fd.append("arquivos", file));
      await fiscalService.addFiles(id, fd);
      setNewFiles([]);
      setSuccess("Arquivos adicionados com sucesso!");
      loadNota();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao adicionar arquivos";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!nota) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Nota fiscal não encontrada</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/fiscal")}
          sx={{ mt: 2, textTransform: "none" }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  const isPendente = nota.status === "PENDENTE";
  const isRecusado = nota.status === "RECUSADO";

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/fiscal")}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              {nota.numero_nota}
            </Typography>
            <StatusChip status={nota.status} size="medium" />
            {nota.is_atrasado && (
              <Chip
                icon={<WarningIcon sx={{ fontSize: 16 }} />}
                label="Atrasado"
                size="small"
                sx={{ bgcolor: "#FFF3E0", color: "#E65100", fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {isRecusado && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/dashboard/fiscal/${id}/editar`)}
              sx={{
                bgcolor: "#8270FF",
                "&:hover": { bgcolor: "#6c5ce7" },
                textTransform: "none",
              }}
            >
              Corrigir e Reenviar
            </Button>
          )}
          {isPendente && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Excluir Nota
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Recusa Message */}
      {nota.comentario_recusa && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>Motivo da recusa:</Typography>
          <Typography variant="body2">{nota.comentario_recusa}</Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Detalhes da Nota
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Mês/Ano</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatMonthYear(nota.ano_mes)}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Data Emissão</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatDate(nota.data_emissao)}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Valor</Typography>
                  <Typography variant="body1" fontWeight={500} color="#8270FF">
                    {formatCurrency(nota.valor_nota)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Envio</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatDateTime(nota.data_upload)}</Typography>
                </Grid>
                {nota.data_aprovacao && (
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Aprovação</Typography>
                    <Typography variant="body1" fontWeight={500}>{formatDateTime(nota.data_aprovacao)}</Typography>
                  </Grid>
                )}
                {nota.data_pagamento && (
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Pagamento</Typography>
                    <Typography variant="body1" fontWeight={500}>{formatDateTime(nota.data_pagamento)}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Files */}
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Arquivos ({nota.arquivos.length})
              </Typography>
              {nota.arquivos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum arquivo anexado
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {nota.arquivos.map((arquivo) => (
                    <Box
                      key={arquivo.arquivo_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <FileIcon sx={{ color: "#8270FF" }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {arquivo.nome_original}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(arquivo.tamanho_bytes)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadFile(arquivo.arquivo_id)}
                        title="Download"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      {isPendente && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteFileId(arquivo.arquivo_id)}
                          title="Excluir"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upload more files (only when PENDENTE) */}
        {isPendente && (
          <Grid item xs={12}>
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Adicionar Arquivos
                </Typography>
                <FileUploadArea
                  onFilesSelected={(f) => setNewFiles((prev) => [...prev, ...f])}
                  selectedFiles={newFiles}
                  onRemoveFile={(i) => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={uploading}
                  maxFiles={5 - nota.arquivos.length}
                />
                {newFiles.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      onClick={handleUploadFiles}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : undefined}
                      sx={{
                        bgcolor: "#8270FF",
                        "&:hover": { bgcolor: "#6c5ce7" },
                        textTransform: "none",
                      }}
                    >
                      {uploading ? "Enviando..." : "Enviar Arquivos"}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Delete Nota Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Nota Fiscal</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a nota <strong>{nota.numero_nota}</strong>?
            Todos os arquivos serão removidos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteNota} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete File Dialog */}
      <Dialog open={!!deleteFileId} onClose={() => setDeleteFileId(null)}>
        <DialogTitle>Excluir Arquivo</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este arquivo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFileId(null)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteFile} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
