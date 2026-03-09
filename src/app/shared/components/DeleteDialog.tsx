"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";

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
  title = "Confirmar Exclusão",
  itemName,
  itemType,
  error,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Tem certeza que deseja excluir {itemType} <strong>{itemName}</strong>?
          Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} sx={{ textTransform: "none" }} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{ textTransform: "none" }}
          disabled={loading}
        >
          {loading ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
