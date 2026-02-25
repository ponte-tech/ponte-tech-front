"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  alpha,
  Stack,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import cursosService from "@/app/services/cursosService";
import { CursoListItem, CursoStatus, CursoNivel } from "@/app/types/api";
import Image from "next/image";

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

export default function VendasPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<CursoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedNivel, setSelectedNivel] = useState<CursoNivel | "">("");
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    setLoading(true);
    try {
      // Buscar todos os cursos
      const response = await cursosService.list({
        limit: 100
      });

      // Filtrar apenas cursos abertos para venda
      const cursosDisponiveis = response.cursos.filter(
        c => c.status === "aberto_venda"
      );
      setCursos(cursosDisponiveis);

      // Extrair categorias únicas
      const uniqueCategories = Array.from(
        new Set(cursosDisponiveis.map(c => c.categoria))
      );
      setCategorias(uniqueCategories);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
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
      month: "short",
    });
  };

  const filteredCursos = cursos.filter((curso) => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || curso.categoria === selectedCategoria;
    const matchesNivel = !selectedNivel || curso.nivel === selectedNivel;

    return matchesSearch && matchesCategoria && matchesNivel;
  });

  const calcularVagasRestantes = (curso: CursoListItem) => {
    return curso.quantidade_limite_alunos - curso.quantidade_alunos_matriculados;
  };

  const getPercentualOcupacao = (curso: CursoListItem) => {
    return (curso.quantidade_alunos_matriculados / curso.quantidade_limite_alunos) * 100;
  };

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
          py: 8,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            opacity: 0.3,
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
            <Typography variant="h2" fontWeight="800" gutterBottom>
              Aprenda sem Limites
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, fontWeight: 400 }}>
              Cursos online de tecnologia com os melhores profissionais do mercado.
              Comece sua jornada hoje!
            </Typography>

            {/* Search Bar */}
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                p: 0.5,
                display: "flex",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              <TextField
                fullWidth
                placeholder="Pesquise por cursos, tecnologias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#8270FF" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: "white",
                    "& fieldset": { border: "none" },
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                Buscar
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA para Vendedores */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#f7fafc",
            border: "1px solid #e2e8f0",
            p: 2.5,
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <StorefrontIcon sx={{ fontSize: 28, color: "#8270FF" }} />
                <Box>
                  <Typography variant="body1" fontWeight="600" sx={{ color: "#2d3748" }}>
                    Deseja vender nossos cursos?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Torne-se um parceiro Ponte Tech e ganhe comissões
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<StorefrontIcon />}
                  onClick={() => router.push("/cadastro/vendedor")}
                  sx={{
                    borderColor: "#8270FF",
                    color: "#8270FF",
                    "&:hover": {
                      borderColor: "#6c5ce7",
                      bgcolor: "rgba(130, 112, 255, 0.04)",
                    },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Saiba Mais
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight="700" sx={{ color: "#2d3748" }}>
                {filteredCursos.length} {filteredCursos.length === 1 ? "Curso Disponível" : "Cursos Disponíveis"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Categoria"
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                size="small"
              >
                <MenuItem value="">Todas as Categorias</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Nível"
                value={selectedNivel}
                onChange={(e) => setSelectedNivel(e.target.value as CursoNivel | "")}
                size="small"
              >
                <MenuItem value="">Todos os Níveis</MenuItem>
                <MenuItem value="basico">Iniciante</MenuItem>
                <MenuItem value="intermediario">Intermediário</MenuItem>
                <MenuItem value="avancado">Avançado</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Courses Grid */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Carregando cursos...
            </Typography>
          </Box>
        ) : filteredCursos.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <SchoolIcon sx={{ fontSize: 80, color: "#cbd5e0", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum curso encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros ou fazer uma nova busca
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCursos.map((curso) => {
              const vagasRestantes = calcularVagasRestantes(curso);
              const ocupacao = getPercentualOcupacao(curso);
              const quaseEsgotado = vagasRestantes <= 5 && vagasRestantes > 0;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={curso.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(130, 112, 255, 0.2)",
                        borderColor: "#8270FF",
                      },
                    }}
                  >
                    {/* Image */}
                    <Box sx={{ position: "relative", paddingTop: "56.25%", bgcolor: "#f7fafc" }}>
                      <CardMedia
                        component="img"
                        image={curso.imagem_capa_url || "https://placehold.co/600x400?text=Curso"}
                        alt={curso.titulo}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      {/* Badges */}
                      <Box sx={{ position: "absolute", top: 12, left: 12, right: 12 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            label={nivelLabels[curso.nivel]}
                            size="small"
                            sx={{
                              bgcolor: nivelColors[curso.nivel],
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                          {quaseEsgotado && (
                            <Chip
                              label="Últimas Vagas!"
                              size="small"
                              sx={{
                                bgcolor: "#f44336",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0.7 },
                                },
                              }}
                            />
                          )}
                          {ocupacao > 80 && !quaseEsgotado && (
                            <Chip
                              label="Popular"
                              size="small"
                              icon={<TrendingUpIcon sx={{ fontSize: "0.9rem !important" }} />}
                              sx={{
                                bgcolor: "#ff9800",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      {/* Category */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#8270FF",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {curso.categoria}
                      </Typography>

                      {/* Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          mt: 0.5,
                          lineHeight: 1.3,
                          color: "#2d3748",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {curso.titulo}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.5,
                        }}
                      >
                        {curso.descricao}
                      </Typography>

                      {/* Info */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {curso.carga_horaria}h de conteúdo
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {vagasRestantes} vagas restantes
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2 }} />

                      {/* Price and CTA */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              color: "#8270FF",
                              lineHeight: 1,
                            }}
                          >
                            {formatCurrency(curso.valor)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Início em {formatDate(curso.data_inicio)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2.5, pt: 0, flexDirection: "column", gap: 1.5 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => router.push(`/vendas/${curso.id}`)}
                        sx={{
                          bgcolor: "#8270FF",
                          "&:hover": { bgcolor: "#6c5ce7" },
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1.2,
                          boxShadow: "0 4px 14px rgba(130, 112, 255, 0.4)",
                        }}
                      >
                        Quero me Matricular
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<StorefrontIcon />}
                        onClick={() => router.push("/cadastro/vendedor")}
                        sx={{
                          borderColor: "#8270FF",
                          color: "#8270FF",
                          "&:hover": {
                            borderColor: "#6c5ce7",
                            bgcolor: "rgba(130, 112, 255, 0.04)",
                          },
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1.2,
                        }}
                      >
                        Quero Vender
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
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
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: "pointer" }}>
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
