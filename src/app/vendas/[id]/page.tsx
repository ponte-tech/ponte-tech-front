"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  AppBar,
  Toolbar,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import cursosService from "@/app/services/cursosService";
import { Curso, CursoNivel } from "@/app/types/api";

const nivelLabels: Record<CursoNivel, string> = {
  basico: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const nivelColors: Record<CursoNivel, string> = {
  basico: "#4caf50",
  intermediario: "#ff9800",
  avancado: "#f44336",
};

export default function CursoPublicoPage() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurso();
  }, [cursoId]);

  const loadCurso = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cursosService.getById(cursoId);
      setCurso(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar curso");
      console.error("Erro ao carregar curso:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const calcularVagasRestantes = () => {
    if (!curso) return 0;
    return curso.quantidade_limite_alunos - curso.quantidade_alunos_matriculados;
  };

  const getPercentualOcupacao = () => {
    if (!curso) return 0;
    return (curso.quantidade_alunos_matriculados / curso.quantidade_limite_alunos) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={60} sx={{ color: "#8270FF" }} />
      </Box>
    );
  }

  if (error || !curso) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Curso não encontrado"}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/vendas")}
            sx={{ textTransform: "none" }}
          >
            Voltar para Cursos
          </Button>
        </Container>
      </Box>
    );
  }

  const vagasRestantes = calcularVagasRestantes();
  const ocupacao = getPercentualOcupacao();
  const quaseEsgotado = vagasRestantes <= 5 && vagasRestantes > 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e2e8f0",
          color: "#2d3748",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/vendas")}
              sx={{ mr: 2, textTransform: "none", color: "#8270FF" }}
            >
              Voltar
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1, color: "#8270FF" }} />
              <Typography variant="h6" fontWeight="700" sx={{ color: "#8270FF" }}>
                Ponte Tech
              </Typography>
            </Box>
            <Button
              color="inherit"
              onClick={() => router.push("/login")}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "#8270FF",
              }}
            >
              Login
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #8270FF 0%, #6c5ce7 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={nivelLabels[curso.nivel]}
                    sx={{
                      bgcolor: nivelColors[curso.nivel],
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={curso.categoria}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  {quaseEsgotado && (
                    <Chip
                      label="Últimas Vagas!"
                      sx={{
                        bgcolor: "#f44336",
                        color: "white",
                        fontWeight: 600,
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.7 },
                        },
                      }}
                    />
                  )}
                </Stack>
              </Box>

              <Typography variant="h3" fontWeight="800" gutterBottom>
                {curso.titulo}
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.95 }}>
                {curso.descricao}
              </Typography>

              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarIcon sx={{ color: "#ffc107" }} />
                  <Typography variant="body1" fontWeight={600}>
                    Curso Premium
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon />
                  <Typography variant="body1">
                    {curso.quantidade_alunos_matriculados} alunos matriculados
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ScheduleIcon />
                  <Typography variant="body1">
                    {curso.carga_horaria} horas de conteúdo
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  bgcolor: "white",
                  color: "#2d3748",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography variant="h3" fontWeight="800" sx={{ color: "#8270FF", mb: 1 }}>
                    {formatCurrency(curso.valor)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Investimento único
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => router.push(`/matricula?codigo_vendedor=DIRETO&codigo_curso=${curso.id}`)}
                  sx={{
                    bgcolor: "#8270FF",
                    "&:hover": { bgcolor: "#6c5ce7" },
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 14px rgba(130, 112, 255, 0.4)",
                    mb: 2,
                  }}
                >
                  Inscreva-se Agora
                </Button>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Início das aulas
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(curso.data_inicio)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Vagas restantes
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: quaseEsgotado ? "#f44336" : "inherit" }}>
                        {vagasRestantes} de {curso.quantidade_limite_alunos}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                {quaseEsgotado && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Restam apenas {vagasRestantes} vagas! Garanta já a sua.
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* O que você vai aprender */}
            {curso.objetivos_curso && (
              <Card sx={{ mb: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    O que você vai aprender
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                    {curso.objetivos_curso}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Conteúdo Programático */}
            {curso.conteudo_programatico && (
              <Card sx={{ mb: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    Conteúdo Programático
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                    {curso.conteudo_programatico}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Ementa */}
            {curso.ementa && (
              <Card sx={{ mb: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    Ementa do Curso
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                    {curso.ementa}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Pré-requisitos */}
            {curso.pre_requisitos && (
              <Card sx={{ mb: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    Pré-requisitos
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                    {curso.pre_requisitos}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Professor */}
            {curso.professor && (
              <Card sx={{ mb: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    Seu Professor
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: "#8270FF",
                        mr: 2,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {curso.professor.nome_completo.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {curso.professor.nome_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Instrutor Verificado
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {curso.professor.email}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Detalhes do Curso */}
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                  Detalhes do Curso
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <ScheduleIcon sx={{ color: "#8270FF" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Carga Horária"
                      secondary={`${curso.carga_horaria} horas`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CalendarIcon sx={{ color: "#8270FF" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data de Início"
                      secondary={formatDate(curso.data_inicio)}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CalendarIcon sx={{ color: "#8270FF" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data de Término"
                      secondary={formatDate(curso.data_fim)}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PeopleIcon sx={{ color: "#8270FF" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Vagas"
                      secondary={`${curso.quantidade_alunos_matriculados} / ${curso.quantidade_limite_alunos}`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <VerifiedIcon sx={{ color: "#8270FF" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nível"
                      secondary={nivelLabels[curso.nivel]}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* CTA Sticky */}
            <Paper
              elevation={4}
              sx={{
                position: "sticky",
                top: 80,
                p: 3,
                mt: 4,
                bgcolor: "#f7fafc",
                border: "2px solid #8270FF",
              }}
            >
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2, textAlign: "center" }}>
                Pronto para começar?
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={() => router.push(`/matricula?codigo_vendedor=DIRETO&codigo_curso=${curso.id}`)}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.5,
                  boxShadow: "0 4px 14px rgba(130, 112, 255, 0.4)",
                }}
              >
                Inscreva-se Agora
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2 }}>
                Garantia de 7 dias ou seu dinheiro de volta
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "#2d3748",
          color: "white",
          py: 6,
          mt: 8,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight="700">
                  Ponte Tech
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Transformamos desafios em soluções através da educação e tecnologia.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Links Rápidos
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: "pointer" }}>
                  Sobre Nós
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: "pointer" }} onClick={() => router.push("/vendas")}>
                  Nossos Cursos
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: "pointer" }}>
                  Contato
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Suporte
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Email: contato@pontetech.com
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Tel: (11) 99999-9999
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.6 }}>
            © 2026 Ponte Tech. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
