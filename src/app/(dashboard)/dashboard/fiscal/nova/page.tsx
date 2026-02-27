"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { CreateNotaFiscalRequest } from "@/app/types/api";
import FileUploadArea from "../../components/FileUploadArea";

export default function NovaNotaFiscalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<CreateNotaFiscalRequest>({
    ano_mes: "",
    numero_nota: "",
    data_emissao: "",
    valor_nota: 0,
  });

  const handleChange = (field: keyof CreateNotaFiscalRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.ano_mes) throw new Error("Selecione o mês/ano");
      if (!formData.numero_nota) throw new Error("Informe o número da nota");
      if (!formData.data_emissao) throw new Error("Informe a data de emissão");
      if (formData.valor_nota <= 0) throw new Error("O valor deve ser maior que zero");

      const fd = new FormData();
      fd.append("ano_mes", formData.ano_mes);
      fd.append("numero_nota", formData.numero_nota);
      fd.append("data_emissao", formData.data_emissao);
      fd.append("valor_nota", formData.valor_nota.toString());

      files.forEach((file) => {
        fd.append("arquivos", file);
      });

      const response = await fiscalService.createNota(fd);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/fiscal/${response.nota_id}`);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar nota fiscal";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/fiscal")}
          sx={{ mb: 1, textTransform: "none" }}
        >
          Voltar
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Nova Nota Fiscal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Envie sua nota fiscal com os documentos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Nota fiscal criada com sucesso! Redirecionando...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Dados da Nota
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mês/Ano de Referência"
                      type="month"
                      required
                      value={formData.ano_mes}
                      onChange={(e) => handleChange("ano_mes", e.target.value)}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Número da Nota"
                      required
                      value={formData.numero_nota}
                      onChange={(e) => handleChange("numero_nota", e.target.value)}
                      disabled={loading}
                      placeholder="Ex: NF-0001"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Emissão"
                      type="date"
                      required
                      value={formData.data_emissao}
                      onChange={(e) => handleChange("data_emissao", e.target.value)}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valor da Nota (R$)"
                      type="number"
                      required
                      value={formData.valor_nota || ""}
                      onChange={(e) => handleChange("valor_nota", parseFloat(e.target.value) || 0)}
                      disabled={loading}
                      inputProps={{ min: 0.01, step: 0.01 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Arquivos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Anexe os documentos da nota fiscal
                </Typography>
                <FileUploadArea
                  onFilesSelected={handleFilesSelected}
                  selectedFiles={files}
                  onRemoveFile={handleRemoveFile}
                  disabled={loading}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => router.push("/dashboard/fiscal")}
                disabled={loading}
                sx={{ textTransform: "none" }}
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
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  minWidth: 150,
                }}
              >
                {loading ? "Enviando..." : "Criar Nota Fiscal"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
