"use client";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  IconButton,
  Tooltip,
  InputAdornment,
  LinearProgress,
  Chip,
  alpha,
} from "@mui/material";
import { useAuth } from "@/app/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SecurityIcon from "@mui/icons-material/Security";

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setInitialLoading(false);
    }
  }, [user]);

  // Track changes (only editable fields)
  useEffect(() => {
    if (user) {
      const changed =
        name !== (user.name || "") ||
        phone !== "" ||
        avatarPreview !== null;
      setHasChanges(changed);
    }
  }, [name, phone, avatarPreview, user]);

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      setPasswordErrors([]);
      return;
    }

    let strength = 0;
    const errors: string[] = [];

    if (newPassword.length >= 8) {
      strength += 25;
    } else {
      errors.push("Mínimo de 8 caracteres");
    }

    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) {
      strength += 25;
    } else {
      errors.push("Letras maiúsculas e minúsculas");
    }

    if (/\d/.test(newPassword)) {
      strength += 25;
    } else {
      errors.push("Pelo menos um número");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      strength += 25;
    } else {
      errors.push("Pelo menos um caractere especial");
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  }, [newPassword]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    let isValid = true;

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
      isValid = false;
    }

    // Validate phone (optional but must be valid if provided)
    if (phone) {
      const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
        newErrors.phone = "Telefone inválido. Use: (00) 00000-0000";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Por favor, corrija os erros no formulário",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar salvamento no backend
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula requisição

      setSnackbar({
        open: true,
        message: "Perfil atualizado com sucesso!",
        severity: "success",
      });
      setHasChanges(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao atualizar perfil. Tente novamente.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setPhone("");
      setAvatarPreview(null);
      setErrors({ name: "", email: "", phone: "" });
      setHasChanges(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "A imagem deve ter no máximo 5MB",
          severity: "error",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    const numbers = value.replace(/\D/g, "");
    let formatted = "";

    if (numbers.length > 0) {
      formatted = `(${numbers.substring(0, 2)}`;
      if (numbers.length > 2) {
        formatted += `) ${numbers.substring(2, 7)}`;
      }
      if (numbers.length > 7) {
        formatted += `-${numbers.substring(7, 11)}`;
      }
    }

    setPhone(formatted);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Muito fraca";
    if (passwordStrength <= 50) return "Fraca";
    if (passwordStrength <= 75) return "Média";
    return "Forte";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "error";
    if (passwordStrength <= 50) return "warning";
    if (passwordStrength <= 75) return "info";
    return "success";
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword) {
      setSnackbar({
        open: true,
        message: "Digite sua senha atual",
        severity: "error",
      });
      return;
    }

    if (passwordStrength < 100) {
      setSnackbar({
        open: true,
        message: "A nova senha não atende aos requisitos mínimos",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "As senhas não coincidem",
        severity: "error",
      });
      return;
    }

    setLoadingPassword(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSnackbar({
        open: true,
        message: "Senha alterada com sucesso!",
        severity: "success",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao alterar senha. Verifique sua senha atual.",
        severity: "error",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (initialLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={60} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {/* Avatar Section Skeleton */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Skeleton variant="circular" width={120} height={120} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
              </Box>
            </Paper>
          </Grid>
          {/* Info Cards Skeleton */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={40} width={120} sx={{ ml: "auto" }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={56} />
            </Paper>
          </Grid>
          {/* Security Section Skeleton */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Skeleton variant="text" height={40} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Skeleton variant="rectangular" height={56} sx={{ flex: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ flex: 1 }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Meu Perfil
        </Typography>
        {hasChanges && (
          <Typography variant="body2" color="warning.main" sx={{ fontStyle: "italic" }}>
            Você tem alterações não salvas
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Avatar Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexDirection: { xs: "column", sm: "row" } }}>
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  src={avatarPreview || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "primary.main",
                    fontSize: 48,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      opacity: 0.8,
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={handleAvatarClick}
                >
                  {!avatarPreview && (user?.name?.charAt(0) || "U")}
                </Avatar>
                <Tooltip title="Alterar foto">
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      width: 36,
                      height: 36,
                    }}
                    onClick={handleAvatarClick}
                  >
                    <CameraAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </Box>
              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {user?.name}
                </Typography>
                <Typography color="text.secondary" variant="body1" sx={{ mb: 1 }}>
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Formatos aceitos: JPG, PNG, GIF • Tamanho máximo: 5MB
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Informações Pessoais
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Atualize suas informações de contato
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name || "Digite seu nome completo"}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Telefone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || "Formato: (00) 00000-0000"}
                placeholder="(00) 00000-0000"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleCancel}
                disabled={loading || !hasChanges}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={loading || !hasChanges}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Account Information - Read Only */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: "100%", bgcolor: alpha("#f5f5f5", 0.5) }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Informações da Conta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dados gerenciados pelo sistema
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                disabled
                helperText="Email não pode ser alterado"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Cargo"
                value={role}
                disabled
                helperText="Cargo gerenciado pelo administrador"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Security Section - Password Change */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Segurança
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mantenha sua conta segura alterando sua senha regularmente
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showCurrentPassword ? "text" : "password"}
                  label="Senha Atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loadingPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showNewPassword ? "text" : "password"}
                  label="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loadingPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirmar Nova Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loadingPassword}
                  error={
                    confirmPassword !== "" && newPassword !== confirmPassword
                  }
                  helperText={
                    confirmPassword !== "" && newPassword !== confirmPassword
                      ? "As senhas não coincidem"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {newPassword && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Força da senha:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={`${getPasswordStrengthColor()}.main`}
                      >
                        {getPasswordStrengthLabel()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={getPasswordStrengthColor()}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {passwordErrors.map((error) => (
                        <Chip
                          key={error}
                          icon={<CancelIcon />}
                          label={error}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      ))}
                      {passwordStrength === 100 && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Senha forte"
                          size="small"
                          color="success"
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>

            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handlePasswordChange}
              disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
              startIcon={loadingPassword ? <CircularProgress size={20} /> : null}
            >
              {loadingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
