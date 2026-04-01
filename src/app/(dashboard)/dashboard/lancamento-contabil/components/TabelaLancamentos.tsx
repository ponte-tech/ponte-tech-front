import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
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
  const [observacaoModal, setObservacaoModal] = useState<{
    open: boolean;
    lancamento: LancamentoContabil | null;
  }>({ open: false, lancamento: null });

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
            <TableCell sx={{ fontWeight: 600 }}>CNPJ Cliente</TableCell>
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

                <TableCell>
                  <Typography variant="body2">
                    {formatCNPJ(lancamento.cliente_cnpj)}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">
                    {formatValor(lancamento.valor_nota_fiscal)}
                  </Typography>
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

                {!readOnly && (
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title={lancamento.observacao ? "Ver Observação" : "Sem observação"}>
                        <span>
                          <IconButton
                            size="small"
                            color={lancamento.observacao ? "primary" : "default"}
                            onClick={() =>
                              setObservacaoModal({ open: true, lancamento })
                            }
                            disabled={!lancamento.observacao}
                          >
                            <DescriptionIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {onDeleteClick && (
                        <Tooltip title="Deletar Lançamento">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeleteClick(lancamento)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Modal de Observação */}
      <Dialog
        open={observacaoModal.open}
        onClose={() => setObservacaoModal({ open: false, lancamento: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Observação do Lançamento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
            {observacaoModal.lancamento?.observacao || "Sem observação"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setObservacaoModal({ open: false, lancamento: null })}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}
