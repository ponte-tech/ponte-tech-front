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
  CircularProgress,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as PdfIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import timesheetService from '../../services/timesheetService';
import fiscalService from '../../services/fiscalService';
import awsDocumentExtractionService, { type ExtractionResult } from '../../services/awsDocumentExtractionService';
import type { Contrato, ResumoContratoMes } from '../../types/timesheet';

interface UploadNotaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadNotaModal({ open, onClose, onSuccess }: UploadNotaModalProps) {
  // Wizard step state
  const [activeStep, setActiveStep] = useState(0);

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

  // Estados da validação IA
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ExtractionResult | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const steps = ['Dados Básicos', 'Upload da Nota', 'Revisão'];

  useEffect(() => {
    const loadContratos = async () => {
      try {
        const data = await timesheetService.getContratos();
        setContratos(data);
      } catch (err) {
    // console.error('Erro ao carregar contratos:', err);
      }
    };

    if (open) {
      loadContratos();
    }
  }, [open]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setValidationResult(null);
      setShowValidationDetails(false);
      return;
    }

    // Validar se é PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são permitidos');
      setFile(null);
      setValidationResult(null);
      setShowValidationDetails(false);
      return;
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      setFile(null);
      setValidationResult(null);
      setShowValidationDetails(false);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Iniciar validação automática com IA
    await validateNotaFiscal(selectedFile);
  };

  const validateNotaFiscal = async (fileToValidate: File) => {
    try {
      setValidating(true);
      setError(null);
      setValidationResult(null);
      setShowValidationDetails(false);

    // console.log("🔍 [UploadModal] Iniciando validação da nota fiscal");

      // Obter dados do contrato selecionado para validação
      const contrato = contratos.find(c => c.contrato_id === contratoId);

      if (!contrato) {
        setError("Selecione um contrato antes de fazer upload da nota fiscal");
        return;
      }

      // Buscar resumo do mês para obter o valor aprovado pelo admin
      let valorAprovadoAdmin: number | null = null;
      let statusMes: string | null = null;
      try {
        const resumoMes = await timesheetService.getResumoMes(mesReferencia);

    // console.log("📊 [UploadModal] Resumo do mês RAW:", JSON.stringify(resumoMes, null, 2));

        // Se o status é APROVADO, pegar o valor total aprovado (que vem do fechamento)
        // Este valor é o total de TODOS os contratos do colaborador naquele mês
        if (resumoMes.status_mes === 'APROVADO') {
          valorAprovadoAdmin = resumoMes.total_valor_lancado;
          statusMes = resumoMes.status_mes;
    // console.log("✅ [UploadModal] Valor TOTAL aprovado pelo admin encontrado:", valorAprovadoAdmin);
    // console.log("📊 [UploadModal] Status:", statusMes);
    // console.log("📊 [UploadModal] Quantidade de contratos:", resumoMes.contratos?.length);

          // Se houver apenas 1 contrato, mostrar o valor dele também
          if (resumoMes.contratos?.length === 1) {
    // console.log("📊 [UploadModal] Contrato único - valor_total_lancado:", resumoMes.contratos[0].valor_total_lancado);
          }
        }
      } catch (err) {
    // console.warn("⚠️ [UploadModal] Não foi possível buscar resumo do mês:", err);
      }

      // console.log("📊 [UploadModal] Dados para validação:", {
      //   contratoSelecionado: contrato.nome_cliente,
      //   mesReferencia,
      //   colaboradorCNPJ: contrato.colaborador_cnpj,
      //   empresaCNPJ: contrato.empresa_cnpj,
      //   valorAprovadoAdmin,
      //   statusMes,
      // });

      // Extrair dados da nota fiscal (SEM validar valor - o admin valida depois)
      // Apenas valida CNPJs do colaborador e empresa
      const result = await awsDocumentExtractionService.extractValueFromDocument(fileToValidate, {
        expectedValor: undefined, // Não valida valor no upload do colaborador
        colaboradorCNPJ: contrato.colaborador_cnpj, // CNPJ do colaborador (emitente da NFS-e)
        empresaCNPJ: contrato.empresa_cnpj, // CNPJ da empresa (tomador do serviço)
      });

      // Adicionar o valor aprovado ao resultado para exibição
      if (valorAprovadoAdmin !== null) {
        result.valorAprovadoAdmin = valorAprovadoAdmin;
        result.statusMes = statusMes || undefined;
      }

      setValidationResult(result);
      setShowValidationDetails(true);

      if (result.error) {
    // console.warn("⚠️ [UploadModal] Erro na validação:", result.error);
      } else if (result.validations) {
        if (result.validations.all_valid) {
    // console.log("✅ [UploadModal] Validação passou!");
        } else {
    // console.warn("❌ [UploadModal] Validação falhou:", result.validations);
        }
      }
    } catch (err) {
    // console.error("❌ [UploadModal] Erro ao validar:", err);

      // Limpar o arquivo e pedir para anexar novamente
      setFile(null);
      setValidationResult(null);
      setShowValidationDetails(false);

      // Verificar se é erro de rede
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NETWORK')) {
        setError("❌ Erro de rede ao processar o documento. Por favor, anexe o arquivo novamente para análise.");
      } else {
        setError("❌ Erro ao validar nota fiscal com IA. Por favor, anexe o arquivo novamente para análise.");
      }
    } finally {
      setValidating(false);
    }
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

    // Verificar se passou nas validações (se houver validações)
    if (validationResult?.validations && !validationResult.validations.can_proceed) {
      setError("Não é possível enviar a nota fiscal. Por favor, corrija os problemas identificados.");
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

  const handleNext = () => {
    setError(null);
    if (activeStep === 1 && file && !validationResult) {
      // Se está no step 2 e tem arquivo mas não validou ainda, valida automaticamente
      validateNotaFiscal(file);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    if (!loading && !validating) {
      setActiveStep(0);
      setContratoId('');
      setFile(null);
      setError(null);
      setUploadProgress(0);
      setIsSubmitting(false);
      setValidationResult(null);
      setShowValidationDetails(false);
      onClose();
    }
  };

  // Validação para habilitar botão "Próximo"
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Step 1: Dados básicos
        return contratoId !== '' && mesReferencia !== '';
      case 1: // Step 2: Upload
        return file !== null && validationResult !== null && !validating;
      case 2: // Step 3: Revisão
        return validationResult?.validations?.can_proceed !== false;
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
          <UploadIcon sx={{ fontSize: 28 }} />
          Enviar Nota Fiscal
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

          {/* STEP 1: Dados Básicos */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>
                Informações Básicas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Selecione o cliente e o mês de referência da nota fiscal
              </Typography>

              <Stack spacing={3}>
                {/* Cliente */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    Cliente *
                  </Typography>
                  <FormControl
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8270FF',
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8270FF',
                            borderWidth: 2,
                          }
                        }
                      }
                    }}
                  >
                    <InputLabel>Selecione o cliente</InputLabel>
                    <Select
                      value={contratoId}
                      onChange={(e) => setContratoId(e.target.value)}
                      label="Selecione o cliente"
                      disabled={loading}
                    >
                      {contratos.map((contrato) => (
                        <MenuItem key={contrato.contrato_id} value={contrato.contrato_id}>
                          {contrato.nome_cliente}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Mês */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    Mês de Referência *
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    type="month"
                    value={mesReferencia}
                    onChange={(e) => setMesReferencia(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8270FF',
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8270FF',
                            borderWidth: 2,
                          }
                        }
                      }
                    }}
                  />
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
                  onChange={handleFileChange}
                  disabled={loading || validating}
                />

                {!file ? (
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
                      <UploadIcon
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
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                        </Typography>
                      </Box>
                      <label htmlFor="upload-nota-fiscal">
                        <Button
                          component="span"
                          variant="outlined"
                          size="small"
                          disabled={loading || validating}
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
          {activeStep === 2 && validationResult && (
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
                    Valores
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Extraído da Nota
                      </Typography>
                      {validationResult.valor !== null && validationResult.valor !== undefined ? (
                        <>
                          <Typography variant="h5" fontWeight={700} color="#8270FF">
                            {validationResult.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
                    {validationResult.valorAprovadoAdmin !== undefined && (
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
                            Aprovado pelo Admin
                          </Typography>
                          <Typography variant="h5" fontWeight={700} color="#10b981">
                            {validationResult.valorAprovadoAdmin.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </Typography>
                          <Chip
                            label={validationResult.statusMes}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: alpha("#10b981", 0.1),
                              color: "#10b981",
                            }}
                          />
                        </Box>
                      </>
                    )}
                  </Stack>
                  {validationResult.valor !== null && validationResult.valor !== undefined && validationResult.valorAprovadoAdmin !== undefined && validationResult.valor !== validationResult.valorAprovadoAdmin && (
                    <Alert
                      severity="warning"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': { fontSize: 22 }
                      }}
                    >
                      O valor da nota diverge do valor aprovado. O administrador validará esta diferença.
                    </Alert>
                  )}
                  {validationResult.valor !== null && validationResult.valor !== undefined && validationResult.valorAprovadoAdmin !== undefined && validationResult.valor === validationResult.valorAprovadoAdmin && (
                    <Alert
                      severity="success"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': { fontSize: 22 }
                      }}
                    >
                      Valor da nota corresponde ao valor aprovado!
                    </Alert>
                  )}
                  {validationResult.valorAprovadoAdmin === undefined && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha("#3b82f6", 0.05),
                        border: '1px solid',
                        borderColor: alpha("#3b82f6", 0.2),
                      }}
                    >
                      <Typography variant="caption" color="#3b82f6" fontWeight={500}>
                        {validationResult.valor !== null && validationResult.valor !== undefined
                          ? "O administrador validará se este valor está correto ao aprovar a nota"
                          : "A IA não conseguiu extrair o valor. O administrador precisará validar manualmente."}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* CNPJ Emitente */}
                {validationResult.cnpj_emitente && (() => {
                  const contrato = contratos.find(c => c.contrato_id === contratoId);
                  const cnpjEsperado = contrato?.colaborador_cnpj;
                  const isValid = validationResult.validations?.cnpj_emitente_match;

                  return (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: isValid ? alpha("#10b981", 0.03) : alpha("#ef4444", 0.03),
                        border: '1px solid',
                        borderColor: isValid ? alpha("#10b981", 0.2) : alpha("#ef4444", 0.2),
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
                        CNPJ Colaborador (Emitente)
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Extraído da Nota
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace" fontWeight={700} color={isValid ? "#10b981" : "#ef4444"}>
                            {validationResult.cnpj_emitente}
                          </Typography>
                        </Box>
                        {cnpjEsperado && (
                          <>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: isValid ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography sx={{ fontSize: "1.2rem", color: isValid ? "#10b981" : "#ef4444" }}>
                                {isValid ? '✓' : '✗'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                Seu Cadastro
                              </Typography>
                              <Typography variant="body1" fontFamily="monospace" fontWeight={700}>
                                {cnpjEsperado}
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
                            background: isValid ? alpha("#10b981", 0.05) : alpha("#ef4444", 0.05),
                          }}
                        >
                          <Typography variant="caption" color={isValid ? "#10b981" : "#ef4444"} fontWeight={600}>
                            {validationResult.validations.cnpj_emitente_message}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}

                {/* CNPJ Destinatário */}
                {validationResult.cnpj_destinatario && (() => {
                  const contrato = contratos.find(c => c.contrato_id === contratoId);
                  const cnpjEsperado = contrato?.empresa_cnpj;
                  const nomeEmpresa = contrato?.empresa_nome;
                  const isValid = validationResult.validations?.cnpj_destinatario_match;

                  return (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: isValid ? alpha("#10b981", 0.03) : alpha("#ef4444", 0.03),
                        border: '1px solid',
                        borderColor: isValid ? alpha("#10b981", 0.2) : alpha("#ef4444", 0.2),
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
                        CNPJ Empresa (Tomador do Serviço)
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Extraído da Nota
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace" fontWeight={700} color={isValid ? "#10b981" : "#ef4444"}>
                            {validationResult.cnpj_destinatario}
                          </Typography>
                        </Box>
                        {cnpjEsperado && (
                          <>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: isValid ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography sx={{ fontSize: "1.2rem", color: isValid ? "#10b981" : "#ef4444" }}>
                                {isValid ? '✓' : '✗'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                {nomeEmpresa || 'Empresa'}
                              </Typography>
                              <Typography variant="body1" fontFamily="monospace" fontWeight={700}>
                                {cnpjEsperado}
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
                            background: isValid ? alpha("#10b981", 0.05) : alpha("#ef4444", 0.05),
                          }}
                        >
                          <Typography variant="caption" color={isValid ? "#10b981" : "#ef4444"} fontWeight={600}>
                            {validationResult.validations.cnpj_destinatario_message}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}

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
          disabled={loading || validating}
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
              disabled={!canProceedToNextStep() || loading || validating}
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
              onClick={handleSubmit}
              variant="contained"
              disabled={
                loading ||
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
              {loading ? (
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
