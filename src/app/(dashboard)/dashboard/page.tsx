"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { Box, Typography, CircularProgress } from "@mui/material";
import DashboardColaborador from "./components/DashboardColaborador";
import DashboardAdmin from "./components/DashboardAdmin";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check user role
  const userRole = user?.userType;
  const userPerfil = user?.perfil;
  const userPerfis = user?.perfis;

  // Check if user is colaborador
  const isColaborador = userPerfil === 'colaborador' || userPerfis?.includes('colaborador');

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  // Render appropriate dashboard based on user role
  if (isAdmin) {
    return <DashboardAdmin />;
  }

  if (isColaborador) {
    return <DashboardColaborador />;
  }

  // Fallback for other user types
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#202031", mb: 2 }}>
        Olá, {user?.name?.split(" ")[0] || "Usuário"}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Dashboard em construção para o seu perfil.
      </Typography>
    </Box>
  );
}
