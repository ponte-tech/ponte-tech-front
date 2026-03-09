'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  DownloadForOffline as DownloadAllIcon,
  RemoveCircle as RemovePaymentIcon,
} from '@mui/icons-material';
import JSZip from 'jszip';
import fiscalService from '@/app/services/fiscalService';
import type { NotaFiscal, StatusNotaFiscal } from '@/app/types/fiscal';

interface NotasFiscaisSectionProps {
  colaboradorId: string;
  mes: string;
}

const statusConfig: Record<StatusNotaFiscal, { label: string; color: 'default' | 'warning' | 'success' | 'error' | 'info'; icon: React.ReactNode }> = {
  PENDENTE: {
    label: 'Pendente',
    color: 'warning',
    icon: <ReceiptIcon fontSize="small" />,
  },
  APROVADA: {
    label: 'Aprovada',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
  },
  REPROVADA: {
    label: 'Reprovada',
    color: 'error',
    icon: <CancelIcon fontSize="small" />,
  },
  PAGA: {
    label: 'Paga',
    color: 'info',
    icon: <PaymentIcon fontSize="small" />,
  },
};

export default function NotasFiscaisSection({ colaboradorId, mes }: NotasFiscaisSectionProps) {
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingNotaId, setProcessingNotaId] = useState<string | null>(null);

  // Dialog de confirmação de pagamento
  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [notaParaPagar, setNotaParaPagar] = useState<NotaFiscal | null>(null);

  // Dialog de confirmação de remoção de pagamento
  const [dialogRemoverPagamento, setDialogRemoverPagamento] = useState(false);
  const [notaParaDespagar, setNotaParaDespagar] = useState<NotaFiscal | null>(null);

  useEffect(() => {
    loadNotas();
  }, [colaboradorId, mes]);

  const loadNotas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Note: Needs backend endpoint implementation
      // For now, will use existing endpoint and filter
      const data = await fiscalService.listNotasFiscaisByColaborador(colaboradorId, mes);
      setNotas(data);
    } catch (err) {
      console.error('Erro ao carregar notas fiscais:', err);
      setError('Erro ao carregar notas fiscais');
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (nota: NotaFiscal) => {
    if (nota.arquivo_url) {
      window.open(nota.arquivo_url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    // Download all invoices at once
    const notasComUrl = notas.filter(n => n.arquivo_url);

    if (notasComUrl.length === 0) {
      alert('Nenhuma nota fiscal disponível para download');
      return;
    }

    // Se houver apenas 1 nota, baixar diretamente
    if (notasComUrl.length === 1) {
      window.open(notasComUrl[0].arquivo_url, '_blank');
      return;
    }

    // Se houver mais de 1 nota, criar um ZIP
    try {
      const zip = new JSZip();

      // Baixar cada nota e adicionar ao ZIP
      for (let i = 0; i < notasComUrl.length; i++) {
        const nota = notasComUrl[i];
        if (nota.arquivo_url) {
          try {
            const response = await fetch(nota.arquivo_url);
            const blob = await response.blob();

            // Usar nome do arquivo ou gerar um nome baseado no cliente
            const fileName = nota.arquivo_nome || `${nota.nome_cliente}_${i + 1}.pdf`;
            zip.file(fileName, blob);
          } catch (err) {
            console.error(`Erro ao baixar nota ${nota.nota_fiscal_id}:`, err);
          }
        }
      }

      // Gerar o ZIP e fazer download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notas_fiscais_${mes}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao criar ZIP:', err);
      alert('Erro ao preparar download das notas fiscais');
    }
  };

  const handlePagarNota = (nota: NotaFiscal) => {
    setNotaParaPagar(nota);
    setDialogPagamento(true);
  };

  const handleRemoverPagamento = (nota: NotaFiscal) => {
    setNotaParaDespagar(nota);
    setDialogRemoverPagamento(true);
  };

  const confirmPagamento = async () => {
    if (!notaParaPagar) return;

    try {
      setProcessingNotaId(notaParaPagar.nota_fiscal_id);
      await fiscalService.marcarNotaComoPaga(notaParaPagar.nota_fiscal_id);

      // Recarregar lista
      await loadNotas();

      setDialogPagamento(false);
      setNotaParaPagar(null);
    } catch (err) {
      console.error('Erro ao marcar nota como paga:', err);
      alert('Erro ao marcar nota como paga');
    } finally {
      setProcessingNotaId(null);
    }
  };

  const confirmRemoverPagamento = async () => {
    if (!notaParaDespagar) return;

    try {
      setProcessingNotaId(notaParaDespagar.nota_fiscal_id);
      // Reverter para status PENDENTE
      await fiscalService.atualizarStatusNota(notaParaDespagar.nota_fiscal_id, 'PENDENTE');

      // Recarregar lista
      await loadNotas();

      setDialogRemoverPagamento(false);
      setNotaParaDespagar(null);
    } catch (err) {
      console.error('Erro ao remover pagamento:', err);
      alert('Erro ao remover pagamento da nota');
    } finally {
      setProcessingNotaId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600">
          Notas Fiscais ({notas.length})
        </Typography>
      </Box>

      {notas.length === 0 ? (
        <Alert severity="info">
          Nenhuma nota fiscal enviada para este período.
        </Alert>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Arquivo</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Download</strong></TableCell>
                <TableCell align="center"><strong>Pagar</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notas.map((nota) => (
                <TableRow key={nota.nota_fiscal_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {nota.nome_cliente}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(nota.data_envio)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2" noWrap maxWidth={150}>
                        {nota.arquivo_nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(nota.arquivo_tamanho)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      icon={statusConfig[nota.status].icon}
                      label={statusConfig[nota.status].label}
                      color={statusConfig[nota.status].color}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Baixar PDF">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownload(nota)}
                        disabled={!nota.arquivo_url}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    {nota.status === 'PAGA' ? (
                      <Tooltip title="Remover Pagamento">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoverPagamento(nota)}
                          disabled={processingNotaId === nota.nota_fiscal_id}
                        >
                          {processingNotaId === nota.nota_fiscal_id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <RemovePaymentIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : (nota.status === 'PENDENTE' || nota.status === 'APROVADA') ? (
                      <Tooltip title="Marcar como Paga">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePagarNota(nota)}
                          disabled={processingNotaId === nota.nota_fiscal_id}
                        >
                          {processingNotaId === nota.nota_fiscal_id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <PaymentIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Confirmação de Pagamento */}
      <Dialog open={dialogPagamento} onClose={() => setDialogPagamento(false)}>
        <DialogTitle>Marcar Nota Fiscal como Paga</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja marcar a nota fiscal de <strong>{notaParaPagar?.nome_cliente}</strong> como paga?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Esta ação confirma que o pagamento foi realizado. O status será alterado para "PAGA".
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPagamento(false)}>Cancelar</Button>
          <Button
            onClick={confirmPagamento}
            variant="contained"
            color="success"
            startIcon={<PaymentIcon />}
            disabled={processingNotaId !== null}
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Remoção de Pagamento */}
      <Dialog open={dialogRemoverPagamento} onClose={() => setDialogRemoverPagamento(false)}>
        <DialogTitle>Remover Pagamento da Nota Fiscal</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja remover o pagamento da nota fiscal de <strong>{notaParaDespagar?.nome_cliente}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação reverterá o status da nota para "PENDENTE".
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogRemoverPagamento(false)}>Cancelar</Button>
          <Button
            onClick={confirmRemoverPagamento}
            variant="contained"
            color="error"
            startIcon={<RemovePaymentIcon />}
            disabled={processingNotaId !== null}
          >
            Confirmar Remoção
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
