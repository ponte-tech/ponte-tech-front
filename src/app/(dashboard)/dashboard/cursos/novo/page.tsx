"use client";

import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, CircularProgress, Alert, Grid } from "@mui/material";

import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import cursosService from "@/app/services/cursosService";
import { CreateCursoRequest, CursoStatus, CursoNivel } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";

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

export default function NovoCursoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateCursoRequest>({
    titulo: "",
    descricao: "",
    valor: 0,
    data_inicio: "",
    data_fim: "",
    carga_horaria: 0,
    categoria: "",
    nivel: "intermediario",
    status: "rascunho",
    quantidade_limite_alunos: 50,
    pre_requisitos: "",
    professor_responsavel_id: user?.id || "",
    ementa: "",
    conteudo_programatico: "",
    objetivos_curso: "",
    imagem_capa_url: "",
  });

  const handleChange = (field: keyof CreateCursoRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!formData.titulo || !formData.descricao || !formData.categoria) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      if (formData.valor <= 0) {
        throw new Error("O valor do curso deve ser maior que zero");
      }

      if (formData.carga_horaria <= 0) {
        throw new Error("A carga horária deve ser maior que zero");
      }

      if (!formData.data_inicio || !formData.data_fim) {
        throw new Error("Por favor, defina as datas de início e fim");
      }

      if (new Date(formData.data_inicio) >= new Date(formData.data_fim)) {
        throw new Error("A data de início deve ser anterior à data de fim");
      }

      const response = await cursosService.create(formData);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/cursos/${response.id}`);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar curso";
      setError(message);
      console.error("Erro ao criar curso:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/cursos")}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Novo Curso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha as informações para criar um novo curso
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
          Curso criado com sucesso! Redirecionando...
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
                      value={formData.titulo}
                      onChange={(e) => handleChange("titulo", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descrição"
                      required
                      multiline
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Categoria"
                      required
                      value={formData.categoria}
                      onChange={(e) => handleChange("categoria", e.target.value)}
                      disabled={loading}
                      placeholder="Ex: Tecnologia"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Nível"
                      required
                      value={formData.nivel}
                      onChange={(e) => handleChange("nivel", e.target.value)}
                      disabled={loading}
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
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      disabled={loading}
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
                      value={formData.imagem_capa_url}
                      onChange={(e) => handleChange("imagem_capa_url", e.target.value)}
                      disabled={loading}
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
                      inputProps={{ step: "0.01", min: "0" }}
                      value={formData.valor}
                      onChange={(e) => handleChange("valor", parseFloat(e.target.value) || 0)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Carga Horária (horas)"
                      type="number"
                      required
                      value={formData.carga_horaria}
                      onChange={(e) => handleChange("carga_horaria", parseInt(e.target.value))}
                      disabled={loading}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Início"
                      type="date"
                      required
                      InputLabelProps={{ shrink: true }}
                      value={formData.data_inicio}
                      onChange={(e) => handleChange("data_inicio", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Término"
                      type="date"
                      required
                      InputLabelProps={{ shrink: true }}
                      value={formData.data_fim}
                      onChange={(e) => handleChange("data_fim", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Limite de Alunos"
                      type="number"
                      required
                      value={formData.quantidade_limite_alunos}
                      onChange={(e) =>
                        handleChange("quantidade_limite_alunos", parseInt(e.target.value))
                      }
                      disabled={loading}
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
                      value={formData.objetivos_curso}
                      onChange={(e) => handleChange("objetivos_curso", e.target.value)}
                      disabled={loading}
                      placeholder="Descreva os objetivos e o que o aluno aprenderá"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pré-requisitos"
                      multiline
                      rows={2}
                      value={formData.pre_requisitos}
                      onChange={(e) => handleChange("pre_requisitos", e.target.value)}
                      disabled={loading}
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
                      value={formData.ementa}
                      onChange={(e) => handleChange("ementa", e.target.value)}
                      disabled={loading}
                      placeholder="Descreva a ementa do curso (módulos, tópicos principais)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Conteúdo Programático"
                      multiline
                      rows={4}
                      value={formData.conteudo_programatico}
                      onChange={(e) => handleChange("conteudo_programatico", e.target.value)}
                      disabled={loading}
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
                onClick={() => router.push("/dashboard/cursos")}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  minWidth: 150,
                }}
              >
                {loading ? "Salvando..." : "Criar Curso"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
