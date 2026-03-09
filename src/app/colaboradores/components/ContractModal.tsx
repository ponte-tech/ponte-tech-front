"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { CreateContratoRequest, Contrato } from "@/app/types/api";
import clienteService from "@/app/services/clienteService";
import type { Cliente } from "@/app/types/cliente";

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contract: CreateContratoRequest, contratoId?: string) => void;
  loading?: boolean;
  error?: string | null;
  editingContract?: Contrato | null;
}

export default function ContractModal({ open, onClose, onSave, loading = false, error = null, editingContract = null }: ContractModalProps) {
  const [formData, setFormData] = useState<CreateContratoRequest>({
    cliente_id: "",
    nome_cliente: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    valor_hora: 0,
    total_hora_mes: 160,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Load clientes when modal opens
  useEffect(() => {
    if (open) {
      loadOptions();

      if (editingContract) {
        // Preencher formulário com dados do contrato para edição
        setFormData({
          cliente_id: editingContract.cliente_id,
          nome_cliente: editingContract.nome_cliente,
          descricao: editingContract.descricao,
          data_inicio: editingContract.data_inicio,
          data_fim: editingContract.data_fim,
          valor_hora: editingContract.valor_hora,
          total_hora_mes: editingContract.total_hora_mes,
        });
      } else {
        // Resetar formulário para novo contrato
        setFormData({
          cliente_id: "",
          nome_cliente: "",
          descricao: "",
          data_inicio: "",
          data_fim: "",
          valor_hora: 0,
          total_hora_mes: 160,
        });
      }
      setValidationError(null);
    }
  }, [open, editingContract]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const clientesResponse = await clienteService.list();
      setClientes(clientesResponse.clientes || []);
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (field: keyof CreateContratoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.cliente_id) {
      setValidationError("Selecione um cliente");
      return;
    }

    if (!formData.descricao) {
      setValidationError("A descrição do contrato é obrigatória");
      return;
    }

    if (!formData.data_inicio) {
      setValidationError("A data de início é obrigatória");
      return;
    }

    if (formData.valor_hora <= 0) {
      setValidationError("O valor por hora deve ser maior que zero");
      return;
    }

    if (formData.total_hora_mes <= 0 || formData.total_hora_mes > 220) {
      setValidationError("O total de horas por mês deve estar entre 1 e 220");
      return;
    }

    onSave(formData, editingContract?.contrato_id);
  };

  const isEditing = !!editingContract;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? "Editar Contrato" : "Adicionar Contrato"}</DialogTitle>
        <DialogContent>
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || validationError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={formData.cliente_id}
                  label="Cliente"
                  onChange={(e) => handleChange("cliente_id", e.target.value)}
                  disabled={loading || loadingOptions}
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                      {cliente.razao_social}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição do Contrato"
                required
                multiline
                rows={3}
                value={formData.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                disabled={loading}
                placeholder="Descreva as atividades e responsabilidades do contrato"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Início"
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
                label="Data de Fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => handleChange("data_fim", e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                helperText="Deixe em branco para contrato indeterminado"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor por Hora (R$)"
                type="number"
                required
                value={formData.valor_hora}
                onChange={(e) => handleChange("valor_hora", parseFloat(e.target.value))}
                disabled={loading}
                inputProps={{ min: 0, step: 0.01 }}
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

            <Grid item xs={12}>
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
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#8270FF",
              "&:hover": { bgcolor: "#6c5ce7" },
            }}
          >
            {loading ? <CircularProgress size={20} /> : isEditing ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
