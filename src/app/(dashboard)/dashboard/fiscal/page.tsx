"use client";

import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, CircularProgress, Alert, Chip, alpha, Grid } from "@mui/material";

import { Add as AddIcon, Search as SearchIcon, Warning as WarningIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalResponse, NotaFiscalStatus } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatCurrency, formatDate, formatMonthYear, getCurrentAnoMes } from "@/app/utils/format-utils";
import StatusChip from "../components/StatusChip";

const statusOptions: { value: NotaFiscalStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "RECUSADO", label: "Recusado" },
  { value: "PAGO", label: "Pago" },
];

export default function FiscalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notas, setNotas] = useState<NotaFiscalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<NotaFiscalStatus | "">("");
  const [filterAnoMes, setFilterAnoMes] = useState("");

  const isAdmin = user?.userType === "admin";
  const isContador = user?.userType === "contador";

  const loadNotas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterAnoMes) filters.ano_mes = filterAnoMes;

      const response = await fiscalService.listNotas(filters);
      setNotas(response.items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar notas fiscais";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterAnoMes]);

  useEffect(() => {
    if (isAdmin) {
      router.push("/dashboard/fiscal/admin");
      return;
    }
    if (isContador) {
      router.push("/dashboard/fiscal/contador");
      return;
    }
    loadNotas();
  }, [isAdmin, isContador, router, loadNotas]);

  if (isAdmin || isContador) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Notas Fiscais
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie suas notas fiscais
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/fiscal/nova")}
          sx={{
            bgcolor: "#8270FF",
            "&:hover": { bgcolor: "#6c5ce7" },
            textTransform: "none",
            px: 3,
          }}
        >
          Nova Nota
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mês/Ano"
                type="month"
                value={filterAnoMes}
                onChange={(e) => setFilterAnoMes(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as NotaFiscalStatus | "")}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notas.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma nota fiscal encontrada
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => router.push("/dashboard/fiscal/nova")}
            sx={{ mt: 2, textTransform: "none" }}
          >
            Criar Primeira Nota
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {notas.map((nota) => (
            <Grid xs={12} sm={6} md={4} key={nota.nota_id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(130, 112, 255, 0.15)",
                  },
                }}
                onClick={() => router.push(`/dashboard/fiscal/${nota.nota_id}`)}
              >
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <StatusChip status={nota.status} />
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

                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    {nota.numero_nota}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formatMonthYear(nota.ano_mes)}
                  </Typography>

                  {nota.comentario_recusa && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        p: 1,
                        bgcolor: alpha("#C62828", 0.05),
                        borderRadius: 1,
                        color: "#C62828",
                        fontSize: "0.75rem",
                      }}
                    >
                      {nota.comentario_recusa}
                    </Typography>
                  )}

                  <Box sx={{ mt: "auto", pt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h6" color="#8270FF" fontWeight="bold">
                        {formatCurrency(nota.valor_nota)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nota.arquivos.length} arquivo(s)
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Emissão: {formatDate(nota.data_emissao)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
