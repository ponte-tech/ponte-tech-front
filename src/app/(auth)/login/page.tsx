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
  CircularProgress,
  Stack,
  Collapse,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  ErrorOutline,
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
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Side - Brand & Visuals (Desktop only) */}
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
        {/* Animated gradient orbs */}
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

        {/* Content */}
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
            Gestão inteligente de projetos e equipes
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
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
            maxWidth: 440,
            pt: { xs: 12, lg: 0 },
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#0F172A",
                mb: 1.5,
                fontSize: { xs: "1.75rem", sm: "2rem" },
              }}
            >
              Entrar na sua conta
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#64748B",
                fontSize: "1rem",
              }}
            >
              Bem-vindo de volta! Entre com suas credenciais
            </Typography>
          </Box>

          {/* Error Alert */}
          <Collapse in={!!error}>
            <Alert
              severity="error"
              icon={<ErrorOutline />}
              onClose={() => setError("")}
              sx={{
                mb: 4,
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Email */}
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
                  Email
                </Typography>
                <TextField
                  id="email"
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#F8FAFC",
                      transition: "all 0.2s",
                      "& fieldset": {
                        borderColor: "#E2E8F0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#CBD5E1",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 1.5,
                      fontSize: "0.9375rem",
                    },
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography
                    component="label"
                    htmlFor="password"
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#0F172A",
                    }}
                  >
                    Senha
                  </Typography>
                  <Link
                    href="/forgot-password"
                    underline="none"
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#8270FF",
                      "&:hover": {
                        color: "#411EFE",
                      },
                    }}
                  >
                    Esqueceu?
                  </Link>
                </Box>
                <TextField
                  id="password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: "#94A3B8",
                            "&:hover": {
                              color: "#8270FF",
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#F8FAFC",
                      transition: "all 0.2s",
                      "& fieldset": {
                        borderColor: "#E2E8F0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#CBD5E1",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 1.5,
                      fontSize: "0.9375rem",
                    },
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                endIcon={!isLoading && <ArrowForward />}
                sx={{
                  py: 1.75,
                  mt: 2,
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
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, rgba(130, 112, 255, 0.5) 0%, rgba(65, 30, 254, 0.5) 100%)",
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
            </Stack>
          </form>

          {/* Footer */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid #F1F5F9",
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontSize: "0.875rem",
              }}
            >
              Precisa de ajuda?{" "}
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
                Contate o suporte
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
