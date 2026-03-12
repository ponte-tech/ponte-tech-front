"use client";

import { useState, useEffect, Suspense } from "react";
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import impostoService from "@/app/services/impostoService";
import empresaService from "@/app/services/empresaService";
import type { UpdateImpostoRequest, TipoImposto, Imposto } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import type { Empresa } from "@/app/types/empresa";
import { PageHeader } from "@/app/shared/components";
import { applyCurrencyMask, removeCurrencyMask, formatCurrency } from "@/app/utils/currencyMask";

function EditarImpostoContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const impostoId = params.id as string;
  const empresaId = searchParams.get("empresa_id") || "";

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [imposto, setImposto] = useState<Imposto | null>(null);

  const [formData, setFormData] = useState<UpdateImpostoRequest>({
    descricao: "",
    tipo_imposto: "OUTROS" as TipoImposto,
    mes_referencia: "",
    valor: 0,
    anexos: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAnexos, setExistingAnexos] = useState<string[]>([]);
  const [valorDisplay, setValorDisplay] = useState("R$ 0,00");

  useEffect(() => {
    loadData();
  }, [impostoId]);

  const loadData = async () => {
    if (!empresaId) {
      setError("ID da empresa não fornecido");
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      const [impostoData, empresasData] = await Promise.all([
        impostoService.getById(impostoId, empresaId),
        empresaService.list(),
      ]);

      setImposto(impostoData);
      setEmpresas(empresasData.empresas || []);
      setExistingAnexos(impostoData.anexos || []);

      setFormData({
        descricao: impostoData.descricao,
        tipo_imposto: impostoData.tipo_imposto,
        mes_referencia: impostoData.mes_referencia,
        valor: impostoData.valor,
        anexos: [],
      });
      setValorDisplay(formatCurrency(impostoData.valor));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do imposto");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: keyof UpdateImpostoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValorChange = (value: string) => {
    const masked = applyCurrencyMask(value);
    const numeric = removeCurrencyMask(masked);
    setValorDisplay(masked);
    setFormData((prev) => ({ ...prev, valor: numeric }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
      setFormData((prev) => ({
        ...prev,
        anexos: [...(prev.anexos || []), ...fileArray],
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      anexos: prev.anexos?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleRemoveExistingAnexo = (index: number) => {
    setExistingAnexos((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDownloadAnexo = async (anexoUrl: string) => {
    try {
      const blob = await impostoService.downloadAnexo(impostoId, anexoUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = anexoUrl.split("/").pop() || "anexo";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar anexo:", err);
      setError("Erro ao baixar anexo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!formData.descricao.trim()) {
      setError("Por favor, informe a descrição");
      return;
    }

    if (formData.valor <= 0) {
      setError("Por favor, informe um valor válido");
      return;
    }

    try {
      setLoading(true);
      await impostoService.update(impostoId, formData);
      router.push("/dashboard/contabilidade/impostos");
    } catch (err: any) {
      console.error("Erro ao atualizar imposto:", err);
      setError(err.response?.data?.message || "Erro ao atualizar imposto");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!imposto) {
    return (
      <Box>
        <Alert severity="error">Imposto não encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Editar Imposto"
        description="Atualize os dados do imposto e gerencie os anexos"
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
              {/* Empresa (readonly) */}
              <TextField
                label="Empresa"
                value={empresas.find((e) => e.empresa_id === imposto.empresa_id)?.nome_fantasia || ""}
                disabled
                fullWidth
              />

              {/* Tipo de Imposto */}
              <FormControl fullWidth required>
                <InputLabel>Tipo de Imposto</InputLabel>
                <Select
                  value={formData.tipo_imposto}
                  label="Tipo de Imposto"
                  onChange={(e) => handleChange("tipo_imposto", e.target.value as TipoImposto)}
                >
                  {TIPOS_IMPOSTO.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
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

              {/* Valor */}
              <TextField
                label="Valor"
                value={valorDisplay}
                onChange={(e) => handleValorChange(e.target.value)}
                required
                fullWidth
                placeholder="R$ 0,00"
              />

              {/* Anexos Existentes */}
              {existingAnexos.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Anexos Existentes
                  </Typography>
                  <Card variant="outlined">
                    <List>
                      {existingAnexos.map((anexo, index) => (
                        <ListItem key={index} divider={index < existingAnexos.length - 1}>
                          <AttachFileIcon sx={{ mr: 2, color: "text.secondary" }} />
                          <ListItemText primary={anexo.split("/").pop() || anexo} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleDownloadAnexo(anexo)}
                              sx={{ mr: 1 }}
                              color="primary"
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveExistingAnexo(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </Box>
              )}

              {/* Upload de Novos Arquivos */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Adicionar Novos Anexos
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
                      {selectedFiles.map((file, index) => (
                        <ListItem key={index} divider={index < selectedFiles.length - 1}>
                          <AttachFileIcon sx={{ mr: 2, color: "text.secondary" }} />
                          <ListItemText primary={file.name} secondary={formatFileSize(file.size)} />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleRemoveFile(index)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedFiles.length} novo(s) arquivo(s) selecionado(s)
                      </Typography>
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
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function EditarImpostoPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    }>
      <EditarImpostoContent />
    </Suspense>
  );
}
