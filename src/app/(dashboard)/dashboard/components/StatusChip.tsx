"use client";

import { Chip, Grid } from "@mui/material";

const statusConfig: Record<string, { bgcolor: string; color: string; label: string }> = {
  RASCUNHO: { bgcolor: "#FFF3E0", color: "#E65100", label: "Rascunho" },
  PENDENTE: { bgcolor: "#FFF3E0", color: "#E65100", label: "Pendente" },
  SUBMETIDO: { bgcolor: "#E3F2FD", color: "#1565C0", label: "Submetido" },
  ABERTO: { bgcolor: "#F3E5F5", color: "#7B1FA2", label: "Aberto" },
  APROVADO: { bgcolor: "#E8F5E9", color: "#2E7D32", label: "Aprovado" },
  RECUSADO: { bgcolor: "#FFEBEE", color: "#C62828", label: "Recusado" },
  PAGO: { bgcolor: "#E3F2FD", color: "#1565C0", label: "Pago" },
};

interface StatusChipProps {
  status: string;
  label?: string;
  size?: "small" | "medium";
}

export default function StatusChip({ status, label, size = "small" }: StatusChipProps) {
  const config = statusConfig[status] || {
    bgcolor: "#F5F5F5",
    color: "#757575",
    label: status,
  };

  return (
    <Chip
      label={label || config.label}
      size={size}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: size === "small" ? "0.75rem" : "0.8125rem",
      }}
    />
  );
}
