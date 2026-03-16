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
import { Add as AddIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import clienteService from "@/app/services/clienteService";
import type { Cliente } from "@/app/types/cliente";
import { PageHeader, DeleteDialog, FilterSearch, TableActionButtons, TableAction, AccessDenied } from "@/app/shared/components";
import { formatCNPJ, cleanCNPJ } from "@/app/utils/cnpjValidator";
import { useAuth } from "@/app/hooks/useAuth";

type ClienteStatus = "ativo" | "inativo";

const statusLabels: Record<ClienteStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

const statusColors: Record<ClienteStatus, "success" | "error"> = {
  ativo: "success",
  inativo: "error",
};

export default function ClientesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClienteStatus | "">("");

  const isColaborador = user?.userType === "colaborador";

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadClientes();
  }, [filterStatus]);

  const loadClientes = async () => {
    try {
      setLoading(true);

      const filters: any = {};
      if (filterStatus) filters.status = filterStatus;

      const response = await clienteService.list(filters);

      setClientes(response.clientes || []);
    } catch (err) {
      console.error('❌ [CLIENTES] Erro ao carregar:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao carregar clientes");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleReactivateClick = async (cliente: Cliente) => {
    try {
      await clienteService.reactivate(cliente.cliente_id);
      setSnackbarMessage("Cliente reativado com sucesso!");
      setSnackbarOpen(true);
      loadClientes();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao reativar cliente");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;

    try {
      setDeleting(true);
      await clienteService.delete(clienteToDelete.cliente_id);
      setClientes(clientes.filter((c) => c.cliente_id !== clienteToDelete.cliente_id));
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
      setSnackbarMessage("Cliente excluído com sucesso!");
      setSnackbarOpen(true);
      loadClientes();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setDeleteError(error.response?.data?.message || "Erro ao excluir cliente");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClienteToDelete(null);
    setDeleteError(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpj.includes(cleanCNPJ(searchTerm)) ||
      (cliente.empresa_razao_social && cliente.empresa_razao_social.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTableActions = (cliente: Cliente): TableAction[] => {
    const actions: TableAction[] = [
      {
        type: "edit",
        onClick: () => router.push(`/dashboard/clientes/${cliente.cliente_id}/editar`),
      },
    ];

    // Se inativo, mostrar botão de reativar; se ativo, mostrar botão de deletar
    if (cliente.status === "inativo") {
      actions.push({
        type: "reactivate",
        onClick: () => handleReactivateClick(cliente),
      });
    } else {
      actions.push({
        type: "delete",
        onClick: () => handleDeleteClick(cliente),
      });
    }

    return actions;
  };

  // Show access denied for colaborador users
  if (isColaborador) {
    return <AccessDenied />;
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes cadastrados no sistema"
        actionButton={{
          label: "Cadastrar Cliente",
          icon: <AddIcon />,
          onClick: () => router.push("/dashboard/clientes/novo"),
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
              placeholder="Pesquisar por empresa, razão social, nome fantasia ou CNPJ..."
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ClienteStatus | "")}
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
                <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Razão Social</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nome Fantasia</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>CNPJ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data Cadastro</TableCell>
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
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum cliente encontrado
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/dashboard/clientes/novo")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Cadastrar Primeiro Cliente
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow
                    key={cliente.cliente_id}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cliente.empresa_razao_social || "Sem empresa"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {cliente.razao_social}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{cliente.nome_fantasia}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatCNPJ(cliente.cnpj)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[(cliente.status as ClienteStatus) || "ativo"]}
                        color={statusColors[(cliente.status as ClienteStatus) || "ativo"]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(cliente.data_cadastro)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TableActionButtons actions={getTableActions(cliente)} />
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
        itemName={clienteToDelete?.nome_fantasia || ""}
        itemType="o cliente"
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
