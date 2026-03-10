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
  Snackbar,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import clienteService from "@/app/services/clienteService";
import type { Cliente } from "@/app/types/cliente";
import { PageHeader, DeleteDialog, FilterSearch, TableActionButtons, TableAction } from "@/app/shared/components";
import { formatCNPJ, cleanCNPJ } from "@/app/utils/cnpjValidator";

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      console.log('📋 [CLIENTES] Iniciando carregamento...');
      const response = await clienteService.list();
      console.log('📋 [CLIENTES] Resposta recebida:', response);
      console.log('📋 [CLIENTES] Clientes:', response.clientes);

      // Log detalhado de cada cliente para verificar campos
      response.clientes?.forEach((cliente, index) => {
        console.log(`📋 [CLIENTE-${index}] Dados:`, {
          cliente_id: cliente.cliente_id,
          empresa_id: cliente.empresa_id,
          empresa_razao_social: cliente.empresa_razao_social,
          razao_social: cliente.razao_social,
          nome_fantasia: cliente.nome_fantasia
        });
      });

      setClientes(response.clientes || []);
      console.log('📋 [CLIENTES] Total de clientes carregados:', response.clientes?.length || 0);
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

  const getTableActions = (cliente: Cliente): TableAction[] => [
    {
      type: "edit",
      onClick: () => router.push(`/dashboard/clientes/${cliente.cliente_id}/editar`),
    },
    {
      type: "delete",
      onClick: () => handleDeleteClick(cliente),
    },
  ];

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
      <FilterSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Pesquisar por empresa, razão social, nome fantasia ou CNPJ..."
      />

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
                <TableCell sx={{ fontWeight: 600 }}>Data Cadastro</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
