'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Apontamento, StatusApontamento } from '@/app/types/timesheet';
import DeleteDialog from '@/app/shared/components/DeleteDialog';

interface DialogLancamentosDiaProps {
  open: boolean;
  onClose: () => void;
  data: string; // YYYY-MM-DD
  lancamentos: Apontamento[];
  onDelete: (apontamentoId: string) => Promise<void>;
  onAddNew: () => void;
}

const statusConfig: Record<StatusApontamento, {
  label: string;
  color: 'default' | 'primary' | 'success' | 'error' | 'warning';
}> = {
  RASCUNHO: {
    label: 'Rascunho',
    color: 'default',
  },
  SUBMETIDO: {
    label: 'Submetido',
    color: 'primary',
  },
  APROVADO: {
    label: 'Aprovado',
    color: 'success',
  },
  REPROVADO: {
    label: 'Reprovado',
    color: 'error',
  },
};

export default function DialogLancamentosDia({
  open,
  onClose,
  data,
  lancamentos,
  onDelete,
  onAddNew,
}: DialogLancamentosDiaProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [lancamentoToDelete, setLancamentoToDelete] = useState<{ id: string; nome: string; status: StatusApontamento } | null>(null);

  // Formatar data para exibição
  const formatarData = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Agrupar lançamentos por contrato
  const lancamentosPorContrato = lancamentos.reduce((acc, lanc) => {
    if (!acc[lanc.contrato_id]) {
      acc[lanc.contrato_id] = {
        nome_cliente: lanc.nome_cliente,
        lancamentos: [],
      };
    }
    acc[lanc.contrato_id].lancamentos.push(lanc);
    return acc;
  }, {} as Record<string, { nome_cliente: string; lancamentos: Apontamento[] }>);

  const handleDeleteClick = (apontamentoId: string, nomeCliente: string, status: StatusApontamento) => {
    if (status === 'APROVADO') {
      setDeleteError(`Não é possível excluir lançamentos com status "${statusConfig[status].label}"`);
      return;
    }

    setLancamentoToDelete({ id: apontamentoId, nome: nomeCliente, status });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lancamentoToDelete) return;

    try {
      setDeletingId(lancamentoToDelete.id);
      setDeleteError(null);
      await onDelete(lancamentoToDelete.id);
      setConfirmDeleteOpen(false);
      setLancamentoToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Erro ao excluir lançamento';
      setDeleteError(errorMsg);
      setConfirmDeleteOpen(false);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setLancamentoToDelete(null);
  };

  const totalHoras = lancamentos.reduce((sum, l) => sum + l.duracao_horas_ajustada, 0);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha('#8270FF', 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EventIcon sx={{ color: '#8270FF', fontSize: 28 }} />
            <Box>
              <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#8270FF' }}>
                Lançamentos do Dia
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatarData(data)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha('#8270FF', 0.1),
                color: '#8270FF',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {deleteError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
            {deleteError}
          </Alert>
        )}

        {lancamentos.length === 0 ? (
          <Box textAlign="center" py={4}>
            <EventIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum lançamento neste dia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em "Adicionar Lançamento" para criar um novo
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Resumo do Dia */}
            <Card
              elevation={0}
              sx={{
                bgcolor: alpha('#8270FF', 0.05),
                border: `1px solid ${alpha('#8270FF', 0.2)}`,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccessTimeIcon sx={{ color: '#8270FF', fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total de Horas Lançadas
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#8270FF' }}>
                      {totalHoras.toFixed(2)}h
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Lançamentos Agrupados por Contrato */}
            {Object.entries(lancamentosPorContrato).map(([contratoId, { nome_cliente, lancamentos: lancs }]) => (
              <Box key={contratoId}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  mb={2}
                  sx={{
                    bgcolor: alpha('#8270FF', 0.05),
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#8270FF', 0.15)}`,
                  }}
                >
                  <BusinessIcon sx={{ color: '#8270FF', fontSize: 22 }} />
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                      {nome_cliente}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lancs.reduce((sum, l) => sum + l.duracao_horas_ajustada, 0).toFixed(2)}h total
                    </Typography>
                  </Box>
                  <Chip
                    label={`${lancs.length} lançamento${lancs.length > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: '#8270FF',
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                <Stack spacing={2}>
                  {lancs.map((lanc) => {
                    const canDelete = lanc.status !== 'APROVADO';
                    const isDeleting = deletingId === lanc.apontamento_id;

                    return (
                      <Card
                        key={lanc.apontamento_id}
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: alpha('#8270FF', 0.3),
                            boxShadow: `0 2px 8px ${alpha('#8270FF', 0.1)}`,
                          },
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1}>
                              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                                <Chip
                                  label={statusConfig[lanc.status].label}
                                  color={statusConfig[lanc.status].color}
                                  size="small"
                                />
                                {lanc.is_atrasado && (
                                  <Chip
                                    icon={<WarningIcon />}
                                    label="Atrasado"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                              </Stack>

                              <Stack direction="row" spacing={3} mb={1}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Horário
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {lanc.hora_inicio} - {lanc.hora_fim}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Duração
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: '#8270FF' }}>
                                    {lanc.duracao_horas_ajustada.toFixed(2)}h
                                  </Typography>
                                </Box>
                              </Stack>

                              {lanc.observacao && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: alpha('#8270FF', 0.05),
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                                    Observação:
                                  </Typography>
                                  <Typography variant="body2">
                                    {lanc.observacao}
                                  </Typography>
                                </Box>
                              )}

                              {lanc.motivo_reprovacao && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                  <Typography variant="caption" display="block" fontWeight={600}>
                                    Motivo da Reprovação:
                                  </Typography>
                                  <Typography variant="body2">
                                    {lanc.motivo_reprovacao}
                                  </Typography>
                                </Alert>
                              )}

                              {lanc.warnings && lanc.warnings.length > 0 && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                  {lanc.warnings.map((warning, idx) => (
                                    <Typography key={idx} variant="body2">
                                      {warning}
                                    </Typography>
                                  ))}
                                </Alert>
                              )}
                            </Box>

                            {canDelete && (
                              <Tooltip title="Excluir lançamento" arrow>
                                <IconButton
                                  onClick={() => handleDeleteClick(lanc.apontamento_id, nome_cliente, lanc.status)}
                                  disabled={isDeleting}
                                  size="small"
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                      bgcolor: alpha('#ef4444', 0.1),
                                    },
                                  }}
                                >
                                  {isDeleting ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <DeleteOutlineIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>
          Fechar
        </Button>
        <Button
          onClick={onAddNew}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#8270FF',
            '&:hover': {
              bgcolor: alpha('#8270FF', 0.8),
            },
          }}
        >
          Adicionar Lançamento
        </Button>
      </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      {lancamentoToDelete && (
        <DeleteDialog
          open={confirmDeleteOpen}
          title="Confirmar Exclusão de Lançamento"
          itemName={`${lancamentoToDelete.nome} - ${formatarData(data)}`}
          itemType="o lançamento de"
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={deletingId !== null}
        />
      )}
    </>
  );
}
