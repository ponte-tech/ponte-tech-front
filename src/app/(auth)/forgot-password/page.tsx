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
  Container,
  Paper,
  LinearProgress,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  CheckCircleOutline,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LockReset,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

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

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: `
            linear-gradient(135deg,
              ${alpha('#8270FF', 0.05)} 0%,
              ${alpha('#FFFFFF', 1)} 50%,
              ${alpha('#E363EB', 0.05)} 100%
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
            background: `radial-gradient(circle, ${alpha('#8270FF', 0.1)} 0%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${alpha('#E363EB', 0.06)} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

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
                border: `1px solid ${alpha('#e5e7eb', 0.8)}`,
                boxShadow: `
                  0 10px 40px ${alpha('#8270FF', 0.08)},
                  0 2px 8px ${alpha('#000000', 0.04)}
                `,
                textAlign: "center",
              }}
            >
              {/* Success icon */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#059669', 0.1)} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleOutline
                    sx={{
                      fontSize: 48,
                      color: "#10b981",
                    }}
                  />
                </Box>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1f2937",
                  mb: 2,
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                }}
              >
                Senha alterada!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#6b7280",
                  mb: 4,
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
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
                  py: 1.75,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8270FF 0%, #411EFE 100%)",
                  boxShadow: `0 4px 12px ${alpha("#8270FF", 0.3)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #411EFE 0%, #8270FF 100%)",
                    boxShadow: `0 8px 20px ${alpha("#411EFE", 0.4)}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Voltar para login
              </Button>
            </Paper>
          </Fade>
        </Container>
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
        background: `
          linear-gradient(135deg,
            ${alpha('#8270FF', 0.05)} 0%,
            ${alpha('#FFFFFF', 1)} 50%,
            ${alpha('#E363EB', 0.05)} 100%
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
          background: `radial-gradient(circle, ${alpha('#8270FF', 0.1)} 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${alpha('#E363EB', 0.06)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

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
              border: `1px solid ${alpha('#e5e7eb', 0.8)}`,
              boxShadow: `
                0 10px 40px ${alpha('#8270FF', 0.08)},
                0 2px 8px ${alpha('#000000', 0.04)}
              `,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `
                  0 20px 60px ${alpha('#8270FF', 0.12)},
                  0 4px 12px ${alpha('#000000', 0.06)}
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
                Redefinir senha
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                }}
              >
                Escolha uma nova senha forte para sua conta
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
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    backgroundColor: alpha('#fef2f2', 0.8),
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
                      backgroundColor: alpha("#f9fafb", 0.8),
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: alpha("#d1d5db", 0.8),
                      },
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        boxShadow: `0 0 0 3px ${alpha("#8270FF", 0.1)}`,
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
                  Nova senha
                </Typography>
                <TextField
                  fullWidth
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: "#9ca3af",
                            "&:hover": {
                              color: "#8270FF",
                            },
                          }}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: alpha("#f9fafb", 0.8),
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: alpha("#d1d5db", 0.8),
                      },
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        boxShadow: `0 0 0 3px ${alpha("#8270FF", 0.1)}`,
                        "& fieldset": {
                          borderColor: "#8270FF",
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
                {newPassword && (
                  <Box sx={{ mt: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: getStrengthColor(passwordStrength),
                        }}
                      >
                        Força: {getStrengthText(passwordStrength)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        {passwordStrength}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha("#e5e7eb", 0.8),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getStrengthColor(passwordStrength),
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Confirmar senha
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: "#9ca3af",
                            "&:hover": {
                              color: "#8270FF",
                            },
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: alpha("#f9fafb", 0.8),
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: alpha("#d1d5db", 0.8),
                      },
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#8270FF",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        boxShadow: `0 0 0 3px ${alpha("#8270FF", 0.1)}`,
                        "& fieldset": {
                          borderColor: "#8270FF",
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={!isLoading && <LockReset />}
                sx={{
                  py: 1.75,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8270FF 0%, #411EFE 100%)",
                  boxShadow: `0 4px 12px ${alpha("#8270FF", 0.3)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #411EFE 0%, #8270FF 100%)",
                    boxShadow: `0 8px 20px ${alpha("#411EFE", 0.4)}`,
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: alpha("#8270FF", 0.4),
                    color: "#FFFFFF",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </form>

            {/* Back to login */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                }}
              >
                Lembrou sua senha?{" "}
                <Link
                  href="/login"
                  sx={{
                    color: "#8270FF",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Voltar para login
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
