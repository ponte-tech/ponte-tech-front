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
  InputAdornment,
  LinearProgress,
  Chip,
  alpha,
  Card,
  CardContent,
  Collapse,
} from "@mui/material";
import { useAuth } from "@/app/hooks/useAuth";
import authService from "@/app/services/authService";
import avatarService from "@/app/services/avatarService";
import { useState, useEffect } from "react";
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HomeIcon from "@mui/icons-material/Home";
import { DeleteDialog } from "@/app/shared/components";

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Address fields
  const [address, setAddress] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // Collapsed sections
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    address: false,
  });

  // Delete avatar dialog
  const [deleteAvatarDialogOpen, setDeleteAvatarDialogOpen] = useState(false);
  const [deleteAvatarError, setDeleteAvatarError] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setAvatarPreview(user.foto_perfil_url || null);
      setInitialLoading(false);
    }
  }, [user]);

  // Track changes (only editable fields)
  useEffect(() => {
    if (user) {
      const changed =
        name !== (user.name || "") ||
        phone !== "" ||
        avatarFile !== null ||
        address.cep !== "";
      setHasChanges(changed);
    }
  }, [name, phone, avatarFile, address, user]);

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
      setAddress({
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      });
      setAvatarFile(null);
      setAvatarPreview(user.foto_perfil_url || null);
      setErrors({ name: "", email: "", phone: "" });
      setHasChanges(false);
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

  const handleCEPChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    let formatted = "";

    if (numbers.length > 0) {
      formatted = numbers.substring(0, 5);
      if (numbers.length > 5) {
        formatted += `-${numbers.substring(5, 8)}`;
      }
    }

    setAddress((prev) => ({ ...prev, cep: formatted }));

    // Fetch address from CEP API
    if (numbers.length === 8) {
      fetchAddressByCEP(numbers);
    }
  };

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  // Avatar handlers
  const handleAvatarFileSelect = (file: File) => {
    setAvatarError(null);

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAvatarError("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Tipo de arquivo não permitido. Use JPG, PNG ou WebP");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarFileSelect(file);
    }
  };

  const handleAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleAvatarFileSelect(file);
    }
  };

  const handleAvatarDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleAvatarDragLeave = () => {
    setIsDragging(false);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      setAvatarError(null);

      const fotoURL = await avatarService.uploadAvatar(avatarFile);

      // Update local user data
      if (user) {
        const updatedUser = { ...user, foto_perfil_url: fotoURL };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }

      setAvatarPreview(fotoURL);
      setAvatarFile(null);

      setSnackbar({
        open: true,
        message: "Foto atualizada com sucesso!",
        severity: "success",
      });
    } catch (err: any) {
      setAvatarError(err.message || "Erro ao fazer upload da foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.foto_perfil_url || null);
    setAvatarError(null);
  };

  const handleAvatarDeleteClick = () => {
    setDeleteAvatarError(null);
    setDeleteAvatarDialogOpen(true);
  };

  const handleAvatarDeleteCancel = () => {
    setDeleteAvatarDialogOpen(false);
    setDeleteAvatarError(null);
  };

  const handleAvatarDeleteConfirm = async () => {
    try {
      setUploadingAvatar(true);
      setDeleteAvatarError(null);

      await avatarService.deleteAvatar();

      if (user) {
        const updatedUser = { ...user, foto_perfil_url: undefined };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }

      setAvatarFile(null);
      setAvatarPreview(null);
      setDeleteAvatarDialogOpen(false);

      setSnackbar({
        open: true,
        message: "Foto removida com sucesso!",
        severity: "success",
      });
    } catch (err: any) {
      setDeleteAvatarError(err.message || "Erro ao remover foto");
    } finally {
      setUploadingAvatar(false);
    }
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
      await authService.changePassword(currentPassword, newPassword);

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
        {/* Avatar Upload Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <PhotoCameraIcon sx={{ color: "#8270FF", fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Foto de Perfil
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Personalize seu perfil com uma foto
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                <Box sx={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                  <Avatar
                    src={avatarPreview || ""}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid",
                      borderColor: "#8270FF",
                      boxShadow: "0 4px 12px rgba(130, 112, 255, 0.2)",
                      fontSize: "3rem",
                      bgcolor: alpha("#8270FF", 0.1),
                      color: "#8270FF",
                      "& img": {
                        objectFit: "cover",
                      },
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  {uploadingAvatar && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 120,
                        height: 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: "50%",
                      }}
                    >
                      <CircularProgress size={40} sx={{ color: "#fff" }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  {!avatarFile ? (
                    <>
                      <Box
                        onDrop={handleAvatarDrop}
                        onDragOver={handleAvatarDragOver}
                        onDragLeave={handleAvatarDragLeave}
                        sx={{
                          border: "2px dashed",
                          borderColor: isDragging ? "#8270FF" : alpha("#8270FF", 0.3),
                          borderRadius: 2,
                          p: 3,
                          textAlign: "center",
                          bgcolor: isDragging ? alpha("#8270FF", 0.05) : "transparent",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            borderColor: "#8270FF",
                            bgcolor: alpha("#8270FF", 0.02),
                          },
                        }}
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleAvatarChange}
                          style={{ display: "none" }}
                          id="avatar-upload"
                          disabled={uploadingAvatar}
                        />
                        <label htmlFor="avatar-upload" style={{ cursor: "pointer" }}>
                          <CloudUploadIcon sx={{ fontSize: 48, color: "#8270FF", mb: 1 }} />
                          <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                            Arraste e solte ou clique para selecionar
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            JPG, PNG ou WebP (máx. 5MB)
                          </Typography>
                        </label>
                      </Box>

                      {avatarPreview && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleAvatarDeleteClick}
                          disabled={uploadingAvatar}
                          sx={{ mt: 2, textTransform: "none", borderRadius: 2 }}
                        >
                          Remover Foto
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha("#8270FF", 0.05),
                          border: `1px solid ${alpha("#8270FF", 0.2)}`,
                        }}
                      >
                        <PhotoCameraIcon sx={{ color: "#8270FF", fontSize: 32 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="500">
                            {avatarFile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={handleCancelAvatarSelection}
                          disabled={uploadingAvatar}
                          sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={uploadingAvatar ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <CloudUploadIcon />}
                          onClick={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          sx={{
                            bgcolor: "#8270FF",
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                            "&:hover": { bgcolor: "#6a5ce0" },
                          }}
                        >
                          {uploadingAvatar ? "Enviando..." : "Enviar Foto"}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCancelAvatarSelection}
                          disabled={uploadingAvatar}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            borderColor: alpha("#8270FF", 0.3),
                            color: "#8270FF",
                            "&:hover": {
                              borderColor: "#8270FF",
                              bgcolor: alpha("#8270FF", 0.05),
                            },
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </>
                  )}

                  {avatarError && (
                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => setAvatarError(null)}>
                      {avatarError}
                    </Alert>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information - Collapsible */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                onClick={() => toggleSection("personalInfo")}
                sx={{
                  p: 3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&:hover": { bgcolor: alpha("#8270FF", 0.02) },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PersonIcon sx={{ color: "#8270FF", fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      Informações Pessoais
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Atualize suas informações de contato
                    </Typography>
                  </Box>
                </Box>
                <IconButton>
                  {expandedSections.personalInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.personalInfo}>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Cargo"
                        value={role}
                        disabled
                        helperText="Cargo gerenciado pelo sistema"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon color="action" />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Address - Collapsible */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                onClick={() => toggleSection("address")}
                sx={{
                  p: 3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&:hover": { bgcolor: alpha("#8270FF", 0.02) },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <HomeIcon sx={{ color: "#8270FF", fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      Endereço
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Informações de localização
                    </Typography>
                  </Box>
                </Box>
                <IconButton>
                  {expandedSections.address ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedSections.address}>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="CEP"
                        value={address.cep}
                        onChange={(e) => handleCEPChange(e.target.value)}
                        disabled={loading}
                        placeholder="00000-000"
                      />
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <TextField
                        fullWidth
                        label="Logradouro"
                        value={address.logradouro}
                        onChange={(e) => setAddress((prev) => ({ ...prev, logradouro: e.target.value }))}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Número"
                        value={address.numero}
                        onChange={(e) => setAddress((prev) => ({ ...prev, numero: e.target.value }))}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Complemento"
                        value={address.complemento}
                        onChange={(e) => setAddress((prev) => ({ ...prev, complemento: e.target.value }))}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Bairro"
                        value={address.bairro}
                        onChange={(e) => setAddress((prev) => ({ ...prev, bairro: e.target.value }))}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Cidade"
                        value={address.cidade}
                        onChange={(e) => setAddress((prev) => ({ ...prev, cidade: e.target.value }))}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Estado"
                        value={address.estado}
                        onChange={(e) => setAddress((prev) => ({ ...prev, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                        disabled={loading}
                        placeholder="SP"
                        inputProps={{ maxLength: 2 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions for Personal Info */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleCancel}
              disabled={loading || !hasChanges}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={loading || !hasChanges}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                bgcolor: "#8270FF",
                "&:hover": { bgcolor: "#6a5ce0" },
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
        </Grid>

        {/* Security Section - Password Change */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
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
                  autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
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

      {/* Delete Avatar Dialog */}
      <DeleteDialog
        open={deleteAvatarDialogOpen}
        title="Remover Foto de Perfil"
        itemName="sua foto de perfil"
        itemType=""
        error={deleteAvatarError}
        onConfirm={handleAvatarDeleteConfirm}
        onCancel={handleAvatarDeleteCancel}
        loading={uploadingAvatar}
      />
    </Box>
  );
}
