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
  Typography,
  IconButton,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(130, 112, 255, 0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2.5,
            px: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: alpha('#FFFFFF', 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Novo Lançamento Contábil
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={submitting}
            sx={{
              color: '#FFFFFF',
              '&:hover': {
                background: alpha('#FFFFFF', 0.2),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha('#8270FF', 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 3px ${alpha('#8270FF', 0.2)}`,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8270FF',
                          borderWidth: 2,
                        },
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#8270FF',
                      fontWeight: 600,
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
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
                  opacity: 0.1,
                  pointerEvents: 'none',
                  zIndex: 0,
                },
              }}
            >
              <TextField
                label="Mês/Ano Referência"
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: '#8270FF',
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    pl: 7,
                    background: alpha('#8270FF', 0.02),
                    '&:hover': {
                      boxShadow: `0 0 0 2px ${alpha('#8270FF', 0.1)}`,
                      background: alpha('#8270FF', 0.04),
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha('#8270FF', 0.2)}`,
                      background: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8270FF',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& input[type="month"]::-webkit-calendar-picker-indicator': {
                    cursor: 'pointer',
                    filter: 'invert(44%) sepia(88%) saturate(1686%) hue-rotate(228deg) brightness(100%) contrast(101%)',
                    '&:hover': {
                      filter: 'invert(44%) sepia(88%) saturate(1686%) hue-rotate(228deg) brightness(120%) contrast(101%)',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <CalendarIcon
                      sx={{
                        position: 'absolute',
                        left: 16,
                        color: '#8270FF',
                        fontSize: 24,
                        zIndex: 1,
                      }}
                    />
                  ),
                }}
              />
            </Box>

            {/* Valor */}
            <TextField
              label="Valor da Nota Fiscal"
              value={valorNotaFiscal}
              onChange={(e) => setValorNotaFiscal(applyCurrencyMask(e.target.value))}
              placeholder="R$ 0,00"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha('#8270FF', 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha('#8270FF', 0.2)}`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8270FF',
                      borderWidth: 2,
                    },
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#8270FF',
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: '1px solid',
            borderColor: alpha('#e5e7eb', 0.8),
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              color: '#6b7280',
              '&:hover': {
                background: alpha('#6b7280', 0.1),
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !selectedCliente || !mesReferencia || !valorNotaFiscal}
            sx={{
              background: 'linear-gradient(135deg, #8270FF 0%, #411EFE 100%)',
              boxShadow: '0 4px 12px rgba(130, 112, 255, 0.3)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #411EFE 0%, #8270FF 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(65, 30, 254, 0.4)',
              },
              '&:disabled': {
                background: alpha('#8270FF', 0.3),
                color: alpha('#FFFFFF', 0.5),
              },
            }}
          >
            {submitting ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : "Criar Lançamento"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
