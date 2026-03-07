"use client";

import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from "@mui/material";

import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { FechamentoListItem, FechamentoStatus } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatHours, formatMonthYear, getCurrentAnoMes } from "@/app/utils/format-utils";
import StatusChip from "../../components/StatusChip";

const statusOptions: { value: FechamentoStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "ABERTO", label: "Aberto" },
  { value: "SUBMETIDO", label: "Submetido" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REJEITADO", label: "Recusado" },
];

export default function FechamentosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [fechamentos, setFechamentos] = useState<FechamentoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FechamentoStatus | "">("");
  const [filterAnoMes, setFilterAnoMes] = useState(getCurrentAnoMes());
  const [selected, setSelected] = useState<string[]>([]);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"APROVADO" | "REJEITADO">("APROVADO");
  const [comentario, setComentario] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.userType === "admin";

  const loadFechamentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterAnoMes) filters.ano_mes = filterAnoMes;

      const response = await timesheetService.adminListFechamentos(filters);
      setFechamentos(response.items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar fechamentos";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterAnoMes]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/timesheet");
      return;
    }
    loadFechamentos();
  }, [isAdmin, router, loadFechamentos]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = fechamentos
        .filter((f) => f.status === "SUBMETIDO")
        .map((f) => `${f.user_id}:${f.ano_mes}`);
      setSelected(selectableIds);
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (fechamento: FechamentoListItem, checked: boolean) => {
    const key = `${fechamento.user_id}:${fechamento.ano_mes}`;
    if (checked) {
      setSelected((prev) => [...prev, key]);
    } else {
      setSelected((prev) => prev.filter((s) => s !== key));
    }
  };

  const openActionDialog = (type: "APROVADO" | "REJEITADO") => {
    setActionType(type);
    setComentario("");
    setActionDialogOpen(true);
  };

  const handleBulkAction = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Novo formato: batch request com acao e comentario
      const fechamentosArray = selected.map((key) => {
        const [userId, anoMes] = key.split(":");
        return { user_id: userId, ano_mes: anoMes };
      });

      await timesheetService.adminUpdateFechamentoStatus({
        acao: actionType,
        comentario: comentario || undefined,
        fechamentos: fechamentosArray,
      });

      setSuccess(
        `${selected.length} fechamento(s) ${actionType === "APROVADO" ? "aprovado(s)" : "rejeitado(s)"} com sucesso!`
      );
      setSelected([]);
      setActionDialogOpen(false);
      loadFechamentos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar fechamentos";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Fechamentos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os fechamentos mensais dos colaboradores
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/dashboard/timesheet/feriados")}
            sx={{ textTransform: "none" }}
          >
            Feriados
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/dashboard/timesheet/configuracao")}
            sx={{ textTransform: "none" }}
          >
            Configuração
          </Button>
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
                onChange={(e) => setFilterStatus(e.target.value as FechamentoStatus | "")}
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

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {selected.length} selecionado(s)
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={() => openActionDialog("APROVADO")}
            sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" }, textTransform: "none" }}
          >
            Aprovar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => openActionDialog("REJEITADO")}
            color="error"
            sx={{ textTransform: "none" }}
          >
            Rejeitar
          </Button>
        </Box>
      )}

      {/* Table */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : fechamentos.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum fechamento encontrado
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={
                          selected.length > 0 &&
                          selected.length ===
                            fechamentos.filter((f) => f.status === "SUBMETIDO").length
                        }
                        indeterminate={
                          selected.length > 0 &&
                          selected.length <
                            fechamentos.filter((f) => f.status === "SUBMETIDO").length
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Colaborador</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mês/Ano</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Horas</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fechamentos.map((fechamento) => {
                    const key = `${fechamento.user_id}:${fechamento.ano_mes}`;
                    const isSelectable = fechamento.status === "SUBMETIDO";
                    return (
                      <TableRow
                        key={key}
                        hover
                        sx={{ "&:hover": { bgcolor: alpha("#8270FF", 0.03) } }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(key)}
                            onChange={(e) => handleSelectOne(fechamento, e.target.checked)}
                            disabled={!isSelectable}
                          />
                        </TableCell>
                        <TableCell>{fechamento.user_nome}</TableCell>
                        <TableCell>{formatMonthYear(fechamento.ano_mes)}</TableCell>
                        <TableCell>{formatHours(fechamento.total_horas)}</TableCell>
                        <TableCell>
                          <StatusChip status={fechamento.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === "APROVADO" ? "Aprovar Fechamentos" : "Rejeitar Fechamentos"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selected.length} fechamento(s) selecionado(s) serão{" "}
            {actionType === "APROVADO" ? "aprovados" : "rejeitados"}.
          </Typography>
          {actionType === "REJEITADO" && (
            <TextField
              fullWidth
              label="Motivo (opcional)"
              multiline
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Informe o motivo da rejeição..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleBulkAction}
            variant="contained"
            disabled={actionLoading}
            color={actionType === "APROVADO" ? "success" : "error"}
          >
            {actionLoading
              ? "Processando..."
              : actionType === "APROVADO"
              ? "Aprovar"
              : "Rejeitar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
