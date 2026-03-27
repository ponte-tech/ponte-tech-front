"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

type ConfirmVariant = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  showIcon?: boolean;
  requireConfirmation?: boolean; // Para ações críticas, pode exigir digitar algo
}

const variantConfig = {
  danger: {
    icon: ErrorOutlineRoundedIcon,
    iconColor: "#ef4444",
    iconBg: "rgba(239, 68, 68, 0.1)",
    confirmBg: "#ef4444",
    confirmHover: "#dc2626",
    confirmText: "Excluir",
  },
  warning: {
    icon: WarningAmberRoundedIcon,
    iconColor: "#f59e0b",
    iconBg: "rgba(245, 158, 11, 0.1)",
    confirmBg: "#f59e0b",
    confirmHover: "#d97706",
    confirmText: "Confirmar",
  },
  info: {
    icon: InfoOutlinedIcon,
    iconColor: "#3b82f6",
    iconBg: "rgba(59, 130, 246, 0.1)",
    confirmBg: "#3b82f6",
    confirmHover: "#2563eb",
    confirmText: "Continuar",
  },
  success: {
    icon: CheckCircleOutlineRoundedIcon,
    iconColor: "#10b981",
    iconBg: "rgba(16, 185, 129, 0.1)",
    confirmBg: "#10b981",
    confirmHover: "#059669",
    confirmText: "Confirmar",
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
  showIcon = true,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "visible",
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
        },
      }}
    >
      {/* Header com close button */}
      <Box
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 1,
        }}
      >
        <IconButton
          onClick={handleCancel}
          disabled={loading}
          size="small"
          sx={{
            color: "#94a3b8",
            transition: "all 0.2s",
            "&:hover": {
              color: "#64748b",
              bgcolor: "rgba(148, 163, 184, 0.1)",
              transform: "scale(1.1)",
            },
            "&.Mui-disabled": {
              color: "#cbd5e1",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "1.25rem" }} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          {/* Icon */}
          {showIcon && (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: config.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Icon sx={{ fontSize: "2rem", color: config.iconColor }} />
            </Box>
          )}

          {/* Title */}
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              fontSize: "0.938rem",
              color: "#64748b",
              lineHeight: 1.6,
              maxWidth: "90%",
            }}
          >
            {description}
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1.5,
          justifyContent: "center",
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={loading}
          fullWidth
          sx={{
            py: 1.25,
            px: 3,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.938rem",
            fontWeight: 600,
            color: "#64748b",
            bgcolor: "transparent",
            border: "1.5px solid #e2e8f0",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#f8fafc",
              borderColor: "#cbd5e1",
              color: "#475569",
            },
            "&.Mui-disabled": {
              color: "#cbd5e1",
              borderColor: "#f1f5f9",
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          fullWidth
          variant="contained"
          sx={{
            py: 1.25,
            px: 3,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.938rem",
            fontWeight: 600,
            bgcolor: config.confirmBg,
            color: "#fff",
            boxShadow: `0 4px 12px ${alpha(config.confirmBg, 0.3)}`,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: config.confirmHover,
              boxShadow: `0 6px 16px ${alpha(config.confirmBg, 0.4)}`,
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&.Mui-disabled": {
              bgcolor: "#e2e8f0",
              color: "#94a3b8",
              boxShadow: "none",
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CircularProgress size={18} sx={{ color: "#fff" }} />
              <span>Processando...</span>
            </Box>
          ) : (
            confirmText || config.confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
