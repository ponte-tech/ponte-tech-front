"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
  CircularProgress,
  Container,
  Paper,
  Divider,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack,
  LoginOutlined,
} from "@mui/icons-material";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError("Email ou senha incorretos. Tente novamente.");
    }
  };

  // Cores calculadas uma vez para evitar erros de hidratação
  const colors = {
    bgGradient1: alpha('#8270FF', 0.05),
    bgGradient2: alpha('#FFFFFF', 1),
    bgGradient3: alpha('#E363EB', 0.05),
    circle1: alpha('#8270FF', 0.1),
    circle2: alpha('#E363EB', 0.06),
    backButtonHover: alpha("#8270FF", 0.08),
    border: alpha('#e5e7eb', 0.8),
    shadow1: alpha('#8270FF', 0.08),
    shadow2: alpha('#000000', 0.04),
    hoverShadow1: alpha('#8270FF', 0.12),
    hoverShadow2: alpha('#000000', 0.06),
    errorBorder: alpha('#ef4444', 0.2),
    errorBg: alpha('#fef2f2', 0.8),
    inputBg: alpha("#f9fafb", 0.8),
    inputBorder: alpha("#d1d5db", 0.8),
    focusShadow: alpha("#8270FF", 0.1),
    buttonShadow: alpha("#8270FF", 0.3),
    buttonHoverShadow: alpha("#411EFE", 0.4),
    buttonDisabled: alpha("#8270FF", 0.4),
    dividerColor: alpha("#d1d5db", 0.6),
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `
          linear-gradient(135deg,
            ${colors.bgGradient1} 0%,
            ${colors.bgGradient2} 50%,
            ${colors.bgGradient3} 100%
          )
        `,
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.circle1} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: { xs: 400, md: 600 },
          height: { xs: 400, md: 600 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.circle2} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Back button */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 20, sm: 32 },
          left: { xs: 20, sm: 32 },
          zIndex: 10,
        }}
      >
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBack />}
          sx={{
            color: "#6b7280",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9375rem",
            px: 2,
            py: 1,
            borderRadius: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: colors.backButtonHover,
              color: "#8270FF",
            },
          }}
        >
          Voltar
        </Button>
      </Box>

      {/* Main content */}
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 8, sm: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Fade in timeout={500}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 480,
              p: { xs: 4, sm: 6 },
              borderRadius: 4,
              backgroundColor: "#FFFFFF",
              border: `1px solid ${colors.border}`,
              boxShadow: `
                0 10px 40px ${colors.shadow1},
                0 2px 8px ${colors.shadow2}
              `,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `
                  0 20px 60px ${colors.hoverShadow1},
                  0 4px 12px ${colors.hoverShadow2}
                `,
              },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: { xs: 140, sm: 160 },
                  height: { xs: 50, sm: 58 },
                  position: "relative",
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
            </Box>

            {/* Title */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1f2937",
                  mb: 1,
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                }}
              >
                Bem-vindo de volta
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.9375rem",
                }}
              >
                Entre com suas credenciais para continuar
              </Typography>
            </Box>

            {/* Error alert */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.errorBorder}`,
                    backgroundColor: colors.errorBg,
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  autoFocus
                  placeholder="seu@email.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon
                          sx={{
                            color: "#9ca3af",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: colors.inputBg,
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: colors.inputBorder,
                      },
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        boxShadow: `0 0 0 3px ${colors.focusShadow}`,
                        "& fieldset": {
                          borderColor: "#8270FF",
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Senha
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="••••••••"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon
                          sx={{
                            color: "#9ca3af",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: "#9ca3af",
                            "&:hover": {
                              color: "#8270FF",
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: colors.inputBg,
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: colors.inputBorder,
                      },
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        boxShadow: `0 0 0 3px ${colors.focusShadow}`,
                        "& fieldset": {
                          borderColor: "#8270FF",
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Forgot password link */}
              <Box sx={{ textAlign: "right", mb: 4 }}>
                <Link
                  href="/forgot-password"
                  underline="none"
                  sx={{
                    color: "#8270FF",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#411EFE",
                    },
                  }}
                >
                  Esqueceu sua senha?
                </Link>
              </Box>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={!isLoading && <LoginOutlined />}
                sx={{
                  py: 1.75,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8270FF 0%, #411EFE 100%)",
                  boxShadow: `0 4px 12px ${colors.buttonShadow}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #411EFE 0%, #8270FF 100%)",
                    boxShadow: `0 8px 20px ${colors.buttonHoverShadow}`,
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: colors.buttonDisabled,
                    color: "#FFFFFF",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Divider */}
            <Divider
              sx={{
                my: 4,
                "&::before, &::after": {
                  borderColor: colors.dividerColor,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#9ca3af",
                  fontSize: "0.8125rem",
                  px: 2,
                }}
              >
                Precisa de ajuda?
              </Typography>
            </Divider>

            {/* Help text */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                }}
              >
                Entre em contato com o suporte em{" "}
                <Link
                  href="mailto:suporte@pontetech.com.br"
                  sx={{
                    color: "#8270FF",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  suporte@pontetech.com.br
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
