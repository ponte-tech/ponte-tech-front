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
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Nenhuma nota fiscal enviada
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Clique em &quot;Enviar Nota Fiscal&quot; para começar
        </Typography>
      </Paper>
    );
  }

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
          {notasValidas.map((nota, index) => (
            <TableRow key={nota.nota_fiscal_id || `nota-${index}`} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {nota.nome_cliente}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {formatMesReferencia(nota.mes_referencia)}
                </Typography>
              </TableCell>

              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <PdfIcon fontSize="small" color="error" />
                  <Box>
                    <Typography variant="body2" noWrap maxWidth={200}>
                      {nota.arquivo_nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(nota.arquivo_tamanho)}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={getStatusLabel(nota.status)}
                  color={getStatusColor(nota.status)}
                  size="small"
                />
                {nota.motivo_rejeicao && (
                  <Tooltip title={nota.motivo_rejeicao}>
                    <Typography
                      variant="caption"
                      color="error"
                      display="block"
                      mt={0.5}
                      sx={{ cursor: 'help' }}
                    >
                      Ver motivo
                    </Typography>
                  </Tooltip>
                )}
              </TableCell>

              <TableCell>
                <Typography variant="body2">
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
                    >
                      <DownloadIcon fontSize="small" />
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
