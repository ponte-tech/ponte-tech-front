"use client";

import { Box, Card, CardContent, Typography, Button, CircularProgress, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Grid } from "@mui/material";
import { Add as AddIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Edit as EditIcon, Delete as DeleteIcon, Send as SendIcon, AccessTime as AccessTimeIcon, CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { MesResponse, ApontamentoResponse } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatDate, formatMonthYear, getCurrentAnoMes } from "@/app/utils/format-utils";
import StatusChip from "../components/StatusChip";

export default function TimesheetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [anoMes, setAnoMes] = useState(getCurrentAnoMes());
  const [mesData, setMesData] = useState<MesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<ApontamentoResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.userType === "admin";

  const loadMes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await timesheetService.getMes(anoMes);
      setMesData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados do mês";
      setError(message);
      setMesData(null);
    } finally {
      setLoading(false);
    }
  }, [anoMes]);

  useEffect(() => {
    if (isAdmin) {
      router.push("/dashboard/timesheet/fechamentos");
      return;
    }
    loadMes();
  }, [isAdmin, router, loadMes]);

  const navigateMonth = (direction: number) => {
    const [year, month] = anoMes.split("-").map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    setAnoMes(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  // Compose lancamentos from dias
  const lancamentos = useMemo(() => {
    if (!mesData) return [];
    return mesData.dias.flatMap((dia) => dia.lancamentos);
  }, [mesData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHoras = lancamentos.reduce((sum, l) => sum + l.duracao_horas_ajustada, 0);
    const horasSubmetidas = lancamentos
      .filter((l) => l.status !== "RASCUNHO")
      .reduce((sum, l) => sum + l.duracao_horas_ajustada, 0);
    const horasAprovadas = lancamentos
      .filter((l) => l.status === "APROVADO")
      .reduce((sum, l) => sum + l.duracao_horas_ajustada, 0);

    return {
      totalHoras: totalHoras.toFixed(1),
      horasSubmetidas: horasSubmetidas.toFixed(1),
      horasAprovadas: horasAprovadas.toFixed(1),
    };
  }, [lancamentos]);

  const handleDelete = async () => {
    if (!selectedLancamento) return;
    setActionLoading(true);
    try {
      await timesheetService.deleteLancamento(selectedLancamento.apontamento_id);
      setDeleteDialogOpen(false);
      setSelectedLancamento(null);
      loadMes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir lançamento";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (lancamento: ApontamentoResponse) => {
    setActionLoading(true);
    try {
      await timesheetService.submitLancamento(lancamento.apontamento_id);
      loadMes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao submeter lançamento";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isAdmin) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Timesheet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie seus lançamentos de horas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/timesheet/novo")}
          sx={{
            bgcolor: "#8270FF",
            "&:hover": { bgcolor: "#6c5ce7" },
            textTransform: "none",
            px: 3,
          }}
        >
          Novo Lançamento
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Month Selector */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigateMonth(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600} sx={{ minWidth: 200, textAlign: "center" }}>
          {formatMonthYear(anoMes)}
        </Typography>
        <IconButton onClick={() => navigateMonth(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          {mesData && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
              <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha("#8270FF", 0.1) }}>
                    <AccessTimeIcon sx={{ color: "#8270FF" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Horas</Typography>
                    <Typography variant="h5" fontWeight="bold">{stats.totalHoras}h</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha("#1565C0", 0.1) }}>
                    <SendIcon sx={{ color: "#1565C0" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Submetidas</Typography>
                    <Typography variant="h5" fontWeight="bold">{stats.horasSubmetidas}h</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha("#2E7D32", 0.1) }}>
                    <CheckCircleIcon sx={{ color: "#2E7D32" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Aprovadas</Typography>
                    <Typography variant="h5" fontWeight="bold">{stats.horasAprovadas}h</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Lancamentos Table */}
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
                <Typography variant="h6" fontWeight={600}>
                  Lançamentos
                </Typography>
              </Box>
              {!mesData || lancamentos.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Nenhum lançamento neste mês
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => router.push("/dashboard/timesheet/novo")}
                    sx={{ mt: 1, textTransform: "none" }}
                  >
                    Criar Primeiro Lançamento
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Horário</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Duração</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lancamentos.map((lancamento) => (
                        <TableRow
                          key={lancamento.apontamento_id}
                          hover
                          sx={{ cursor: "pointer", "&:hover": { bgcolor: alpha("#8270FF", 0.03) } }}
                          onClick={() => router.push(`/dashboard/timesheet/${lancamento.apontamento_id}`)}
                        >
                          <TableCell>{formatDate(lancamento.data)}</TableCell>
                          <TableCell>{`${lancamento.hora_inicio} - ${lancamento.hora_fim}`}</TableCell>
                          <TableCell>{lancamento.duracao_horas_ajustada.toFixed(1)}h</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {lancamento.tipo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={lancamento.status} />
                          </TableCell>
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            {lancamento.status === "RASCUNHO" && (
                              <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                <IconButton
                                  size="small"
                                  onClick={() => router.push(`/dashboard/timesheet/${lancamento.apontamento_id}`)}
                                  title="Editar"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleSubmit(lancamento)}
                                  disabled={actionLoading}
                                  title="Submeter"
                                >
                                  <SendIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedLancamento(lancamento);
                                    setDeleteDialogOpen(true);
                                  }}
                                  title="Excluir"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Lançamento</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o lançamento de{" "}
            <strong>{selectedLancamento ? formatDate(selectedLancamento.data) : ""}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
