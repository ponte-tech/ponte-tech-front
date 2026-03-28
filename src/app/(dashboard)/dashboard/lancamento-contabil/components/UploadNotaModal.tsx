import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  alpha,
  CircularProgress,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Warning as WarningIcon,
  Description as PdfIcon,
} from "@mui/icons-material";
import lancamentoContabilService from "@/app/services/lancamentoContabilService";
import awsDocumentExtractionService, { type ExtractionResult } from "@/app/services/awsDocumentExtractionService";
import { useAuth } from "@/app/hooks/useAuth";
import type { LancamentoContabil } from "@/app/types/lancamentoContabil";
import { formatCNPJ } from "@/app/utils/cnpjValidator";

interface UploadNotaModalProps {
  open: boolean;
  lancamento: LancamentoContabil | null;
  onClose: () => void;
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export default function UploadNotaModal({
  open,
  lancamento,
  onClose,
  onSuccess,
  onError,
}: UploadNotaModalProps) {
  const { user } = useAuth();

  // Wizard step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Confirmar Dados', 'Upload da Nota', 'Revisão'];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Estados da validação IA
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ExtractionResult | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setValidationResult(null);
    setShowValidationDetails(false);

    // Iniciar validação automática com IA
    if (lancamento && user) {
      await validateNotaFiscal(file);
    }
  };

  const validateNotaFiscal = async (file: File) => {
    try {
      setValidating(true);
      setError(null);
      setValidationResult(null);
      setShowValidationDetails(false);

      console.log("🔍 [UploadModal - Lançamento Contábil] Iniciando validação da nota fiscal");
      console.log("📊 [UploadModal] Dados para validação:", {
        valorEsperado: lancamento?.valor_nota_fiscal,
        clienteCNPJ_tomador: lancamento?.cliente_cnpj, // CNPJ do Cliente (Tomador do Serviço)
        empresaCNPJ_emitente: lancamento?.empresa_cnpj, // CNPJ da Empresa (Emitente)
      });

      // Validar com os CNPJs corretos:
      // - Cliente CNPJ como Destinatário (Tomador do Serviço)
      // - Empresa CNPJ como Emitente (Prestador do Serviço)
      const result = await awsDocumentExtractionService.extractValueFromDocument(file, {
        expectedValor: lancamento?.valor_nota_fiscal,
        colaboradorCNPJ: lancamento?.empresa_cnpj, // Empresa emite a nota (emitente)
        empresaCNPJ: lancamento?.cliente_cnpj, // Cliente recebe o serviço (tomador/destinatário)
      });

      setValidationResult(result);
      setShowValidationDetails(true);

      if (result.error) {
        console.warn("⚠️ [UploadModal] Erro na validação:", result.error);
      } else if (result.validations) {
        if (result.validations.all_valid) {
          console.log("✅ [UploadModal] Validação passou!");
        } else {
          console.warn("❌ [UploadModal] Validação falhou:", result.validations);
        }
      }
    } catch (err) {
      console.error("❌ [UploadModal] Erro ao validar:", err);

      const errorMessage = err instanceof Error ? err.message : String(err);
      let userMessage = "";

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NETWORK')) {
        userMessage = "❌ Erro de rede ao processar o documento. Por favor, tente fazer o upload novamente.";
      } else {
        userMessage = "❌ Erro ao validar nota fiscal com IA. Por favor, tente fazer o upload novamente.";
      }

      // Notificar o erro ao componente pai e fechar o modal
      if (onError) {
        onError(userMessage);
      }

      // Fechar o modal
      onClose();
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !lancamento) return;

    // Verificar se passou nas validações (se houver validações)
    if (validationResult?.validations && !validationResult.validations.can_proceed) {
      setError("Não é possível enviar a nota fiscal. Por favor, corrija os problemas identificados.");
      return;
    }

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

  const handleNext = () => {
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    if (!uploading && !validating) {
      setActiveStep(0);
      setSelectedFile(null);
      setError(null);
      setUploadProgress(0);
      setValidationResult(null);
      setShowValidationDetails(false);
      onClose();
    }
  };

  // Validação para habilitar botão "Próximo"
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Step 1: Confirmar dados
        return lancamento !== null;
      case 1: // Step 2: Upload
        return selectedFile !== null && validationResult !== null && !validating;
      case 2: // Step 3: Revisão - Exige que TODAS validações passem
        // Só permite enviar se:
        // 1. Temos resultado de validação
        // 2. Não há erros
        // 3. TODAS as validações (valor, CNPJs) estão corretas
        return (
          validationResult !== null &&
          !validationResult.error &&
          validationResult.validations?.all_valid === true &&
          validationResult.validations?.valor_match === true &&
          validationResult.validations?.cnpj_emitente_match === true &&
          validationResult.validations?.cnpj_destinatario_match === true
        );
      default:
        return false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      {/* Header Moderno com Step Indicator */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 28 }} />
          Upload de Nota Fiscal
        </Typography>

        {/* Step Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {steps.map((label, index) => (
            <React.Fragment key={label}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: activeStep >= index
                      ? '#FFFFFF'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: activeStep >= index ? '#8270FF' : 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {activeStep > index ? '✓' : index + 1}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: activeStep >= index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: activeStep === index ? 700 : 500,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {label}
                </Typography>
              </Box>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 40,
                    height: 2,
                    background: activeStep > index
                      ? '#FFFFFF'
                      : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ p: 4, minHeight: 400 }}>
        <Stack spacing={4}>
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{
                borderRadius: 2,
                '& .MuiAlert-icon': { fontSize: 24 }
              }}
            >
              {error}
            </Alert>
          )}

          {/* STEP 1: Confirmar Dados do Lançamento */}
          {activeStep === 0 && lancamento && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
                Confirmar Dados do Lançamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Verifique os dados do lançamento contábil antes de fazer o upload da nota fiscal
              </Typography>

              <Stack spacing={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: alpha('#8270FF', 0.05),
                    border: '1px solid',
                    borderColor: alpha('#8270FF', 0.1),
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Cliente
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {lancamento.cliente_nome_fantasia}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lancamento.cliente_razao_social}
                      </Typography>
                    </Box>

                    {lancamento.cliente_cnpj && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          CNPJ do Cliente (Tomador)
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatCNPJ(lancamento.cliente_cnpj)}
                        </Typography>
                      </Box>
                    )}

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Empresa Emitente
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {lancamento.empresa_razao_social}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        CNPJ: {formatCNPJ(lancamento.empresa_cnpj)}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Mês de Referência
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {(() => {
                          const [year, month] = lancamento.mes_referencia.split("-");
                          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                          return date.toLocaleDateString("pt-BR", {
                            month: "long",
                            year: "numeric",
                          });
                        })()}
                      </Typography>
                    </Box>

                    {lancamento.valor_nota_fiscal && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Valor da Nota Fiscal
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="#8270FF">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(lancamento.valor_nota_fiscal)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {/* STEP 2: Upload e Validação */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
                Anexar Nota Fiscal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Faça o upload do PDF e nossa IA validará automaticamente os dados
              </Typography>

              <Stack spacing={3}>
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="upload-nota-fiscal"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading || validating}
                />

                {!selectedFile ? (
                  <label htmlFor="upload-nota-fiscal">
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: '#8270FF',
                        borderRadius: 3,
                        p: 6,
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: alpha('#8270FF', 0.03),
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: '#6b5ce0',
                          background: alpha('#8270FF', 0.06),
                          transform: 'translateY(-2px)',
                        },
                      }}
                      component="div"
                    >
                      <CloudUploadIcon
                        sx={{
                          fontSize: 56,
                          color: '#8270FF',
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#0f172a',
                          mb: 1,
                        }}
                      >
                        Clique ou arraste o arquivo aqui
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Apenas arquivos PDF · Tamanho máximo 10MB
                      </Typography>
                    </Box>
                  </label>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha('#10b981', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#10b981', 0.2),
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: alpha('#ef4444', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PdfIcon sx={{ fontSize: 28, color: '#ef4444' }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                        </Typography>
                      </Box>
                      <label htmlFor="upload-nota-fiscal">
                        <Button
                          component="span"
                          variant="outlined"
                          size="small"
                          disabled={uploading || validating}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Trocar
                        </Button>
                      </label>
                    </Stack>
                  </Box>
                )}

                {/* Validação IA em andamento */}
                {validating && (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha('#8270FF', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#8270FF', 0.2),
                      textAlign: 'center',
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <CircularProgress size={40} sx={{ color: "#8270FF" }} />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                          <AutoAwesomeIcon sx={{ fontSize: 20, color: "#8270FF" }} />
                          <Typography variant="subtitle1" fontWeight={600} color="#8270FF">
                            Validando com IA...
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Extraindo e validando dados da nota fiscal
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Resultado validação compacto */}
                {!validating && validationResult && (
                  <Alert
                    severity={validationResult.validations?.all_valid ? "success" : "warning"}
                    sx={{
                      borderRadius: 2,
                      '& .MuiAlert-icon': { fontSize: 24 }
                    }}
                  >
                    {validationResult.validations?.all_valid
                      ? "✅ Nota fiscal validada com sucesso! Clique em Próximo para revisar os dados."
                      : "⚠️ Alguns dados precisam de atenção. Clique em Próximo para revisar."}
                  </Alert>
                )}
              </Stack>
            </Box>
          )}

          {/* STEP 3: Revisão dos Dados Extraídos */}
          {activeStep === 2 && validationResult && lancamento && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
                Revisão dos Dados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Confira os dados extraídos da nota fiscal antes de enviar
              </Typography>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: validationResult.validations?.all_valid
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)',
                  border: '2px solid',
                  borderColor: validationResult.validations?.all_valid
                    ? alpha("#10b981", 0.3)
                    : alpha("#f59e0b", 0.3),
                  boxShadow: validationResult.validations?.all_valid
                    ? '0 4px 20px rgba(16, 185, 129, 0.1)'
                    : '0 4px 20px rgba(245, 158, 11, 0.1)',
                }}
              >
                <Stack spacing={3}>
                  {/* Header com status */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      borderRadius: 2,
                      background: validationResult.validations?.all_valid
                        ? alpha("#10b981", 0.1)
                        : alpha("#f59e0b", 0.1),
                    }}
                  >
                    {validationResult.validations?.all_valid ? (
                      <CheckCircleIcon sx={{ fontSize: 28, color: "#10b981" }} />
                    ) : (
                      <WarningIcon sx={{ fontSize: 28, color: "#f59e0b" }} />
                    )}
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                        {validationResult.validations?.all_valid
                          ? "Validação Concluída com Sucesso"
                          : "Atenção aos Dados Extraídos"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {validationResult.validations?.all_valid
                          ? "Todos os dados foram validados e estão corretos"
                          : "Verifique os campos abaixo antes de enviar"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Valor */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: alpha("#8270FF", 0.03),
                      border: '1px solid',
                      borderColor: alpha("#8270FF", 0.1),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        mb: 2,
                      }}
                    >
                      Valor
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Extraído da Nota
                        </Typography>
                        {validationResult.valor !== null && validationResult.valor !== undefined ? (
                          <>
                            <Typography variant="h5" fontWeight={700} color="#8270FF">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(validationResult.valor)}
                            </Typography>
                            <Chip
                              icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                              label="IA"
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 20,
                                fontSize: '0.65rem',
                                bgcolor: alpha("#8270FF", 0.1),
                                color: "#8270FF",
                              }}
                            />
                          </>
                        ) : (
                          <Typography variant="body1" color="text.secondary" fontStyle="italic">
                            ⚠️ Não foi possível extrair o valor automaticamente
                          </Typography>
                        )}
                      </Box>
                      {lancamento.valor_nota_fiscal && (
                        <>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: alpha("#94a3b8", 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem", color: "#94a3b8" }}>↔</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Valor Cadastrado
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="#10b981">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(lancamento.valor_nota_fiscal)}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                    {validationResult.validations?.valor_message && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 2,
                          background: validationResult.validations.valor_match
                            ? alpha("#10b981", 0.05)
                            : alpha("#f59e0b", 0.05),
                        }}
                      >
                        <Typography
                          variant="caption"
                          color={validationResult.validations.valor_match ? "#10b981" : "#f59e0b"}
                          fontWeight={600}
                        >
                          {validationResult.validations.valor_message}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* CNPJ Emitente (Empresa) */}
                  {validationResult.cnpj_emitente && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: validationResult.validations?.cnpj_emitente_match
                          ? alpha("#10b981", 0.03)
                          : alpha("#ef4444", 0.03),
                        border: '1px solid',
                        borderColor: validationResult.validations?.cnpj_emitente_match
                          ? alpha("#10b981", 0.2)
                          : alpha("#ef4444", 0.2),
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748b',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: 2,
                        }}
                      >
                        CNPJ Empresa (Emitente)
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Extraído da Nota
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={700}
                            color={validationResult.validations?.cnpj_emitente_match ? "#10b981" : "#ef4444"}
                          >
                            {formatCNPJ(validationResult.cnpj_emitente)}
                          </Typography>
                        </Box>
                        {lancamento.empresa_cnpj && (
                          <>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: validationResult.validations?.cnpj_emitente_match
                                  ? alpha("#10b981", 0.1)
                                  : alpha("#ef4444", 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "1.2rem",
                                  color: validationResult.validations?.cnpj_emitente_match ? "#10b981" : "#ef4444"
                                }}
                              >
                                {validationResult.validations?.cnpj_emitente_match ? '✓' : '✗'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                {lancamento.empresa_razao_social}
                              </Typography>
                              <Typography variant="body1" fontWeight={700}>
                                {formatCNPJ(lancamento.empresa_cnpj)}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Stack>
                      {validationResult.validations?.cnpj_emitente_message && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            background: validationResult.validations.cnpj_emitente_match
                              ? alpha("#10b981", 0.05)
                              : alpha("#ef4444", 0.05),
                          }}
                        >
                          <Typography
                            variant="caption"
                            color={validationResult.validations.cnpj_emitente_match ? "#10b981" : "#ef4444"}
                            fontWeight={600}
                          >
                            {validationResult.validations.cnpj_emitente_message}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* CNPJ Destinatário (Cliente/Tomador) */}
                  {validationResult.cnpj_destinatario && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: validationResult.validations?.cnpj_destinatario_match
                          ? alpha("#10b981", 0.03)
                          : alpha("#ef4444", 0.03),
                        border: '1px solid',
                        borderColor: validationResult.validations?.cnpj_destinatario_match
                          ? alpha("#10b981", 0.2)
                          : alpha("#ef4444", 0.2),
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748b',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: 2,
                        }}
                      >
                        CNPJ Cliente (Tomador do Serviço)
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Extraído da Nota
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={700}
                            color={validationResult.validations?.cnpj_destinatario_match ? "#10b981" : "#ef4444"}
                          >
                            {formatCNPJ(validationResult.cnpj_destinatario)}
                          </Typography>
                        </Box>
                        {lancamento.cliente_cnpj && (
                          <>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: validationResult.validations?.cnpj_destinatario_match
                                  ? alpha("#10b981", 0.1)
                                  : alpha("#ef4444", 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "1.2rem",
                                  color: validationResult.validations?.cnpj_destinatario_match ? "#10b981" : "#ef4444"
                                }}
                              >
                                {validationResult.validations?.cnpj_destinatario_match ? '✓' : '✗'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                {lancamento.cliente_nome_fantasia}
                              </Typography>
                              <Typography variant="body1" fontWeight={700}>
                                {formatCNPJ(lancamento.cliente_cnpj)}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Stack>
                      {validationResult.validations?.cnpj_destinatario_message && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            background: validationResult.validations.cnpj_destinatario_match
                              ? alpha("#10b981", 0.05)
                              : alpha("#ef4444", 0.05),
                          }}
                        >
                          <Typography
                            variant="caption"
                            color={validationResult.validations.cnpj_destinatario_match ? "#10b981" : "#ef4444"}
                            fontWeight={600}
                          >
                            {validationResult.validations.cnpj_destinatario_message}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Footer com badge de IA */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label="Validado por AWS Textract"
                      sx={{
                        bgcolor: alpha("#8270FF", 0.1),
                        color: "#8270FF",
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: "#8270FF" }
                      }}
                    />
                    {validationResult.confidence > 0 && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Confiança da IA
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#8270FF">
                          {validationResult.confidence}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}

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

      {/* Modern DialogActions - Wizard Navigation */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: alpha('#f8fafc', 0.5),
          justifyContent: 'space-between',
        }}
      >
        {/* Botão Voltar */}
        <Button
          onClick={activeStep === 0 ? handleClose : handleBack}
          disabled={uploading || validating}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            color: '#64748b',
            '&:hover': {
              background: alpha('#64748b', 0.1),
            }
          }}
        >
          {activeStep === 0 ? 'Cancelar' : 'Voltar'}
        </Button>

        {/* Botão Próximo ou Enviar */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep < 2 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={!canProceedToNextStep() || uploading || validating}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.25,
                background: 'linear-gradient(135deg, #8270FF 0%, #6b5ce0 100%)',
                boxShadow: '0 4px 12px rgba(130, 112, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6b5ce0 0%, #5b4ec0 100%)',
                  boxShadow: '0 6px 16px rgba(130, 112, 255, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: alpha('#94a3b8', 0.3),
                  color: alpha('#64748b', 0.5),
                  boxShadow: 'none',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {validating ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                  <span>Validando...</span>
                </Stack>
              ) : (
                'Próximo'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={
                uploading ||
                validating ||
                !canProceedToNextStep()
              }
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.25,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: alpha('#94a3b8', 0.3),
                  color: alpha('#64748b', 0.5),
                  boxShadow: 'none',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {uploading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                  <span>Enviando...</span>
                </Stack>
              ) : (
                <>
                  <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                  Enviar Nota Fiscal
                </>
              )}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
