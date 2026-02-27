"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import cursosService from "@/app/services/cursosService";
import { Curso, CursoStatus, CursoNivel } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";

const statusLabels: Record<CursoStatus, string> = {
  rascunho: "Rascunho",
  aberto_venda: "Aberto para Vendas",
  em_andamento: "Em Andamento",
  encerrado: "Encerrado",
};

const nivelLabels: Record<CursoNivel, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const statusColors: Record<CursoStatus, "default" | "primary" | "success" | "error"> = {
  rascunho: "default",
  aberto_venda: "success",
  em_andamento: "primary",
  encerrado: "error",
};

export default function CursoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.userType === "admin";
  const cursoId = params.id as string;

  const loadCurso = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cursosService.getById(cursoId);
      setCurso(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar curso";
      setError(errorMessage);
      console.error("Erro ao carregar curso:", err);
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    loadCurso();
  }, [loadCurso]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !curso) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/cursos")}
          sx={{ mb: 3 }}
        >
          Voltar
        </Button>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || "Curso não encontrado"}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => router.push("/cursos")}
            sx={{ mt: 2 }}
          >
            Voltar para Cursos
          </Button>
        </Card>
      </Box>
    );
  }

  const vagasDisponiveis = curso.quantidade_limite_alunos - curso.quantidade_alunos_matriculados;
  const percentualOcupacao = (curso.quantidade_alunos_matriculados / curso.quantidade_limite_alunos) * 100;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/cursos")}
          sx={{ textTransform: "none" }}
        >
          Voltar
        </Button>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/cursos/${cursoId}/editar`)}
            sx={{
              bgcolor: "#8270FF",
              "&:hover": { bgcolor: "#6c5ce7" },
              textTransform: "none",
            }}
          >
            Editar Curso
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Image and Title */}
          <Card sx={{ mb: 3, overflow: "hidden" }}>
            <Box
              component="img"
              src={curso.imagem_capa_url || "https://placehold.co/1200x400?text=Curso"}
              alt={curso.titulo}
              sx={{
                width: "100%",
                height: 300,
                objectFit: "cover",
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Chip
                  label={statusLabels[curso.status]}
                  color={statusColors[curso.status]}
                  size="small"
                />
                <Chip label={nivelLabels[curso.nivel]} size="small" variant="outlined" />
                <Chip label={curso.categoria} size="small" variant="outlined" />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {curso.titulo}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {curso.descricao}
              </Typography>
            </CardContent>
          </Card>

          {/* Detalhes */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Sobre o Curso
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {curso.objetivos_curso && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Objetivos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {curso.objetivos_curso}
                  </Typography>
                </Box>
              )}

              {curso.pre_requisitos && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Pré-requisitos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {curso.pre_requisitos}
                  </Typography>
                </Box>
              )}

              {curso.ementa && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Ementa
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {curso.ementa}
                  </Typography>
                </Box>
              )}

              {curso.conteudo_programatico && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Conteúdo Programático
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {curso.conteudo_programatico}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Professor */}
          {curso.professor && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Professor
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={curso.professor.foto_url}
                    sx={{ width: 64, height: 64, bgcolor: "#8270FF" }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {curso.professor.nome}
                    </Typography>
                    {curso.professor.especialidade && (
                      <Typography variant="body2" color="text.secondary">
                        {curso.professor.especialidade}
                      </Typography>
                    )}
                    {curso.professor.biografia && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {curso.professor.biografia}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Informações */}
          <Card sx={{ mb: 3, position: "sticky", top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" color="#8270FF" fontWeight="bold" gutterBottom>
                {formatCurrency(curso.valor)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CalendarIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Início
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {formatDate(curso.data_inicio)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CalendarIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Término
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {formatDate(curso.data_fim)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ScheduleIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Carga Horária
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {curso.carga_horaria} horas
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SchoolIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Nível
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {nivelLabels[curso.nivel]}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <PeopleIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Vagas
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {curso.quantidade_alunos_matriculados} / {curso.quantidade_limite_alunos} alunos
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        height: 6,
                        bgcolor: alpha("#8270FF", 0.1),
                        borderRadius: 1,
                        mt: 0.5,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentualOcupacao}%`,
                          height: "100%",
                          bgcolor: "#8270FF",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {vagasDisponiveis} vagas disponíveis ({percentualOcupacao.toFixed(0)}% ocupado)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
