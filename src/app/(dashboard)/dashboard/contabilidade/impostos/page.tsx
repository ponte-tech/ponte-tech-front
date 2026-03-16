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
import { Add as AddIcon, AttachFile as AttachFileIcon, CloudDownload as CloudDownloadIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import impostoService from "@/app/services/impostoService";
import type { Imposto } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import { PageHeader, FilterSearch, TableActionButtons, TableAction, AccessDenied } from "@/app/shared/components";
import { useAuth } from "@/app/hooks/useAuth";

export default function ImpostosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [impostos, setImpostos] = useState<Imposto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mesReferencia, setMesReferencia] = useState(getCurrentMonth());

  const isColaborador = user?.userType === "colaborador";

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Download
  const [downloadingImpostoId, setDownloadingImpostoId] = useState<string | null>(null);

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

  const handleDownloadAnexos = async (imposto: Imposto) => {
    if (!imposto.anexos || imposto.anexos.length === 0) {
      setSnackbarMessage("Nenhum anexo disponível para download");
      setSnackbarOpen(true);
      return;
    }

    try {
      setDownloadingImpostoId(imposto.imposto_id);

      // Se houver apenas 1 anexo, fazer download direto
      if (imposto.anexos.length === 1) {
        const anexo = imposto.anexos[0];
        const response = await impostoService.getAnexoDownloadUrl(
          imposto.imposto_id,
          imposto.empresa_id,
          anexo.s3_key
        );
        window.open(response.download_url, "_blank");
        setSnackbarMessage("Download iniciado!");
        setSnackbarOpen(true);
      } else {
        // Múltiplos anexos: criar ZIP
        setSnackbarMessage(`Preparando download de ${imposto.anexos.length} arquivo(s)...`);
        setSnackbarOpen(true);

        const zip = new JSZip();

        for (const anexo of imposto.anexos) {
          try {
            const response = await impostoService.getAnexoDownloadUrl(
              imposto.imposto_id,
              imposto.empresa_id,
              anexo.s3_key
            );

            // Buscar o arquivo
            const fileResponse = await fetch(response.download_url);
            const blob = await fileResponse.blob();

            // Adicionar ao ZIP com nome que inclui tipo de imposto
            const tipoLabel = getTipoImpostoLabel(anexo.tipo_imposto || "OUTROS");
            const fileName = `${tipoLabel}_${anexo.nome_arquivo}`;
            zip.file(fileName, blob);
          } catch (err) {
            console.error("Erro ao baixar anexo:", anexo.nome_arquivo, err);
            // Continuar com os outros arquivos
          }
        }

        // Gerar ZIP e fazer download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `impostos_${imposto.mes_referencia}_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSnackbarMessage("Download concluído!");
        setSnackbarOpen(true);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbarMessage(
        error.response?.data?.message || "Erro ao fazer download dos anexos"
      );
      setSnackbarOpen(true);
    } finally {
      setDownloadingImpostoId(null);
    }
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
      HONORARIOS_CONTABEIS: "primary",
      OUTROS: "default",
    };
    return colorMap[tipo] || "default";
  };

  const filteredImpostos = impostos.filter(
    (imposto) =>
      imposto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imposto.tipo_imposto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTableActions = (imposto: Imposto): TableAction[] => {
    const actions: TableAction[] = [
      {
        type: "view",
        onClick: () => router.push(`/dashboard/contabilidade/impostos/${imposto.imposto_id}?empresa_id=${imposto.empresa_id}`),
        tooltip: "Ver detalhes",
      },
    ];

    // Adicionar download se houver anexos
    if (imposto.anexos && imposto.anexos.length > 0) {
      actions.push({
        type: "download",
        onClick: () => handleDownloadAnexos(imposto),
        tooltip: "Baixar anexos",
      });
    }

    return actions;
  };

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

  // Bloquear acesso para colaboradores
  if (isColaborador) {
    return <AccessDenied />;
  }

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
                    onClick={() => router.push(`/dashboard/contabilidade/impostos/${imposto.imposto_id}?empresa_id=${imposto.empresa_id}`)}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa", cursor: "pointer" },
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {imposto.anexos && imposto.anexos.length > 0 ? (
                        <Chip
                          icon={downloadingImpostoId === imposto.imposto_id ? <CircularProgress size={16} /> : <CloudDownloadIcon />}
                          label={`${imposto.anexos.length} arquivo(s)`}
                          size="small"
                          variant="outlined"
                          onClick={() => handleDownloadAnexos(imposto)}
                          disabled={downloadingImpostoId === imposto.imposto_id}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "primary.50",
                              borderColor: "primary.main",
                            },
                          }}
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
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <TableActionButtons actions={getTableActions(imposto)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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
