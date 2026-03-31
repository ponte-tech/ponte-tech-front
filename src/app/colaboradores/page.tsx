"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Avatar,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import colaboradoresService from "@/app/services/colaboradoresService";
import { ColaboradorListItem, ColaboradorStatus } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageHeader, DeleteDialog, FilterSearch, TableActionButtons, TableAction, AccessDenied } from "@/app/shared/components";
import { useTablePagination } from "@/app/shared/hooks";

const statusLabels: Record<ColaboradorStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

const statusColors: Record<ColaboradorStatus, "success" | "error"> = {
  ativo: "success",
  inativo: "error",
};

export default function ColaboradoresPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Estados
  const [colaboradores, setColaboradores] = useState<ColaboradorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ColaboradorStatus | "">("");
  const [filterCliente, setFilterCliente] = useState("");
  const [colaboradorToDelete, setColaboradorToDelete] = useState<ColaboradorListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Hook customizado de paginação
  const [pagination, paginationHandlers] = useTablePagination(10);
  const { page, rowsPerPage, totalItems } = pagination;
  const { handleChangePage, handleChangeRowsPerPage, setTotalItems } = paginationHandlers;

  const isAdmin = user?.userType === "admin";
  const isColaborador = user?.userType === "colaborador";

  const loadColaboradores = async () => {
    setLoading(true);
    try {
      const filters: any = { page: page + 1, limit: rowsPerPage };
      if (filterStatus) filters.status = filterStatus;

      const response = await colaboradoresService.list(filters);
      setColaboradores(response.colaboradores || []);
      setTotalItems(response.pagination.total_items);
    } catch (error) {
    // console.error("Erro ao carregar colaboradores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadColaboradores();
    }
  }, [page, rowsPerPage, filterStatus, isAdmin]);

  // Handlers de ações
  const handleDeleteClick = (colaborador: ColaboradorListItem) => {
    setColaboradorToDelete(colaborador);
    setDeleteError(null);
  };

  const handleReactivateClick = async (colaborador: ColaboradorListItem) => {
    try {
      await colaboradoresService.reactivate(colaborador.id);
      setSnackbarMessage("Colaborador reativado com sucesso");
      setSnackbarOpen(true);
      loadColaboradores();
    } catch (error: any) {
      setSnackbarMessage(error.message || "Erro ao reativar colaborador");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!colaboradorToDelete) return;

    try {
      await colaboradoresService.delete(colaboradorToDelete.id);

      setColaboradores(colaboradores.filter(c => c.id !== colaboradorToDelete.id));
      setColaboradorToDelete(null);
      setSnackbarMessage("Colaborador excluído com sucesso");
      setSnackbarOpen(true);

      loadColaboradores();
    } catch (error: any) {
      setDeleteError(error.message || "Erro ao excluir colaborador");
    }
  };

  const handleDeleteCancel = () => {
    setColaboradorToDelete(null);
    setDeleteError(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const filteredColaboradores = colaboradores.filter((colaborador) => {
    const matchesSearch =
      colaborador.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colaborador.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCliente = !filterCliente ||
      (colaborador.clientes && colaborador.clientes.some(cliente =>
        cliente.toLowerCase().includes(filterCliente.toLowerCase())
      ));

    return matchesSearch && matchesCliente;
  });

  // Calcular valor total de todos os colaboradores filtrados
  const valorTotalGeral = filteredColaboradores.reduce(
    (total, colaborador) => total + (colaborador.valor_total || 0),
    0
  );

  // Extrair lista única de clientes para o filtro
  const allClientes = Array.from(
    new Set(colaboradores.flatMap(c => c.clientes || []))
  ).sort();

  // Show access denied for colaborador users
  if (isColaborador) {
    return (
      <AccessDenied
        redirectTo="/minhas-horas"
        redirectLabel="Ir para Lançamento de Horas"
        message="Você não tem permissão para acessar a lista de colaboradores."
      />
    );
  }

  // Don't render for non-admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title="Colaboradores"
        description="Gerencie os colaboradores do sistema"
        actionButton={{
          label: "Novo Colaborador",
          icon: <AddIcon />,
          onClick: () => router.push("/colaboradores/novo"),
        }}
      />

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FilterSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Pesquisar por nome ou email..."
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ColaboradorStatus | "")}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Cliente"
              value={filterCliente}
              onChange={(e) => setFilterCliente(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {allClientes.map((cliente) => (
                <MenuItem key={cliente} value={cliente}>
                  {cliente}
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
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cliente(s)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>CNPJ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Valor Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredColaboradores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum colaborador encontrado
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/colaboradores/novo")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Cadastrar Primeiro Colaborador
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredColaboradores.map((colaborador) => (
                  <TableRow
                    key={colaborador.id}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={colaborador.foto_perfil_url || "/avatar.svg"}
                          alt={colaborador.nome_completo}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "transparent",
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {colaborador.nome_completo}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {colaborador.clientes && colaborador.clientes.length > 0 ? (
                        colaborador.clientes.map((cliente, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{ display: "block", lineHeight: 1.8 }}
                          >
                            {cliente}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatCNPJ(colaborador.cnpj)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{colaborador.email}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(colaborador.valor_total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusLabels[colaborador.status]}
                        color={statusColors[colaborador.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TableActionButtons
                        actions={[
                          {
                            type: "view",
                            onClick: () => router.push(`/colaboradores/${colaborador.id}`),
                          },
                          {
                            type: "edit",
                            onClick: () => router.push(`/colaboradores/${colaborador.id}/editar`),
                          },
                          // Se inativo, mostrar botão de reativar; se ativo, mostrar botão de deletar
                          colaborador.status === "inativo"
                            ? {
                                type: "reactivate" as const,
                                onClick: () => handleReactivateClick(colaborador),
                              }
                            : {
                                type: "delete" as const,
                                onClick: () => handleDeleteClick(colaborador),
                              },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Colaboradores por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            Valor Total: {formatCurrency(valorTotalGeral)}
          </Typography>
        </Box>
      </Card>

      <DeleteDialog
        open={!!colaboradorToDelete}
        itemName={colaboradorToDelete?.nome_completo || ""}
        itemType="o colaborador"
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Snackbar for feedback */}
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
