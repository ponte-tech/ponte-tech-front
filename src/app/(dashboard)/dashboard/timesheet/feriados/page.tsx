"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import timesheetService from "@/app/services/timesheetService";
import { FeriadoResponse, FeriadoTipo, CreateFeriadoRequest } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatDate } from "@/app/utils/format-utils";

const tipoLabels: Record<FeriadoTipo, string> = {
  nacional: "Nacional",
  estadual: "Estadual",
  municipal: "Municipal",
};

const tipoColors: Record<FeriadoTipo, string> = {
  nacional: "#1565C0",
  estadual: "#7B1FA2",
  municipal: "#E65100",
};

const emptyForm: CreateFeriadoRequest = {
  data: "",
  descricao: "",
  tipo: "nacional",
};

export default function FeriadosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [feriados, setFeriados] = useState<FeriadoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateFeriadoRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeriado, setSelectedFeriado] = useState<FeriadoResponse | null>(null);

  const isAdmin = user?.userType === "admin";

  const loadFeriados = useCallback(async () => {
    setLoading(true);
    try {
      const data = await timesheetService.getFeriados();
      setFeriados(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar feriados";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard/timesheet");
      return;
    }
    loadFeriados();
  }, [isAdmin, router, loadFeriados]);

  const openCreateDialog = () => {
    setEditingData(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (feriado: FeriadoResponse) => {
    setEditingData(feriado.data);
    setFormData({
      data: feriado.data,
      descricao: feriado.descricao,
      tipo: feriado.tipo,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!formData.data || !formData.descricao) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      if (editingData) {
        await timesheetService.adminUpdateFeriado(editingData, {
          descricao: formData.descricao,
          tipo: formData.tipo,
        });
        setSuccess("Feriado atualizado com sucesso!");
      } else {
        await timesheetService.adminCreateFeriado(formData);
        setSuccess("Feriado criado com sucesso!");
      }
      setDialogOpen(false);
      loadFeriados();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar feriado";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeriado) return;
    setSaving(true);
    try {
      await timesheetService.adminDeleteFeriado(selectedFeriado.data);
      setSuccess("Feriado excluído com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedFeriado(null);
      loadFeriados();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir feriado";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/timesheet/fechamentos")}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Feriados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os feriados do sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{
            bgcolor: "#8270FF",
            "&:hover": { bgcolor: "#6c5ce7" },
            textTransform: "none",
            px: 3,
          }}
        >
          Novo Feriado
        </Button>
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

      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : feriados.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum feriado cadastrado
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feriados.map((feriado) => (
                    <TableRow
                      key={feriado.data}
                      hover
                      sx={{ "&:hover": { bgcolor: alpha("#8270FF", 0.03) } }}
                    >
                      <TableCell>{formatDate(feriado.data)}</TableCell>
                      <TableCell>{feriado.descricao}</TableCell>
                      <TableCell>
                        <Chip
                          label={tipoLabels[feriado.tipo]}
                          size="small"
                          sx={{
                            bgcolor: alpha(tipoColors[feriado.tipo], 0.1),
                            color: tipoColors[feriado.tipo],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEditDialog(feriado)} title="Editar">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedFeriado(feriado);
                            setDeleteDialogOpen(true);
                          }}
                          title="Excluir"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingData ? "Editar Feriado" : "Novo Feriado"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data"
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData((prev) => ({ ...prev, data: e.target.value }))}
                disabled={saving || !!editingData}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                required
                value={formData.descricao}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Tipo"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tipo: e.target.value as FeriadoTipo }))
                }
                disabled={saving}
              >
                {Object.entries(tipoLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: "#8270FF", "&:hover": { bgcolor: "#6c5ce7" } }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Feriado</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o feriado{" "}
            <strong>{selectedFeriado?.descricao}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
