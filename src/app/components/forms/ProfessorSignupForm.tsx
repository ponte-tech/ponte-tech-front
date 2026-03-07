"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  CreditCard as CPFIcon,
  School as SchoolIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { SignupProfessorRequest } from "@/app/types/api";
import { MaskedTextField } from "@/app/components/forms/MaskedTextField";

interface ProfessorSignupFormProps {
  onDataChange: (data: Partial<SignupProfessorRequest>) => void;
  formData: Partial<SignupProfessorRequest>;
  errors?: Record<string, string>;
}

export default function ProfessorSignupForm({
  onDataChange,
  formData,
  errors = {},
}: ProfessorSignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof SignupProfessorRequest, value: any) => {
    onDataChange({
      ...formData,
      [field]: value,
    });
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

      {/* Experiência */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, mt: 4 }}>
        Experiência Profissional
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Especialidade"
            value={formData.especialidade || ""}
            onChange={(e) => handleChange("especialidade", e.target.value)}
            error={!!errors.especialidade}
            helperText={errors.especialidade || "Ex: Matemática"}
            required
            placeholder="Matemática"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SchoolIcon sx={{ color: "#8270FF" }} />
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
            label="Área de Atuação"
            value={formData.area_atuacao || ""}
            onChange={(e) => handleChange("area_atuacao", e.target.value)}
            error={!!errors.area_atuacao}
            helperText={errors.area_atuacao || "Ex: Educação Matemática"}
            required
            placeholder="Educação Matemática"
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
            label="Biografia"
            value={formData.biografia || ""}
            onChange={(e) => handleChange("biografia", e.target.value)}
            error={!!errors.biografia}
            helperText={errors.biografia}
            multiline
            rows={4}
            placeholder="Conte um pouco sobre sua experiência e formação..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1, mt: 1 }}>
                  <InfoIcon sx={{ color: "#8270FF" }} />
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
            label="LinkedIn (Opcional)"
            type="url"
            value={formData.linkedin_url || ""}
            onChange={(e) => handleChange("linkedin_url", e.target.value)}
            error={!!errors.linkedin_url}
            helperText={errors.linkedin_url || "Ex: https://linkedin.com/in/seu-perfil"}
            placeholder="https://linkedin.com/in/seu-perfil"
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
