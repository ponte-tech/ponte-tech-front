"use client";

import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Container, CircularProgress, Alert, Fade, Grid } from "@mui/material";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const profileOptions: Record<string, ProfileOption> = {
  admin: {
    id: "admin",
    label: "Administrador",
    emoji: "👨‍💼",
    description: "Gerencie usuários, configurações e aprovações",
    color: "#8270FF",
  },
  colaborador: {
    id: "colaborador",
    label: "Colaborador",
    emoji: "👷",
    description: "Acesse timesheet e notas fiscais",
    color: "#411EFE",
  },
  contador: {
    id: "contador",
    label: "Contador",
    emoji: "📊",
    description: "Visualize e gerencie notas fiscais",
    color: "#E363EB",
  },
  vendedor: {
    id: "vendedor",
    label: "Vendedor",
    emoji: "💼",
    description: "Gerencie cursos e vendas",
    color: "#2196F3",
  },
  professor: {
    id: "professor",
    label: "Professor",
    emoji: "👨‍🏫",
    description: "Ministere e gerencie seus cursos",
    color: "#4CAF50",
  },
  aluno: {
    id: "aluno",
    label: "Aluno",
    emoji: "🎓",
    description: "Acesse seus cursos e matrículas",
    color: "#FF9800",
  },
};

export default function SelectProfilePage() {
  const { user, selectProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Redirecionar se não houver múltiplos perfis
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!user.perfis || user.perfis.length <= 1) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSelectProfile = async (profileId: string) => {
    try {
      setLoading(true);
      setError("");
      setSelectedProfile(profileId);
      await selectProfile(profileId as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao selecionar perfil");
      setSelectedProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.perfis || user.perfis.length <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8270FF 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(130, 112, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            width: { xs: 100, sm: 140 },
            height: { xs: 35, sm: 50 },
            position: "relative",
          }}
        >
          <Image
            src="/logo-login.svg"
            alt="Ponte Tech"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>
      </Box>

      {/* Container centralizado */}
      <Container maxWidth="md" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", py: 4 }}>
        <Fade in timeout={600}>
          <Box sx={{ width: "100%" }}>
            {/* Título */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2.5rem" },
                  color: "white",
                  mb: 1,
                }}
              >
                Escolha seu Perfil
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 300,
                  fontSize: { xs: "0.875rem", sm: "1.1rem" },
                }}
              >
                Você tem acesso a múltiplos perfis. Selecione com qual deseja continuar.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* Perfis Grid */}
            <Grid container spacing={2.5}>
              {user.perfis
                .map((perfil) => profileOptions[perfil])
                .filter(Boolean)
                .map((option) => (
                  <Grid item xs={12} sm={6} key={option.id}>
                    <Card
                      onClick={() => !loading && handleSelectProfile(option.id)}
                      sx={{
                        height: "100%",
                        cursor: loading ? "not-allowed" : "pointer",
                        bgcolor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "2px solid",
                        borderColor: selectedProfile === option.id ? option.color : "rgba(130, 112, 255, 0.2)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "3px",
                          bgcolor: option.color,
                          transform: selectedProfile === option.id ? "scaleX(1)" : "scaleX(0)",
                          transformOrigin: "left",
                          transition: "transform 0.3s ease",
                        },
                        "&:hover": !loading
                          ? {
                              borderColor: option.color,
                              boxShadow: `0 8px 32px rgba(${parseInt(option.color.slice(1, 3), 16)}, ${parseInt(option.color.slice(3, 5), 16)}, ${parseInt(option.color.slice(5, 7), 16)}, 0.2)`,
                              transform: "translateY(-4px)",
                            }
                          : {},
                        "&:disabled": {
                          opacity: 0.6,
                          cursor: "not-allowed",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: "center", position: "relative", zIndex: 1 }}>
                        <Box sx={{ fontSize: "3rem", mb: 2 }}>{option.emoji}</Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: option.color,
                          }}
                        >
                          {option.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mb: 2.5,
                            minHeight: "40px",
                          }}
                        >
                          {option.description}
                        </Typography>

                        {/* Loading ou Button */}
                        {selectedProfile === option.id && loading ? (
                          <CircularProgress size={24} sx={{ color: option.color }} />
                        ) : (
                          <Button
                            fullWidth
                            variant={selectedProfile === option.id ? "contained" : "outlined"}
                            disabled={loading}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              bgcolor: selectedProfile === option.id ? option.color : "transparent",
                              borderColor: option.color,
                              color: selectedProfile === option.id ? "white" : option.color,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                bgcolor: selectedProfile === option.id ? option.color : `${option.color}15`,
                                borderColor: option.color,
                              },
                            }}
                          >
                            Acessar como {option.label}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
