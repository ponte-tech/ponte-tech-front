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
import clienteService from "@/app/services/clienteService";
import type { Cliente } from "@/app/types/cliente";

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

  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<WikiTopic | null>(null);
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicClienteId, setTopicClienteId] = useState("");

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

  useEffect(() => {
    loadTopics();
    clienteService.list({ status: "ativo" }).then((res) => setClientes(res.clientes || [])).catch(() => {});
  }, []);

  const handleCreateTopic = async () => {
    try {
      if (editingTopic) {
        await wikiService.updateTopic(editingTopic.topic_id, { name: topicName, description: topicDescription });
        setSnackbar({ open: true, message: "Tópico atualizado", severity: "success" });
      } else {
        // Find or create parent topic for the selected client
        const cliente = clientes.find((c) => c.cliente_id === topicClienteId);
        if (!cliente) {
          setSnackbar({ open: true, message: "Selecione um cliente", severity: "error" });
          return;
        }

        const clienteName = cliente.nome_fantasia || cliente.razao_social;

        // Check if parent topic already exists for this client
        let parentTopic = topics.find((t) => t.cliente_id === topicClienteId && !t.parent_topic_id);

        if (!parentTopic) {
          // Create parent topic with client name
          const created = await wikiService.createTopic({
            name: clienteName,
            description: `Documentação do cliente ${clienteName}`,
            cliente_id: topicClienteId,
            position: topics.length,
          });
          parentTopic = created as unknown as WikiTopic;
        }

        // Create subtopic under the parent
        await wikiService.createTopic({
          name: topicName,
          description: topicDescription,
          cliente_id: topicClienteId,
          parent_topic_id: parentTopic.topic_id,
          position: topics.length + 1,
        });

        setSnackbar({ open: true, message: "Tópico criado", severity: "success" });
      }
      setTopicDialogOpen(false);
      setTopicName("");
      setTopicDescription("");
      setTopicClienteId("");
      setEditingTopic(null);
      loadTopics(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Erro ao salvar tópico";
      setSnackbar({ open: true, message: msg, severity: "error" });
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

  // Separate parent topics (no parent_topic_id) and subtopics
  const parentTopics = topics.filter((t) => !t.parent_topic_id);
  const subtopicsByParent = topics.reduce((acc, t) => {
    if (t.parent_topic_id) {
      if (!acc[t.parent_topic_id]) acc[t.parent_topic_id] = [];
      acc[t.parent_topic_id].push(t);
    }
    return acc;
  }, {} as Record<string, WikiTopic[]>);

  const filteredTopics = parentTopics.filter((topic) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (topic.name.toLowerCase().includes(q)) return true;
    const children = subtopicsByParent[topic.topic_id] || [];
    if (children.some((c) => c.name.toLowerCase().includes(q))) return true;
    for (const child of children) {
      if ((pagesByTopic[child.topic_id] || []).some((p) => p.title.toLowerCase().includes(q))) return true;
    }
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
                  setTopicClienteId("");
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
                onClick={() => { setEditingTopic(null); setTopicName(""); setTopicDescription(""); setTopicClienteId(""); setTopicDialogOpen(true); }}
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
            {filteredTopics.map((parentTopic) => {
              const isParentExpanded = expandedTopics[parentTopic.topic_id];
              const children = subtopicsByParent[parentTopic.topic_id] || [];
              const parentPages = pagesByTopic[parentTopic.topic_id] || [];

              return (
                <Box key={parentTopic.topic_id}>
                  {/* Parent Topic Header (Client) */}
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
                    onClick={() => setExpandedTopics((prev) => ({ ...prev, [parentTopic.topic_id]: !prev[parentTopic.topic_id] }))}
                  >
                    <ChevronRightIcon
                      sx={{
                        fontSize: 20,
                        color: "#94a3b8",
                        transition: "transform 0.2s ease",
                        transform: isParentExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                    <FolderOpenIcon sx={{ fontSize: 20, color: "#8270FF" }} />
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ flex: 1 }}>
                      {parentTopic.name}
                    </Typography>
                    <Chip
                      label={children.length + parentPages.length}
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
                      <Tooltip title="Editar" arrow>
                        <IconButton
                          size="small"
                          onClick={() => { setEditingTopic(parentTopic); setTopicName(parentTopic.name); setTopicDescription(parentTopic.description || ""); setTopicDialogOpen(true); }}
                          sx={{ color: "#64748b", width: 28, height: 28 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir" arrow>
                        <IconButton
                          size="small"
                          onClick={() => { setDeleteTarget({ type: "topic", id: parentTopic.topic_id, name: parentTopic.name }); setDeleteDialogOpen(true); }}
                          sx={{ color: "#64748b", width: 28, height: 28, "&:hover": { color: "#ef4444" } }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Subtopics and Pages */}
                  <Collapse in={isParentExpanded} timeout={200}>
                    <Box sx={{ pl: { xs: 2, md: 4 }, pt: 1 }}>
                      {children.map((subtopic) => {
                        const subPages = pagesByTopic[subtopic.topic_id] || [];
                        const isSubExpanded = expandedTopics[subtopic.topic_id];
                        const filteredSubPages = search
                          ? subPages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
                          : subPages;

                        return (
                          <Box key={subtopic.topic_id} sx={{ mb: 1 }}>
                            {/* Subtopic Header */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 0.5,
                                py: 0.5,
                                cursor: "pointer",
                                borderRadius: 1.5,
                                transition: "all 0.15s ease",
                                "&:hover": { bgcolor: alpha("#8270FF", 0.03) },
                                "&:hover .topic-actions": { opacity: 1 },
                              }}
                              onClick={() => setExpandedTopics((prev) => ({ ...prev, [subtopic.topic_id]: !prev[subtopic.topic_id] }))}
                            >
                              <ChevronRightIcon
                                sx={{
                                  fontSize: 18,
                                  color: "#94a3b8",
                                  transition: "transform 0.2s ease",
                                  transform: isSubExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                }}
                              />
                              <ArticleIcon sx={{ fontSize: 18, color: "#64748b" }} />
                              <Typography variant="body2" fontWeight={600} color="#334155" sx={{ flex: 1 }}>
                                {subtopic.name}
                              </Typography>
                              {subtopic.description && (
                                <Typography variant="caption" color="#94a3b8" sx={{ mr: 1, display: { xs: "none", md: "block" } }}>
                                  {subtopic.description}
                                </Typography>
                              )}
                              <Chip
                                label={subPages.length}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.625rem",
                                  fontWeight: 600,
                                  bgcolor: alpha("#94a3b8", 0.08),
                                  color: "#64748b",
                                  "& .MuiChip-label": { px: 0.5 },
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
                                    onClick={() => { setNewPageTopicId(subtopic.topic_id); setNewPageTitle(""); setPageDialogOpen(true); }}
                                    sx={{ color: "#8270FF", width: 24, height: 24 }}
                                  >
                                    <NoteAddIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => { setEditingTopic(subtopic); setTopicName(subtopic.name); setTopicDescription(subtopic.description || ""); setTopicDialogOpen(true); }}
                                    sx={{ color: "#64748b", width: 24, height: 24 }}
                                  >
                                    <EditIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => { setDeleteTarget({ type: "topic", id: subtopic.topic_id, name: subtopic.name }); setDeleteDialogOpen(true); }}
                                    sx={{ color: "#64748b", width: 24, height: 24, "&:hover": { color: "#ef4444" } }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>

                            {/* Subtopic Pages */}
                            <Collapse in={isSubExpanded} timeout={200}>
                              <Box sx={{ pl: { xs: 2, md: 4.5 }, pt: 1, pb: 1 }}>
                                {filteredSubPages.length === 0 ? (
                                  <Box
                                    sx={{
                                      py: 2,
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
                                      onClick={() => { setNewPageTopicId(subtopic.topic_id); setNewPageTitle(""); setPageDialogOpen(true); }}
                                      sx={{ mt: 1, textTransform: "none", color: "#8270FF", fontSize: "0.8125rem" }}
                                    >
                                      Criar página
                                    </Button>
                                  </Box>
                                ) : (
                                  <Grid container spacing={1.5}>
                                    {filteredSubPages.map((page) => (
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

                      {/* Pages directly under parent (legacy or direct pages) */}
                      {parentPages.length > 0 && (
                        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                          {parentPages.map((page) => (
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
                                    <Typography variant="body2" fontWeight={600} color="#1e293b" noWrap sx={{ mb: 0.5, fontSize: "0.875rem" }}>
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

                      {children.length === 0 && parentPages.length === 0 && (
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
                            Nenhum subtópico ou página neste cliente
                          </Typography>
                        </Box>
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
            {editingTopic ? "Atualize as informações do tópico." : "Selecione o cliente e crie um subtópico para organizar a documentação."}
          </Typography>
          {!editingTopic && (
            <TextField
              select
              fullWidth
              label="Cliente *"
              value={topicClienteId}
              onChange={(e) => setTopicClienteId(e.target.value)}
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
              helperText="O tópico principal será criado automaticamente com o nome do cliente"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.cliente_id} value={c.cliente_id}>
                  {c.nome_fantasia || c.razao_social}
                </option>
              ))}
            </TextField>
          )}
          <TextField
            autoFocus={!!editingTopic}
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
            disabled={!topicName.trim() || (!editingTopic && !topicClienteId)}
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
            <option value="">Selecione um tópico</option>
            {topics.map((t) => {
              const parent = t.parent_topic_id ? parentTopics.find((p) => p.topic_id === t.parent_topic_id) : null;
              const label = parent ? `${parent.name} > ${t.name}` : t.name;
              return <option key={t.topic_id} value={t.topic_id}>{label}</option>;
            })}
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
