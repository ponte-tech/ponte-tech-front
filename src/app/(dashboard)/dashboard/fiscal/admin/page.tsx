"use client";

import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, alpha, Chip, Grid } from "@mui/material";

import { Download as DownloadIcon, Warning as WarningIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalResponse, NotaFiscalStatus } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatCurrency, formatDate, formatMonthYear } from "@/app/utils/format-utils";
import StatusChip from "../../components/StatusChip";

const statusOptions: { value: NotaFiscalStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "RECUSADO", label: "Recusado" },
  { value: "PAGO", label: "Pago" },
];

export default function AdminFiscalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notas, setNotas] = useState<NotaFiscalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<NotaFiscalStatus | "">("");
  const [filterAnoMes, setFilterAnoMes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const isAdmin = user?.userType === "admin";

  const loadNotas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterAnoMes) filters.ano_mes = filterAnoMes;

      const response = await fiscalService.adminListNotas(filters);
      setNotas(response.items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar notas fiscais";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterAnoMes]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/fiscal");
      return;
    }
    loadNotas();
  }, [isAdmin, router, loadNotas]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(notas.map((n) => n.nota_id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (notaId: string, checked: boolean) => {
    if (checked) {
      setSelected((prev) => [...prev, notaId]);
    } else {
      setSelected((prev) => prev.filter((id) => id !== notaId));
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    setError(null);
    try {
      const items = notas
        .filter((n) => selected.includes(n.nota_id))
        .flatMap((n) =>
          n.arquivos.map((a) => ({
            nota_id: n.nota_id,
            arquivo_id: a.arquivo_id,
          }))
        );

      if (items.length === 0) {
        throw new Error("Nenhum arquivo para download nas notas selecionadas");
      }

      const blob = await fiscalService.adminDownloadZip({ items });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "notas-fiscais.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao baixar arquivos";
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Notas Fiscais - Administração
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as notas fiscais de todos os colaboradores
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push("/dashboard/fiscal/configuracao")}
          sx={{ textTransform: "none" }}
        >
          Configuração
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

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {selected.length} nota(s) selecionada(s)
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={handleDownloadZip}
            disabled={downloading}
            sx={{ bgcolor: "#8270FF", "&:hover": { bgcolor: "#6c5ce7" }, textTransform: "none" }}
          >
            {downloading ? "Baixando..." : "Download ZIP"}
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
          ) : notas.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma nota fiscal encontrada
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
                        checked={selected.length === notas.length && notas.length > 0}
                        indeterminate={selected.length > 0 && selected.length < notas.length}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Colaborador</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nota</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mês/Ano</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Data Envio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notas.map((nota) => (
                    <TableRow
                      key={nota.nota_id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: alpha("#8270FF", 0.03) },
                      }}
                      onClick={() => router.push(`/dashboard/fiscal/admin/${nota.nota_id}`)}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(nota.nota_id)}
                          onChange={(e) => handleSelectOne(nota.nota_id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{nota.user_nome || nota.user_id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {nota.numero_nota}
                          {nota.is_atrasado && (
                            <WarningIcon sx={{ fontSize: 16, color: "#E65100" }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{formatMonthYear(nota.ano_mes)}</TableCell>
                      <TableCell>{formatCurrency(nota.valor_nota)}</TableCell>
                      <TableCell>
                        <StatusChip status={nota.status} />
                      </TableCell>
                      <TableCell>{formatDate(nota.data_upload)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
