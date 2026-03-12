"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { Box, Typography, CircularProgress } from "@mui/material";
import DashboardColaborador from "./components/DashboardColaborador";
import DashboardAdmin from "./components/DashboardAdmin";
import { useEffect } from "react";
import { getCookie } from "@/app/lib/cookies";

// Function to decode JWT token (without verification - client side only for debugging)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ [DASHBOARD] Error decoding JWT:', error);
    return null;
  }
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Decode and log JWT token on page load
    const token = getCookie("token");
    if (token) {
      const decodedToken = decodeJWT(token);
    } else {
      console.error('❌ [DASHBOARD] No JWT token found in cookies');
    }
  }, []);

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
  const isAdmin = userRole === 'admin' || userPerfis?.includes('admin');

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
