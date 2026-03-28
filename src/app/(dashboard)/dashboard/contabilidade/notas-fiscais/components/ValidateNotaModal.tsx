"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  alpha,
  Stack,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AutoAwesome as AutoAwesomeIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
} from "@mui/icons-material";
import awsDocumentExtractionService, { type ExtractionResult } from "@/app/services/awsDocumentExtractionService";
import fiscalService from "@/app/services/fiscalService";
import type { NotaFiscalComColaborador } from "@/app/types/fiscal";

interface ValidateNotaModalProps {
  open: boolean;
  nota: NotaFiscalComColaborador | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ValidateNotaModal({
  open,
  nota,
  onClose,
  onSuccess,
}: ValidateNotaModalProps) {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && nota) {
      validateNota();
    } else {
      // Reset quando fechar
      setValidationResult(null);
      setError(null);
    }
  }, [open, nota]);

  const validateNota = async () => {
    if (!nota) return;

    try {
      setValidating(true);
      setError(null);

    // console.log("🔍 [ValidateModal] Baixando e validando nota fiscal:", nota.nota_fiscal_id);

      // 1. Baixar o arquivo da nota fiscal
      const blob = await fiscalService.downloadNotaFiscal(nota.nota_fiscal_id);

      // 2. Converter blob para File
      const file = new File([blob], nota.arquivo_nome, { type: "application/pdf" });

      // console.log("📄 [ValidateModal] Arquivo baixado:", {
      //   nome: file.name,
      //   tamanho: file.size,
      //   tipo: file.type,
      // });

      // 3. Extrair e validar com IA
      // TODO: Obter valor esperado do contrato associado
      const result = await awsDocumentExtractionService.extractValueFromDocument(file, {
        // expectedValor: nota.valor_contrato, // TODO: Adicionar ao tipo NotaFiscalComColaborador
        colaboradorCNPJ: nota.empresa_cnpj, // CNPJ do colaborador como emitente
        // empresaCNPJ: nota.empresa_cnpj_destinatario, // TODO: CNPJ da empresa como destinatário
      });

      setValidationResult(result);

      if (result.error) {
        setError(result.error);
      }

    // console.log("✅ [ValidateModal] Validação concluída:", result);
    } catch (err) {
    // console.error("❌ [ValidateModal] Erro ao validar:", err);
      setError("Erro ao validar nota fiscal. Por favor, tente novamente.");
    } finally {
      setValidating(false);
    }
  };

  const handleDownload = async () => {
    if (!nota) return;

    try {
      const blob = await fiscalService.downloadNotaFiscal(nota.nota_fiscal_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nota.arquivo_nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
    // console.error("Erro ao baixar nota:", err);
      setError("Erro ao baixar nota fiscal");
    }
  };

  const handleApprove = async () => {
    if (!nota) return;

    try {
      setProcessing(true);
      await fiscalService.atualizarStatusNota(nota.nota_fiscal_id, {
        status: "APROVADA",
      });
      onSuccess();
      onClose();
    } catch (err) {
    // console.error("Erro ao aprovar nota:", err);
      setError("Erro ao aprovar nota fiscal");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!nota) return;

    try {
      setProcessing(true);
      await fiscalService.atualizarStatusNota(nota.nota_fiscal_id, {
        status: "REPROVADA",
        motivo_rejeicao: validationResult?.validations
          ? Object.entries(validationResult.validations)
              .filter(([key, value]) => key.includes("_message") && value)
              .map(([_, msg]) => msg)
              .join("; ")
          : "Dados não correspondem ao esperado",
      });
      onSuccess();
      onClose();
    } catch (err) {
    // console.error("Erro ao reprovar nota:", err);
      setError("Erro ao reprovar nota fiscal");
    } finally {
      setProcessing(false);
    }
  };

  if (!nota) return null;

  return (
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
          bgcolor: alpha("#8270FF", 0.05),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#8270FF" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#8270FF" }}>
            Validação Automática com IA
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Stack spacing={3}>
          {/* Informações da Nota */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: alpha("#8270FF", 0.05),
              border: `1px solid ${alpha("#8270FF", 0.1)}`,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Nota Fiscal
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Colaborador:</strong> {nota.colaborador_nome}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Cliente:</strong> {nota.nome_cliente}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Empresa:</strong> {nota.empresa_nome || "-"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Arquivo:</strong> {nota.arquivo_nome}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Validação em progresso */}
          {validating && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <CircularProgress size={24} sx={{ color: "#8270FF" }} />
                <AutoAwesomeIcon sx={{ fontSize: 24, color: "#8270FF", animation: "pulse 2s infinite" }} />
                <Typography variant="body1" color="text.secondary">
                  Analisando nota fiscal com IA...
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Resultado da validação */}
          {!validating && validationResult && (
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                background: validationResult.validations?.all_valid
                  ? alpha("#10b981", 0.05)
                  : alpha("#f59e0b", 0.05),
                border: `2px solid ${
                  validationResult.validations?.all_valid
                    ? alpha("#10b981", 0.3)
                    : alpha("#f59e0b", 0.3)
                }`,
              }}
            >
              <Stack spacing={2.5}>
                {/* Header com status */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {validationResult.validations?.all_valid ? (
                    <CheckCircleIcon sx={{ fontSize: 32, color: "#10b981" }} />
                  ) : (
                    <WarningIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {validationResult.validations?.all_valid
                        ? "✅ Validação Aprovada"
                        : "⚠️ Atenção Necessária"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {validationResult.validations?.all_valid
                        ? "Todos os dados estão corretos"
                        : "Foram encontradas inconsistências"}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Detalhes da validação */}
                <Stack spacing={2}>
                  {/* Valor */}
                  {validationResult.valor !== null && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: validationResult.validations?.valor_match
                          ? alpha("#10b981", 0.1)
                          : alpha("#f59e0b", 0.1),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Valor da Nota Fiscal
                      </Typography>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        R$ {validationResult.valor.toFixed(2)}
                      </Typography>
                      {validationResult.validations?.valor_message && (
                        <Typography
                          variant="body2"
                          color={validationResult.validations.valor_match ? "success.main" : "warning.main"}
                        >
                          {validationResult.validations.valor_message}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* CNPJ Emitente */}
                  {validationResult.cnpj_emitente && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: validationResult.validations?.cnpj_emitente_match
                          ? alpha("#10b981", 0.1)
                          : alpha("#f59e0b", 0.1),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        CNPJ do Colaborador (Emitente)
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace" fontWeight={600} gutterBottom>
                        {validationResult.cnpj_emitente}
                      </Typography>
                      {validationResult.validations?.cnpj_emitente_message && (
                        <Typography
                          variant="body2"
                          color={validationResult.validations.cnpj_emitente_match ? "success.main" : "error.main"}
                        >
                          {validationResult.validations.cnpj_emitente_message}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* CNPJ Destinatário */}
                  {validationResult.cnpj_destinatario && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: validationResult.validations?.cnpj_destinatario_match
                          ? alpha("#10b981", 0.1)
                          : alpha("#f59e0b", 0.1),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        CNPJ da Empresa (Destinatário)
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace" fontWeight={600} gutterBottom>
                        {validationResult.cnpj_destinatario}
                      </Typography>
                      {validationResult.validations?.cnpj_destinatario_message && (
                        <Typography
                          variant="body2"
                          color={validationResult.validations.cnpj_destinatario_match ? "success.main" : "error.main"}
                        >
                          {validationResult.validations.cnpj_destinatario_message}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>

                <Divider />

                {/* Footer com badges */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip
                    icon={<AutoAwesomeIcon />}
                    label="AWS Textract"
                    size="small"
                    sx={{
                      bgcolor: alpha("#8270FF", 0.1),
                      color: "#8270FF",
                      fontWeight: 600,
                    }}
                  />
                  {validationResult.confidence > 0 && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Confiança: {validationResult.confidence}%
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: "divider", gap: 1 }}>
        <Tooltip title="Baixar nota fiscal">
          <Button
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            variant="outlined"
            sx={{ borderColor: "#8270FF", color: "#8270FF" }}
          >
            Baixar
          </Button>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <Button
          onClick={onClose}
          disabled={processing}
          variant="outlined"
        >
          Cancelar
        </Button>

        {nota.status === "PENDENTE" && (
          <>
            <Button
              onClick={handleReject}
              disabled={processing || validating}
              startIcon={processing ? <CircularProgress size={16} /> : <RejectIcon />}
              variant="outlined"
              color="error"
            >
              Reprovar
            </Button>

            <Button
              onClick={handleApprove}
              disabled={processing || validating}
              startIcon={processing ? <CircularProgress size={16} /> : <ApproveIcon />}
              variant="contained"
              sx={{
                bgcolor: validationResult?.validations?.all_valid ? "#10b981" : "#8270FF",
                "&:hover": {
                  bgcolor: validationResult?.validations?.all_valid ? "#059669" : "#6C5CE7",
                },
              }}
            >
              {validationResult?.validations?.all_valid ? "Aprovar ✓" : "Aprovar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
