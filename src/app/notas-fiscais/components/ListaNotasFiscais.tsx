'use client';

import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  Description as PdfIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import type { NotaFiscal, StatusNotaFiscal } from '../../types/fiscal';

interface ListaNotasFiscaisProps {
  notas: NotaFiscal[];
  loading?: boolean;
}

const getStatusColor = (status: StatusNotaFiscal) => {
  switch (status) {
    case 'APROVADA':
      return 'success';
    case 'REPROVADA':
      return 'error';
    case 'PENDENTE':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: StatusNotaFiscal) => {
  switch (status) {
    case 'APROVADA':
      return 'Aprovada';
    case 'REPROVADA':
      return 'Reprovada';
    case 'PENDENTE':
      return 'Pendente';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatMesReferencia = (mesRef: string) => {
  const [year, month] = mesRef.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${monthNames[parseInt(month) - 1]}/${year}`;
};

const formatFileSize = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

export default function ListaNotasFiscais({ notas, loading }: ListaNotasFiscaisProps) {
  const handleDownload = (nota: NotaFiscal) => {
    if (nota.arquivo_url) {
      window.open(nota.arquivo_url, '_blank');
    }
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Mês Referência</TableCell>
              <TableCell>Arquivo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data Envio</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton variant="text" width="80%" height={20} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="60%" height={20} />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 3 }} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="70%" height={20} />
                </TableCell>
                <TableCell align="center">
                  <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Filtrar notas válidas (com ID)
  const notasValidas = notas.filter((nota) => nota.nota_fiscal_id);

  if (notasValidas.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          background: '#ffffff',
          border: '1px solid',
          borderColor: 'rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px rgba(100, 116, 139, 0.06)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#64748b',
            fontWeight: 600,
            fontSize: '1.125rem',
            mb: 1,
          }}
        >
          Nenhuma nota fiscal enviada
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#94a3b8',
            fontSize: '0.938rem',
          }}
        >
          Clique em &quot;Enviar Nota Fiscal&quot; para começar
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        background: '#ffffff',
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        boxShadow: '0 1px 3px rgba(100, 116, 139, 0.06)',
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              background: 'rgba(248, 250, 252, 0.8)',
              borderBottom: '2px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mês Referência</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Arquivo</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Envio</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notasValidas.map((nota, index) => (
            <TableRow
              key={nota.nota_fiscal_id || `nota-${index}`}
              sx={{
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(130, 112, 255, 0.03)',
                  transform: 'scale(1.001)',
                },
              }}
            >
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#0f172a',
                  }}
                >
                  {nota.nome_cliente}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                  }}
                >
                  {formatMesReferencia(nota.mes_referencia)}
                </Typography>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PdfIcon sx={{ fontSize: '1.125rem', color: '#ef4444' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      noWrap
                      maxWidth={200}
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#0f172a',
                      }}
                    >
                      {nota.arquivo_nome}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatFileSize(nota.arquivo_tamanho)}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={getStatusLabel(nota.status)}
                  sx={{
                    height: 28,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: 1.5,
                    ...(nota.status === 'APROVADA' && {
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                    }),
                    ...(nota.status === 'REPROVADA' && {
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                    }),
                    ...(nota.status === 'PENDENTE' && {
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                    }),
                  }}
                />
                {nota.motivo_rejeicao && (
                  <Tooltip title={nota.motivo_rejeicao}>
                    <Typography
                      variant="caption"
                      display="block"
                      mt={0.5}
                      sx={{
                        cursor: 'help',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Ver motivo
                    </Typography>
                  </Tooltip>
                )}
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                  }}
                >
                  {formatDate(nota.data_envio)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Tooltip title={nota.arquivo_url ? "Baixar PDF" : "Arquivo não disponível"}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(nota)}
                      disabled={!nota.arquivo_url}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: 'rgba(130, 112, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          opacity: 0.4,
                        },
                      }}
                    >
                      <DownloadIcon sx={{ fontSize: '1.125rem', color: '#8270FF' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
