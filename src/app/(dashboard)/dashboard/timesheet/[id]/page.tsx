"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { ApontamentoResponse } from "@/app/types/api";
import { formatDate, formatHours, formatDateTime } from "@/app/utils/format-utils";
import StatusChip from "../../components/StatusChip";

export default function LancamentoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [lancamento, setLancamento] = useState<ApontamentoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    data: "",
    horas: 8,
    descricao: "",
  });

  const loadLancamento = useCallback(async () => {
    setLoading(true);
    try {
      const data = await timesheetService.getLancamento(id);
      setLancamento(data);
      setFormData({
        data: data.data,
        horas: data.horas,
        descricao: data.descricao || "",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar lançamento";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLancamento();
  }, [loadLancamento]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.data) throw new Error("Selecione a data");
      if (formData.horas <= 0 || formData.horas > 24) throw new Error("Horas devem estar entre 0 e 24");

      await timesheetService.updateLancamento(id, formData);
      setSuccess("Lançamento atualizado com sucesso!");
      loadLancamento();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar lançamento";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await timesheetService.submitLancamento(id);
      setSuccess("Lançamento submetido com sucesso!");
      loadLancamento();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao submeter lançamento";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await timesheetService.deleteLancamento(id);
      router.push("/dashboard/timesheet");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir lançamento";
      setError(message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lancamento) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Lançamento não encontrado</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/timesheet")}
          sx={{ mt: 2, textTransform: "none" }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  const isEditable = lancamento.status === "RASCUNHO";

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/timesheet")}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              Lançamento
            </Typography>
            <StatusChip status={lancamento.status} size="medium" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Criado em {formatDateTime(lancamento.data_criacao)}
          </Typography>
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

      {isEditable ? (
        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Editar Lançamento
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Data"
                        type="date"
                        required
                        value={formData.data}
                        onChange={(e) => handleChange("data", e.target.value)}
                        disabled={saving}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horas"
                        type="number"
                        required
                        value={formData.horas}
                        onChange={(e) => handleChange("horas", parseFloat(e.target.value))}
                        disabled={saving}
                        inputProps={{ min: 0.5, max: 24, step: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Descrição"
                        multiline
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => handleChange("descricao", e.target.value)}
                        disabled={saving}
                        inputProps={{ maxLength: 500 }}
                        helperText={`${formData.descricao.length}/500 caracteres`}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={saving}
                  sx={{ textTransform: "none" }}
                >
                  Excluir
                </Button>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ textTransform: "none" }}
                  >
                    Submeter
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                    sx={{
                      bgcolor: "#8270FF",
                      "&:hover": { bgcolor: "#6c5ce7" },
                      textTransform: "none",
                      minWidth: 150,
                    }}
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      ) : (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Detalhes do Lançamento
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Data</Typography>
                <Typography variant="body1" fontWeight={500}>{formatDate(lancamento.data)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Horas</Typography>
                <Typography variant="body1" fontWeight={500}>{formatHours(lancamento.horas)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <StatusChip status={lancamento.status} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Descrição</Typography>
                <Typography variant="body1">{lancamento.descricao || "Sem descrição"}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Lançamento</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este lançamento de{" "}
            <strong>{formatDate(lancamento.data)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
