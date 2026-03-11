"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useState } from "react";
import contratosService from "@/app/services/contratosService";
import type { CreateContratoRequest } from "@/app/types/api";
import { applyCurrencyMask, removeCurrencyMask, formatCurrency } from "@/app/utils/currencyMask";

interface ContractFormProps {
  userId: string;
  onContractAdded: () => void;
}

export default function ContractForm({ userId, onContractAdded }: ContractFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [valorHoraDisplay, setValorHoraDisplay] = useState("R$ 0,00");

  const [formData, setFormData] = useState<CreateContratoRequest>({
    data_inicio: "",
    data_fim: "",
    valor_hora: 0,
    total_hora_mes: 160,
    tipo_chave_pix: "cpf",
    chave_pix: "",
    data_pagamento: "5",
  });

  const handleChange = (field: keyof CreateContratoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleValorHoraChange = (value: string) => {
    const masked = applyCurrencyMask(value);
    const numeric = removeCurrencyMask(masked);
    setValorHoraDisplay(masked);
    setFormData((prev) => ({ ...prev, valor_hora: numeric }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!formData.data_inicio) {
        throw new Error("A data de início do contrato é obrigatória");
      }

      if (!formData.data_fim) {
        throw new Error("A data de fim do contrato é obrigatória");
      }

      if (formData.valor_hora <= 0) {
        throw new Error("O valor por hora deve ser maior que zero");
      }

      if (formData.total_hora_mes <= 0 || formData.total_hora_mes > 220) {
        throw new Error("O total de horas por mês deve estar entre 1 e 220");
      }

      if (!formData.chave_pix) {
        throw new Error("A chave PIX é obrigatória");
      }

      await contratosService.create(userId, formData);
      setSuccess(true);

      // Reset form
      setFormData({
        data_inicio: "",
        data_fim: "",
        valor_hora: 0,
        total_hora_mes: 160,
        tipo_chave_pix: "cpf",
        chave_pix: "",
        data_pagamento: "5",
      });
      setValorHoraDisplay("R$ 0,00");

      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        onContractAdded();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao criar contrato");
      console.error("Erro ao criar contrato:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {!showForm ? (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          sx={{ textTransform: "none" }}
          fullWidth
        >
          Adicionar Novo Contrato
        </Button>
      ) : (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Adicionar Novo Contrato
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Collapse in={success}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Contrato criado com sucesso!
              </Alert>
            </Collapse>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data de Início do Contrato"
                    type="date"
                    required
                    value={formData.data_inicio}
                    onChange={(e) => handleChange("data_inicio", e.target.value)}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data de Fim do Contrato"
                    type="date"
                    required
                    value={formData.data_fim}
                    onChange={(e) => handleChange("data_fim", e.target.value)}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor por Hora"
                    required
                    value={valorHoraDisplay}
                    onChange={(e) => handleValorHoraChange(e.target.value)}
                    disabled={loading}
                    placeholder="R$ 0,00"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total de Horas por Mês"
                    type="number"
                    required
                    value={formData.total_hora_mes}
                    onChange={(e) => handleChange("total_hora_mes", parseFloat(e.target.value))}
                    disabled={loading}
                    inputProps={{ min: 1, max: 220, step: 0.5 }}
                    helperText="Máximo de 220 horas/mês"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Total Mensal (R$)"
                    type="text"
                    value={`R$ ${(formData.valor_hora * formData.total_hora_mes).toFixed(2)}`}
                    disabled
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "#000",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                      },
                    }}
                    helperText="Calculado automaticamente"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Tipo de Chave PIX</InputLabel>
                    <Select
                      value={formData.tipo_chave_pix}
                      label="Tipo de Chave PIX"
                      onChange={(e) => handleChange("tipo_chave_pix", e.target.value)}
                      disabled={loading}
                    >
                      <MenuItem value="cpf">CPF</MenuItem>
                      <MenuItem value="cnpj">CNPJ</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="telefone">Telefone</MenuItem>
                      <MenuItem value="aleatoria">Chave Aleatória</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Chave PIX"
                    required
                    value={formData.chave_pix}
                    onChange={(e) => handleChange("chave_pix", e.target.value)}
                    disabled={loading}
                    placeholder="Informe a chave PIX"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dia do Pagamento"
                    type="number"
                    required
                    value={formData.data_pagamento}
                    onChange={(e) => handleChange("data_pagamento", e.target.value)}
                    disabled={loading}
                    inputProps={{ min: 1, max: 31 }}
                    helperText="Dia do mês (1-31)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowForm(false)}
                      disabled={loading}
                      sx={{ textTransform: "none" }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        bgcolor: "#8270FF",
                        "&:hover": { bgcolor: "#6c5ce7" },
                        textTransform: "none",
                      }}
                    >
                      {loading ? <CircularProgress size={20} /> : "Adicionar Contrato"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
