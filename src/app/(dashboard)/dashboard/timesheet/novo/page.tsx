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
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { CreateApontamentoRequest } from "@/app/types/api";

export default function NovoLancamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateApontamentoRequest>({
    data: "",
    horas: 8,
    descricao: "",
  });

  const handleChange = (field: keyof CreateApontamentoRequest, value: string | number) => {
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

      if (formData.horas <= 0 || formData.horas > 24) {
        throw new Error("As horas devem estar entre 0 e 24");
      }

      await timesheetService.createLancamento(formData);
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Horas"
                      type="number"
                      required
                      value={formData.horas}
                      onChange={(e) => handleChange("horas", parseFloat(e.target.value))}
                      disabled={loading}
                      inputProps={{ min: 0.5, max: 24, step: 0.5 }}
                      helperText="Mínimo 0.5h, máximo 24h"
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
                      disabled={loading}
                      placeholder="Descreva as atividades realizadas"
                      inputProps={{ maxLength: 500 }}
                      helperText={`${(formData.descricao || "").length}/500 caracteres`}
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
