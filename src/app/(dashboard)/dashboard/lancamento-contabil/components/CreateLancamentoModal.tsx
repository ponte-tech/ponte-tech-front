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
  alpha,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
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
  const [emitirNotaFiscal, setEmitirNotaFiscal] = useState(true);
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
      setEmitirNotaFiscal(true);
      setError(null);
    }
  }, [open, defaultMesReferencia]);

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.list({ status: 'ativo' });
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
        emitir_nota_fiscal: emitirNotaFiscal,
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            bgcolor: alpha("#8270FF", 0.05),
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <CalendarIcon sx={{ color: "#8270FF" }} />
          <Box component="span" sx={{ fontWeight: 600, fontSize: "1.25rem", color: "#8270FF" }}>
            Novo Lançamento Contábil
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#8270FF",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#8270FF",
                    },
                  }}
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
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#8270FF",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#8270FF",
                },
              }}
            />

            {/* Valor */}
            <TextField
              label="Valor da Nota Fiscal"
              value={valorNotaFiscal}
              onChange={(e) => setValorNotaFiscal(applyCurrencyMask(e.target.value))}
              placeholder="R$ 0,00"
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#8270FF",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#8270FF",
                },
              }}
            />

            {/* Emitir Nota Fiscal */}
            <FormControlLabel
              control={
                <Switch
                  checked={emitirNotaFiscal}
                  onChange={(e) => setEmitirNotaFiscal(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#8270FF",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#8270FF",
                    },
                  }}
                />
              }
              label="Emitir Nota Fiscal?"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontWeight: 500,
                  color: "#0f172a",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !selectedCliente || !mesReferencia || !valorNotaFiscal}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#8270FF",
              "&:hover": {
                bgcolor: alpha("#8270FF", 0.8),
              },
            }}
          >
            {submitting ? "Criando..." : "Criar Lançamento"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
