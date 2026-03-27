import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Box,
  Tooltip,
  TableFooter,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { LancamentoContabil } from "@/app/types/lancamentoContabil";
import { formatCNPJ } from "@/app/utils/cnpjValidator";

interface TabelaLancamentosProps {
  lancamentos: LancamentoContabil[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onUploadClick: (lancamento: LancamentoContabil) => void;
  onDownloadClick: (lancamento: LancamentoContabil) => void;
  onDeleteClick?: (lancamento: LancamentoContabil) => void;
  onValorChange?: (lancamentoId: string, valor: number) => void;
  readOnly?: boolean;
}

export default function TabelaLancamentos({
  lancamentos,
  loading,
  selectedIds,
  onSelectionChange,
  onUploadClick,
  onDownloadClick,
  onDeleteClick,
  onValorChange,
  readOnly = false,
}: TabelaLancamentosProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValor, setEditingValor] = useState<string>("");

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = lancamentos.map((l) => l.lancamento_id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (lancamentoId: string) => {
    const currentIndex = selectedIds.indexOf(lancamentoId);
    const newSelected = [...selectedIds];

    if (currentIndex === -1) {
      newSelected.push(lancamentoId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onSelectionChange(newSelected);
  };

  const handleEditValor = (lancamento: LancamentoContabil) => {
    setEditingId(lancamento.lancamento_id);
    setEditingValor(
      lancamento.valor_nota_fiscal?.toFixed(2).replace(".", ",") || ""
    );
  };

  const handleSaveValor = (lancamentoId: string) => {
    const valor = parseFloat(editingValor.replace(",", "."));
    if (!isNaN(valor) && valor > 0) {
      onValorChange(lancamentoId, valor);
    }
    setEditingId(null);
    setEditingValor("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValor("");
  };

  const formatValor = (valor?: number): string => {
    if (!valor) return "-";
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const isSelected = (id: string) => selectedIds.indexOf(id) !== -1;
  const isAllSelected =
    lancamentos.length > 0 && selectedIds.length === lancamentos.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  // Calcular o valor total de todos os lançamentos
  const valorTotal = useMemo(() => {
    return lancamentos.reduce((acc, lancamento) => {
      return acc + (lancamento.valor_nota_fiscal || 0);
    }, 0);
  }, [lancamentos]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (lancamentos.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum lançamento encontrado para este mês
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8f9fa" }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={isSomeSelected}
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Razão Social Empresa</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>CNPJ Empresa</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Razão Social Cliente</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Nome Fantasia Cliente</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">
              Valor NF
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Emitir NF?
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Upload NF
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">
              Download NF
            </TableCell>
            {!readOnly && (
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Ações
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {lancamentos.map((lancamento) => {
            const isItemSelected = isSelected(lancamento.lancamento_id);
            const isEditing = editingId === lancamento.lancamento_id;
            const temNotaFiscal = !!lancamento.nota_fiscal_id;

            return (
              <TableRow
                key={lancamento.lancamento_id}
                hover
                selected={isItemSelected}
                sx={{
                  "&:hover": { bgcolor: "#f8f9fa" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isItemSelected}
                    onChange={() => handleSelectOne(lancamento.lancamento_id)}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {lancamento.empresa_razao_social}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatCNPJ(lancamento.empresa_cnpj)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {lancamento.cliente_razao_social}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {lancamento.cliente_nome_fantasia}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {isEditing && !readOnly ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        size="small"
                        value={editingValor}
                        onChange={(e) => setEditingValor(e.target.value)}
                        placeholder="0,00"
                        sx={{ width: 120 }}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSaveValor(lancamento.lancamento_id);
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleSaveValor(lancamento.lancamento_id)}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleCancelEdit}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      onClick={!readOnly && onValorChange ? () => handleEditValor(lancamento) : undefined}
                      sx={{
                        cursor: !readOnly && onValorChange ? "pointer" : "default",
                        "&:hover": !readOnly && onValorChange ? { textDecoration: "underline" } : {},
                      }}
                    >
                      {formatValor(lancamento.valor_nota_fiscal)}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={lancamento.emitir_nota_fiscal ? "Sim" : "Não"}
                    size="small"
                    color={lancamento.emitir_nota_fiscal ? "success" : "default"}
                    sx={{
                      fontWeight: 600,
                      minWidth: 60,
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  {lancamento.emitir_nota_fiscal ? (
                    <>
                      <Tooltip title="Upload de Nota Fiscal">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onUploadClick(lancamento)}
                        >
                          <UploadIcon />
                        </IconButton>
                      </Tooltip>
                      {temNotaFiscal && (
                        <Chip
                          label="OK"
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  {lancamento.emitir_nota_fiscal && temNotaFiscal ? (
                    <Tooltip title="Download de Nota Fiscal">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => onDownloadClick(lancamento)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                {!readOnly && onDeleteClick && (
                  <TableCell align="center">
                    <Tooltip title="Deletar Lançamento">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteClick(lancamento)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>
              Total
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#f8f9fa", color: "#8270FF", fontSize: "1rem" }}>
              {formatValor(valorTotal)}
            </TableCell>
            <TableCell colSpan={readOnly ? 3 : 4} sx={{ bgcolor: "#f8f9fa" }} />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
