'use client';

import React from 'react';
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import type { StatusNotaFiscal } from '../../types/fiscal';

interface FiltrosNotasProps {
  statusFiltro: StatusNotaFiscal | 'TODOS';
  mesFiltro: string;
  onStatusChange: (status: StatusNotaFiscal | 'TODOS') => void;
  onMesChange: (mes: string) => void;
  totalNotas: number;
}

export default function FiltrosNotas({
  statusFiltro,
  mesFiltro,
  onStatusChange,
  onMesChange,
  totalNotas,
}: FiltrosNotasProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFiltro}
            onChange={(e) => onStatusChange(e.target.value as StatusNotaFiscal | 'TODOS')}
            label="Status"
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="PENDENTE">Pendente</MenuItem>
            <MenuItem value="APROVADA">Aprovada</MenuItem>
            <MenuItem value="REPROVADA">Reprovada</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Mês de Referência"
          type="month"
          value={mesFiltro}
          onChange={(e) => onMesChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />

        <Box flex={1} />

        <Chip
          label={`${totalNotas} nota${totalNotas !== 1 ? 's' : ''}`}
          color="primary"
          variant="outlined"
        />
      </Stack>
    </Paper>
  );
}
