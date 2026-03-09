'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as PdfIcon,
} from '@mui/icons-material';
import timesheetService from '../../services/timesheetService';
import fiscalService from '../../services/fiscalService';
import type { Contrato } from '../../types/timesheet';

interface UploadNotaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadNotaModal({ open, onClose, onSuccess }: UploadNotaModalProps) {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoId, setContratoId] = useState('');
  const [mesReferencia, setMesReferencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadContratos = async () => {
      try {
        const data = await timesheetService.getContratos();
        setContratos(data);
      } catch (err) {
        console.error('Erro ao carregar contratos:', err);
      }
    };

    if (open) {
      loadContratos();
    }
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validar se é PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são permitidos');
      setFile(null);
      return;
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    // Prevenir submissões duplicadas
    if (isSubmitting || loading) {
      return;
    }

    if (!contratoId || !mesReferencia || !file) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      setError(null);
      setUploadProgress(10);

      // 1. Iniciar upload e obter presigned URL
      const initiateResponse = await fiscalService.initiateUpload({
        contrato_id: contratoId,
        mes_referencia: mesReferencia,
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
      });

      setUploadProgress(30);

      // 2. Upload do arquivo para S3
      await fiscalService.uploadFileToS3(initiateResponse.upload_url, file);

      setUploadProgress(100);

      // Sucesso
      onSuccess();
      handleClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao fazer upload da nota fiscal');
      setUploadProgress(0);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContratoId('');
      setFile(null);
      setError(null);
      setUploadProgress(0);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enviar Nota Fiscal</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth required>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={contratoId}
              onChange={(e) => setContratoId(e.target.value)}
              label="Cliente"
              disabled={loading}
            >
              {contratos.map((contrato) => (
                <MenuItem key={contrato.contrato_id} value={contrato.contrato_id}>
                  {contrato.nome_cliente}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            label="Mês de Referência"
            type="month"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />

          <Box>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="upload-nota-fiscal"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="upload-nota-fiscal">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<UploadIcon />}
                disabled={loading}
              >
                {file ? 'Alterar Arquivo' : 'Selecionar PDF'}
              </Button>
            </label>

            {file && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <PdfIcon color="error" />
                <Box flex={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Enviando... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !contratoId || !mesReferencia || !file}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
