import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import clienteService from "@/app/services/clienteService";
import type { Cliente } from "@/app/types/cliente";
import type { CreateLancamentoRequest } from "@/app/types/lancamentoContabil";
import { applyCurrencyMask, removeCurrencyMask } from "@/app/utils/currencyMask";

interface CreateLancamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMesReferencia?: string;
}

export default function CreateLancamentoModal({
  open,
  onClose,
  onSuccess,
  defaultMesReferencia,
}: CreateLancamentoModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [mesReferencia, setMesReferencia] = useState(defaultMesReferencia || "");
  const [valorNotaFiscal, setValorNotaFiscal] = useState("R$ 0,00");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Carregar clientes ao abrir modal
  useEffect(() => {
    if (open) {
      loadClientes();
      // Reset form when modal opens
      setSelectedCliente(null);
      setMesReferencia(defaultMesReferencia || "");
      setValorNotaFiscal("R$ 0,00");
      setError(null);
    }
  }, [open, defaultMesReferencia]);

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.list();
      setClientes(response.clientes || []);
    } catch (err) {
      setError("Erro ao carregar clientes");
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCliente) {
      setError("Selecione um cliente");
      return;
    }

    if (!mesReferencia) {
      setError("Selecione o mês de referência");
      return;
    }

    const valor = removeCurrencyMask(valorNotaFiscal);
    if (valor <= 0) {
      setError("Valor deve ser maior que zero");
      return;
    }

    try {
      setSubmitting(true);

      const data: CreateLancamentoRequest = {
        cliente_id: selectedCliente.cliente_id,
        mes_referencia: mesReferencia,
        valor_nota_fiscal: valor,
      };

      // Import dynamically to avoid circular dependency
      const { default: lancamentoContabilService } = await import("@/app/services/lancamentoContabilService");
      await lancamentoContabilService.create(data);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar lançamento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Novo Lançamento Contábil</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Cliente Autocomplete */}
            <Autocomplete
              options={clientes}
              getOptionLabel={(option) =>
                `${option.nome_fantasia} - ${option.razao_social}`
              }
              value={selectedCliente}
              onChange={(_, newValue) => setSelectedCliente(newValue)}
              loading={loadingClientes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingClientes ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {/* Mês Referência */}
            <TextField
              label="Mês/Ano Referência"
              type="month"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Valor */}
            <TextField
              label="Valor da Nota Fiscal"
              value={valorNotaFiscal}
              onChange={(e) => setValorNotaFiscal(applyCurrencyMask(e.target.value))}
              placeholder="R$ 0,00"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !selectedCliente || !mesReferencia || !valorNotaFiscal}
          >
            {submitting ? <CircularProgress size={24} /> : "Criar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
