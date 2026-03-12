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
import empresaService from "@/app/services/empresaService";
import type { Empresa } from "@/app/types/empresa";
import { PageHeader, DeleteDialog, FilterSearch, TableActionButtons, TableAction } from "@/app/shared/components";
import { formatCNPJ, cleanCNPJ } from "@/app/utils/cnpjValidator";

export default function EmpresasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const response = await empresaService.list();
      setEmpresas(response.empresas || []);
    } catch (err) {
      console.error('❌ [EMPRESAS] Erro ao carregar:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao carregar empresas");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!empresaToDelete) return;

    try {
      setDeleting(true);
      await empresaService.delete(empresaToDelete.empresa_id);
      setEmpresas(empresas.filter((e) => e.empresa_id !== empresaToDelete.empresa_id));
      setDeleteDialogOpen(false);
      setEmpresaToDelete(null);
      setSnackbarMessage("Empresa excluída com sucesso!");
      setSnackbarOpen(true);
      loadEmpresas();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setDeleteError(error.response?.data?.message || "Erro ao excluir empresa");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmpresaToDelete(null);
    setDeleteError(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const filteredEmpresas = empresas.filter(
    (empresa) =>
      empresa.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.cnpj.includes(cleanCNPJ(searchTerm))
  );

  const getTableActions = (empresa: Empresa): TableAction[] => [
    {
      type: "edit",
      onClick: () => router.push(`/dashboard/empresas/${empresa.empresa_id}/editar`),
      tooltip: "Editar empresa",
    },
    {
      type: "delete",
      onClick: () => handleDeleteClick(empresa),
      tooltip: "Excluir empresa",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Empresas"
        description="Gerencie as empresas cadastradas no sistema"
        actionButton={{
          label: "Cadastrar Empresa",
          icon: <AddIcon />,
          onClick: () => router.push("/dashboard/empresas/novo"),
          visible: true,
        }}
      />

      {/* Filters */}
      <FilterSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Pesquisar por razão social, nome fantasia ou CNPJ..."
      />

      {/* Table */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
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
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredEmpresas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhuma empresa encontrada
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/dashboard/empresas/novo")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Cadastrar Primeira Empresa
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmpresas.map((empresa) => (
                  <TableRow
                    key={empresa.empresa_id}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {empresa.razao_social}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{empresa.nome_fantasia}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatCNPJ(empresa.cnpj)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(empresa.data_cadastro)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TableActionButtons actions={getTableActions(empresa)} />
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
        itemName={empresaToDelete?.nome_fantasia || ""}
        itemType="a empresa"
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
