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
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { Board } from "@/app/types/kanban";

interface BoardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  board?: Board | null;
}

export default function BoardModal({
  open,
  onClose,
  board,
  onSave,
}: BoardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [board, open]);

  const handleSubmit = () => {
    onSave({
      name,
      description,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <DashboardIcon sx={{ color: "#8270FF" }} />
        <Box component="span" sx={{ fontWeight: 600, fontSize: "1.25rem", color: "#8270FF" }}>
          {board ? "Editar Board" : "Novo Board"}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Nome do Board"
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
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        </Box>
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
          {board ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
