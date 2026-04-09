"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  AutoStories as AutoStoriesIcon,
  FiberManualRecord as DotIcon,
  KeyboardCommandKey,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import wikiService, { WikiPage, WikiTopic } from "@/app/services/wikiService";
import TipTapEditor from "../components/TipTapEditor";

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

export default function WikiPageEditor() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;

  const [page, setPage] = useState<WikiPage | null>(null);
  const [topic, setTopic] = useState<WikiTopic | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  const savedContentRef = useRef({ title: "", content: "" });

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const pageData = await wikiService.getPage(pageId);
        setPage(pageData);
        setTitle(pageData.title);
        setContent(pageData.content);
        savedContentRef.current = { title: pageData.title, content: pageData.content };
        setLastSaved(pageData.updated_at);

        const topicData = await wikiService.getTopic(pageData.topic_id);
        setTopic(topicData);
      } catch {
        setSnackbar({ open: true, message: "Erro ao carregar página", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [pageId]);

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !saving) handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, saving, title, content]);

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    setHasChanges(html !== savedContentRef.current.content || title !== savedContentRef.current.title);
  }, [title]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasChanges(newTitle !== savedContentRef.current.title || content !== savedContentRef.current.content);
  }, [content]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await wikiService.updatePage(pageId, { title, content });
      savedContentRef.current = { title, content };
      setHasChanges(false);
      setLastSaved(new Date().toISOString());
      setSnackbar({ open: true, message: "Salvo", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Erro ao salvar", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={32} sx={{ color: "#8270FF" }} />
      </Box>
    );
  }

  if (!page) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography color="#64748b" sx={{ mb: 2 }}>Página não encontrada.</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/documentacao")}
          sx={{ textTransform: "none", color: "#8270FF" }}
        >
          Voltar à documentação
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", width: "100%", mt: { xs: -2, sm: -3 }, mx: { xs: -2, sm: -3 } }}>
      {/* Top Bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: alpha("#94a3b8", 0.1),
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Left: Breadcrumbs */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Voltar" arrow>
              <IconButton
                size="small"
                onClick={() => router.push("/dashboard/documentacao")}
                sx={{
                  color: "#64748b",
                  width: 32,
                  height: 32,
                  "&:hover": { bgcolor: alpha("#8270FF", 0.06), color: "#8270FF" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Breadcrumbs
              separator={<DotIcon sx={{ fontSize: 6, color: "#cbd5e1" }} />}
              sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.75 } }}
            >
              <MuiLink
                underline="none"
                sx={{
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": { color: "#8270FF" },
                  transition: "color 0.15s",
                }}
                onClick={() => router.push("/dashboard/documentacao")}
              >
                <AutoStoriesIcon sx={{ fontSize: 15 }} />
                Docs
              </MuiLink>
              {topic && (
                <Typography sx={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>
                  {topic.name}
                </Typography>
              )}
              <Typography sx={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600, maxWidth: 200 }} noWrap>
                {title || "Sem título"}
              </Typography>
            </Breadcrumbs>
          </Stack>

          {/* Right: Status + Actions */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Save Status */}
            <Fade in={!hasChanges && lastSaved !== null}>
              <Typography variant="caption" color="#94a3b8" sx={{ fontSize: "0.75rem", mr: 0.5 }}>
                Salvo {lastSaved ? timeAgo(lastSaved) : ""}
              </Typography>
            </Fade>
            <Fade in={hasChanges}>
              <Chip
                label="Não salvo"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  bgcolor: alpha("#f59e0b", 0.1),
                  color: "#d97706",
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Fade>

            <Box sx={{ width: 1, height: 20, bgcolor: alpha("#94a3b8", 0.15), mx: 0.5 }} />

            <Tooltip title={editMode ? "Modo leitura" : "Modo edição"} arrow>
              <IconButton
                size="small"
                onClick={() => setEditMode(!editMode)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  color: editMode ? "#8270FF" : "#64748b",
                  bgcolor: editMode ? alpha("#8270FF", 0.08) : "transparent",
                  "&:hover": { bgcolor: alpha("#8270FF", 0.1) },
                }}
              >
                {editMode ? <EditIcon sx={{ fontSize: 17 }} /> : <VisibilityIcon sx={{ fontSize: 17 }} />}
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon sx={{ fontSize: 20 }} />}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                bgcolor: "#8270FF",
                borderRadius: 2,
                px: 3,
                py: 1,
                height: 40,
                minWidth: 120,
                boxShadow: hasChanges ? "0 2px 6px rgba(130,112,255,0.35)" : "none",
                "&:hover": { bgcolor: "#6B5FCC" },
                "&.Mui-disabled": { bgcolor: alpha("#94a3b8", 0.12), color: "#94a3b8" },
              }}
            >
              Salvar
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Title */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 0 }}>
        {editMode ? (
          <TextField
            fullWidth
            variant="standard"
            placeholder="Título da página"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "#0f172a",
                lineHeight: 1.3,
                "&::placeholder": { color: "#cbd5e1" },
              },
            }}
          />
        ) : (
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#0f172a",
              lineHeight: 1.3,
            }}
          >
            {title || "Sem título"}
          </Typography>
        )}

        {/* Meta */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1, mb: 1 }}>
          <Typography variant="caption" color="#94a3b8" fontSize="0.75rem">
            Criado em {new Date(page.created_at).toLocaleDateString("pt-BR")}
          </Typography>
          <DotIcon sx={{ fontSize: 4, color: "#cbd5e1" }} />
          <Typography variant="caption" color="#94a3b8" fontSize="0.75rem">
            Editado {timeAgo(page.updated_at)}
          </Typography>
        </Stack>
      </Box>

      {/* Editor */}
      <TipTapEditor content={content} onChange={handleContentChange} editable={editMode} />

      {/* Bottom padding */}
      <Box sx={{ height: 120 }} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, fontSize: "0.8125rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
