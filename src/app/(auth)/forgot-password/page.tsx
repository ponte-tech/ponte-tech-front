"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Collapse,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
  CheckCircleOutline,
  ErrorOutline,
  WhatsApp,
} from "@mui/icons-material";
import Image from "next/image";
import authService from "@/app/services/authService";

type StepType = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepType>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneLastFour, setPhoneLastFour] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Calcular força da senha
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "#ef4444";
    if (strength < 70) return "#f59e0b";
    return "#10b981";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return "Fraca";
    if (strength < 70) return "Média";
    return "Forte";
  };

  const handleRequestCode = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.requestResetCode(email);
      setPhoneLastFour(response.phoneLastFour);
      setCurrentStep("code");
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos");
      return;
    }
    setError("");
    setCurrentStep("password");
  };

  const handleResetPassword = async () => {
    setError("");

    if (newPassword.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyAndReset(email, code, newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao resetar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveStep = () => {
    switch (currentStep) {
      case "email":
        return 0;
      case "code":
        return 1;
      case "password":
        return 2;
      default:
        return 0;
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Side - Brand */}
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            flex: 1,
            position: "relative",
            background: "linear-gradient(135deg, #8270FF 0%, #411EFE 50%, #E363EB 100%)",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              right: "10%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(227, 99, 235, 0.4) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "float 8s ease-in-out infinite",
              "@keyframes float": {
                "0%, 100%": { transform: "translate(0, 0)" },
                "50%": { transform: "translate(30px, -30px)" },
              },
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              px: 8,
            }}
          >
            <Box
              sx={{
                width: 200,
                height: 70,
                position: "relative",
                mx: "auto",
                mb: 6,
                filter: "brightness(0) invert(1)",
              }}
            >
              <Image
                src="/logo-login.svg"
                alt="Ponte Tech"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>
            <Typography
              variant="h3"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", lg: "2.5rem" },
                lineHeight: 1.2,
              }}
            >
              Conectando pessoas,
              <br />
              transformando negócios
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Success */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFFFFF",
            px: { xs: 3, sm: 6, lg: 8 },
            py: 4,
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 440 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckCircleOutline sx={{ fontSize: 48, color: "#10b981" }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>
              Senha alterada!
            </Typography>

            <Typography variant="body1" sx={{ color: "#64748B", mb: 4 }}>
              Sua senha foi resetada com sucesso. Redirecionando para o login...
            </Typography>

            <CircularProgress size={32} sx={{ color: "#8270FF" }} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Side - Brand (Desktop only) */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flex: 1,
          position: "relative",
          background: "linear-gradient(135deg, #8270FF 0%, #411EFE 50%, #E363EB 100%)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(227, 99, 235, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translate(0, 0)" },
              "50%": { transform: "translate(30px, -30px)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            left: "15%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(65, 30, 254, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "float 6s ease-in-out infinite reverse",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            px: 8,
          }}
        >
          <Box
            sx={{
              width: 200,
              height: 70,
              position: "relative",
              mx: "auto",
              mb: 6,
              filter: "brightness(0) invert(1)",
            }}
          >
            <Image
              src="/logo-login.svg"
              alt="Ponte Tech"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: "#FFFFFF",
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "2rem", lg: "2.5rem" },
              lineHeight: 1.2,
            }}
          >
            Conectando pessoas,
            <br />
            transformando negócios
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              fontWeight: 400,
              fontSize: "1.125rem",
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Recuperação segura via WhatsApp
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          px: { xs: 3, sm: 6, lg: 8 },
          py: 4,
          position: "relative",
        }}
      >
        {/* Mobile Logo */}
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            position: "absolute",
            top: 32,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 50,
          }}
        >
          <Image
            src="/logo-login.svg"
            alt="Ponte Tech"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            maxWidth: 480,
            pt: { xs: 12, lg: 0 },
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#0F172A",
                mb: 1.5,
                fontSize: { xs: "1.75rem", sm: "2rem" },
              }}
            >
              Recuperar senha
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748B", fontSize: "1rem" }}>
              Recupere sua senha de forma segura via WhatsApp
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={getActiveStep()} alternativeLabel>
              <Step>
                <StepLabel>Email</StepLabel>
              </Step>
              <Step>
                <StepLabel>Código</StepLabel>
              </Step>
              <Step>
                <StepLabel>Nova Senha</StepLabel>
              </Step>
            </Stepper>
          </Box>

          {/* Error Alert */}
          <Collapse in={!!error}>
            <Alert
              severity="error"
              icon={<ErrorOutline />}
              onClose={() => setError("")}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #FEE2E2",
                backgroundColor: "#FEF2F2",
                "& .MuiAlert-message": {
                  color: "#991B1B",
                  fontWeight: 500,
                },
              }}
            >
              {error}
            </Alert>
          </Collapse>

          {/* Step 1: Email */}
          {currentStep === "email" && (
            <Stack spacing={3}>
              <Box>
                <Typography
                  component="label"
                  htmlFor="email"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  Email cadastrado
                </Typography>
                <TextField
                  id="email"
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="seu@email.com"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#F8FAFC",
                      transition: "all 0.2s",
                      "& fieldset": { borderColor: "#E2E8F0" },
                      "&:hover fieldset": { borderColor: "#CBD5E1" },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": { borderColor: "#8270FF", borderWidth: 2 },
                      },
                    },
                    "& .MuiOutlinedInput-input": { py: 1.5, fontSize: "0.9375rem" },
                  }}
                />
                <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#64748B" }}>
                  Enviaremos um código de verificação para seu WhatsApp cadastrado
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !email}
                endIcon={!isLoading && <WhatsApp />}
                onClick={handleRequestCode}
                sx={{
                  py: 1.75,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8270FF 0%, #411EFE 100%)",
                  boxShadow: "0 4px 12px rgba(130, 112, 255, 0.25)",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7059e5 0%, #3513e8 100%)",
                    boxShadow: "0 6px 20px rgba(130, 112, 255, 0.35)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                  "&:disabled": {
                    background: "linear-gradient(135deg, rgba(130, 112, 255, 0.5) 0%, rgba(65, 30, 254, 0.5) 100%)",
                    color: "#FFFFFF",
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: "#FFFFFF" }} /> : "Enviar código"}
              </Button>
            </Stack>
          )}

          {/* Step 2: Code */}
          {currentStep === "code" && (
            <Stack spacing={3}>
              <Alert severity="success" icon={<WhatsApp />} sx={{ borderRadius: 2 }}>
                Código enviado para o WhatsApp terminando em <strong>****{phoneLastFour}</strong>
              </Alert>

              <Box>
                <Typography
                  component="label"
                  htmlFor="code"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  Código de verificação
                </Typography>
                <TextField
                  id="code"
                  fullWidth
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  autoFocus
                  placeholder="000000"
                  inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#F8FAFC",
                      transition: "all 0.2s",
                      "& fieldset": { borderColor: "#E2E8F0" },
                      "&:hover fieldset": { borderColor: "#CBD5E1" },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": { borderColor: "#8270FF", borderWidth: 2 },
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 1.5,
                      fontSize: "1.5rem",
                      letterSpacing: "0.5em",
                      textAlign: "center",
                      fontFamily: "monospace",
                    },
                  }}
                />
                <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#64748B" }}>
                  Digite o código de 6 dígitos que você recebeu
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
                  onClick={() => setCurrentStep("email")}
                  sx={{
                    py: 1.75,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderColor: "#E2E8F0",
                    color: "#64748B",
                    "&:hover": { borderColor: "#8270FF", backgroundColor: "#F8FAFC" },
                  }}
                >
                  Voltar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={code.length !== 6}
                  endIcon={<ArrowForward />}
                  onClick={handleVerifyCode}
                  sx={{
                    py: 1.75,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #8270FF 0%, #411EFE 100%)",
                    boxShadow: "0 4px 12px rgba(130, 112, 255, 0.25)",
                    transition: "all 0.2s",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7059e5 0%, #3513e8 100%)",
                      boxShadow: "0 6px 20px rgba(130, 112, 255, 0.35)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": { transform: "translateY(0)" },
                    "&:disabled": {
                      background: "linear-gradient(135deg, rgba(130, 112, 255, 0.5) 0%, rgba(65, 30, 254, 0.5) 100%)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  Continuar
                </Button>
              </Stack>

              <Button
                variant="text"
                size="small"
                onClick={handleRequestCode}
                disabled={isLoading}
                sx={{
                  textTransform: "none",
                  color: "#8270FF",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "rgba(130, 112, 255, 0.05)" },
                }}
              >
                Reenviar código
              </Button>
            </Stack>
          )}

          {/* Step 3: Password */}
          {currentStep === "password" && (
            <Stack spacing={3}>
              <Box>
                <Typography
                  component="label"
                  htmlFor="new-password"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  Nova senha
                </Typography>
                <TextField
                  id="new-password"
                  fullWidth
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
                  placeholder="••••••••"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: "#94A3B8", "&:hover": { color: "#8270FF" } }}
                        >
                          {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#F8FAFC",
                      transition: "all 0.2s",
                      "& fieldset": { borderColor: "#E2E8F0" },
                      "&:hover fieldset": { borderColor: "#CBD5E1" },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": { borderColor: "#8270FF", borderWidth: 2 },
                      },
                    },
                    "& .MuiOutlinedInput-input": { py: 1.5, fontSize: "0.9375rem" },
                  }}
                />
                {newPassword && (
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.75rem", fontWeight: 600, color: getStrengthColor(passwordStrength) }}
                      >
                        Força: {getStrengthText(passwordStrength)}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        {passwordStrength}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#E2E8F0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getStrengthColor(passwordStrength),
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <Typography
                  component="label"
                  htmlFor="confirm-password"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  Confirmar senha
                </Typography>
                <TextField
                  id="confirm-password"
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: "#94A3B8", "&:hover": { color: "#8270FF" } }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#F8FAFC",
                      transition: "all 0.2s",
                      "& fieldset": { borderColor: "#E2E8F0" },
                      "&:hover fieldset": { borderColor: "#CBD5E1" },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": { borderColor: "#8270FF", borderWidth: 2 },
                      },
                    },
                    "& .MuiOutlinedInput-input": { py: 1.5, fontSize: "0.9375rem" },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
                  onClick={() => setCurrentStep("code")}
                  sx={{
                    py: 1.75,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderColor: "#E2E8F0",
                    color: "#64748B",
                    "&:hover": { borderColor: "#8270FF", backgroundColor: "#F8FAFC" },
                  }}
                >
                  Voltar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  endIcon={!isLoading && <CheckCircleOutline />}
                  onClick={handleResetPassword}
                  sx={{
                    py: 1.75,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #8270FF 0%, #411EFE 100%)",
                    boxShadow: "0 4px 12px rgba(130, 112, 255, 0.25)",
                    transition: "all 0.2s",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7059e5 0%, #3513e8 100%)",
                      boxShadow: "0 6px 20px rgba(130, 112, 255, 0.35)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": { transform: "translateY(0)" },
                    "&:disabled": {
                      background: "linear-gradient(135deg, rgba(130, 112, 255, 0.5) 0%, rgba(65, 30, 254, 0.5) 100%)",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: "#FFFFFF" }} /> : "Redefinir senha"}
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #F1F5F9",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.875rem" }}>
              Lembrou sua senha?{" "}
              <Link
                href="/login"
                sx={{
                  color: "#8270FF",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Voltar para login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
