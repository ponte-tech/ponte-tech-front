"use client";

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Pagination,
  alpha,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import cursosService from "@/app/services/cursosService";
import { CursoListItem, CursoStatus, CursoNivel } from "@/app/types/api";
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

export default function CursosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cursos, setCursos] = useState<CursoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CursoStatus | "">("");
  const [filterNivel, setFilterNivel] = useState<CursoNivel | "">("");

  const isAdmin = user?.userType === "admin";

  const loadCursos = async () => {
    setLoading(true);
    try {
      const filters: any = { page, limit: 9 };
      if (filterStatus) filters.status = filterStatus;
      if (filterNivel) filters.nivel = filterNivel;

      const response = await cursosService.list(filters);
      setCursos(response.cursos);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
    // console.error("Erro ao carregar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCursos();
  }, [page, filterStatus, filterNivel]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const filteredCursos = cursos.filter((curso) =>
    curso.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Cursos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie e visualize todos os cursos disponíveis
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/dashboard/cursos/novo")}
            sx={{
              bgcolor: "#8270FF",
              "&:hover": { bgcolor: "#6c5ce7" },
              textTransform: "none",
              px: 3,
            }}
          >
            Novo Curso
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Pesquisar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CursoStatus | "")}
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Nível"
                value={filterNivel}
                onChange={(e) => setFilterNivel(e.target.value as CursoNivel | "")}
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(nivelLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredCursos.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum curso encontrado
          </Typography>
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => router.push("/dashboard/cursos/novo")}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Criar Primeiro Curso
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredCursos.map((curso) => (
              <Grid item xs={12} sm={6} md={4} key={curso.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(130, 112, 255, 0.15)",
                    },
                  }}
                  onClick={() => router.push(`/dashboard/cursos/${curso.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={curso.imagem_capa_url || "https://placehold.co/600x400?text=Curso"}
                    alt={curso.titulo}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Chip
                          label={statusLabels[curso.status]}
                          color={statusColors[curso.status]}
                          size="small"
                        />
                        <Chip label={nivelLabels[curso.nivel]} size="small" variant="outlined" />
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        fontWeight="600"
                        sx={{
                          mb: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {curso.titulo}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {curso.descricao}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {curso.categoria}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {curso.carga_horaria}h
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" color="#8270FF" fontWeight="bold">
                          {formatCurrency(curso.valor)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {curso.quantidade_alunos_matriculados}/{curso.quantidade_limite_alunos}{" "}
                          alunos
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
