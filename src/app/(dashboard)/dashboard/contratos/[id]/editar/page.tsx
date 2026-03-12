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
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import contratoService from "@/app/services/contratoService";
import clienteService from "@/app/services/clienteService";
import type { Contrato, UpdateContratoRequest } from "@/app/types/contrato";
import type { Cliente } from "@/app/types/cliente";
import { useAuth } from "@/app/hooks/useAuth";

export default function EditarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contrato, setContrato] = useState<Contrato | null>(null);
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
        console.error("Erro ao carregar clientes:", err);
        setError("Erro ao carregar lista de clientes");
      } finally {
        setLoadingClientes(false);
      }
    };

    loadClientes();
  }, []);

  const [formData, setFormData] = useState<UpdateContratoRequest>({
    titulo: "",
    descricao: "",
    valor: 0,
    data_inicio: "",
    data_fim: "",
  });

  // Carregar dados do contrato
  useEffect(() => {
    const loadContrato = async () => {
      try {
        setLoading(true);
        const response = await contratoService.list();
        const contratoEncontrado = response.contratos.find((c) => c.contrato_id === id);

        if (!contratoEncontrado) {
          setError("Contrato não encontrado");
          setTimeout(() => router.push("/dashboard/contratos"), 2000);
          return;
        }

        setContrato(contratoEncontrado);
        setFormData({
          titulo: contratoEncontrado.titulo || "",
          descricao: contratoEncontrado.descricao || "",
          valor: contratoEncontrado.valor || 0,
          data_inicio: contratoEncontrado.data_inicio || "",
          data_fim: contratoEncontrado.data_fim || "",
        });
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Erro ao carregar contrato");
      } finally {
        setLoading(false);
      }
    };

    loadContrato();
  }, [id, router]);

  const handleChange = (field: keyof UpdateContratoRequest, value: string | number) => {
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
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!formData.titulo || !formData.descricao ||
          formData.valor <= 0 || !formData.data_inicio) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Valida se data fim é maior que data início (se data fim foi informada)
      if (formData.data_fim && new Date(formData.data_fim) < new Date(formData.data_inicio)) {
        throw new Error("A data de fim deve ser maior que a data de início");
      }

      if (!contrato) {
        throw new Error("Contrato não encontrado");
      }

      await contratoService.update(id, contrato.cliente_id, formData);
      setSuccess(true);

      // Redirecionar após 1 segundo
      setTimeout(() => {
        router.push("/dashboard/contratos");
      }, 1000);
    } catch (err) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || error.message || "Erro ao atualizar contrato");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

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
            Editar Contrato
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atualize os dados do contrato {contrato?.titulo}
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
          Contrato atualizado com sucesso! Redirecionando...
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
                  label="Cliente"
                  value={contrato?.cliente_nome || ""}
                  disabled
                  helperText="O cliente não pode ser alterado"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  required
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                    disabled={saving}
                    sx={{ textTransform: "none", minWidth: 120 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                    sx={{
                      bgcolor: "#8270FF",
                      "&:hover": { bgcolor: "#6c5ce7" },
                      textTransform: "none",
                      minWidth: 120,
                    }}
                  >
                    {saving ? "Salvando..." : "Salvar"}
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
