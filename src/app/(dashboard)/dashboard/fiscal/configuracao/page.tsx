"use client";

import { Box, Card, CardContent, Typography, Button, TextField, CircularProgress, Alert, Switch, FormControlLabel, Grid } from "@mui/material";

import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { FiscalConfigRequest } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";

export default function FiscalConfigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FiscalConfigRequest>({
    prazo_maximo_dia: 10,
    tolerancia_pct: 2.0,
    bloquear_pagamento_sem_nota: false,
  });

  const isAdmin = user?.userType === "admin";

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const config = await fiscalService.adminGetConfig();
      setFormData({
        prazo_maximo_dia: config.prazo_maximo_dia,
        tolerancia_pct: config.tolerancia_pct,
        bloquear_pagamento_sem_nota: config.bloquear_pagamento_sem_nota,
      });
    } catch (err: unknown) {
      console.error("Erro ao carregar configuração:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/fiscal");
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
      if (formData.prazo_maximo_dia < 1 || formData.prazo_maximo_dia > 28) {
        throw new Error("Prazo máximo deve estar entre 1 e 28");
      }
      if (formData.tolerancia_pct < 0 || formData.tolerancia_pct > 100) {
        throw new Error("Tolerância deve estar entre 0% e 100%");
      }

      await fiscalService.adminUpsertConfig(formData);
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
          onClick={() => router.push("/dashboard/fiscal/admin")}
          sx={{ mb: 1, textTransform: "none" }}
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Configuração Fiscal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Defina as regras para notas fiscais
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
                  Regras de Notas Fiscais
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prazo Máximo (dia do mês)"
                      type="number"
                      required
                      value={formData.prazo_maximo_dia}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prazo_maximo_dia: parseInt(e.target.value),
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 1, max: 28 }}
                      helperText="Dia limite para envio da nota fiscal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tolerância de Valor (%)"
                      type="number"
                      required
                      value={formData.tolerancia_pct}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tolerancia_pct: parseFloat(e.target.value),
                        }))
                      }
                      disabled={saving}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      helperText="Variação permitida entre o valor da nota e o valor esperado"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.bloquear_pagamento_sem_nota}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bloquear_pagamento_sem_nota: e.target.checked,
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
                      label="Bloquear pagamento sem nota fiscal"
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
                onClick={() => router.push("/dashboard/fiscal/admin")}
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
