"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import Image from "next/image";

type UserType = "aluno" | "vendedor";

function RegisterForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as UserType | null;
  const [userType] = useState<UserType>(typeParam === "vendedor" ? "vendedor" : "aluno");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await register(name, email, password, userType);
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8270FF 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(130, 112, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      {/* Link para voltar ao site */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          zIndex: 10,
        }}
      >
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBack />}
          sx={{
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.875rem", sm: "1rem" },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          Voltar ao site
        </Button>
      </Box>

      {/* Container centralizado */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 8, sm: 4 },
        }}
      >
        <Fade in timeout={600}>
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 480 },
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              p: { xs: 3, sm: 5 },
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
              },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: { xs: 3, sm: 4 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 140, sm: 180 },
                  height: { xs: 50, sm: 65 },
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

            {/* Título */}
            <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: "center" }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                  color: "#202031",
                  mb: 1,
                }}
              >
                Criar sua conta
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  mb: 1,
                }}
              >
                Preencha os dados para começar
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#8270FF",
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  fontWeight: 600,
                }}
              >
                {userType === "aluno" ? "🎓 Cadastro de Aluno" : "💼 Cadastro de Vendedor"}
              </Typography>
            </Box>

            {/* Alert de erro */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} autoComplete="off">
              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                  autoFocus
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
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(130, 112, 255, 0.15)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 16px rgba(130, 112, 255, 0.25)",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
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
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(130, 112, 255, 0.15)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 16px rgba(130, 112, 255, 0.25)",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  helperText="Mínimo de 6 caracteres"
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
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(130, 112, 255, 0.15)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 16px rgba(130, 112, 255, 0.25)",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Confirmar Senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="off"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#8270FF" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: "#8270FF" }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(130, 112, 255, 0.15)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 16px rgba(130, 112, 255, 0.25)",
                      },
                    },
                  }}
                />
              </Box>

              {/* Botão de cadastro */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: { xs: 1.5, sm: 1.75 },
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: "1rem", sm: "1.0625rem" },
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
                  boxShadow: "0 4px 14px rgba(130, 112, 255, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #6a5dd9 0%, #5a4dbf 100%)",
                    boxShadow: "0 6px 20px rgba(130, 112, 255, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #c0b8e8 0%, #b0a5dc 100%)",
                  },
                }}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>

              {/* Divider */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  my: { xs: 3, sm: 3.5 },
                }}
              >
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                <Typography
                  sx={{
                    px: 2,
                    color: "text.secondary",
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  }}
                >
                  ou
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
              </Box>

              {/* Link para login */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  }}
                >
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    sx={{
                      color: "#8270FF",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#6a5dd9",
                      },
                    }}
                  >
                    Faça login
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
