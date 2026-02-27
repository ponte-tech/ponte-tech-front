"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import authService from "@/app/services/authService";
import { RegisterVendedorRequest, Endereco } from "@/app/types/api";

const steps = ["Dados Pessoais", "Endereço", "Confirmação"];

export default function CadastroVendedorPage() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [codigoVendedor, setCodigoVendedor] = useState<string>("");

  const [formData, setFormData] = useState<RegisterVendedorRequest>({
    nome_completo: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
    senha: "",
    termos_aceite: false,
    endereco: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
    },
  });

  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const handleChange = (field: keyof RegisterVendedorRequest, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
    setError(null);
  };

  const buscarCEP = async () => {
    const cep = formData.endereco.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: data.logradouro || prev.endereco.rua,
            cidade: data.localidade || prev.endereco.cidade,
            estado: data.uf || prev.endereco.estado,
          },
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  // Input masking functions
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 0) {
      if (!formData.nome_completo || formData.nome_completo.trim() === "") {
        setError("Nome completo é obrigatório");
        return false;
      }
      if (!formData.email || !formData.email.includes("@")) {
        setError("Email válido é obrigatório");
        return false;
      }
      if (!formData.telefone || formData.telefone.length < 10) {
        setError("Telefone válido é obrigatório");
        return false;
      }
      if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
        setError("CPF válido é obrigatório");
        return false;
      }
      if (!formData.data_nascimento) {
        setError("Data de nascimento é obrigatória");
        return false;
      }
      if (!formData.senha || formData.senha.length < 6) {
        setError("Senha deve ter no mínimo 6 caracteres");
        return false;
      }
      if (formData.senha !== confirmarSenha) {
        setError("As senhas não coincidem");
        return false;
      }
    }

    if (step === 1) {
      if (!formData.endereco.cep || formData.endereco.cep.replace(/\D/g, "").length !== 8) {
        setError("CEP válido é obrigatório");
        return false;
      }
      if (!formData.endereco.rua || formData.endereco.rua.trim() === "") {
        setError("Rua é obrigatória");
        return false;
      }
      if (!formData.endereco.numero || formData.endereco.numero.trim() === "") {
        setError("Número é obrigatório");
        return false;
      }
      if (!formData.endereco.cidade || formData.endereco.cidade.trim() === "") {
        setError("Cidade é obrigatória");
        return false;
      }
      if (!formData.endereco.estado || formData.endereco.estado.trim() === "") {
        setError("Estado é obrigatório");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.termos_aceite) {
        setError("Você deve aceitar os termos e condições");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await authService.registerVendedor(formData);
      setCodigoVendedor(response.codigo_vendedor || "");
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar vendedor";
      setError(errorMessage);
      console.error("Erro ao cadastrar vendedor:", err);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e2e8f0",
            color: "#2d3748",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ py: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                <SchoolIcon sx={{ fontSize: 32, mr: 1, color: "#8270FF" }} />
                <Typography variant="h6" fontWeight="700" sx={{ color: "#8270FF" }}>
                  Ponte Tech
                </Typography>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 5, textAlign: "center" }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: "#10b981", mb: 3 }} />
              <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                Cadastro Realizado com Sucesso!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Seu cadastro foi aprovado. Agora você pode começar a vender nossos cursos!
              </Typography>

              <Paper sx={{ p: 3, bgcolor: "#f7fafc", mb: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Seu código de vendedor
                </Typography>
                <Typography variant="h5" fontWeight="700" sx={{ color: "#8270FF", mb: 2 }}>
                  {codigoVendedor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use este código para gerar links de matrícula e receber suas comissões
                </Typography>
              </Paper>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/login")}
                  sx={{
                    bgcolor: "#8270FF",
                    "&:hover": { bgcolor: "#6c5ce7" },
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.5,
                  }}
                >
                  Fazer Login
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/vendas")}
                  sx={{
                    borderColor: "#8270FF",
                    color: "#8270FF",
                    "&:hover": {
                      borderColor: "#6c5ce7",
                      bgcolor: "rgba(130, 112, 255, 0.04)",
                    },
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  Ver Cursos Disponíveis
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e2e8f0",
          color: "#2d3748",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1, color: "#8270FF" }} />
              <Typography variant="h6" fontWeight="700" sx={{ color: "#8270FF" }}>
                Ponte Tech
              </Typography>
            </Box>
            <Button
              color="inherit"
              onClick={() => router.push("/login")}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "#8270FF",
              }}
            >
              Já tenho cadastro
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Image
                  src="/logo-menu.svg"
                  alt="Ponte Tech"
                  width={180}
                  height={60}
                  priority
                />
              </Box>
              <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                Torne-se um Vendedor
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Preencha seus dados e comece a vender nossos cursos
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

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Step 0: Dados Pessoais */}
            {activeStep === 0 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      required
                      value={formData.nome_completo}
                      onChange={(e) => handleChange("nome_completo", e.target.value)}
                      disabled={submitting}
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => handleChange("telefone", formatPhone(e.target.value))}
                      disabled={submitting}
                      inputProps={{ maxLength: 15 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CPF"
                      required
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
                      disabled={submitting}
                      inputProps={{ maxLength: 14 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Nascimento"
                      type="date"
                      required
                      value={formData.data_nascimento}
                      onChange={(e) => handleChange("data_nascimento", e.target.value)}
                      disabled={submitting}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Senha"
                      type={mostrarSenha ? "text" : "password"}
                      required
                      value={formData.senha}
                      onChange={(e) => handleChange("senha", e.target.value)}
                      disabled={submitting}
                      helperText="Mínimo 6 caracteres"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setMostrarSenha(!mostrarSenha)}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {mostrarSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirmar Senha"
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      required
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      disabled={submitting}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                            >
                              {mostrarConfirmarSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 1: Endereço */}
            {activeStep === 1 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="CEP"
                      required
                      placeholder="00000-000"
                      value={formData.endereco.cep}
                      onChange={(e) => handleEnderecoChange("cep", formatCEP(e.target.value))}
                      onBlur={buscarCEP}
                      disabled={submitting}
                      inputProps={{ maxLength: 9 }}
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Rua"
                      required
                      value={formData.endereco.rua}
                      onChange={(e) => handleEnderecoChange("rua", e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Número"
                      required
                      value={formData.endereco.numero}
                      onChange={(e) => handleEnderecoChange("numero", e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Complemento"
                      value={formData.endereco.complemento}
                      onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      required
                      value={formData.endereco.cidade}
                      onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Estado"
                      required
                      placeholder="SP"
                      value={formData.endereco.estado}
                      onChange={(e) => handleEnderecoChange("estado", e.target.value)}
                      disabled={submitting}
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Confirmação */}
            {activeStep === 2 && (
              <Box>
                <Paper sx={{ p: 3, bgcolor: "#f7fafc", mb: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Revise seus dados
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">
                        Nome
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.nome_completo}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">
                        CPF
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.cpf}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">
                        Telefone
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.telefone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Endereço
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formData.endereco.rua}, {formData.endereco.numero}
                        {formData.endereco.complemento && ` - ${formData.endereco.complemento}`}
                        <br />
                        {formData.endereco.cidade} - {formData.endereco.estado} • CEP: {formData.endereco.cep}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.termos_aceite}
                      onChange={(e) => handleChange("termos_aceite", e.target.checked)}
                      disabled={submitting}
                      sx={{
                        color: "#8270FF",
                        "&.Mui-checked": {
                          color: "#8270FF",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Li e aceito os{" "}
                      <a href="#" style={{ color: "#8270FF" }}>
                        termos e condições
                      </a>{" "}
                      e a{" "}
                      <a href="#" style={{ color: "#8270FF" }}>
                        política de privacidade
                      </a>
                    </Typography>
                  }
                />
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button
                disabled={activeStep === 0 || submitting}
                onClick={handleBack}
                sx={{ textTransform: "none" }}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={submitting}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  px: 4,
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : activeStep === steps.length - 1 ? (
                  "Cadastrar"
                ) : (
                  "Próximo"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
