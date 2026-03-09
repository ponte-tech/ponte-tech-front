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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import empresaService from "@/app/services/empresaService";
import type { CreateEmpresaRequest } from "@/app/types/empresa";
import { useAuth } from "@/app/hooks/useAuth";
import { formatCNPJ, cleanCNPJ } from "@/app/utils/cnpjValidator";

export default function NovaEmpresaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && user.perfil !== "admin" && !user.perfis?.includes("admin")) {
      router.push("/dashboard/empresas");
    }
  }, [user, router]);

  const [formData, setFormData] = useState<CreateEmpresaRequest>({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
  });

  const handleChange = (field: keyof CreateEmpresaRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    handleChange("cnpj", formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!formData.razao_social || !formData.nome_fantasia || !formData.cnpj) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Valida apenas o tamanho do CNPJ
      if (cleanCNPJ(formData.cnpj).length !== 14) {
        throw new Error("CNPJ deve conter 14 dígitos");
      }

      // Remove formatação do CNPJ antes de enviar
      const dataToSend: CreateEmpresaRequest = {
        ...formData,
        cnpj: cleanCNPJ(formData.cnpj),
      };

      await empresaService.create(dataToSend);
      setSuccess(true);

      // Redirecionar após 1 segundo
      setTimeout(() => {
        router.push("/dashboard/empresas");
      }, 1000);
    } catch (err) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || error.message || "Erro ao cadastrar empresa"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/empresas")}
          sx={{ mr: 2, textTransform: "none", color: "text.secondary" }}
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Cadastrar Nova Empresa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha os dados abaixo para cadastrar uma nova empresa
          </Typography>
        </Box>
      </Box>

      {/* Mensagens de feedback */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Empresa cadastrada com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Formulário */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Razão Social"
                  value={formData.razao_social}
                  onChange={(e) => handleChange("razao_social", e.target.value)}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Fantasia"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="00.000.000/0000-00"
                  helperText="Digite apenas os números do CNPJ"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/empresas")}
                    disabled={loading}
                    sx={{ textTransform: "none", minWidth: 120 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                    sx={{
                      bgcolor: "#8270FF",
                      "&:hover": { bgcolor: "#6c5ce7" },
                      textTransform: "none",
                      minWidth: 120,
                    }}
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
