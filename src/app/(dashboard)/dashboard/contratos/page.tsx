"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Button,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Cancel as CancelIcon, Check as CheckIcon, Restore as RestoreIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import contratoService from "@/app/services/contratoService";
import clienteService from "@/app/services/clienteService";
import type { Contrato, StatusContrato } from "@/app/types/contrato";
import type { Cliente } from "@/app/types/cliente";
import { PageHeader, DeleteDialog, FilterSearch, TableActionButtons, TableAction, AccessDenied } from "@/app/shared/components";
import { useAuth } from "@/app/hooks/useAuth";

const statusLabels: Record<StatusContrato, string> = {
  ATIVO: "Ativo",
  CANCELADO: "Cancelado",
  FINALIZADO: "Finalizado",
};

const statusColors: Record<StatusContrato, "success" | "error" | "default"> = {
  ATIVO: "success",
  CANCELADO: "error",
  FINALIZADO: "default",
};

export default function ContratosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusContrato | "">("");

  const isColaborador = user?.userType === "colaborador";

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contratoToDelete, setContratoToDelete] = useState<Contrato | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadContratos();
    loadClientes();
  }, [filterStatus]);

  const loadContratos = async () => {
    try {
      setLoading(true);

      const filters: any = {};
      if (filterStatus) filters.status = filterStatus;

      const response = await contratoService.list(filters);

      setContratos(response.contratos || []);
    } catch (err) {
    // console.error('Erro ao carregar contratos:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao carregar contratos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await clienteService.list();
      setClientes(response.clientes || []);
    } catch (err) {
    // console.error('Erro ao carregar clientes:', err);
    }
  };

  const handleDeleteClick = (contrato: Contrato) => {
    setContratoToDelete(contrato);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleCancelarClick = async (contrato: Contrato) => {
    try {
      await contratoService.changeStatus(contrato.contrato_id, contrato.cliente_id, "CANCELADO");
      setSnackbarMessage("Contrato cancelado com sucesso!");
      setSnackbarOpen(true);
      loadContratos();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao cancelar contrato");
      setSnackbarOpen(true);
    }
  };

  const handleFinalizarClick = async (contrato: Contrato) => {
    try {
      await contratoService.changeStatus(contrato.contrato_id, contrato.cliente_id, "FINALIZADO");
      setSnackbarMessage("Contrato finalizado com sucesso!");
      setSnackbarOpen(true);
      loadContratos();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao finalizar contrato");
      setSnackbarOpen(true);
    }
  };

  const handleReativarClick = async (contrato: Contrato) => {
    try {
      await contratoService.changeStatus(contrato.contrato_id, contrato.cliente_id, "ATIVO");
      setSnackbarMessage("Contrato reativado com sucesso!");
      setSnackbarOpen(true);
      loadContratos();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao reativar contrato");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!contratoToDelete) return;

    try {
      setDeleting(true);
      await contratoService.delete(contratoToDelete.contrato_id);
      setContratos(contratos.filter((c) => c.contrato_id !== contratoToDelete.contrato_id));
      setDeleteDialogOpen(false);
      setContratoToDelete(null);
      setSnackbarMessage("Contrato excluído com sucesso!");
      setSnackbarOpen(true);
      loadContratos();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setDeleteError(error.response?.data?.message || "Erro ao excluir contrato");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContratoToDelete(null);
    setDeleteError(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getClienteNome = (clienteId: string): string => {
    const cliente = clientes.find((c) => c.cliente_id === clienteId);
    return cliente?.nome_fantasia || "Cliente não encontrado";
  };

  const filteredContratos = contratos.filter(
    (contrato) =>
      contrato.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClienteNome(contrato.cliente_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTableActions = (contrato: Contrato): TableAction[] => {
    const actions: TableAction[] = [
      {
        type: "edit",
        onClick: () => router.push(`/dashboard/contratos/${contrato.contrato_id}/editar`),
      },
    ];

    // Se ativo, mostrar botões de cancelar e finalizar
    if (contrato.status === "ATIVO") {
      actions.push({
        type: "custom",
        icon: <CancelIcon />,
        tooltip: "Cancelar contrato",
        onClick: () => handleCancelarClick(contrato),
        color: "error",
      });
      actions.push({
        type: "custom",
        icon: <CheckIcon />,
        tooltip: "Finalizar contrato",
        onClick: () => handleFinalizarClick(contrato),
        color: "success",
      });
    }

    // Se cancelado, mostrar botão de reativar
    if (contrato.status === "CANCELADO") {
      actions.push({
        type: "reactivate",
        tooltip: "Reativar contrato",
        onClick: () => handleReativarClick(contrato),
      });
    }

    actions.push({
      type: "delete",
      onClick: () => handleDeleteClick(contrato),
    });

    return actions;
  };

  // Bloquear acesso para colaboradores
  if (isColaborador) {
    return <AccessDenied />;
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Contratos"
        description="Gerencie os contratos cadastrados no sistema"
        actionButton={{
          label: "Cadastrar Contrato",
          icon: <AddIcon />,
          onClick: () => router.push("/dashboard/contratos/novo"),
          visible: true,
        }}
      />

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FilterSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Pesquisar por título ou cliente..."
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusContrato | "")}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data Início</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data Fim</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredContratos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum contrato encontrado
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/dashboard/contratos/novo")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Cadastrar Primeiro Contrato
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContratos.map((contrato) => (
                  <TableRow
                    key={contrato.contrato_id}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {contrato.cliente_nome || getClienteNome(contrato.cliente_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(contrato.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {contrato.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(contrato.data_inicio)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(contrato.data_fim)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[contrato.status]}
                        color={statusColors[contrato.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TableActionButtons actions={getTableActions(contrato)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        itemName={contratoToDelete?.titulo || ""}
        itemType="o contrato"
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
