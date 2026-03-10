import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import lancamentoContabilService from "@/app/services/lancamentoContabilService";
import type { LancamentoContabil } from "@/app/types/lancamentoContabil";

interface UploadNotaModalProps {
  open: boolean;
  lancamento: LancamentoContabil | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadNotaModal({
  open,
  lancamento,
  onClose,
  onSuccess,
}: UploadNotaModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = lancamentoContabilService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Arquivo inválido");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !lancamento) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // 1. Iniciar upload e obter presigned URL
      const uploadData = await lancamentoContabilService.initiateUpload({
        lancamento_id: lancamento.lancamento_id,
        mes_referencia: lancamento.mes_referencia,
        arquivo_nome: selectedFile.name,
        arquivo_tamanho: selectedFile.size,
      });

      setUploadProgress(50);

      // 2. Upload do arquivo para S3
      await lancamentoContabilService.uploadFileToS3(
        uploadData.upload_url,
        selectedFile
      );

      setUploadProgress(100);

      // Aguardar um pouco para mostrar 100%
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 500);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Erro ao fazer upload da nota fiscal"
      );
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setError(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload de Nota Fiscal</DialogTitle>
      <DialogContent>
        {lancamento && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Cliente:</strong> {lancamento.cliente_nome_fantasia}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Mês Referência:</strong>{" "}
              {new Date(lancamento.mes_referencia + "-01").toLocaleDateString(
                "pt-BR",
                { month: "long", year: "numeric" }
              )}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            border: "2px dashed",
            borderColor: selectedFile ? "success.main" : "grey.300",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: selectedFile ? "success.50" : "grey.50",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            "&:hover": {
              borderColor: uploading ? "grey.300" : "primary.main",
              bgcolor: uploading ? "grey.50" : "primary.50",
            },
          }}
        >
          <input
            accept="application/pdf"
            style={{ display: "none" }}
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              <CloudUploadIcon
                sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
              />
              <Typography variant="body1" gutterBottom>
                {selectedFile
                  ? selectedFile.name
                  : "Clique para selecionar o arquivo PDF"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tamanho máximo: 10MB
              </Typography>
            </Box>
          </label>
        </Box>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Enviando... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Enviando..." : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
