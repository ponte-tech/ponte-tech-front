"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  CreditCard as CPFIcon,
} from "@mui/icons-material";
import { SignupContadorRequest } from "@/app/types/api";

interface ContadorSignupFormProps {
  onDataChange: (data: Partial<SignupContadorRequest>) => void;
  formData: Partial<SignupContadorRequest>;
  errors?: Record<string, string>;
}

export default function ContadorSignupForm({
  onDataChange,
  formData,
  errors = {},
}: ContadorSignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof SignupContadorRequest, value: any) => {
    onDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Este formulário é preenchido por administrador. A senha será necessária para login posterior.
      </Alert>

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
