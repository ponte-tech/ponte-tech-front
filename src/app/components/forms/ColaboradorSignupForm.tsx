"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Typography,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  CreditCard as CPFIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Business as CNPJIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { SignupColaboradorRequest } from "@/app/types/api";

interface ColaboradorSignupFormProps {
  step: number; // 0 = Dados Pessoais, 1 = Endereço, 2 = Dados Contratuais, 3 = Dados Financeiros
  onDataChange: (data: Partial<SignupColaboradorRequest>) => void;
  formData: Partial<SignupColaboradorRequest>;
  errors?: Record<string, string>;
}

export default function ColaboradorSignupForm({
  step,
  onDataChange,
  formData,
  errors = {},
}: ColaboradorSignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: any) => {
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

  const handleDadosContrataisChange = (field: string, value: any) => {
    onDataChange({
      ...formData,
      dados_contratuais: {
        ...formData.dados_contratuais,
        [field]: value,
      },
    });
  };

  const handleDadosFinanceirosChange = (field: string, value: string) => {
    onDataChange({
      ...formData,
      dados_financeiros: {
        ...formData.dados_financeiros,
        [field]: value,
      },
    });
  };

  // Step 0: Dados Pessoais
  if (step === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          Este formulário é preenchido por administrador. A senha será necessária para login posterior.
        </Alert>

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Dados Pessoais
        </Typography>

        <Grid container spacing={2}>
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
            <TextField
              fullWidth
              label="CPF"
              value={formData.cpf || ""}
              onChange={(e) => handleChange("cpf", e.target.value)}
              error={!!errors.cpf}
              helperText={errors.cpf || "11 dígitos"}
              required
              placeholder="12345678901"
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
              label="CNPJ"
              value={formData.cnpj || ""}
              onChange={(e) => handleChange("cnpj", e.target.value)}
              error={!!errors.cnpj}
              helperText={errors.cnpj || "14 dígitos"}
              required
              placeholder="12345678901234"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CNPJIcon sx={{ color: "#8270FF" }} />
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
            <TextField
              fullWidth
              label="Celular"
              value={formData.celular || ""}
              onChange={(e) => handleChange("celular", e.target.value)}
              error={!!errors.celular}
              helperText={errors.celular || "(11) 98765-4321"}
              required
              placeholder="(11) 98765-4321"
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={formData.senha || ""}
              onChange={(e) => handleChange("senha", e.target.value)}
              error={!!errors.senha}
              helperText={
                errors.senha ||
                "Min 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial"
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
      </Box>
    );
  }

  // Step 1: Endereço
  if (step === 1) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Endereço
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CEP"
              value={formData.endereco?.cep || ""}
              onChange={(e) => handleEnderecoChange("cep", e.target.value)}
              error={!!errors.endereco_cep}
              helperText={errors.endereco_cep}
              placeholder="01310100"
              required
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Logradouro"
              value={formData.endereco?.logradouro || ""}
              onChange={(e) => handleEnderecoChange("logradouro", e.target.value)}
              error={!!errors.endereco_logradouro}
              helperText={errors.endereco_logradouro}
              placeholder="Avenida Paulista"
              required
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
              error={!!errors.endereco_numero}
              helperText={errors.endereco_numero}
              placeholder="1578"
              required
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
              error={!!errors.endereco_bairro}
              helperText={errors.endereco_bairro}
              placeholder="Centro"
              required
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
              error={!!errors.endereco_cidade}
              helperText={errors.endereco_cidade}
              placeholder="São Paulo"
              required
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
              error={!!errors.endereco_estado}
              helperText={errors.endereco_estado}
              placeholder="SP"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Step 2: Dados Contratuais
  if (step === 2) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Dados Contratuais
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Data de Contratação"
              type="date"
              value={formData.dados_contratuais?.data_contratacao || ""}
              onChange={(e) => handleDadosContrataisChange("data_contratacao", e.target.value)}
              error={!!errors.data_contratacao}
              helperText={errors.data_contratacao}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ color: "#8270FF" }} />
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
              label="Valor da Hora (R$)"
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              value={formData.dados_contratuais?.valor_hora || ""}
              onChange={(e) =>
                handleDadosContrataisChange("valor_hora", parseFloat(e.target.value))
              }
              error={!!errors.valor_hora}
              helperText={errors.valor_hora}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon sx={{ color: "#8270FF" }} />
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
              label="Total de Horas/Mês"
              type="number"
              inputProps={{ min: "1", max: "220" }}
              value={formData.dados_contratuais?.total_hora_mes || ""}
              onChange={(e) =>
                handleDadosContrataisChange("total_hora_mes", parseInt(e.target.value))
              }
              error={!!errors.total_hora_mes}
              helperText={errors.total_hora_mes || "Max 220 horas"}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Step 3: Dados Financeiros
  if (step === 3) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Dados Financeiros
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Chave PIX"
              value={formData.dados_financeiros?.chave_pix || ""}
              onChange={(e) => handleDadosFinanceirosChange("chave_pix", e.target.value)}
              error={!!errors.chave_pix}
              helperText={
                errors.chave_pix ||
                "CPF, CNPJ, Email, Telefone ou UUID válido"
              }
              placeholder="pedro@example.com"
              required
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
              label="Dia do Pagamento"
              type="number"
              inputProps={{ min: "1", max: "28" }}
              value={formData.dados_financeiros?.data_pagamento || ""}
              onChange={(e) => handleDadosFinanceirosChange("data_pagamento", e.target.value)}
              error={!!errors.data_pagamento}
              helperText={errors.data_pagamento || "Entre 1 e 28"}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ color: "#8270FF" }} />
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
      </Box>
    );
  }

  return null;
}
