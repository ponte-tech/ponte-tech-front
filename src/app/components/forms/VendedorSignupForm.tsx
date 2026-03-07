"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  CreditCard as CPFIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { SignupVendedorRequest } from "@/app/types/api";
import cepService from "@/app/services/cepService";
import { MaskedTextField } from "@/app/components/forms/MaskedTextField";

interface VendedorSignupFormProps {
  onDataChange: (data: Partial<SignupVendedorRequest>) => void;
  formData: Partial<SignupVendedorRequest>;
  errors?: Record<string, string>;
}

export default function VendedorSignupForm({
  onDataChange,
  formData,
  errors = {},
}: VendedorSignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);

  const handleChange = (field: keyof SignupVendedorRequest, value: any) => {
    onDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleEnderecoChange = (field: string, value: string) => {
    onDataChange({
      ...formData,
      endereco: {
        ...formData.endereco,
        [field]: value,
      },
    });
  };

  const handleBuscarCep = async (cep: string) => {
    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      return;
    }

    setCepLoading(true);
    setCepNotFound(false);

    try {
      const endereco = await cepService.buscarEndereco(cep);

      if (endereco) {
        const transformado = cepService.transformarParaFormulario(endereco);
        onDataChange({
          ...formData,
          endereco: {
            ...formData.endereco,
            cep: cep.replace(/\D/g, ""),
            rua: transformado.logradouro,
            bairro: transformado.bairro,
            cidade: transformado.cidade,
            estado: transformado.estado,
          },
        });
        setCepNotFound(false);
      } else {
        setCepNotFound(true);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepNotFound(true);
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <Box>
      {/* Dados Pessoais */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Dados Pessoais
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome Completo"
            value={formData.nome_completo || ""}
            onChange={(e) => handleChange("nome_completo", e.target.value)}
            error={!!errors.nome_completo}
            helperText={errors.nome_completo}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "#8270FF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <MaskedTextField
            fullWidth
            label="CPF"
            maskType="cpf"
            value={formData.cpf || ""}
            onChange={(formatted) => handleChange("cpf", formatted)}
            error={!!errors.cpf}
            helperText={errors.cpf || "11 dígitos"}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CPFIcon sx={{ color: "#8270FF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data de Nascimento"
            type="date"
            value={formData.data_nascimento || ""}
            onChange={(e) => handleChange("data_nascimento", e.target.value)}
            error={!!errors.data_nascimento}
            helperText={errors.data_nascimento}
            required
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#8270FF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <MaskedTextField
            fullWidth
            label="Telefone"
            maskType="phone"
            value={formData.telefone || ""}
            onChange={(formatted) => handleChange("telefone", formatted)}
            error={!!errors.telefone}
            helperText={errors.telefone || "(11) 98765-4321"}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: "#8270FF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Segurança */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, mt: 4 }}>
        Segurança
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Senha"
            type={showPassword ? "text" : "password"}
            value={formData.senha || ""}
            onChange={(e) => handleChange("senha", e.target.value)}
            error={!!errors.senha}
            helperText={
              errors.senha || "Min 8 caracteres, 1 maiúscula, 1 número, 1 especial"
            }
            required
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Endereço */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, mt: 4 }}>
        Endereço (Opcional)
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <MaskedTextField
            fullWidth
            label="CEP"
            maskType="cep"
            value={formData.endereco?.cep || ""}
            onChange={(formatted) => handleEnderecoChange("cep", formatted)}
            onBlur={() => handleBuscarCep(formData.endereco?.cep || "")}
            disabled={cepLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationIcon sx={{ color: "#8270FF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} />

        {cepNotFound && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              CEP não encontrado. Preencha o endereço manualmente.
            </Alert>
          </Grid>
        )}

        {cepLoading && (
          <Grid item xs={12}>
            <Alert
              severity="info"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 2,
              }}
            >
              <CircularProgress size={20} />
              Buscando endereço...
            </Alert>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Rua"
            value={formData.endereco?.rua || ""}
            onChange={(e) => handleEnderecoChange("rua", e.target.value)}
            placeholder="Avenida Paulista"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Número"
            value={formData.endereco?.numero || ""}
            onChange={(e) => handleEnderecoChange("numero", e.target.value)}
            placeholder="1578"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Complemento"
            value={formData.endereco?.complemento || ""}
            onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
            placeholder="Apto 500"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Bairro"
            value={formData.endereco?.bairro || ""}
            onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
            placeholder="Centro"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cidade"
            value={formData.endereco?.cidade || ""}
            onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
            placeholder="São Paulo"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Estado"
            value={formData.endereco?.estado || ""}
            onChange={(e) => handleEnderecoChange("estado", e.target.value)}
            placeholder="SP"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Termos */}
      <Box sx={{ mt: 4 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.termos_aceite || false}
              onChange={(e) => handleChange("termos_aceite", e.target.checked)}
            />
          }
          label="Aceito os termos e condições de uso"
        />
      </Box>
    </Box>
  );
}
