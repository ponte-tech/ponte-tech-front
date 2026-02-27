"use client";

import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress, Alert, Grid } from "@mui/material";

import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalResponse, UpdateNotaFiscalRequest } from "@/app/types/api";

export default function EditarNotaFiscalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nota, setNota] = useState<NotaFiscalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<UpdateNotaFiscalRequest>({
    numero_nota: "",
    data_emissao: "",
    valor_nota: 0,
  });

  const loadNota = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fiscalService.getNota(id);
      if (data.status !== "RECUSADO") {
        router.push(`/dashboard/fiscal/${id}`);
        return;
      }
      setNota(data);
      setFormData({
        numero_nota: data.numero_nota,
        data_emissao: data.data_emissao,
        valor_nota: data.valor_nota,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar nota fiscal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadNota();
  }, [loadNota]);

  const handleChange = (field: keyof UpdateNotaFiscalRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.numero_nota) throw new Error("Informe o número da nota");
      if (!formData.data_emissao) throw new Error("Informe a data de emissão");
      if (!formData.valor_nota || formData.valor_nota <= 0) throw new Error("O valor deve ser maior que zero");

      await fiscalService.updateNota(id, formData);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/fiscal/${id}`);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar nota fiscal";
      setError(message);
    } finally {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/dashboard/fiscal/${id}`)}
          sx={{ mb: 1, textTransform: "none" }}
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Corrigir Nota Fiscal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Corrija os dados e reenvie a nota fiscal
        </Typography>
      </Box>

      {nota.comentario_recusa && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>Motivo da recusa:</Typography>
          <Typography variant="body2">{nota.comentario_recusa}</Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Nota fiscal atualizada e reenviada com sucesso! Redirecionando...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Dados da Nota
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Número da Nota"
                      required
                      value={formData.numero_nota}
                      onChange={(e) => handleChange("numero_nota", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Data de Emissão"
                      type="date"
                      required
                      value={formData.data_emissao}
                      onChange={(e) => handleChange("data_emissao", e.target.value)}
                      disabled={saving}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Valor da Nota (R$)"
                      type="number"
                      required
                      value={formData.valor_nota || ""}
                      onChange={(e) => handleChange("valor_nota", parseFloat(e.target.value) || 0)}
                      disabled={saving}
                      inputProps={{ min: 0.01, step: 0.01 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/dashboard/fiscal/${id}`)}
                disabled={saving}
                sx={{ textTransform: "none" }}
              >
                Cancelar
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
                  minWidth: 180,
                }}
              >
                {saving ? "Salvando..." : "Corrigir e Reenviar"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
