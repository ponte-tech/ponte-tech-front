import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  alpha,
} from "@mui/material";
import {
  ViewColumn as ViewColumnIcon,
} from "@mui/icons-material";
import { Column } from "@/app/types/kanban";

interface ColumnModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  column?: Column | null;
  boardId: string;
  nextPosition: number;
}

export default function ColumnModal({
  open,
  onClose,
  column,
  boardId,
  nextPosition,
  onSave,
}: ColumnModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (column) {
      setName(column.name);
    } else {
      setName("");
    }
  }, [column, open]);

  const handleSubmit = () => {
    if (column) {
      // Update
      onSave({ name });
    } else {
      // Create
      onSave({
        board_id: boardId,
        name,
        position: nextPosition,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha("#8270FF", 0.05),
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <ViewColumnIcon sx={{ color: "#8270FF" }} />
        <Box component="span" sx={{ fontWeight: 600, fontSize: "1.25rem", color: "#8270FF" }}>
          {column ? "Editar Coluna" : "Nova Coluna"}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          label="Nome da Coluna"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#8270FF",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#8270FF",
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#8270FF",
            "&:hover": {
              bgcolor: alpha("#8270FF", 0.8),
            },
          }}
          disabled={!name.trim()}
        >
          {column ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
