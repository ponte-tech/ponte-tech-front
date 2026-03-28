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
import contratoService from "@/app/services/contratoService";
import clienteService from "@/app/services/clienteService";
import type { CreateContratoRequest } from "@/app/types/contrato";
import type { Cliente } from "@/app/types/cliente";
import { useAuth } from "@/app/hooks/useAuth";

export default function NovoContratoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && user.perfil !== "admin" && !user.perfis?.includes("admin")) {
      router.push("/dashboard/contratos");
    }
  }, [user, router]);

  // Carregar lista de clientes
  useEffect(() => {
    const loadClientes = async () => {
      try {
        setLoadingClientes(true);
        const response = await clienteService.list();
        setClientes(response.clientes);
      } catch (err) {
    // console.error("Erro ao carregar clientes:", err);
        setError("Erro ao carregar lista de clientes");
      } finally {
        setLoadingClientes(false);
      }
    };

    loadClientes();
  }, []);

  const [formData, setFormData] = useState<CreateContratoRequest>({
    cliente_id: "",
    titulo: "",
    descricao: "",
    valor: 0,
    data_inicio: "",
    data_fim: "",
  });

  const handleChange = (field: keyof CreateContratoRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleValorChange = (value: string) => {
    // Remove tudo exceto números
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue === '') {
      handleChange("valor", 0);
      return;
    }

    // Converte centavos para reais (divide por 100)
    const numValue = parseInt(cleanValue, 10) / 100;
    handleChange("valor", numValue);
  };

  const formatValorDisplay = (value: number): string => {
    if (value === 0) return "";

    // Formata como moeda brasileira
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!formData.cliente_id || !formData.titulo || !formData.descricao ||
          formData.valor <= 0 || !formData.data_inicio) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Valida se data fim é maior que data início (se data fim foi informada)
      if (formData.data_fim && new Date(formData.data_fim) < new Date(formData.data_inicio)) {
        throw new Error("A data de fim deve ser maior que a data de início");
      }

      await contratoService.create(formData);
      setSuccess(true);

      // Redirecionar após 1 segundo
      setTimeout(() => {
        router.push("/dashboard/contratos");
      }, 1000);
    } catch (err) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || error.message || "Erro ao cadastrar contrato"
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
          onClick={() => router.push("/dashboard/contratos")}
          sx={{ mr: 2, textTransform: "none", color: "text.secondary" }}
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Cadastrar Novo Contrato
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha os dados abaixo para cadastrar um novo contrato
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
          Contrato cadastrado com sucesso! Redirecionando...
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
                  label="Cliente"
                  value={formData.cliente_id || ""}
                  onChange={(e) => handleChange("cliente_id", e.target.value)}
                  required
                  disabled={loading || loadingClientes}
                  helperText={loadingClientes ? "Carregando clientes..." : "Selecione o cliente do contrato"}
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                      {cliente.nome_fantasia}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  required
                  disabled={loading}
                  helperText="Título do contrato"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  required
                  disabled={loading}
                  multiline
                  rows={4}
                  helperText="Descrição detalhada do contrato"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valor (R$)"
                  value={formatValorDisplay(formData.valor)}
                  onChange={(e) => handleValorChange(e.target.value)}
                  required
                  disabled={loading}
                  helperText="Valor do contrato em reais"
                  inputProps={{
                    inputMode: 'decimal',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data Início"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleChange("data_inicio", e.target.value)}
                  required
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data Fim (Opcional)"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => handleChange("data_fim", e.target.value)}
                  disabled={loading}
                  helperText="Deixe vazio para contrato sem data de término"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/contratos")}
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
