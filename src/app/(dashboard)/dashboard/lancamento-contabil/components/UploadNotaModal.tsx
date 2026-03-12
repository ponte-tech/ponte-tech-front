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
  alpha,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(130, 112, 255, 0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: alpha('#FFFFFF', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Upload de Nota Fiscal
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={uploading}
          sx={{
            color: '#FFFFFF',
            '&:hover': {
              background: alpha('#FFFFFF', 0.2),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {lancamento && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                background: alpha('#8270FF', 0.05),
                border: `1px solid ${alpha('#8270FF', 0.1)}`,
              }}
            >
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
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              border: "2px dashed",
              borderColor: selectedFile ? "#10b981" : alpha("#8270FF", 0.3),
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: selectedFile ? alpha("#10b981", 0.05) : alpha("#8270FF", 0.02),
              cursor: uploading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: uploading ? alpha("#8270FF", 0.3) : "#8270FF",
                bgcolor: uploading ? alpha("#8270FF", 0.02) : alpha("#8270FF", 0.08),
                boxShadow: uploading ? "none" : `0 0 0 3px ${alpha('#8270FF', 0.1)}`,
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
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: selectedFile
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: selectedFile
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : '0 4px 12px rgba(130, 112, 255, 0.3)',
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
              </Box>
              <Typography variant="body1" gutterBottom fontWeight={600}>
                {selectedFile
                  ? selectedFile.name
                  : "Clique para selecionar o arquivo PDF"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tamanho máximo: 10MB • Formato: PDF
              </Typography>
            </Box>
          </label>
        </Box>

          {uploading && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha('#8270FF', 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Enviando arquivo...
                </Typography>
                <Typography variant="caption" fontWeight={600} color="#8270FF">
                  {uploadProgress}%
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: '1px solid',
          borderColor: alpha('#e5e7eb', 0.8),
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={uploading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            color: '#6b7280',
            '&:hover': {
              background: alpha('#6b7280', 0.1),
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
          sx={{
            background: 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
            boxShadow: '0 4px 12px rgba(130, 112, 255, 0.3)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #411EFE 0%, #8270FF 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(65, 30, 254, 0.4)',
            },
            '&:disabled': {
              background: alpha('#8270FF', 0.3),
              color: alpha('#FFFFFF', 0.5),
            },
          }}
        >
          {uploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
              <span>Enviando...</span>
            </Box>
          ) : (
            "Enviar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
