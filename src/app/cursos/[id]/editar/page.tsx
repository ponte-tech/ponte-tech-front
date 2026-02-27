"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import cursosService from "@/app/services/cursosService";
import { UpdateCursoRequest, CursoStatus, CursoNivel, Curso } from "@/app/types/api";

const statusOptions: { value: CursoStatus; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "aberto_venda", label: "Aberto para Vendas" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "encerrado", label: "Encerrado" },
];

const nivelOptions: { value: CursoNivel; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

export default function EditarCursoPage() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<UpdateCursoRequest>({});

  const loadCurso = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cursosService.getById(cursoId);
      setCurso(data);
      setFormData({
        titulo: data.titulo,
        descricao: data.descricao,
        valor: data.valor,
        data_inicio: data.data_inicio.split("T")[0],
        data_fim: data.data_fim.split("T")[0],
        carga_horaria: data.carga_horaria,
        categoria: data.categoria,
        nivel: data.nivel,
        status: data.status,
        quantidade_limite_alunos: data.quantidade_limite_alunos,
        pre_requisitos: data.pre_requisitos || "",
        ementa: data.ementa || "",
        conteudo_programatico: data.conteudo_programatico || "",
        objetivos_curso: data.objetivos_curso || "",
        imagem_capa_url: data.imagem_capa_url || "",
      });
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

  const handleChange = useCallback((field: keyof UpdateCursoRequest, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (formData.titulo && formData.titulo.trim() === "") {
        throw new Error("O título não pode estar vazio");
      }

      if (formData.valor !== undefined && formData.valor <= 0) {
        throw new Error("O valor do curso deve ser maior que zero");
      }

      if (formData.carga_horaria !== undefined && formData.carga_horaria <= 0) {
        throw new Error("A carga horária deve ser maior que zero");
      }

      if (formData.data_inicio && formData.data_fim) {
        if (new Date(formData.data_inicio) >= new Date(formData.data_fim)) {
          throw new Error("A data de início deve ser anterior à data de fim");
        }
      }

      await cursosService.update(cursoId, formData);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/cursos/${cursoId}`);
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar curso";
      setError(errorMessage);
      console.error("Erro ao atualizar curso:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !curso) {
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
            {error}
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push(`/cursos/${cursoId}`)}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Editar Curso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {curso?.titulo}
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Curso atualizado com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Informações Básicas
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título do Curso"
                      required
                      value={formData.titulo || ""}
                      onChange={(e) => handleChange("titulo", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descrição"
                      required
                      multiline
                      rows={3}
                      value={formData.descricao || ""}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Categoria"
                      required
                      value={formData.categoria || ""}
                      onChange={(e) => handleChange("categoria", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Nível"
                      required
                      value={formData.nivel || "intermediario"}
                      onChange={(e) => handleChange("nivel", e.target.value)}
                      disabled={saving}
                    >
                      {nivelOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      required
                      value={formData.status || "rascunho"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      disabled={saving}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL da Imagem de Capa"
                      value={formData.imagem_capa_url || ""}
                      onChange={(e) => handleChange("imagem_capa_url", e.target.value)}
                      disabled={saving}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Detalhes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Valores e Datas
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valor (R$)"
                      type="number"
                      required
                      value={formData.valor || 0}
                      onChange={(e) => handleChange("valor", parseFloat(e.target.value))}
                      disabled={saving}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Carga Horária (horas)"
                      type="number"
                      required
                      value={formData.carga_horaria || 0}
                      onChange={(e) => handleChange("carga_horaria", parseInt(e.target.value))}
                      disabled={saving}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Início"
                      type="date"
                      required
                      value={formData.data_inicio || ""}
                      onChange={(e) => handleChange("data_inicio", e.target.value)}
                      disabled={saving}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Término"
                      type="date"
                      required
                      value={formData.data_fim || ""}
                      onChange={(e) => handleChange("data_fim", e.target.value)}
                      disabled={saving}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Limite de Alunos"
                      type="number"
                      required
                      value={formData.quantidade_limite_alunos || 50}
                      onChange={(e) =>
                        handleChange("quantidade_limite_alunos", parseInt(e.target.value))
                      }
                      disabled={saving}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Conteúdo */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Conteúdo do Curso
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Objetivos do Curso"
                      multiline
                      rows={3}
                      value={formData.objetivos_curso || ""}
                      onChange={(e) => handleChange("objetivos_curso", e.target.value)}
                      disabled={saving}
                      placeholder="Descreva os objetivos e o que o aluno aprenderá"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pré-requisitos"
                      multiline
                      rows={2}
                      value={formData.pre_requisitos || ""}
                      onChange={(e) => handleChange("pre_requisitos", e.target.value)}
                      disabled={saving}
                      placeholder="Liste os conhecimentos necessários"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Ementa e Conteúdo Programático */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Ementa e Conteúdo
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ementa"
                      multiline
                      rows={4}
                      value={formData.ementa || ""}
                      onChange={(e) => handleChange("ementa", e.target.value)}
                      disabled={saving}
                      placeholder="Descreva a ementa do curso (módulos, tópicos principais)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Conteúdo Programático"
                      multiline
                      rows={4}
                      value={formData.conteudo_programatico || ""}
                      onChange={(e) => handleChange("conteudo_programatico", e.target.value)}
                      disabled={saving}
                      placeholder="Detalhe o conteúdo programático completo"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/cursos/${cursoId}`)}
                disabled={saving}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  minWidth: 150,
                }}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
