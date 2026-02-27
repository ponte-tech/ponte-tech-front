"use client";

import { useState } from "react";
import { Box, TextField, Button, Typography, Link, Alert, InputAdornment, Fade, Grid } from "@mui/material";
import { Email as EmailIcon, ArrowBack, CheckCircle } from "@mui/icons-material";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      // TODO: Integrar com seu backend
      // await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });

      // Simulação temporária
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError("Erro ao enviar email. Tente novamente.");
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
                    Digite seu email para receber instruções
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
                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
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
                    {isLoading ? "Enviando..." : "Enviar Email"}
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
                    Email enviado!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      mb: 4,
                    }}
                  >
                    Verifique sua caixa de entrada em <strong>{email}</strong> para
                    instruções de recuperação de senha.
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
