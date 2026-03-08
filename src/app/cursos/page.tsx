"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  TablePagination,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CursoStatus | "">("");
  const [filterNivel, setFilterNivel] = useState<CursoNivel | "">("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState<CursoListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const isAdmin = user?.userType === "admin";
  const isVendedor = user?.userType === "vendedor";

  const loadCursos = async () => {
    setLoading(true);
    try {
      const filters: any = { page: page + 1, limit: rowsPerPage };
      if (filterStatus) filters.status = filterStatus;
      if (filterNivel) filters.nivel = filterNivel;

      const response = await cursosService.list(filters);
      setCursos(response.cursos);
      setTotalItems(response.pagination.total_items);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCursos();
  }, [page, rowsPerPage, filterStatus, filterNivel]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleDeleteClick = (curso: CursoListItem) => {
    setCursoToDelete(curso);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!cursoToDelete) return;

    try {
      await cursosService.delete(cursoToDelete.id);

      // Remove da lista local e recarrega
      setCursos(cursos.filter(c => c.id !== cursoToDelete.id));
      setDeleteDialogOpen(false);
      setCursoToDelete(null);

      // Recarrega a lista para garantir que está atualizada
      loadCursos();
    } catch (error: any) {
      setDeleteError(error.message || "Erro ao excluir curso");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCursoToDelete(null);
    setDeleteError(null);
  };

  const handleShare = async (curso: CursoListItem) => {
    if (!user?.codigoVendedor) {
      setSnackbarMessage("Código de vendedor não encontrado");
      setSnackbarOpen(true);
      return;
    }

    const shareUrl = `${window.location.origin}/matricula?codigo_vendedor=${user.codigoVendedor}&codigo_curso=${curso.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbarMessage("Link de compartilhamento copiado!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      setSnackbarMessage("Erro ao copiar link");
      setSnackbarOpen(true);
    }
  };

  const filteredCursos = cursos.filter((curso) =>
    curso.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
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
            onClick={() => router.push("/cursos/novo")}
            sx={{
              bgcolor: "#8270FF",
              "&:hover": { bgcolor: "#6c5ce7" },
              textTransform: "none",
              px: 3,
            }}
          >
            Cadastrar Curso
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CursoStatus | "")}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Nível"
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value as CursoNivel | "")}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(nivelLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nível</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Vagas</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Início</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredCursos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum curso encontrado
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/cursos/novo")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Cadastrar Primeiro Curso
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCursos.map((curso) => (
                  <TableRow
                    key={curso.id}
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {curso.titulo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        {curso.descricao.length > 60
                          ? `${curso.descricao.substring(0, 60)}...`
                          : curso.descricao}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{curso.categoria}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nivelLabels[curso.nivel]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[curso.status]}
                        color={statusColors[curso.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(curso.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {curso.quantidade_alunos_matriculados} / {curso.quantidade_limite_alunos}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(curso.data_inicio)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        {isVendedor && (
                          <Tooltip title="Compartilhar link de matrícula">
                            <IconButton
                              size="small"
                              onClick={() => handleShare(curso)}
                              sx={{ color: "#00c853" }}
                            >
                              <ShareIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/cursos/${curso.id}`)}
                            sx={{ color: "#8270FF" }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/cursos/${curso.id}/editar`)}
                                sx={{ color: "#1976d2" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(curso)}
                                sx={{ color: "#d32f2f" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Cursos por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Tem certeza que deseja excluir o curso <strong>{cursoToDelete?.titulo}</strong>?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for share feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
