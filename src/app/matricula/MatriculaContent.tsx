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
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import matriculaService from "@/app/services/matriculaService";
import {
  CreateMatriculaRequest,
  AlunoMatriculaRequest,
  Endereco,
  MatriculaInfoResponse,
} from "@/app/types/api";

const steps = ["Dados Pessoais", "Endereço", "Confirmação"];

export default function MatriculaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codigoVendedor = searchParams.get("codigo_vendedor") || "";
  const codigoCurso = searchParams.get("codigo_curso") || "";

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<MatriculaInfoResponse | null>(null);

  const [formData, setFormData] = useState<AlunoMatriculaRequest>({
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

  const loadInfo = useCallback(async () => {
    if (!codigoVendedor || !codigoCurso) {
      setError("Código do vendedor e do curso são obrigatórios");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await matriculaService.getInfo(codigoVendedor, codigoCurso);
      setInfo(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar informações";
      setError(errorMessage);
      console.error("Erro ao carregar informações:", err);
    } finally {
      setLoading(false);
    }
  }, [codigoVendedor, codigoCurso]);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  const handleChange = (field: keyof AlunoMatriculaRequest, value: unknown) => {
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
      const request: CreateMatriculaRequest = {
        codigo_vendedor: codigoVendedor,
        codigo_curso: codigoCurso,
        aluno: formData,
      };

      const response = await matriculaService.create(request);

      // Redirecionar para página de pagamento
      if (response.pagamento.checkout_url) {
        window.location.href = response.pagamento.checkout_url;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar matrícula";
      setError(errorMessage);
      console.error("Erro ao criar matrícula:", err);
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={60} sx={{ color: "#8270FF" }} />
      </Box>
    );
  }

  if (error && !info) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={() => router.push("/vendas")}>
            Voltar para Cursos
          </Button>
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
            <Typography variant="body2" color="text.secondary">
              Processo de Matrícula
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Column - Form */}
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                  Complete sua Matrícula
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Preencha seus dados para se matricular no curso
                </Typography>

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
                      "Finalizar e Pagar"
                    ) : (
                      "Próximo"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Course Info */}
          <Grid item xs={12} md={4}>
            {info && (
              <Card sx={{ position: "sticky", top: 90, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    Resumo da Compra
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  {info.imagem_capa_url && (
                    <Box
                      component="img"
                      src={info.imagem_capa_url}
                      alt={info.titulo}
                      sx={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 1,
                        mb: 2,
                      }}
                    />
                  )}

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {info.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {info.descricao}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Data de início:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(info.data_inicio)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Vagas disponíveis:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {info.quantidade_limite_alunos - info.quantidade_alunos_matriculados}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Vendedor:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {info.vendedor_nome}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight={600}>
                      Total:
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: "#8270FF" }}>
                      {formatCurrency(info.valor)}
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
                    Pagamento seguro e garantido
                  </Alert>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
