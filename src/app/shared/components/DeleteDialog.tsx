"use client";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  alpha,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

interface DeleteDialogProps {
  open: boolean;
  title?: string;
  itemName: string;
  itemType: string;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteDialog({
  open,
  title,
  itemName,
  itemType,
  error,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteDialogProps) {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel();
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
          {/* Icon de perigo */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: "2rem", color: "#ef4444" }} />
          </Box>

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
            {title || "Confirmar Exclusão"}
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
            Tem certeza que deseja excluir {itemType}{" "}
            <Box component="span" sx={{ fontWeight: 600, color: "#0f172a" }}>
              {itemName}
            </Box>
            ?
          </Typography>

          {/* Aviso de ação irreversível */}
          <Box
            sx={{
              mt: 1,
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.813rem",
                color: "#ef4444",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              ⚠️ Esta ação não pode ser desfeita
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1,
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Button
          onClick={handleConfirm}
          disabled={loading}
          fullWidth
          variant="contained"
          sx={{
            height: "48px",
            py: 0,
            px: 3,
            borderRadius: "24px",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "0.75px",
            bgcolor: "#ef4444",
            color: "#fff",
            boxShadow: "none",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#dc2626",
              boxShadow: `0 6px 16px ${alpha("#ef4444", 0.4)}`,
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&.Mui-disabled": {
              bgcolor: "#2e3555",
              color: "#64748b",
              boxShadow: "none",
              opacity: 1,
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CircularProgress size={18} sx={{ color: "#fff" }} />
              <span>Excluindo...</span>
            </Box>
          ) : (
            "Sim, excluir"
          )}
        </Button>

        <Button
          onClick={handleCancel}
          disabled={loading}
          fullWidth
          sx={{
            py: 1.25,
            px: 0,
            background: "transparent",
            border: 0,
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            lineHeight: "24px",
            color: "#0f172a",
            transition: "opacity 0.2s",
            "&:hover": {
              bgcolor: "transparent",
              opacity: 0.85,
            },
            "&:active": {
              opacity: 0.7,
            },
            "&.Mui-disabled": {
              color: "#cbd5e1",
            },
          }}
        >
          Cancelar e voltar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
