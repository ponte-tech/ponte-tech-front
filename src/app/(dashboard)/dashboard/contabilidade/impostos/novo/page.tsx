"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import impostoService from "@/app/services/impostoService";
import empresaService from "@/app/services/empresaService";
import documentExtractionService from "@/app/services/documentExtractionService";
import type { CreateImpostoRequest, TipoImposto } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import type { Empresa } from "@/app/types/empresa";
import { PageHeader } from "@/app/shared/components";
import { applyCurrencyMask, removeCurrencyMask } from "@/app/utils/currencyMask";

interface FileWithType {
  file: File;
  tipoImposto: TipoImposto;
  extractedValue?: number | null;
  extractionConfidence?: number;
  extractionError?: string;
  extracting?: boolean;
}

export default function NovoImpostoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const [formData, setFormData] = useState<CreateImpostoRequest>({
    empresa_id: "",
    descricao: "",
    tipo_imposto: "TFE" as TipoImposto,
    mes_referencia: getCurrentMonth(),
    valor: 0.01, // Valor padrão mínimo para passar na validação do backend
    anexos: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<FileWithType[]>([]);
  const [valorDisplay, setValorDisplay] = useState("R$ 0,00");

  useEffect(() => {
    loadEmpresas();
  }, []);

  function getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const response = await empresaService.list();
      setEmpresas(response.empresas || []);
    } catch (err) {
      console.error("Erro ao carregar empresas:", err);
      setError("Erro ao carregar lista de empresas");
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleChange = (field: keyof CreateImpostoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValorChange = (value: string) => {
    const masked = applyCurrencyMask(value);
    const numeric = removeCurrencyMask(masked);
    setValorDisplay(masked);
    setFormData((prev) => ({ ...prev, valor: numeric }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const filesWithType: FileWithType[] = fileArray.map((file) => ({
        file,
        tipoImposto: "" as TipoImposto,
        extracting: true,
      }));

      setSelectedFiles((prev) => [...prev, ...filesWithType]);
      setFormData((prev) => ({
        ...prev,
        anexos: [...(prev.anexos || []), ...fileArray],
      }));

      // Extrair valores automaticamente com IA
      if (documentExtractionService.isConfigured()) {
        fileArray.forEach(async (file, index) => {
          const baseIndex = selectedFiles.length + index;

          try {
            const result = await documentExtractionService.extractValueFromDocument(file);

            setSelectedFiles((prev) =>
              prev.map((item, i) =>
                i === baseIndex
                  ? {
                      ...item,
                      extracting: false,
                      extractedValue: result.valor,
                      extractionConfidence: result.confidence,
                      extractionError: result.error,
                    }
                  : item
              )
            );

            // Se foi extraído um valor com confiança alta, sugerir ao usuário
            if (result.valor && result.confidence > 70) {
              // Opcional: atualizar o valor total automaticamente
              // setFormData((prev) => ({ ...prev, valor: result.valor }));
            }
          } catch (error: any) {
            console.error('Erro na extração:', error);
            setSelectedFiles((prev) =>
              prev.map((item, i) =>
                i === baseIndex
                  ? {
                      ...item,
                      extracting: false,
                      extractionError: 'Erro ao extrair valor',
                    }
                  : item
              )
            );
          }
        });
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      anexos: prev.anexos?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleFileTipoChange = (index: number, tipoImposto: TipoImposto) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, tipoImposto } : item))
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatCNPJ = (cnpj: string): string => {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!formData.empresa_id) {
      setError("Por favor, selecione uma empresa");
      return;
    }

    if (!formData.descricao.trim()) {
      setError("Por favor, informe a descrição");
      return;
    }

    // Validar que todos os arquivos têm tipo de imposto selecionado
    if (selectedFiles.length > 0) {
      const filesWithoutType = selectedFiles.filter(f => !f.tipoImposto);
      if (filesWithoutType.length > 0) {
        setError("Por favor, selecione o tipo de imposto para todos os arquivos");
        return;
      }
    }

    try {
      setLoading(true);

      // 1. Criar o imposto sem anexos
      const imposto = await impostoService.create({
        empresa_id: formData.empresa_id,
        descricao: formData.descricao,
        tipo_imposto: "TFE", // Tipo padrão obrigatório pelo backend
        mes_referencia: formData.mes_referencia,
        valor: 0.01, // Valor mínimo obrigatório pelo backend (gt=0)
      });

      // 2. Fazer upload de cada anexo
      if (selectedFiles.length > 0) {
        for (const fileWithType of selectedFiles) {
          try {
            // Validar arquivo
            const validation = impostoService.validateFile(fileWithType.file);
            if (!validation.valid) {
              console.error("Arquivo inválido:", fileWithType.file.name, validation.error);
              continue; // Pular arquivo inválido
            }

            // Iniciar upload e obter presigned URL
            const uploadData = await impostoService.initiateAnexoUpload(
              imposto.imposto_id,
              imposto.empresa_id,
              fileWithType.file.name,
              fileWithType.file.size,
              fileWithType.file.type
            );

            // Upload do arquivo para S3
            await impostoService.uploadFileToS3(
              uploadData.upload_url,
              fileWithType.file
            );

            // Confirmar upload no backend
            await impostoService.confirmAnexoUpload(
              imposto.imposto_id,
              imposto.empresa_id,
              uploadData.s3_key,
              fileWithType.file.name,
              fileWithType.file.size,
              fileWithType.file.type,
              fileWithType.tipoImposto
            );
          } catch (uploadErr: any) {
            console.error("Erro ao fazer upload do arquivo:", fileWithType.file.name);
            console.error("Detalhes do erro:", uploadErr.response?.data || uploadErr.message || uploadErr);
            // Continuar com os outros arquivos mesmo se um falhar
          }
        }
      }

      router.push("/dashboard/contabilidade/impostos");
    } catch (err: any) {
      console.error("Erro ao cadastrar imposto:", err);
      setError(err.response?.data?.message || "Erro ao cadastrar imposto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Cadastrar Novo Imposto"
        description="Preencha os dados do imposto e faça upload dos comprovantes"
        actionButton={{
          label: "Voltar",
          icon: <ArrowBackIcon />,
          onClick: () => router.push("/dashboard/contabilidade/impostos"),
          visible: true,
        }}
      />

      {/* Form */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Empresa */}
              <FormControl fullWidth required>
                <InputLabel>Empresa</InputLabel>
                <Select
                  value={formData.empresa_id}
                  label="Empresa"
                  onChange={(e) => handleChange("empresa_id", e.target.value)}
                  disabled={loadingEmpresas}
                >
                  {empresas.map((empresa) => (
                    <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>
                      {empresa.nome_fantasia} - {formatCNPJ(empresa.cnpj)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Descrição */}
              <TextField
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
                placeholder="Ex: IRPJ do terceiro trimestre de 2026"
              />

              {/* Mês de Referência */}
              <TextField
                label="Mês de Referência"
                type="month"
                value={formData.mes_referencia}
                onChange={(e) => handleChange("mes_referencia", e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              {/* Upload de Arquivos */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Anexos (Comprovantes)
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Selecionar Arquivos
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                </Button>

                {selectedFiles.length > 0 && (
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <List>
                      {selectedFiles.map((fileWithType, index) => (
                        <ListItem
                          key={index}
                          divider={index < selectedFiles.length - 1}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            py: 2
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", width: "100%", mb: 2 }}>
                            <AttachFileIcon sx={{ mr: 2, color: "text.secondary" }} />
                            <Box sx={{ flex: 1 }}>
                              <ListItemText
                                primary={fileWithType.file.name}
                                secondary={formatFileSize(fileWithType.file.size)}
                              />
                              {/* Valor extraído por IA */}
                              {fileWithType.extracting && (
                                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                  <AutoAwesomeIcon sx={{ fontSize: 16, color: "#8270FF" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Extraindo valor com IA...
                                  </Typography>
                                  <LinearProgress sx={{ flex: 1, maxWidth: 100, ml: 1 }} />
                                </Box>
                              )}
                              {!fileWithType.extracting && fileWithType.extractedValue !== undefined && (
                                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                  {fileWithType.extractedValue ? (
                                    <>
                                      <CheckCircleIcon sx={{ fontSize: 16, color: "#10b981" }} />
                                      <Chip
                                        icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                                        label={`Valor detectado: ${new Intl.NumberFormat("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        }).format(fileWithType.extractedValue)}`}
                                        size="small"
                                        sx={{
                                          bgcolor: alpha("#10b981", 0.1),
                                          color: "#10b981",
                                          fontWeight: 600,
                                          "& .MuiChip-icon": { color: "#10b981" },
                                        }}
                                      />
                                      {fileWithType.extractionConfidence && (
                                        <Tooltip title="Confiança da extração">
                                          <Chip
                                            label={`${fileWithType.extractionConfidence}%`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: "0.7rem" }}
                                          />
                                        </Tooltip>
                                      )}
                                    </>
                                  ) : fileWithType.extractionError ? (
                                    <>
                                      <ErrorIcon sx={{ fontSize: 16, color: "#ef4444" }} />
                                      <Typography variant="caption" color="error">
                                        {fileWithType.extractionError}
                                      </Typography>
                                    </>
                                  ) : (
                                    <>
                                      <ErrorIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                                      <Typography variant="caption" color="text.secondary">
                                        Valor não detectado automaticamente
                                      </Typography>
                                    </>
                                  )}
                                </Box>
                              )}
                            </Box>
                            <IconButton
                              onClick={() => handleRemoveFile(index)}
                              color="error"
                              sx={{ ml: 2 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          <Box sx={{ pl: 6 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Tipo de Imposto</InputLabel>
                              <Select
                                value={fileWithType.tipoImposto}
                                label="Tipo de Imposto"
                                onChange={(e) => handleFileTipoChange(index, e.target.value as TipoImposto)}
                              >
                                {TIPOS_IMPOSTO.map((tipo) => (
                                  <MenuItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ p: 2, bgcolor: alpha("#8270FF", 0.02) }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          Total: {selectedFiles.length} arquivo(s) selecionado(s)
                        </Typography>
                        {documentExtractionService.isConfigured() && (
                          <Chip
                            icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                            label="Extração automática ativa"
                            size="small"
                            sx={{
                              bgcolor: alpha("#8270FF", 0.1),
                              color: "#8270FF",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Card>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Formatos aceitos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
                </Typography>
              </Box>

              {/* Buttons */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/dashboard/contabilidade/impostos")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                  sx={{
                    bgcolor: "#8270FF",
                    "&:hover": { bgcolor: "#6a5dd9" },
                  }}
                >
                  {loading ? "Cadastrando..." : "Cadastrar Imposto"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
