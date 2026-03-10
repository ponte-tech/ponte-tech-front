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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import impostoService from "@/app/services/impostoService";
import empresaService from "@/app/services/empresaService";
import type { CreateImpostoRequest, TipoImposto } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import type { Empresa } from "@/app/types/empresa";
import { PageHeader } from "@/app/shared/components";

export default function NovoImpostoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const [formData, setFormData] = useState<CreateImpostoRequest>({
    empresa_id: "",
    descricao: "",
    tipo_imposto: "OUTROS" as TipoImposto,
    mes_referencia: getCurrentMonth(),
    valor: 0,
    anexos: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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

    if (formData.valor <= 0) {
      setError("Por favor, informe um valor válido");
      return;
    }

    try {
      setLoading(true);
      await impostoService.create(formData);
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
                      {empresa.nome_fantasia} - {empresa.cnpj}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

              {/* Valor */}
              <TextField
                label="Valor (R$)"
                type="number"
                value={formData.valor}
                onChange={(e) => handleChange("valor", parseFloat(e.target.value))}
                required
                fullWidth
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
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
                      {selectedFiles.map((file, index) => (
                        <ListItem key={index} divider={index < selectedFiles.length - 1}>
                          <AttachFileIcon sx={{ mr: 2, color: "text.secondary" }} />
                          <ListItemText
                            primary={file.name}
                            secondary={formatFileSize(file.size)}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveFile(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="caption" color="text.secondary">
                        Total: {selectedFiles.length} arquivo(s) selecionado(s)
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
