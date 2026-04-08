"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  alpha,
  Tooltip,
  InputAdornment,
  Grid,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Article as ArticleIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  NoteAdd as NoteAddIcon,
  AutoStories as AutoStoriesIcon,
  MoreHoriz as MoreHorizIcon,
  AccessTime as AccessTimeIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import wikiService, {
  WikiTopic,
  WikiPageSummary,
} from "@/app/services/wikiService";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

export default function DocumentacaoPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<WikiTopic[]>([]);
  const [pagesByTopic, setPagesByTopic] = useState<Record<string, WikiPageSummary[]>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<WikiTopic | null>(null);
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");

  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [newPageTopicId, setNewPageTopicId] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "topic" | "page"; id: string; name: string } | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  const loadTopics = async (showFullLoader = true) => {
    try {
      if (showFullLoader) setLoading(true);
      const topicsList = await wikiService.listTopics();
      setTopics(topicsList);

      const pagesMap: Record<string, WikiPageSummary[]> = {};
      for (const topic of topicsList) {
        const pages = await wikiService.listPages(topic.topic_id);
        pagesMap[topic.topic_id] = pages;
      }
      setPagesByTopic(pagesMap);

      if (topicsList.length > 0 && Object.keys(expandedTopics).length === 0) {
        const expanded: Record<string, boolean> = {};
        topicsList.forEach((t) => { expanded[t.topic_id] = true; });
        setExpandedTopics(expanded);
      }
    } catch {
      setSnackbar({ open: true, message: "Erro ao carregar documentação", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTopics(); }, []);

  const handleCreateTopic = async () => {
    try {
      if (editingTopic) {
        await wikiService.updateTopic(editingTopic.topic_id, { name: topicName, description: topicDescription });
        setSnackbar({ open: true, message: "Tópico atualizado", severity: "success" });
      } else {
        await wikiService.createTopic({ name: topicName, description: topicDescription, position: topics.length });
        setSnackbar({ open: true, message: "Tópico criado", severity: "success" });
      }
      setTopicDialogOpen(false);
      setTopicName("");
      setTopicDescription("");
      setEditingTopic(null);
      loadTopics(false);
    } catch {
      setSnackbar({ open: true, message: "Erro ao salvar tópico", severity: "error" });
    }
  };

  const handleCreatePage = async () => {
    try {
      const page = await wikiService.createPage({
        topic_id: newPageTopicId,
        title: newPageTitle,
        content: "<p></p>",
        position: (pagesByTopic[newPageTopicId]?.length || 0),
      });
      setPageDialogOpen(false);
      setNewPageTitle("");
      setNewPageTopicId("");
      router.push(`/dashboard/documentacao/${page.page_id}`);
    } catch {
      setSnackbar({ open: true, message: "Erro ao criar página", severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "topic") {
        await wikiService.deleteTopic(deleteTarget.id);
      } else {
        await wikiService.deletePage(deleteTarget.id);
      }
      setSnackbar({ open: true, message: `${deleteTarget.type === "topic" ? "Tópico" : "Página"} excluído`, severity: "success" });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      loadTopics(false);
    } catch {
      setSnackbar({ open: true, message: "Erro ao excluir", severity: "error" });
    }
  };

  const filteredTopics = topics.filter((topic) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (topic.name.toLowerCase().includes(q)) return true;
    return (pagesByTopic[topic.topic_id] || []).some((p) => p.title.toLowerCase().includes(q));
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={32} sx={{ color: "#8270FF" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafbfc" }}>
      {/* Hero Header */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          pt: { xs: 3, md: 4 },
          pb: 3,
          bgcolor: "#fff",
          borderBottom: "1px solid",
          borderColor: alpha("#94a3b8", 0.12),
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha("#8270FF", 0.08),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AutoStoriesIcon sx={{ color: "#8270FF", fontSize: 22 }} />
                </Box>
                <Typography variant="h5" fontWeight={700} color="#0f172a" letterSpacing="-0.02em">
                  Documentação
                </Typography>
              </Stack>
              <Typography variant="body2" color="#64748b" sx={{ ml: 0.25 }}>
                Base de conhecimento da equipe
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingTopic(null);
                  setTopicName("");
                  setTopicDescription("");
                  setTopicDialogOpen(true);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  borderColor: alpha("#8270FF", 0.3),
                  color: "#8270FF",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { borderColor: "#8270FF", bgcolor: alpha("#8270FF", 0.04) },
                }}
              >
                Novo Tópico
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<NoteAddIcon />}
                disabled={topics.length === 0}
                onClick={() => {
                  setNewPageTopicId(topics[0]?.topic_id || "");
                  setNewPageTitle("");
                  setPageDialogOpen(true);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  bgcolor: "#8270FF",
                  borderRadius: 2,
                  px: 2,
                  boxShadow: "0 1px 3px rgba(130,112,255,0.3)",
                  "&:hover": { bgcolor: "#6B5FCC" },
                }}
              >
                Nova Página
              </Button>
            </Stack>
          </Stack>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por título ou tópico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mt: 3,
              maxWidth: 480,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "#f8fafc",
                fontSize: "0.875rem",
                "& fieldset": { borderColor: alpha("#94a3b8", 0.2) },
                "&:hover fieldset": { borderColor: alpha("#8270FF", 0.3) },
                "&.Mui-focused fieldset": { borderColor: "#8270FF", borderWidth: "1.5px" },
              },
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 1100, mx: "auto" }}>
        {filteredTopics.length === 0 ? (
          /* Empty State */
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 3,
              bgcolor: "#fff",
              borderRadius: 3,
              border: "1px dashed",
              borderColor: alpha("#94a3b8", 0.3),
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: alpha("#8270FF", 0.06),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 36, color: alpha("#8270FF", 0.4) }} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="#334155" sx={{ mb: 1 }}>
              {topics.length === 0 ? "Comece sua documentação" : "Nenhum resultado"}
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mb: 3, maxWidth: 360, mx: "auto" }}>
              {topics.length === 0
                ? "Crie tópicos para organizar e páginas para documentar o conhecimento da equipe."
                : "Tente buscar com outros termos."}
            </Typography>
            {topics.length === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingTopic(null); setTopicName(""); setTopicDescription(""); setTopicDialogOpen(true); }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#8270FF",
                  borderRadius: 2,
                  px: 3,
                  boxShadow: "0 1px 3px rgba(130,112,255,0.3)",
                  "&:hover": { bgcolor: "#6B5FCC" },
                }}
              >
                Criar primeiro tópico
              </Button>
            )}
          </Box>
        ) : (
          /* Topics Tree */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredTopics.map((topic) => {
              const pages = pagesByTopic[topic.topic_id] || [];
              const isExpanded = expandedTopics[topic.topic_id];
              const filteredPages = search
                ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
                : pages;

              return (
                <Box key={topic.topic_id}>
                  {/* Topic Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 0.5,
                      py: 0.75,
                      cursor: "pointer",
                      borderRadius: 2,
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: alpha("#8270FF", 0.03) },
                      "&:hover .topic-actions": { opacity: 1 },
                    }}
                    onClick={() => setExpandedTopics((prev) => ({ ...prev, [topic.topic_id]: !prev[topic.topic_id] }))}
                  >
                    <ChevronRightIcon
                      sx={{
                        fontSize: 20,
                        color: "#94a3b8",
                        transition: "transform 0.2s ease",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                    <FolderOpenIcon sx={{ fontSize: 20, color: "#8270FF" }} />
                    <Typography variant="subtitle2" fontWeight={600} color="#1e293b" sx={{ flex: 1 }}>
                      {topic.name}
                    </Typography>
                    {topic.description && (
                      <Typography variant="caption" color="#94a3b8" sx={{ mr: 1, display: { xs: "none", md: "block" } }}>
                        {topic.description}
                      </Typography>
                    )}
                    <Chip
                      label={pages.length}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        bgcolor: alpha("#8270FF", 0.08),
                        color: "#8270FF",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={0.25}
                      className="topic-actions"
                      sx={{ opacity: 0, transition: "opacity 0.15s" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Nova página" arrow>
                        <IconButton
                          size="small"
                          onClick={() => { setNewPageTopicId(topic.topic_id); setNewPageTitle(""); setPageDialogOpen(true); }}
                          sx={{ color: "#8270FF", width: 28, height: 28 }}
                        >
                          <NoteAddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar" arrow>
                        <IconButton
                          size="small"
                          onClick={() => { setEditingTopic(topic); setTopicName(topic.name); setTopicDescription(topic.description || ""); setTopicDialogOpen(true); }}
                          sx={{ color: "#64748b", width: 28, height: 28 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir" arrow>
                        <IconButton
                          size="small"
                          onClick={() => { setDeleteTarget({ type: "topic", id: topic.topic_id, name: topic.name }); setDeleteDialogOpen(true); }}
                          sx={{ color: "#64748b", width: 28, height: 28, "&:hover": { color: "#ef4444" } }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Pages Grid */}
                  <Collapse in={isExpanded} timeout={200}>
                    <Box sx={{ pl: { xs: 2, md: 5.5 }, pt: 1, pb: 1 }}>
                      {filteredPages.length === 0 ? (
                        <Box
                          sx={{
                            py: 3,
                            px: 2,
                            border: "1px dashed",
                            borderColor: alpha("#94a3b8", 0.2),
                            borderRadius: 2,
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="body2" color="#94a3b8" fontSize="0.8125rem">
                            Nenhuma página neste tópico
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                            onClick={() => { setNewPageTopicId(topic.topic_id); setNewPageTitle(""); setPageDialogOpen(true); }}
                            sx={{ mt: 1, textTransform: "none", color: "#8270FF", fontSize: "0.8125rem" }}
                          >
                            Criar página
                          </Button>
                        </Box>
                      ) : (
                        <Grid container spacing={1.5}>
                          {filteredPages.map((page) => (
                            <Grid item xs={12} sm={6} md={4} key={page.page_id}>
                              <Box
                                onClick={() => router.push(`/dashboard/documentacao/${page.page_id}`)}
                                sx={{
                                  p: 2,
                                  bgcolor: "#fff",
                                  borderRadius: 2.5,
                                  border: "1px solid",
                                  borderColor: alpha("#94a3b8", 0.12),
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  position: "relative",
                                  "&:hover": {
                                    borderColor: alpha("#8270FF", 0.3),
                                    boxShadow: `0 4px 12px ${alpha("#8270FF", 0.08)}`,
                                    transform: "translateY(-1px)",
                                  },
                                  "&:hover .page-delete": { opacity: 1 },
                                }}
                              >
                                <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 1.5,
                                      bgcolor: alpha("#8270FF", 0.06),
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      mt: 0.25,
                                    }}
                                  >
                                    <ArticleIcon sx={{ fontSize: 18, color: "#8270FF" }} />
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      color="#1e293b"
                                      noWrap
                                      sx={{ mb: 0.5, fontSize: "0.875rem" }}
                                    >
                                      {page.title}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <AccessTimeIcon sx={{ fontSize: 12, color: "#94a3b8" }} />
                                      <Typography variant="caption" color="#94a3b8" fontSize="0.6875rem">
                                        {timeAgo(page.updated_at)}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </Stack>
                                <IconButton
                                  className="page-delete"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({ type: "page", id: page.page_id, name: page.title });
                                    setDeleteDialogOpen(true);
                                  }}
                                  sx={{
                                    position: "absolute",
                                    top: 6,
                                    right: 6,
                                    opacity: 0,
                                    transition: "opacity 0.15s",
                                    width: 24,
                                    height: 24,
                                    color: "#94a3b8",
                                    "&:hover": { color: "#ef4444" },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Create/Edit Topic Dialog */}
      <Dialog
        open={topicDialogOpen}
        onClose={() => setTopicDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.125rem", pb: 0.5 }}>
          {editingTopic ? "Editar Tópico" : "Novo Tópico"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748b" sx={{ mb: 2.5 }}>
            {editingTopic ? "Atualize as informações do tópico." : "Tópicos organizam suas páginas em categorias."}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nome do tópico"
            placeholder="Ex: Guias de Onboarding"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descrição (opcional)"
            placeholder="Uma breve descrição do conteúdo"
            value={topicDescription}
            onChange={(e) => setTopicDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTopicDialogOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTopic}
            disabled={!topicName.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#8270FF",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#6B5FCC" },
            }}
          >
            {editingTopic ? "Salvar" : "Criar tópico"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Page Dialog */}
      <Dialog
        open={pageDialogOpen}
        onClose={() => setPageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.125rem", pb: 0.5 }}>Nova Página</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748b" sx={{ mb: 2.5 }}>
            Crie uma nova página de documentação.
          </Typography>
          <TextField
            select
            fullWidth
            label="Tópico"
            value={newPageTopicId}
            onChange={(e) => setNewPageTopicId(e.target.value)}
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            {topics.map((t) => (
              <option key={t.topic_id} value={t.topic_id}>{t.name}</option>
            ))}
          </TextField>
          <TextField
            autoFocus
            fullWidth
            label="Título"
            placeholder="Ex: Como configurar o ambiente"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPageDialogOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePage}
            disabled={!newPageTitle.trim() || !newPageTopicId}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#8270FF",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#6B5FCC" },
            }}
          >
            Criar e editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.0625rem" }}>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#475569">
            Deseja excluir <strong>{deleteTarget?.name}</strong>?
            {deleteTarget?.type === "topic" && " Todas as páginas deste tópico serão excluídas."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#ef4444",
              borderRadius: 2,
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
