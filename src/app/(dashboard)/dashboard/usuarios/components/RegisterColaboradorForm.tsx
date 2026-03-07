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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Key as KeyIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import authService from "@/app/services/authService";
import cepService from "@/app/services/cepService";
import { SignupColaboradorRequest } from "@/app/types/api";
import { MaskedTextField } from "@/app/components/forms/MaskedTextField";

interface RegisterColaboradorFormProps {
  onSuccess: (message: string) => void;
}

const steps = [
  "Dados Pessoais",
  "Endereço",
  "Dados Contratuais",
  "Dados Financeiros",
];

export default function RegisterColaboradorForm({ onSuccess }: RegisterColaboradorFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const [formData, setFormData] = useState<Partial<SignupColaboradorRequest>>({
    nome_completo: "",
    cpf: "",
    cnpj: "",
    celular: "",
    senha: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    dados_contratuais: {
      data_contratacao: "",
      valor_hora: 0,
      total_hora_mes: 0,
    },
    dados_financeiros: {
      chave_pix: "",
      data_pagamento: "15",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: {
        cep: prev.endereco?.cep || "",
        logradouro: prev.endereco?.logradouro || "",
        numero: prev.endereco?.numero || "",
        complemento: prev.endereco?.complemento || "",
        bairro: prev.endereco?.bairro || "",
        cidade: prev.endereco?.cidade || "",
        estado: prev.endereco?.estado || "",
        [field]: value,
      },
    }));
  };

  const handleDadosContrataisChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      dados_contratuais: {
        data_contratacao: prev.dados_contratuais?.data_contratacao || "",
        valor_hora: prev.dados_contratuais?.valor_hora || 0,
        total_hora_mes: prev.dados_contratuais?.total_hora_mes || 0,
        [field]: value,
      },
    }));
  };

  const handleDadosFinanceirosChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dados_financeiros: {
        chave_pix: prev.dados_financeiros?.chave_pix || "",
        data_pagamento: prev.dados_financeiros?.data_pagamento || "15",
        [field]: value,
      },
    }));
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
        // CEP encontrado - preenche os campos automaticamente
        const transformado = cepService.transformarParaFormulario(endereco);
        setFormData((prev) => ({
          ...prev,
          endereco: {
            cep: cep.replace(/\D/g, ""),
            logradouro: transformado.logradouro,
            numero: prev.endereco?.numero || "",
            complemento: prev.endereco?.complemento || "",
            bairro: transformado.bairro,
            cidade: transformado.cidade,
            estado: transformado.estado,
          },
        }));
        setCepNotFound(false);
      } else {
        // CEP não encontrado - desbloqueio campos para preenchimento manual
        setCepNotFound(true);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepNotFound(true);
    } finally {
      setCepLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const fullData = formData as SignupColaboradorRequest;

      // Validações básicas
      if (!fullData.nome_completo?.trim()) {
        throw new Error("Nome completo é obrigatório");
      }
      if (!fullData.cpf?.trim()) {
        throw new Error("CPF é obrigatório");
      }
      if (!fullData.cnpj?.trim()) {
        throw new Error("CNPJ é obrigatório");
      }
      if (!fullData.celular?.trim()) {
        throw new Error("Celular é obrigatório");
      }
      if (!fullData.senha?.trim()) {
        throw new Error("Senha é obrigatória");
      }
      if (!fullData.endereco?.cep?.trim()) {
        throw new Error("CEP é obrigatório");
      }
      if (!fullData.endereco?.logradouro?.trim()) {
        throw new Error("Logradouro é obrigatório");
      }
      if (!fullData.endereco?.numero?.trim()) {
        throw new Error("Número é obrigatório");
      }
      if (!fullData.endereco?.bairro?.trim()) {
        throw new Error("Bairro é obrigatório");
      }
      if (!fullData.endereco?.cidade?.trim()) {
        throw new Error("Cidade é obrigatória");
      }
      if (!fullData.endereco?.estado?.trim()) {
        throw new Error("Estado é obrigatório");
      }
      if (!fullData.dados_contratuais?.data_contratacao?.trim()) {
        throw new Error("Data de contratação é obrigatória");
      }
      if (!fullData.dados_contratuais?.valor_hora || fullData.dados_contratuais.valor_hora <= 0) {
        throw new Error("Valor hora deve ser maior que 0");
      }
      if (!fullData.dados_contratuais?.total_hora_mes || fullData.dados_contratuais.total_hora_mes <= 0 || fullData.dados_contratuais.total_hora_mes > 220) {
        throw new Error("Total de horas por mês deve estar entre 1 e 220");
      }
      if (!fullData.dados_financeiros?.chave_pix?.trim()) {
        throw new Error("Chave PIX é obrigatória");
      }
      if (!fullData.dados_financeiros?.data_pagamento?.trim()) {
        throw new Error("Data de pagamento é obrigatória");
      }
      const dia = parseInt(fullData.dados_financeiros.data_pagamento);
      if (dia < 1 || dia > 28) {
        throw new Error("Dia de pagamento deve estar entre 1 e 28");
      }

      await authService.registerColaborador(fullData);

      onSuccess("Colaborador registrado com sucesso! ✅");

      // Reset form
      setFormData({
        nome_completo: "",
        cpf: "",
        cnpj: "",
        celular: "",
        senha: "",
        endereco: {
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
        },
        dados_contratuais: {
          data_contratacao: "",
          valor_hora: 0,
          total_hora_mes: 0,
        },
        dados_financeiros: {
          chave_pix: "",
          data_pagamento: "15",
        },
      });
      setActiveStep(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar colaborador";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      // Step 0: Dados Pessoais
      case 0:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome_completo"
                value={formData.nome_completo || ""}
                onChange={handleChange}
                required
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
                value={formData.cpf || ""}
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

            <Grid item xs={12} sm={6}>
              <MaskedTextField
                fullWidth
                label="CNPJ"
                name="cnpj"
                maskType="cnpj"
                value={formData.cnpj || ""}
                onChange={(formatted) =>
                  setFormData((prev) => ({ ...prev, cnpj: formatted }))
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: "#8270FF" }} />
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                value={formData.senha || ""}
                onChange={handleChange}
                required
                helperText="Min 8 caracteres, 1 maiúscula, 1 número, 1 especial"
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
          </Grid>
        );

      // Step 1: Endereço
      case 1: {
        const cepValue = formData.endereco?.cep || "";
        const isCepPreenchido = !!(cepValue && cepValue.length === 8);
        const blockedFields = isCepPreenchido && !cepNotFound;

        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <MaskedTextField
                fullWidth
                label="CEP"
                name="cep"
                maskType="cep"
                value={formData.endereco?.cep || ""}
                onChange={(formatted) =>
                  handleEnderecoChange("cep", formatted)
                }
                onBlur={() => handleBuscarCep(formData.endereco?.cep || "")}
                required
                disabled={cepLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} />

            {/* Alert de CEP não encontrado */}
            {cepNotFound && (
              <Grid item xs={12}>
                <Alert severity="info">
                  CEP não encontrado na base viaCEP. Preencha o endereço manualmente.
                </Alert>
              </Grid>
            )}

            {/* Alert de carregamento */}
            {cepLoading && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  Buscando endereço...
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Logradouro"
                value={formData.endereco?.logradouro || ""}
                onChange={(e) => handleEnderecoChange("logradouro", e.target.value)}
                required
                disabled={blockedFields}
                placeholder="Avenida Paulista"
                helperText={blockedFields ? "Preenchido via viaCEP" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número"
                value={formData.endereco?.numero || ""}
                onChange={(e) => handleEnderecoChange("numero", e.target.value)}
                required
                placeholder="1578"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Complemento"
                value={formData.endereco?.complemento || ""}
                onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
                placeholder="Apto 500"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.endereco?.bairro || ""}
                onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
                required
                disabled={blockedFields}
                placeholder="Centro"
                helperText={blockedFields ? "Preenchido via viaCEP" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.endereco?.cidade || ""}
                onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
                required
                disabled={blockedFields}
                placeholder="São Paulo"
                helperText={blockedFields ? "Preenchido via viaCEP" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado"
                value={formData.endereco?.estado || ""}
                onChange={(e) => handleEnderecoChange("estado", e.target.value)}
                required
                disabled={blockedFields}
                placeholder="SP"
                helperText={blockedFields ? "Preenchido via viaCEP" : ""}
              />
            </Grid>
          </Grid>
        );
      }

      // Step 2: Dados Contratuais
      case 2:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data de Contratação"
                type="date"
                value={formData.dados_contratuais?.data_contratacao || ""}
                onChange={(e) =>
                  handleDadosContrataisChange("data_contratacao", e.target.value)
                }
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
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
                  handleDadosContrataisChange("valor_hora", parseFloat(e.target.value) || 0)
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total de Horas/Mês"
                type="number"
                inputProps={{ step: "1", min: "1", max: "220" }}
                value={formData.dados_contratuais?.total_hora_mes || ""}
                onChange={(e) =>
                  handleDadosContrataisChange("total_hora_mes", parseInt(e.target.value) || 0)
                }
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">horas</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        );

      // Step 3: Dados Financeiros
      case 3:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chave PIX"
                value={formData.dados_financeiros?.chave_pix || ""}
                onChange={(e) => handleDadosFinanceirosChange("chave_pix", e.target.value)}
                required
                placeholder="email@example.com"
                helperText="CPF, CNPJ, email, telefone ou UUID"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dia do Pagamento"
                type="number"
                inputProps={{ step: "1", min: "1", max: "28" }}
                value={formData.dados_financeiros?.data_pagamento || "15"}
                onChange={(e) => handleDadosFinanceirosChange("data_pagamento", e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">do mês</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Registrar Novo Colaborador
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ⚠️ Apenas administradores podem registrar colaboradores. O acesso será criado
            automaticamente com email: CPF@colaborador.interno
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Form Content */}
        <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Anterior
          </Button>

          <Box sx={{ flex: 1 }} />

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "white" }} />
                  Registrando...
                </Box>
              ) : (
                "Registrar Colaborador"
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              sx={{
                background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
              }}
            >
              Próximo
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
