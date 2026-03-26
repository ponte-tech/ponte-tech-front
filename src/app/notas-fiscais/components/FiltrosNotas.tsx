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
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        background: '#ffffff',
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        boxShadow: '0 1px 3px rgba(100, 116, 139, 0.06)',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                borderColor: 'rgba(226, 232, 240, 0.8)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(130, 112, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8270FF',
                borderWidth: '2px',
              },
            },
          }}
        >
          <InputLabel sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Status</InputLabel>
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
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                borderColor: 'rgba(226, 232, 240, 0.8)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(130, 112, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8270FF',
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 500,
              fontSize: '0.875rem',
            },
          }}
        />

        <Box flex={1} />

        <Chip
          label={`${totalNotas} nota${totalNotas !== 1 ? 's' : ''}`}
          sx={{
            height: 32,
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: 2,
            background: 'rgba(130, 112, 255, 0.08)',
            color: '#8270FF',
            border: '1px solid rgba(130, 112, 255, 0.2)',
          }}
        />
      </Stack>
    </Paper>
  );
}
