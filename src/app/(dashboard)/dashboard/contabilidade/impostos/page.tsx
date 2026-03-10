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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { Add as AddIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import impostoService from "@/app/services/impostoService";
import type { Imposto } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import { PageHeader, DeleteDialog, FilterSearch, TableActionButtons, TableAction } from "@/app/shared/components";

export default function ImpostosPage() {
  const router = useRouter();
  const [impostos, setImpostos] = useState<Imposto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mesReferencia, setMesReferencia] = useState(getCurrentMonth());

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [impostoToDelete, setImpostoToDelete] = useState<Imposto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadImpostos();
  }, [mesReferencia]);

  function getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  const loadImpostos = async () => {
    try {
      setLoading(true);
      const response = await impostoService.list(mesReferencia);
      setImpostos(response.impostos || []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(error.response?.data?.message || "Erro ao carregar impostos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (imposto: Imposto) => {
    setImpostoToDelete(imposto);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!impostoToDelete) return;

    try {
      setDeleting(true);
      await impostoService.delete(impostoToDelete.imposto_id);
      setImpostos(impostos.filter((i) => i.imposto_id !== impostoToDelete.imposto_id));
      setDeleteDialogOpen(false);
      setImpostoToDelete(null);
      setSnackbarMessage("Imposto excluído com sucesso!");
      setSnackbarOpen(true);
      loadImpostos();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setDeleteError(error.response?.data?.message || "Erro ao excluir imposto");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setImpostoToDelete(null);
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

  const formatMesReferencia = (mesRef: string): string => {
    const [year, month] = mesRef.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const getTipoImpostoLabel = (tipo: string): string => {
    const tipoObj = TIPOS_IMPOSTO.find((t) => t.value === tipo);
    return tipoObj?.label || tipo;
  };

  const getColorForTipo = (tipo: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      IRPJ: "primary",
      CSLL: "secondary",
      PIS: "info",
      COFINS: "info",
      ISS: "success",
      ICMS: "warning",
      IPI: "warning",
      INSS: "error",
      FGTS: "error",
      SIMPLES_NACIONAL: "success",
      OUTROS: "default",
    };
    return colorMap[tipo] || "default";
  };

  const filteredImpostos = impostos.filter(
    (imposto) =>
      imposto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imposto.tipo_imposto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTableActions = (imposto: Imposto): TableAction[] => [
    {
      type: "edit",
      onClick: () => router.push(`/dashboard/contabilidade/impostos/${imposto.imposto_id}/editar`),
      tooltip: "Editar imposto",
    },
    {
      type: "delete",
      onClick: () => handleDeleteClick(imposto),
      tooltip: "Excluir imposto",
    },
  ];

  // Gerar lista de meses para o select (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      options.push({ value, label });
    }
    return options;
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Lançamento de Impostos"
        description="Gerencie os impostos cadastrados por empresa e período"
        actionButton={{
          label: "Cadastrar Imposto",
          icon: <AddIcon />,
          onClick: () => router.push("/dashboard/contabilidade/impostos/novo"),
          visible: true,
        }}
      />

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Mês de Referência</InputLabel>
          <Select
            value={mesReferencia}
            label="Mês de Referência"
            onChange={(e) => setMesReferencia(e.target.value)}
          >
            {generateMonthOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }}>
          <FilterSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Pesquisar por descrição ou tipo de imposto..."
          />
        </Box>
      </Box>

      {/* Table */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo de Imposto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mês Referência</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Anexos</TableCell>
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
              ) : filteredImpostos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum imposto encontrado para este período
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/dashboard/contabilidade/impostos/novo")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Cadastrar Primeiro Imposto
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredImpostos.map((imposto) => (
                  <TableRow
                    key={imposto.imposto_id}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {imposto.descricao}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTipoImpostoLabel(imposto.tipo_imposto)}
                        color={getColorForTipo(imposto.tipo_imposto)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatMesReferencia(imposto.mes_referencia)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(imposto.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {imposto.anexos && imposto.anexos.length > 0 ? (
                        <Chip
                          icon={<AttachFileIcon />}
                          label={`${imposto.anexos.length} arquivo(s)`}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(imposto.data_cadastro)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TableActionButtons actions={getTableActions(imposto)} />
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
        itemName={impostoToDelete?.descricao || ""}
        itemType="o imposto"
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
