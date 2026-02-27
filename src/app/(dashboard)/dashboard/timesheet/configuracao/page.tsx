"use client";

import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress, Alert, Switch, FormControlLabel, Grid } from "@mui/material";

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
    horas_maximas_dia: 8,
    horas_minimas_mes: 160,
    permitir_horas_extras: true,
    taxa_hora_extra: 1.5,
  });

  const isAdmin = user?.userType === "admin";

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const config = await timesheetService.adminGetConfig();
      setFormData({
        horas_maximas_dia: config.horas_maximas_dia,
        horas_minimas_mes: config.horas_minimas_mes,
        permitir_horas_extras: config.permitir_horas_extras,
        taxa_hora_extra: config.taxa_hora_extra,
      });
    } catch (err: unknown) {
      // Config may not exist yet, use defaults
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
      if (formData.horas_maximas_dia <= 0 || formData.horas_maximas_dia > 24) {
        throw new Error("Horas máximas por dia devem estar entre 1 e 24");
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
                  Regras de Horas
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Horas Máximas por Dia"
                      type="number"
                      required
                      value={formData.horas_maximas_dia}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          horas_maximas_dia: parseFloat(e.target.value),
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 1, max: 24, step: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Horas Mínimas por Mês"
                      type="number"
                      required
                      value={formData.horas_minimas_mes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          horas_minimas_mes: parseFloat(e.target.value),
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 0, max: 744 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permitir_horas_extras}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              permitir_horas_extras: e.target.checked,
                            }))
                          }
                          disabled={saving}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: "#8270FF" },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              bgcolor: "#8270FF",
                            },
                          }}
                        />
                      }
                      label="Permitir Horas Extras"
                    />
                  </Grid>
                  {formData.permitir_horas_extras && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Taxa Hora Extra (multiplicador)"
                        type="number"
                        value={formData.taxa_hora_extra}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            taxa_hora_extra: parseFloat(e.target.value),
                          }))
                        }
                        disabled={saving}
                        inputProps={{ min: 1, max: 3, step: 0.1 }}
                        helperText="Ex: 1.5 = 50% adicional"
                      />
                    </Grid>
                  )}
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
