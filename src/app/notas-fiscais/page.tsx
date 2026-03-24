'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Snackbar,
  Skeleton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import fiscalService from '../services/fiscalService';
import type { NotaFiscal, StatusNotaFiscal } from '../types/fiscal';
import ListaNotasFiscais from './components/ListaNotasFiscais';
import UploadNotaModal from './components/UploadNotaModal';
import FiltrosNotas from './components/FiltrosNotas';

export default function NotasFiscaisPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [notasFiltradas, setNotasFiltradas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Filtros
  const [statusFiltro, setStatusFiltro] = useState<StatusNotaFiscal | 'TODOS'>('TODOS');
  const [mesFiltro, setMesFiltro] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check if user is colaborador
  const isColaborador = user?.perfil === 'colaborador' || user?.perfis?.includes('colaborador');

  // Verificar autenticação e perfil
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/notas-fiscais');
      return;
    }

    // Verificar se o perfil atual é colaborador
    if (user && !isColaborador) {
      setError('Acesso negado. Esta área é exclusiva para colaboradores.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [user, isAuthenticated, router, isColaborador]);

  // Carregar notas fiscais
  const loadNotas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fiscalService.listNotasFiscais();
      setNotas(data);
      setNotasFiltradas(data);
    } catch (err) {
      console.error('Erro ao carregar notas fiscais:', err);
      setError('Erro ao carregar notas fiscais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isColaborador) {
      loadNotas();
    }
  }, [isAuthenticated, isColaborador]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...notas];

    // Filtro de status
    if (statusFiltro !== 'TODOS') {
      filtered = filtered.filter((nota) => nota.status === statusFiltro);
    }

    // Filtro de mês
    if (mesFiltro) {
      filtered = filtered.filter((nota) => nota.mes_referencia === mesFiltro);
    }

    setNotasFiltradas(filtered);
  }, [statusFiltro, mesFiltro, notas]);

  const handleUploadSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Nota fiscal enviada com sucesso!',
      severity: 'success',
    });
    loadNotas();
  };

  const handleLimparFiltros = () => {
    setStatusFiltro('TODOS');
    setMesFiltro('');
  };

  // Show loading only if authenticated and is colaborador
  if (loading && notas.length === 0 && isAuthenticated && isColaborador) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated or not colaborador, don't show loading (redirect will handle it)
  if (!isAuthenticated || !isColaborador) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Notas Fiscais
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie suas notas fiscais enviadas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadModalOpen(true)}
          sx={{ minWidth: 200 }}
        >
          Enviar Nota Fiscal
        </Button>
      </Stack>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      {loading ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
            <Box flex={1} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 3 }} />
          </Stack>
        </Paper>
      ) : (
        <FiltrosNotas
          statusFiltro={statusFiltro}
          mesFiltro={mesFiltro}
          onStatusChange={setStatusFiltro}
          onMesChange={setMesFiltro}
          totalNotas={notasFiltradas.length}
        />
      )}

      {/* Lista de Notas */}
      <ListaNotasFiscais notas={notasFiltradas} loading={loading} />

      {/* Modal de Upload */}
      <UploadNotaModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
