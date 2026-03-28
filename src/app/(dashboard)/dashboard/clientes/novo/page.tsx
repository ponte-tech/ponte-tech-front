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
  MenuItem,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import clienteService from "@/app/services/clienteService";
import empresaService from "@/app/services/empresaService";
import type { CreateClienteRequest } from "@/app/types/cliente";
import type { Empresa } from "@/app/types/empresa";
import { useAuth } from "@/app/hooks/useAuth";
import { formatCNPJ, cleanCNPJ } from "@/app/utils/cnpjValidator";

export default function NovoClientePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && user.perfil !== "admin" && !user.perfis?.includes("admin")) {
      router.push("/dashboard/clientes");
    }
  }, [user, router]);

  // Carregar lista de empresas
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        const response = await empresaService.list();
        setEmpresas(response.empresas);
      } catch (err) {
    // console.error("Erro ao carregar empresas:", err);
        setError("Erro ao carregar lista de empresas");
      } finally {
        setLoadingEmpresas(false);
      }
    };

    loadEmpresas();
  }, []);

  const [formData, setFormData] = useState<CreateClienteRequest>({
    empresa_id: "",
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
  });

  const handleChange = (field: keyof CreateClienteRequest, value: string) => {
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
      if (!formData.empresa_id || !formData.razao_social || !formData.nome_fantasia || !formData.cnpj) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Valida apenas o tamanho do CNPJ
      if (cleanCNPJ(formData.cnpj).length !== 14) {
        throw new Error("CNPJ deve conter 14 dígitos");
      }

      // Remove formatação do CNPJ antes de enviar
      const dataToSend: CreateClienteRequest = {
        ...formData,
        cnpj: cleanCNPJ(formData.cnpj),
      };

      await clienteService.create(dataToSend);
      setSuccess(true);

      // Redirecionar após 1 segundo
      setTimeout(() => {
        router.push("/dashboard/clientes");
      }, 1000);
    } catch (err) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || error.message || "Erro ao cadastrar cliente"
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
          onClick={() => router.push("/dashboard/clientes")}
          sx={{ mr: 2, textTransform: "none", color: "text.secondary" }}
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Cadastrar Novo Cliente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha os dados abaixo para cadastrar um novo cliente
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
          Cliente cadastrado com sucesso! Redirecionando...
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
                  select
                  label="Empresa"
                  value={formData.empresa_id || ""}
                  onChange={(e) => handleChange("empresa_id", e.target.value)}
                  required
                  disabled={loading || loadingEmpresas}
                  helperText={loadingEmpresas ? "Carregando empresas..." : "Selecione a empresa do cliente"}
                >
                  {empresas.map((empresa) => (
                    <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>
                      {empresa.razao_social}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

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
                    onClick={() => router.push("/dashboard/clientes")}
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
