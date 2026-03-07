"use client";

import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress, Alert, Grid } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { CreateApontamentoRequest, LancamentoItemRequest } from "@/app/types/api";

export default function NovoLancamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<LancamentoItemRequest>({
    data: "",
    hora_inicio: "",
    hora_fim: "",
    observacao: "",
  });

  const handleChange = (field: keyof LancamentoItemRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.data) {
        throw new Error("Por favor, selecione a data");
      }

      if (!formData.hora_inicio) {
        throw new Error("Por favor, selecione a hora de início");
      }

      if (!formData.hora_fim) {
        throw new Error("Por favor, selecione a hora de término");
      }

      const request: CreateApontamentoRequest = {
        lancamentos: [formData],
      };

      await timesheetService.createLancamento(request);
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/timesheet");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar lançamento";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/timesheet")}
          sx={{ mb: 1, textTransform: "none" }}
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Novo Lançamento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registre suas horas trabalhadas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Lançamento criado com sucesso! Redirecionando...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Informações do Lançamento
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
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Hora Início"
                      type="time"
                      required
                      value={formData.hora_inicio}
                      onChange={(e) => handleChange("hora_inicio", e.target.value)}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Hora Fim"
                      type="time"
                      required
                      value={formData.hora_fim}
                      onChange={(e) => handleChange("hora_fim", e.target.value)}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Observação"
                      multiline
                      rows={3}
                      value={formData.observacao || ""}
                      onChange={(e) => handleChange("observacao", e.target.value)}
                      disabled={loading}
                      placeholder="Descreva as atividades realizadas"
                      inputProps={{ maxLength: 500 }}
                      helperText={`${(formData.observacao || "").length}/500 caracteres`}
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
                onClick={() => router.push("/dashboard/timesheet")}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  minWidth: 150,
                }}
              >
                {loading ? "Salvando..." : "Criar Lançamento"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
