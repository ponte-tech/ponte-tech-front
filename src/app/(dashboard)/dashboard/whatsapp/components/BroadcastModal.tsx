"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
  alpha,
  Autocomplete,
  FormControl,
  FormLabel,
  Divider,
} from "@mui/material";
import {
  Send as SendIcon,
  CampaignOutlined as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { BroadcastMessageRequest, BroadcastMessageResponse } from "@/app/types/comunicacao";
import { ColaboradorListItem } from "@/app/types/api";

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (data: BroadcastMessageRequest) => Promise<BroadcastMessageResponse>;
  onSuccess?: () => void; // Callback para atualizar conversas após envio
  colaboradores: ColaboradorListItem[];
  loadingColaboradores: boolean;
}

export default function BroadcastModal({
  open,
  onClose,
  onSend,
  onSuccess,
  colaboradores,
  loadingColaboradores,
}: BroadcastModalProps) {
  const [sendType, setSendType] = useState<"all" | "specific">("all");
  const [selectedColaboradores, setSelectedColaboradores] = useState<ColaboradorListItem[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setTimeout(() => {
        setSendType("all");
        setSelectedColaboradores([]);
        setMessage("");
        setSending(false);
        setResult(null);
        setError(null);
      }, 300);
    }
  }, [open]);

  // Auto-fechar modal após envio bem-sucedido
  useEffect(() => {
    if (result && result.total_sent > 0) {
      // Chamar callback de sucesso para atualizar conversas
      if (onSuccess) {
        onSuccess();
      }

      // Fechar modal após 2 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [result, onSuccess, onClose]);

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Por favor, digite uma mensagem");
      return;
    }

    if (sendType === "specific" && selectedColaboradores.length === 0) {
      setError("Por favor, selecione pelo menos um colaborador");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const data: BroadcastMessageRequest = {
        message: message.trim(),
      };

      if (sendType === "all") {
        data.send_to_all = true;
      } else if (sendType === "specific") {
        data.collaborator_ids = selectedColaboradores.map((c) => c.id);
      }

      const response = await onSend(data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar mensagens");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      onClose();
    }
  };

  const isValid = () => {
    if (!message.trim()) return false;
    if (sendType === "specific" && selectedColaboradores.length === 0) return false;
    return true;
  };

  const activeColaboradores = colaboradores.filter((c) => c.status === "ativo");

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
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
        <CampaignIcon sx={{ color: "#8270FF" }} />
        <Box component="span" sx={{ fontWeight: 600, fontSize: "1.25rem", color: "#8270FF" }}>
          Enviar Mensagem em Massa
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {result ? (
          // Success/Result View
          <Box sx={{ py: 2 }}>
            <Alert
              severity={result.total_failed === 0 ? "success" : "warning"}
              icon={result.total_failed === 0 ? <CheckCircleIcon /> : <ErrorIcon />}
              sx={{ mb: 3 }}
            >
              {result.total_failed === 0
                ? "Todas as mensagens foram enviadas com sucesso!"
                : "Algumas mensagens falharam ao enviar"}
            </Alert>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <Chip
                label={`Total: ${result.total_queued}`}
                sx={{
                  bgcolor: alpha("#8270FF", 0.1),
                  color: "#8270FF",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Enviadas: ${result.total_sent}`}
                color="success"
                sx={{ fontWeight: 600 }}
              />
              {result.total_failed > 0 && (
                <Chip
                  label={`Falhadas: ${result.total_failed}`}
                  color="error"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {result.failures && result.failures.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Falhas:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                  {result.failures.map((failure, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{failure.name}</strong> ({failure.phone})
                      </Typography>
                      <Typography variant="caption">{failure.error}</Typography>
                    </Alert>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          // Form View
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600, color: "#8270FF" }}>
                Destinatários
              </FormLabel>
              <RadioGroup value={sendType} onChange={(e) => setSendType(e.target.value as any)}>
                <FormControlLabel
                  value="all"
                  control={<Radio sx={{ color: "#8270FF", "&.Mui-checked": { color: "#8270FF" } }} />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Todos os colaboradores ativos
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loadingColaboradores
                          ? "Carregando..."
                          : `${activeColaboradores.length} colaboradores`}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="specific"
                  control={<Radio sx={{ color: "#8270FF", "&.Mui-checked": { color: "#8270FF" } }} />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Colaboradores específicos
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            {sendType === "specific" && (
              <Autocomplete
                multiple
                options={activeColaboradores}
                getOptionLabel={(option) => `${option.nome_completo} - ${option.celular}`}
                value={selectedColaboradores}
                onChange={(_, newValue) => setSelectedColaboradores(newValue)}
                loading={loadingColaboradores}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecione os colaboradores"
                    placeholder="Buscar colaboradores..."
                    sx={{ mb: 3 }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.nome_completo}
                      size="small"
                      sx={{
                        bgcolor: alpha("#8270FF", 0.1),
                        color: "#8270FF",
                      }}
                    />
                  ))
                }
              />
            )}

            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Mensagem"
              placeholder="Digite a mensagem que será enviada para todos os destinatários..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              helperText={`${message.length}/4096 caracteres`}
              inputProps={{ maxLength: 4096 }}
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
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {result ? (
          <Button onClick={handleClose} variant="contained" sx={{ bgcolor: "#8270FF" }}>
            Fechar
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={sending}>
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              variant="contained"
              disabled={!isValid() || sending}
              startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                bgcolor: "#8270FF",
                "&:hover": {
                  bgcolor: alpha("#8270FF", 0.8),
                },
              }}
            >
              {sending ? "Enviando..." : "Enviar Mensagens"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
