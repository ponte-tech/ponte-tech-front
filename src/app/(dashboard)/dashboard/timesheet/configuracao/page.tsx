"use client";

import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { TimesheetConfigRequest } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";

export default function TimesheetConfigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<TimesheetConfigRequest>({
    multiplicadores: { NORMAL: 1, EXTRA: 1.5, FERIADO: 2 },
    limites_diarios: { NORMAL: 8 },
    limites_mensais: { NORMAL: 160 },
    limite_submissao_dia: 5,
    comportamento_atraso: "PERMITIR_ATRASADO",
  });

  const isAdmin = user?.userType === "admin";

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const config = await timesheetService.adminGetConfig();
      setFormData({
        multiplicadores: config.multiplicadores || { NORMAL: 1, EXTRA: 1.5, FERIADO: 2 },
        limites_diarios: config.limites_diarios || { NORMAL: 8 },
        limites_mensais: config.limites_mensais || { NORMAL: 160 },
        limite_submissao_dia: config.limite_submissao_dia || 5,
        comportamento_atraso: config.comportamento_atraso || "PERMITIR_ATRASADO",
      });
    } catch (err: unknown) {
      console.error("Erro ao carregar configuração:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/timesheet");
      return;
    }
    loadConfig();
  }, [isAdmin, router, loadConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formData.limite_submissao_dia <= 0) {
        throw new Error("Limite de submissão deve ser maior que 0");
      }

      await timesheetService.adminUpsertConfig(formData);
      setSuccess("Configuração salva com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar configuração";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/timesheet/fechamentos")}
          sx={{ mb: 1, textTransform: "none" }}
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Configuração do Timesheet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Defina as regras de lançamento de horas
        </Typography>
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

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Multiplicadores de Horas
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Horas Normais (multiplicador)"
                      type="number"
                      required
                      value={formData.multiplicadores.NORMAL || 1}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          multiplicadores: {
                            ...prev.multiplicadores,
                            NORMAL: parseFloat(e.target.value),
                          },
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 0.5, max: 3, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Horas Extras (multiplicador)"
                      type="number"
                      required
                      value={formData.multiplicadores.EXTRA || 1.5}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          multiplicadores: {
                            ...prev.multiplicadores,
                            EXTRA: parseFloat(e.target.value),
                          },
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 0.5, max: 3, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Horas Feriado (multiplicador)"
                      type="number"
                      required
                      value={formData.multiplicadores.FERIADO || 2}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          multiplicadores: {
                            ...prev.multiplicadores,
                            FERIADO: parseFloat(e.target.value),
                          },
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 0.5, max: 3, step: 0.1 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Limites
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Limite Diário (horas)"
                      type="number"
                      required
                      value={formData.limites_diarios.NORMAL || 8}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          limites_diarios: {
                            ...prev.limites_diarios,
                            NORMAL: parseFloat(e.target.value),
                          },
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 1, max: 24, step: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Limite Mensal (horas)"
                      type="number"
                      required
                      value={formData.limites_mensais.NORMAL || 160}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          limites_mensais: {
                            ...prev.limites_mensais,
                            NORMAL: parseFloat(e.target.value),
                          },
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 0, max: 744 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Dias para Submissão"
                      type="number"
                      required
                      value={formData.limite_submissao_dia}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          limite_submissao_dia: parseInt(e.target.value),
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 1, max: 30 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={saving}>
                      <InputLabel>Comportamento Atraso</InputLabel>
                      <Select
                        value={formData.comportamento_atraso}
                        label="Comportamento Atraso"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            comportamento_atraso: e.target.value as "BLOQUEAR" | "PERMITIR_ATRASADO",
                          }))
                        }
                      >
                        <MenuItem value="BLOQUEAR">Bloquear Submissão Atrasada</MenuItem>
                        <MenuItem value="PERMITIR_ATRASADO">Permitir Submissão Atrasada</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => router.push("/dashboard/timesheet/fechamentos")}
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
                  minWidth: 150,
                }}
              >
                {saving ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
