"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import authService from "@/app/services/authService";
import { SignupContadorRequest } from "@/app/types/api";
import { MaskedTextField } from "@/app/components/forms/MaskedTextField";

interface RegisterContadorFormProps {
  onSuccess: (message: string) => void;
}

export default function RegisterContadorForm({ onSuccess }: RegisterContadorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<SignupContadorRequest>>({
    nome_completo: "",
    email: "",
    senha: "",
    cpf: "",
    celular: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validações
      if (!formData.nome_completo?.trim()) {
        throw new Error("Nome completo é obrigatório");
      }
      if (!formData.email?.trim()) {
        throw new Error("Email é obrigatório");
      }
      if (!formData.email?.includes("@")) {
        throw new Error("Email inválido");
      }
      if (!formData.senha) {
        throw new Error("Senha é obrigatória");
      }
      if (formData.senha.length < 8) {
        throw new Error("Senha deve ter pelo menos 8 caracteres");
      }
      if (!/[A-Z]/.test(formData.senha)) {
        throw new Error("Senha deve conter pelo menos uma letra maiúscula");
      }
      if (!/[0-9]/.test(formData.senha)) {
        throw new Error("Senha deve conter pelo menos um número");
      }
      if (!/[@#$%&!*]/.test(formData.senha)) {
        throw new Error("Senha deve conter pelo menos um caractere especial (@, #, $, %, &, !)");
      }
      if (!formData.cpf?.trim()) {
        throw new Error("CPF é obrigatório");
      }
      if (!formData.celular?.trim()) {
        throw new Error("Celular é obrigatório");
      }

      await authService.registerContador(formData as SignupContadorRequest);

      onSuccess("Contador registrado com sucesso! ✅");

      // Limpar formulário
      setFormData({
        nome_completo: "",
        email: "",
        senha: "",
        cpf: "",
        celular: "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar contador";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Registrar Novo Contador
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ⚠️ Apenas administradores podem registrar contadores. O contador receberá um
            email de boas-vindas com as instruções de acesso.
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Informações Pessoais */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#8270FF", mb: 2 }}>
                📋 Informações Pessoais
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                required
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MaskedTextField
                fullWidth
                label="CPF"
                name="cpf"
                maskType="cpf"
                value={formData.cpf}
                onChange={(formatted) =>
                  setFormData((prev) => ({ ...prev, cpf: formatted }))
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <MaskedTextField
                fullWidth
                label="Celular"
                name="celular"
                maskType="phone"
                value={formData.celular || ""}
                onChange={(formatted) =>
                  setFormData((prev) => ({ ...prev, celular: formatted }))
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Credenciais */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#8270FF", mb: 2 }}>
                🔐 Credenciais de Acesso
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha"
                name="senha"
                type={showPassword ? "text" : "password"}
                value={formData.senha || ""}
                onChange={handleChange}
                required
                helperText="Mín. 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial (@, #, $, %, &, !)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#8270FF" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Password Requirements */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "rgba(130, 112, 255, 0.05)",
                  border: "1px solid rgba(130, 112, 255, 0.2)",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                  ✅ Requisitos de Senha:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, fontSize: "0.875rem" }}>
                  <li>Mínimo 8 caracteres</li>
                  <li>Pelo menos 1 letra maiúscula</li>
                  <li>Pelo menos 1 número</li>
                  <li>Pelo menos 1 caractere especial (@, #, $, %, &, !)</li>
                </Box>
              </Box>
            </Grid>

            {/* Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
                  boxShadow: "0 4px 14px rgba(130, 112, 255, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #6a5dd9 0%, #5a4dbf 100%)",
                    boxShadow: "0 6px 20px rgba(130, 112, 255, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #c0b8e8 0%, #b0a5dc 100%)",
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: "white" }} />
                    Registrando...
                  </Box>
                ) : (
                  "Registrar Contador"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
