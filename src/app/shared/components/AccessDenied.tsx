"use client";

import { Box, Typography, Button } from "@mui/material";
import {
  LockOutlined as LockIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface AccessDeniedProps {
  redirectTo?: string;
  redirectLabel?: string;
  message?: string;
}

export default function AccessDenied({
  redirectTo = "/minhas-horas",
  redirectLabel = "Ir para Lançamento de Horas",
  message = "Você não tem permissão para acessar esta página."
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 200px)",
        p: 3,
        maxWidth: 480,
        mx: "auto",
        textAlign: "center",
      }}
    >
      {/* Ícone minimalista */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <LockIcon sx={{ fontSize: 40, color: "text.secondary" }} />
      </Box>

      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          mb: 1.5,
          letterSpacing: "-0.02em",
        }}
      >
        Acesso Restrito
      </Typography>

      {/* Mensagem */}
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          mb: 5,
          lineHeight: 1.7,
          maxWidth: 400,
        }}
      >
        {message}
      </Typography>

      {/* Botões minimalistas */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => router.push(redirectTo)}
          sx={{
            bgcolor: "#202031",
            color: "white",
            textTransform: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            py: 1.5,
            borderRadius: 1.5,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#2a2a3e",
              boxShadow: "none",
            },
          }}
        >
          {redirectLabel}
        </Button>

        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            py: 1.5,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          Voltar
        </Button>
      </Box>

      {/* Footer minimalista */}
      <Typography
        variant="caption"
        sx={{
          color: "text.disabled",
          mt: 6,
          fontSize: "0.8125rem",
        }}
      >
        Precisa de ajuda? Entre em contato com o administrador
      </Typography>
    </Box>
  );
}
