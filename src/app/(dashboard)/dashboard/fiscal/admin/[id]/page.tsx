"use client";

import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress, Alert, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from "@mui/material";

import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Payment as PaymentIcon, Download as DownloadIcon, InsertDriveFile as FileIcon, Warning as WarningIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalResponse } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatCurrency, formatDate, formatDateTime, formatMonthYear, formatFileSize } from "@/app/utils/format-utils";
import StatusChip from "../../../components/StatusChip";

export default function AdminNotaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [nota, setNota] = useState<NotaFiscalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [recusarDialogOpen, setRecusarDialogOpen] = useState(false);
  const [comentario, setComentario] = useState("");

  const isAdmin = user?.userType === "admin";

  const loadNota = useCallback(async () => {
    setLoading(true);
    try {
      // Admin uses the colaborador endpoint to get detail (or we could add an admin detail endpoint)
      const response = await fiscalService.adminListNotas({});
      const found = response.items.find((n) => n.nota_id === id);
      if (found) {
        setNota(found);
      } else {
        setError("Nota fiscal não encontrada");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar nota fiscal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/fiscal");
      return;
    }
    loadNota();
  }, [isAdmin, router, loadNota]);

  const handleAprovar = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await fiscalService.adminUpdateStatus(id, { status: "APROVADO" });
      setSuccess("Nota fiscal aprovada com sucesso!");
      loadNota();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao aprovar nota";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecusar = async () => {
    if (!comentario.trim()) {
      setError("Informe o motivo da recusa");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await fiscalService.adminUpdateStatus(id, {
        status: "RECUSADO",
        comentario: comentario.trim(),
      });
      setSuccess("Nota fiscal recusada.");
      setRecusarDialogOpen(false);
      setComentario("");
      loadNota();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao recusar nota";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePagar = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await fiscalService.adminUpdateStatus(id, { status: "PAGO" });
      setSuccess("Nota fiscal marcada como paga!");
      loadNota();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao marcar como pago";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadFile = (arquivoId: string) => {
    const url = fiscalService.getDownloadUrl(id, arquivoId);
    window.open(url, "_blank");
  };

  if (!isAdmin) return null;

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
        <Alert severity="error">{error || "Nota fiscal não encontrada"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/fiscal/admin")}
          sx={{ mt: 2, textTransform: "none" }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/fiscal/admin")}
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
          <Typography variant="body2" color="text.secondary">
            Colaborador: {nota.user_nome || nota.user_id}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {nota.status === "PENDENTE" && (
            <>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleAprovar}
                disabled={actionLoading}
                sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" }, textTransform: "none" }}
              >
                Aprovar
              </Button>
              <Button
                variant="contained"
                startIcon={<CancelIcon />}
                onClick={() => setRecusarDialogOpen(true)}
                disabled={actionLoading}
                color="error"
                sx={{ textTransform: "none" }}
              >
                Recusar
              </Button>
            </>
          )}
          {nota.status === "APROVADO" && (
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={handlePagar}
              disabled={actionLoading}
              sx={{ bgcolor: "#1565C0", "&:hover": { bgcolor: "#0D47A1" }, textTransform: "none" }}
            >
              Marcar como Pago
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
                  <Typography variant="body2" color="text.secondary">Data Envio</Typography>
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
                  Nenhum arquivo
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
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recusar Dialog */}
      <Dialog open={recusarDialogOpen} onClose={() => setRecusarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recusar Nota Fiscal</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Informe o motivo da recusa para o colaborador.
          </Typography>
          <TextField
            fullWidth
            label="Motivo da Recusa"
            required
            multiline
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Descreva o motivo da recusa..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecusarDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleRecusar}
            variant="contained"
            color="error"
            disabled={actionLoading || !comentario.trim()}
          >
            {actionLoading ? "Processando..." : "Recusar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
