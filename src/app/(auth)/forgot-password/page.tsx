"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  Fade,
  IconButton,
} from "@mui/material";
import {
  Email as EmailIcon,
  ArrowBack,
  CheckCircle,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import Image from "next/image";
import authService from "@/app/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validações
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
      await authService.forgotPassword(email, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao resetar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
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
          href="/login"
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
          Voltar ao login
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
              maxWidth: { xs: "100%", sm: 440 },
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

            {!success ? (
              <>
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
                    Esqueceu sua senha?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Informe seu email e escolha uma nova senha
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
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="off"
                      autoFocus
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
                      label="Nova Senha"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="off"
                      helperText="Mínimo 8 caracteres"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: "#8270FF" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                              sx={{ color: "#8270FF" }}
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                      label="Confirmar Nova Senha"
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

                  {/* Botão de envio */}
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
                    {isLoading ? "Resetando senha..." : "Resetar Senha"}
                  </Button>
                </form>
              </>
            ) : (
              /* Mensagem de sucesso */
              <Fade in>
                <Box sx={{ textAlign: "center", py: { xs: 2, sm: 4 } }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: "50%",
                      bgcolor: "rgba(130, 112, 255, 0.1)",
                      mb: 3,
                    }}
                  >
                    <CheckCircle
                      sx={{
                        fontSize: { xs: 40, sm: 50 },
                        color: "#8270FF",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.5rem", sm: "1.75rem" },
                      color: "#202031",
                      mb: 2,
                    }}
                  >
                    Senha alterada com sucesso!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      mb: 4,
                    }}
                  >
                    Sua senha foi resetada com sucesso. Agora você pode fazer login com sua nova senha.
                  </Typography>
                  <Button
                    component={Link}
                    href="/login"
                    variant="contained"
                    fullWidth
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
                    }}
                  >
                    Voltar ao login
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
