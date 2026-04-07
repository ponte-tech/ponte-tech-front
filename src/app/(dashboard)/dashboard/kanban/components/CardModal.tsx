import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  alpha,
  IconButton,
  Tabs,
  Tab,
  Autocomplete,
  Chip,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Article as ArticleIcon,
  ViewColumn as ViewColumnIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Tag as TagIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import ConfirmDialog from "@/app/shared/components/ConfirmDialog";
import { Card } from "@/app/types/kanban";
import { Cliente } from "@/app/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import kanbanService from "@/app/services/kanbanService";

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onAddObservation?: (content: string) => void;
  onChangeColumn?: (cardId: string, newColumnId: string) => void;
  card?: Card | null;
  columnId: string;
  clientes: Cliente[];
  columns?: any[];
  colaboradores?: any[];
  currentUserId?: string;
}

// Modern Input Styles - Reusable
const modernInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: "rgba(226, 232, 240, 1)",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "rgba(130, 112, 255, 0.5)",
    },
    "&.Mui-focused": {
      "& fieldset": {
        borderColor: "#8270FF",
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#64748b",
    "&.Mui-focused": {
      color: "#8270FF",
      fontWeight: 600,
    },
  },
};

export default function CardModal({
  open,
  onClose,
  card,
  columnId,
  clientes,
  columns = [],
  colaboradores = [],
  onSave,
  onAddObservation,
  onChangeColumn,
  currentUserId,
}: CardModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: "",
    identificador_demanda_cliente: "",
    delivery_date: "",
    assigned_to: [] as string[],
  });
  const [observation, setObservation] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedColumnId, setSelectedColumnId] = useState(columnId);
  const [lastCardId, setLastCardId] = useState<string | null>(null);
  const [descriptionVisible, setDescriptionVisible] = useState(true);

  // Attachment state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Share snackbar state
  const [shareSnackbarOpen, setShareSnackbarOpen] = useState(false);

  // Attachment delete confirmation
  const [attachmentDeleteDialogOpen, setAttachmentDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingAttachment, setDeletingAttachment] = useState(false);

  // Subtask state
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("");
  const [editingSubtask, setEditingSubtask] = useState<any | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("");
  const [editSubtaskDescription, setEditSubtaskDescription] = useState("");

  // Combined history (server + localStorage)
  const [combinedHistory, setCombinedHistory] = useState<any[]>([]);

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title,
        description: card.description || "",
        client_id: card.client_id || "",
        identificador_demanda_cliente: card.identificador_demanda_cliente || "",
        delivery_date: card.delivery_date || "",
        assigned_to: card.assigned_to || [],
      });
      setSelectedColumnId(card.column_id);

      // Only reset tab when opening modal or changing to a different card
      if (card.card_id !== lastCardId) {
        setActiveTab(0);
        setLastCardId(card.card_id);
      }
    } else {
      // Ao criar novo card, atribuir automaticamente ao usuário logado
      const defaultAssignedTo = currentUserId ? [currentUserId] : [];

      setFormData({
        title: "",
        description: "",
        client_id: "",
        identificador_demanda_cliente: "",
        delivery_date: "",
        assigned_to: defaultAssignedTo,
      });
      setSelectedColumnId(columnId);
      setActiveTab(0);
      setLastCardId(null);
    }
    setObservation("");
  }, [card, open, columnId, lastCardId, currentUserId]);

  const handleSubmit = () => {
    if (card) {
      // Update - only send non-empty fields
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        delivery_date: formData.delivery_date,
        identificador_demanda_cliente: formData.identificador_demanda_cliente,
        assigned_to: formData.assigned_to,
      };

      // Only include client_id if it's not empty
      if (formData.client_id) {
        updateData.client_id = formData.client_id;
      }

      onSave(updateData);
    } else {
      // Create
      onSave({
        ...formData,
        column_id: columnId,
      });
    }
  };

  const handleAddObservation = () => {
    if (observation.trim() && card && onAddObservation) {
      onAddObservation(observation);
      setObservation("");
    }
  };

  const handleColumnChange = (newColumnId: string) => {
    if (card && onChangeColumn && newColumnId !== card.column_id) {
      onChangeColumn(card.card_id, newColumnId);
      setSelectedColumnId(newColumnId);
    }
  };

  // Load attachments when card changes
  useEffect(() => {
    const loadAttachments = async () => {
      if (card?.card_id) {
        try {
          const response = await kanbanService.listAttachments(card.card_id);
          setAttachments(response.attachments || []);
        } catch (error) {
    // console.error("Error loading attachments:", error);
        }
      } else {
        setAttachments([]);
      }
    };
    loadAttachments();
  }, [card?.card_id]);

  // Load subtasks when card changes
  useEffect(() => {
    const loadSubtasks = async () => {
      if (card?.card_id) {
        try {
          const response = await kanbanService.listSubtasks(card.card_id);
          const loadedSubtasks = response.subtasks || [];
          console.log("Loaded subtasks:", loadedSubtasks.map(s => ({ id: s.subtask_id, title: s.title })));
          setSubtasks(loadedSubtasks);
        } catch (error: any) {
          console.error("Error loading subtasks:", error);
          setSubtasks([]);
        }
      } else {
        setSubtasks([]);
      }
    };
    loadSubtasks();
  }, [card?.card_id]);

  // Load and combine history (server + localStorage)
  useEffect(() => {
    if (card?.card_id) {
      const serverHistory = card.history || [];
      const storageKey = `history_${card.card_id}`;
      const storedHistory = localStorage.getItem(storageKey);

      let localHistory: any[] = [];
      if (storedHistory) {
        try {
          localHistory = JSON.parse(storedHistory);
        } catch {
          localHistory = [];
        }
      }

      // Combine and sort by date (newest first)
      const combined = [...serverHistory, ...localHistory].sort((a, b) => {
        return new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime();
      });

      setCombinedHistory(combined);
    } else {
      setCombinedHistory([]);
    }
  }, [card?.card_id, card?.history]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !card) return;

    const validation = kanbanService.validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Step 1: Initiate upload
      const initResponse = await kanbanService.initiateAttachmentUpload(card.card_id, {
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
        content_type: file.type,
      });

      setUploadProgress(50);

      // Step 2: Upload to S3
      await kanbanService.uploadFileToS3(initResponse.upload_url, file);

      setUploadProgress(100);

      // Reload attachments
      const response = await kanbanService.listAttachments(card.card_id);
      setAttachments(response.attachments || []);

      // Reset input
      event.target.value = "";
    } catch (error) {
    // console.error("Error uploading file:", error);
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file download
  const handleFileDownload = async (attachmentId: string) => {
    if (!card) return;

    try {
      const response = await kanbanService.downloadAttachment(card.card_id, attachmentId);
      window.open(response.download_url, "_blank");
    } catch (error) {
    // console.error("Error downloading file:", error);
      alert("Erro ao baixar arquivo");
    }
  };

  // Handle file deletion
  const handleFileDelete = (attachmentId: string, fileName: string) => {
    setAttachmentToDelete({ id: attachmentId, name: fileName });
    setAttachmentDeleteDialogOpen(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!card || !attachmentToDelete) return;

    try {
      setDeletingAttachment(true);
      await kanbanService.deleteAttachment(card.card_id, attachmentToDelete.id);

      // Reload attachments
      const response = await kanbanService.listAttachments(card.card_id);
      setAttachments(response.attachments || []);

      setAttachmentDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    } catch (error) {
    // console.error("Error deleting file:", error);
      alert("Erro ao excluir arquivo");
    } finally {
      setDeletingAttachment(false);
    }
  };

  const cancelDeleteAttachment = () => {
    setAttachmentDeleteDialogOpen(false);
    setAttachmentToDelete(null);
  };

  // Get column name
  const currentColumn = columns.find(c => c.column_id === selectedColumnId);

  // Helper to get colaborador name by ID
  const getColaboradorNameById = (id: string) => {
    const colab = colaboradores.find(c => c.colaborador_id === id || c.id === id);
    return colab?.nome || colab?.nome_completo || "Usuário desconhecido";
  };

  // Helper to add history entry locally
  const addLocalHistoryEntry = (fieldChanged: string, oldValue: string, newValue: string) => {
    if (!card) return;

    const historyEntry = {
      history_id: `HISTORY#${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      changed_at: new Date().toISOString(),
      changed_by: "current-user",
      field_changed: fieldChanged,
      old_value: oldValue,
      new_value: newValue,
    };

    const storageKey = `history_${card.card_id}`;
    const existingHistory = localStorage.getItem(storageKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(historyEntry);
    localStorage.setItem(storageKey, JSON.stringify(history));

    // Update combined history in state
    setCombinedHistory(prev => [historyEntry, ...prev]);
  };

  // Helper to format history values
  const formatHistoryValue = (fieldChanged: string, value: string) => {
    if (!value) return "-";

    if (fieldChanged === "Responsáveis") {
      // Value is comma-separated IDs
      const ids = value.split(", ").filter(id => id.trim());
      return ids.map(id => getColaboradorNameById(id.trim())).join(", ");
    }

    return value;
  };

  // Subtask handlers
  const handleCreateSubtask = async () => {
    console.log("handleCreateSubtask called", { card, newSubtaskTitle });
    if (!card || !newSubtaskTitle.trim()) {
      console.log("Validation failed:", { hasCard: !!card, titleTrimmed: newSubtaskTitle.trim() });
      return;
    }

    try {
      console.log("Creating subtask...");
      const newSubtask = await kanbanService.createSubtask({
        card_id: card.card_id,
        title: newSubtaskTitle,
        description: newSubtaskDescription || undefined,
      });
      console.log("Subtask created:", newSubtask);

      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle("");
      setNewSubtaskDescription("");
    } catch (error: any) {
      console.error("Error creating subtask:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("Erro ao criar subtarefa: " + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleSubtask = async (subtask: any) => {
    if (!card) return;

    try {
      const updated = await kanbanService.updateSubtask(card.card_id, subtask.subtask_id, {
        completed: !subtask.completed,
      });

      setSubtasks(subtasks.map((st) => (st.subtask_id === updated.subtask_id ? updated : st)));
    } catch (error: any) {
      console.error("Error toggling subtask:", error);
      alert("Erro ao atualizar subtarefa");
    }
  };

  const handleStartEditSubtask = (subtask: any) => {
    setEditingSubtask(subtask);
    setEditSubtaskTitle(subtask.title);
    setEditSubtaskDescription(subtask.description || "");
  };

  const handleSaveEditSubtask = async () => {
    if (!card || !editingSubtask || !editSubtaskTitle.trim()) return;

    try {
      const updated = await kanbanService.updateSubtask(card.card_id, editingSubtask.subtask_id, {
        title: editSubtaskTitle,
        description: editSubtaskDescription || undefined,
      });

      setSubtasks(subtasks.map((st) => (st.subtask_id === updated.subtask_id ? updated : st)));
      setEditingSubtask(null);
      setEditSubtaskTitle("");
      setEditSubtaskDescription("");
    } catch (error: any) {
      console.error("Error updating subtask:", error);
      alert("Erro ao atualizar subtarefa");
    }
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtask(null);
    setEditSubtaskTitle("");
    setEditSubtaskDescription("");
  };

  const handleDeleteSubtask = async (subtask: any) => {
    if (!card) return;

    console.log("Deleting subtask:", subtask);

    try {
      await kanbanService.deleteSubtask(card.card_id, subtask.subtask_id);
      console.log("Subtask deleted successfully");
      setSubtasks(subtasks.filter((st) => st.subtask_id !== subtask.subtask_id));
    } catch (error: any) {
      console.error("Error deleting subtask:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("Erro ao excluir subtarefa: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle share card - copy URL to clipboard
  const handleShareCard = async () => {
    if (!card) return;

    // Encode the card_id to handle special characters like #
    const url = `${window.location.origin}/dashboard/kanban?card=${encodeURIComponent(card.card_id)}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareSnackbarOpen(true);
    } catch (error) {
    // console.error("Erro ao copiar URL:", error);
      alert("Erro ao copiar link. Tente novamente.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableScrollLock
      PaperProps={{
        sx: {
          borderRadius: 4,
          height: "92vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(226, 232, 240, 0.6)",
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
        },
      }}
    >
      {/* Modern Header - Minimal & Clean */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          py: 2.5,
          px: 4,
          bgcolor: "rgba(248, 250, 252, 0.5)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "rgba(130, 112, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArticleIcon sx={{ color: "#8270FF", fontSize: "1.25rem" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder={card ? "Título do card..." : "Digite o título do novo card..."}
              inputProps={{ maxLength: 500 }}
              variant="standard"
              sx={{
                "& .MuiInput-root": {
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                  "&:before": {
                    borderBottom: "2px solid transparent",
                  },
                  "&:hover:before": {
                    borderBottom: "2px solid rgba(130, 112, 255, 0.3) !important",
                  },
                  "&:after": {
                    borderBottom: "2px solid #8270FF",
                  },
                },
                "& .MuiInput-input": {
                  padding: "4px 0",
                },
              }}
            />
            {card && (
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontSize: "0.813rem",
                  fontWeight: 500,
                  fontFamily: "monospace",
                  display: "block",
                  mt: 0.5,
                }}
              >
                #{card.card_id.replace("CARD#", "").substring(0, 8)} • {formData.title.length}/500
              </Typography>
            )}
            {!card && formData.title && (
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontSize: "0.813rem",
                  fontWeight: 500,
                  display: "block",
                  mt: 0.5,
                }}
              >
                {formData.title.length}/500
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#64748b",
            "&:hover": {
              color: "#0f172a",
              bgcolor: "rgba(100, 116, 139, 0.08)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: "flex", height: "calc(90vh - 130px)" }}>
        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Modern Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
              px: 4,
              minHeight: 48,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#64748b",
                minHeight: 48,
                px: 2,
                py: 1.5,
                "&:hover": {
                  color: "#8270FF",
                },
                "&.Mui-disabled": {
                  opacity: 0.4,
                },
              },
              "& .Mui-selected": {
                color: "#8270FF !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#8270FF",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label="Detalhes" icon={<ArticleIcon sx={{ fontSize: "1.125rem", mb: 0.5 }} />} iconPosition="start" />
            <Tab label="Observações" icon={<HistoryIcon sx={{ fontSize: "1.125rem", mb: 0.5 }} />} iconPosition="start" disabled={!card} />
            <Tab label="Anexos" icon={<AttachFileIcon sx={{ fontSize: "1.125rem", mb: 0.5 }} />} iconPosition="start" disabled={!card} />
            <Tab label="Histórico" icon={<HistoryIcon sx={{ fontSize: "1.125rem", mb: 0.5 }} />} iconPosition="start" disabled={!card} />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
            {/* Detalhes Tab */}
            {activeTab === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Description Field */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                      Descrição ({formData.description.length}/10000)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setDescriptionVisible(!descriptionVisible)}
                      sx={{
                        color: "#8270FF",
                        padding: "4px",
                        "&:hover": {
                          bgcolor: "rgba(130, 112, 255, 0.08)",
                        },
                      }}
                      title={descriptionVisible ? "Ocultar descrição" : "Mostrar descrição"}
                    >
                      {descriptionVisible ? (
                        <VisibilityOffIcon sx={{ fontSize: "1.125rem" }} />
                      ) : (
                        <VisibilityIcon sx={{ fontSize: "1.125rem" }} />
                      )}
                    </IconButton>
                  </Box>
                  {descriptionVisible && (
                    <TextField
                      fullWidth
                      multiline
                      minRows={12}
                      maxRows={30}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Adicione uma descrição detalhada..."
                      inputProps={{ maxLength: 10000 }}
                      sx={{
                        ...modernInputSx,
                        "& .MuiOutlinedInput-root": {
                          ...modernInputSx["& .MuiOutlinedInput-root"],
                          alignItems: "flex-start",
                        },
                        "& .MuiOutlinedInput-input": {
                          fontSize: "0.938rem",
                          lineHeight: 1.6,
                          overflowY: "auto !important",
                        },
                      }}
                    />
                  )}
                </Box>

                {/* Metadata Fields - Grid Layout */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 2.5, alignItems: "start" }}>
                  {/* Cliente */}
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      Cliente
                    </Typography>
                    <FormControl fullWidth sx={modernInputSx}>
                      <Select
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        displayEmpty
                        sx={{
                          height: 48,
                          "& .MuiSelect-select": {
                            fontSize: "0.938rem",
                            fontWeight: 500,
                          },
                        }}
                      >
                        <MenuItem value="">
                          <Typography sx={{ color: "#94a3b8", fontSize: "0.938rem" }}>Nenhum cliente</Typography>
                        </MenuItem>
                        {clientes.map((cliente) => (
                          <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <BusinessIcon sx={{ fontSize: "1rem", color: "#8270FF" }} />
                              <Typography sx={{ fontSize: "0.938rem" }}>{cliente.nome_fantasia}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* ID Demanda */}
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      ID Demanda Cliente
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.identificador_demanda_cliente}
                      onChange={(e) => setFormData({ ...formData, identificador_demanda_cliente: e.target.value })}
                      placeholder="Ex: TICKET-1234"
                      sx={{
                        ...modernInputSx,
                        "& .MuiOutlinedInput-input": {
                          fontFamily: "monospace",
                          fontSize: "0.938rem",
                        },
                      }}
                      InputProps={{
                        sx: { height: 48 },
                        startAdornment: <TagIcon sx={{ fontSize: "1.125rem", color: "#94a3b8", mr: 1 }} />,
                      }}
                    />
                  </Box>

                  {/* Data de Entrega - Right Side */}
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      Data de Entrega
                    </Typography>
                    <TextField
                      type="date"
                      sx={{
                        width: 200,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: alpha("#8270FF", 0.03),
                          height: 48,
                          "& fieldset": {
                            borderColor: "rgba(130, 112, 255, 0.3)",
                            borderWidth: "1px",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(130, 112, 255, 0.5)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: alpha("#8270FF", 0.05),
                            "& fieldset": {
                              borderColor: "#8270FF",
                              borderWidth: "2px",
                            },
                          },
                        },
                        "& input": {
                          color: "#8270FF",
                          fontWeight: 500,
                          fontSize: "0.938rem",
                        },
                      }}
                      InputLabelProps={{ shrink: true }}
                      value={formData.delivery_date}
                      onChange={(e) =>
                        setFormData({ ...formData, delivery_date: e.target.value })
                      }
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha("#8270FF", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: `1.5px solid ${alpha("#8270FF", 0.2)}`,
                    }}
                  >
                    <PersonIcon sx={{ color: "#8270FF", fontSize: "1.3rem" }} />
                  </Box>
                  <Autocomplete
                    multiple
                    fullWidth
                    size="small"
                    options={colaboradores.filter((c) => c.status === "ativo")}
                    getOptionLabel={(option) => option.nome || "Sem nome"}
                    value={colaboradores.filter((c) => formData.assigned_to.includes(c.colaborador_id))}
                    onChange={(event, newValue) => {
                      setFormData({
                        ...formData,
                        assigned_to: newValue.map((v) => v.colaborador_id),
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Responsáveis"
                        placeholder="Digite para buscar..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            backgroundColor: "#fff",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                              borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#8270FF",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#8270FF",
                              borderWidth: "1.5px",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "0.875rem",
                            color: "#666",
                            "&.Mui-focused": {
                              color: "#8270FF",
                            },
                          },
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.colaborador_id}
                          label={option.nome}
                          avatar={
                            <Avatar
                              src={option.foto_perfil_url || "/avatar.svg"}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: "transparent",
                              }}
                            />
                          }
                          size="small"
                          sx={{
                            bgcolor: alpha("#8270FF", 0.1),
                            color: "#8270FF",
                            "& .MuiChip-deleteIcon": {
                              color: "#8270FF",
                              "&:hover": {
                                color: "#6a5ce0",
                              },
                            },
                          }}
                        />
                      ))
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={option.colaborador_id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={option.foto_perfil_url || "/avatar.svg"}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "transparent",
                            }}
                          />
                          <span>{option.nome || "Sem nome"}</span>
                        </Box>
                      </li>
                    )}
                  />
                </Box>

                {/* Subtasks Section - Compact */}
                {card && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <CheckBoxIcon sx={{ fontSize: "1.1rem", color: "#8270FF" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                        Subtarefas
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        ({subtasks.filter(st => st.completed).length}/{subtasks.length})
                      </Typography>
                    </Box>

                    {/* Add Subtask - Compact */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          placeholder="+ Título da subtarefa"
                          fullWidth
                          size="small"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newSubtaskTitle.trim() && !e.shiftKey) {
                              handleCreateSubtask();
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                              fontSize: "0.875rem",
                              "& fieldset": { borderColor: "#e0e0e0" },
                              "&:hover fieldset": { borderColor: "#8270FF" },
                              "&.Mui-focused fieldset": { borderColor: "#8270FF" },
                            },
                          }}
                        />
                        {newSubtaskTitle.trim() && (
                          <IconButton
                            size="small"
                            onClick={handleCreateSubtask}
                            sx={{
                              bgcolor: "#8270FF",
                              color: "white",
                              "&:hover": { bgcolor: alpha("#8270FF", 0.8) },
                              width: 32,
                              height: 32,
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {newSubtaskTitle.trim() && (
                        <TextField
                          placeholder="Descrição (opcional)"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          value={newSubtaskDescription}
                          onChange={(e) => setNewSubtaskDescription(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                              fontSize: "0.8125rem",
                              "& fieldset": { borderColor: "#e0e0e0" },
                              "&:hover fieldset": { borderColor: "#8270FF" },
                              "&.Mui-focused fieldset": { borderColor: "#8270FF" },
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Subtasks List - Compact */}
                    {subtasks.length > 0 && (
                      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                        {subtasks.map((subtask, index) => {
                          return (
                            <Box
                              key={`subtask-${subtask.subtask_id || index}`}
                              sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              py: 0.75,
                              px: 1,
                              borderRadius: 1,
                              mb: 0.5,
                              bgcolor: subtask.completed ? alpha("#4caf50", 0.03) : "transparent",
                              "&:hover": {
                                bgcolor: subtask.completed ? alpha("#4caf50", 0.08) : alpha("#f5f5f5", 0.8),
                                "& .subtask-actions": {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            {editingSubtask?.subtask_id === subtask.subtask_id ? (
                              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Título"
                                  value={editSubtaskTitle}
                                  onChange={(e) => setEditSubtaskTitle(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      handleSaveEditSubtask();
                                    }
                                  }}
                                  autoFocus
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontSize: "0.8125rem",
                                      "& input": { py: 0.5 },
                                    },
                                  }}
                                />
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Descrição (opcional)"
                                  multiline
                                  rows={2}
                                  value={editSubtaskDescription}
                                  onChange={(e) => setEditSubtaskDescription(e.target.value)}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontSize: "0.75rem",
                                    },
                                  }}
                                />
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                  <IconButton
                                    size="small"
                                    onClick={handleSaveEditSubtask}
                                    sx={{ p: 0.5 }}
                                  >
                                    <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={handleCancelEditSubtask}
                                    sx={{ p: 0.5 }}
                                  >
                                    <CloseIcon fontSize="small" sx={{ color: "#999" }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ flex: 1, display: "flex", gap: 1, alignItems: "center" }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleSubtask(subtask)}
                                  sx={{ p: 0.5, color: subtask.completed ? "#4caf50" : "#999", alignSelf: "flex-start" }}
                                >
                                  {subtask.completed ? (
                                    <CheckBoxIcon fontSize="small" />
                                  ) : (
                                    <CheckBoxOutlineBlankIcon fontSize="small" />
                                  )}
                                </IconButton>
                                <Box
                                  sx={{ flex: 1, cursor: "pointer" }}
                                  onClick={() => handleToggleSubtask(subtask)}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: "0.8125rem",
                                      color: subtask.completed ? "#999" : "#333",
                                      textDecoration: subtask.completed ? "line-through" : "none",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {subtask.title}
                                  </Typography>
                                  {subtask.description && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: subtask.completed ? "#bbb" : "#666",
                                        display: "block",
                                        mt: 0.25,
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {subtask.description}
                                    </Typography>
                                  )}
                                </Box>
                                <Box
                                  className="subtask-actions"
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    opacity: 0,
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStartEditSubtask(subtask)}
                                    sx={{ p: 0.5, color: "#8270FF" }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteSubtask(subtask)}
                                    sx={{ p: 0.5, color: "#d32f2f" }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Observações Tab */}
            {activeTab === 1 && card && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    label="Nova Observação"
                    fullWidth
                    multiline
                    rows={3}
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Digite aqui..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        backgroundColor: "#fff",
                        "& fieldset": {
                          borderColor: "#e0e0e0",
                          borderWidth: "1px",
                        },
                        "&:hover fieldset": {
                          borderColor: "#8270FF",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#fff",
                          "& fieldset": {
                            borderColor: "#8270FF",
                            borderWidth: "1.5px",
                          },
                        },
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.875rem",
                        color: "#666",
                        "&.Mui-focused": {
                          color: "#8270FF",
                        },
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleAddObservation}
                    disabled={!observation.trim()}
                    sx={{
                      bgcolor: "#8270FF",
                      color: "white",
                      height: 40,
                      width: 40,
                      alignSelf: "flex-end",
                      "&:hover": {
                        bgcolor: alpha("#8270FF", 0.8),
                      },
                      "&:disabled": {
                        bgcolor: alpha("#8270FF", 0.3),
                      },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <Divider />

                {card.observations && card.observations.length > 0 ? (
                  <List sx={{ maxHeight: 400, overflow: "auto" }}>
                    {card.observations.map((obs) => (
                      <ListItem
                        key={obs.observation_id}
                        sx={{
                          px: 0,
                          py: 1.5,
                          borderBottom: "1px solid #f0f0f0",
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <ListItemText
                          primary={obs.content}
                          secondary={
                            format(new Date(obs.created_at), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })
                          }
                          primaryTypographyProps={{
                            sx: { fontSize: "0.875rem", color: "#333" },
                          }}
                          secondaryTypographyProps={{
                            sx: { fontSize: "0.75rem", color: "#999", mt: 0.5 },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                    <Typography variant="body2">
                      Nenhuma observação adicionada ainda.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Anexos Tab */}
            {activeTab === 2 && card && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Upload Area */}
                <Box
                  sx={{
                    border: "2px dashed #e0e0e0",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    bgcolor: alpha("#8270FF", 0.02),
                    cursor: uploading ? "not-allowed" : "pointer",
                    "&:hover": {
                      borderColor: uploading ? "#e0e0e0" : "#8270FF",
                      bgcolor: uploading ? alpha("#8270FF", 0.02) : alpha("#8270FF", 0.05),
                    },
                  }}
                  onClick={() => {
                    if (!uploading) {
                      document.getElementById("file-upload-input")?.click();
                    }
                  }}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <CloudUploadIcon sx={{ fontSize: 48, color: "#8270FF", mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                    {uploading ? "Fazendo upload..." : "Clique para selecionar um arquivo"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#999", display: "block", mt: 0.5 }}>
                    Tamanho máximo: 10MB
                  </Typography>
                  {uploading && uploadProgress > 0 && (
                    <Box sx={{ mt: 2, width: "100%" }}>
                      <Box
                        sx={{
                          height: 4,
                          bgcolor: "#e0e0e0",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            bgcolor: "#8270FF",
                            width: `${uploadProgress}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* Attachments List */}
                {attachments.length > 0 ? (
                  <List sx={{ maxHeight: 400, overflow: "auto" }}>
                    {attachments.map((attachment) => (
                      <ListItem
                        key={attachment.attachment_id}
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 1.5,
                          mb: 1,
                          bgcolor: alpha("#f5f5f5", 0.5),
                          border: "1px solid #e0e0e0",
                          "&:hover": {
                            bgcolor: alpha("#8270FF", 0.05),
                            borderColor: "#8270FF",
                          },
                        }}
                        secondaryAction={
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleFileDownload(attachment.attachment_id)}
                              sx={{
                                color: "#8270FF",
                                "&:hover": {
                                  bgcolor: alpha("#8270FF", 0.1),
                                },
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleFileDelete(attachment.attachment_id, attachment.nome_arquivo)}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": {
                                  bgcolor: alpha("#d32f2f", 0.1),
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <AttachFileIcon sx={{ fontSize: "1.2rem", color: "#8270FF", mr: 2 }} />
                        <ListItemText
                          primary={attachment.nome_arquivo}
                          secondary={
                            <>
                              {(attachment.tamanho_bytes / 1024).toFixed(2)} KB •{" "}
                              {format(new Date(attachment.uploaded_at), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })}
                            </>
                          }
                          primaryTypographyProps={{
                            sx: {
                              fontSize: "0.875rem",
                              color: "#333",
                              fontWeight: 500,
                              maxWidth: "400px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                          secondaryTypographyProps={{
                            sx: { fontSize: "0.75rem", color: "#999", mt: 0.5 },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                    <Typography variant="body2">
                      Nenhum anexo adicionado ainda.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Histórico Tab */}
            {activeTab === 3 && card && (
              <Box>
                {combinedHistory && combinedHistory.length > 0 ? (
                  <List sx={{ maxHeight: 500, overflow: "auto" }}>
                    {combinedHistory.map((hist) => (
                      <ListItem
                        key={hist.history_id}
                        sx={{
                          px: 0,
                          py: 1.5,
                          borderBottom: "1px solid #f0f0f0",
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <HistoryIcon sx={{ fontSize: "1.2rem", color: "#8270FF", mr: 2 }} />
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#333" }}>
                                {hist.field_changed}
                              </Typography>
                              <Box sx={{ mt: 0.5, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                {hist.old_value && (
                                  <>
                                    <Typography variant="body2" sx={{ color: "#999", fontSize: "0.8rem", textDecoration: "line-through" }}>
                                      {formatHistoryValue(hist.field_changed, hist.old_value)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#999" }}>→</Typography>
                                  </>
                                )}
                                <Typography variant="body2" sx={{ color: "#8270FF", fontSize: "0.8rem", fontWeight: 500 }}>
                                  {formatHistoryValue(hist.field_changed, hist.new_value)}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                                Por: {getColaboradorNameById(hist.changed_by)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            format(new Date(hist.changed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })
                          }
                          secondaryTypographyProps={{
                            sx: { fontSize: "0.7rem", color: "#999", mt: 0.5 },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                    <Typography variant="body2">
                      Nenhuma alteração registrada ainda.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Sidebar - Details */}
        <Box
          sx={{
            width: 280,
            borderLeft: 1,
            borderColor: "divider",
            bgcolor: alpha("#f5f5f5", 0.5),
            p: 2,
            overflowY: "auto",
          }}
        >
          <Typography variant="overline" sx={{ color: "#999", fontSize: "0.7rem", fontWeight: 600, mb: 2, display: "block" }}>
            Informações
          </Typography>

          {/* Column Status */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <ViewColumnIcon sx={{ fontSize: "1rem", color: "#666" }} />
              <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem" }}>
                Status
              </Typography>
            </Box>
            {card ? (
              <FormControl fullWidth size="small">
                <Select
                  value={selectedColumnId}
                  onChange={(e) => handleColumnChange(e.target.value)}
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#8270FF",
                    bgcolor: alpha("#8270FF", 0.05),
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha("#8270FF", 0.3),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8270FF",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8270FF",
                    },
                  }}
                >
                  {columns.map((column) => (
                    <MenuItem key={column.column_id} value={column.column_id}>
                      {column.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: alpha("#8270FF", 0.1),
                  border: `1px solid ${alpha("#8270FF", 0.3)}`,
                }}
              >
                <Typography variant="body2" sx={{ color: "#8270FF", fontWeight: 600, fontSize: "0.85rem" }}>
                  {currentColumn?.name || "Sem coluna"}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Client */}
          {formData.client_id && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BusinessIcon sx={{ fontSize: "1rem", color: "#666" }} />
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem" }}>
                  Cliente
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>
                {clientes.find(c => c.cliente_id === formData.client_id)?.nome_fantasia || "-"}
              </Typography>
            </Box>
          )}

          {/* Responsáveis */}
          {formData.assigned_to && formData.assigned_to.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PersonIcon sx={{ fontSize: "1rem", color: "#666" }} />
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem" }}>
                  Responsáveis
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {formData.assigned_to.map((colaboradorId) => {
                  const colab = colaboradores.find(c => c.colaborador_id === colaboradorId);
                  if (!colab) return null;
                  return (
                    <Chip
                      key={colaboradorId}
                      label={colab.nome}
                      avatar={
                        <Avatar
                          src={colab.foto_perfil_url || "/avatar.svg"}
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: "transparent",
                          }}
                        />
                      }
                      size="small"
                      sx={{
                        bgcolor: alpha("#8270FF", 0.1),
                        color: "#8270FF",
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Identificador Demanda Cliente */}
          {formData.identificador_demanda_cliente && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TagIcon sx={{ fontSize: "1rem", color: "#666" }} />
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem" }}>
                  ID Demanda Cliente
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem", fontFamily: "monospace" }}>
                {formData.identificador_demanda_cliente}
              </Typography>
            </Box>
          )}

          {/* Delivery Date */}
          {formData.delivery_date && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CalendarIcon sx={{ fontSize: "1rem", color: "#666" }} />
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem" }}>
                  Data de Entrega
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>
                {formData.delivery_date
                  ? format(new Date(formData.delivery_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })
                  : "-"}
              </Typography>
            </Box>
          )}

          {/* Created By */}
          {card?.created_by && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PersonIcon sx={{ fontSize: "1rem", color: "#666" }} />
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.75rem" }}>
                  Criado por
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>
                {getColaboradorNameById(card.created_by)}
              </Typography>
            </Box>
          )}

          {/* Created Date */}
          {card?.created_at && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: "#999", fontSize: "0.7rem", display: "block", mb: 0.5 }}>
                Criado em
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
                {format(new Date(card.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </Typography>
            </Box>
          )}

          {/* Updated Date */}
          {card?.updated_at && (
            <Box>
              <Typography variant="caption" sx={{ color: "#999", fontSize: "0.7rem", display: "block", mb: 0.5 }}>
                Atualizado em
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
                {format(new Date(card.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Modern Footer with Actions */}
      <DialogActions
        sx={{
          px: 4,
          py: 2.5,
          borderTop: "1px solid rgba(226, 232, 240, 0.8)",
          justifyContent: "space-between",
          bgcolor: "rgba(248, 250, 252, 0.5)",
        }}
      >
        <Box>
          {card && (
            <Button
              onClick={handleShareCard}
              startIcon={<ShareIcon sx={{ fontSize: "1.125rem" }} />}
              sx={{
                color: "#64748b",
                fontWeight: 600,
                textTransform: "none",
                px: 2,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  color: "#8270FF",
                  bgcolor: "rgba(130, 112, 255, 0.08)",
                },
              }}
            >
              Compartilhar
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={onClose}
            sx={{
              color: "#64748b",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              py: 1.25,
              borderRadius: 2,
              border: "1px solid rgba(226, 232, 240, 1)",
              "&:hover": {
                borderColor: "#94a3b8",
                bgcolor: "rgba(100, 116, 139, 0.04)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title.trim()}
            sx={{
              bgcolor: "#8270FF",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              px: 4,
              py: 1.25,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(130, 112, 255, 0.3)",
              "&:hover": {
                bgcolor: "#6b5ce0",
                boxShadow: "0 4px 12px rgba(130, 112, 255, 0.4)",
              },
              "&.Mui-disabled": {
                bgcolor: "#e2e8f0",
                color: "#94a3b8",
                boxShadow: "none",
              },
            }}
          >
            {card ? "Salvar Alterações" : "Criar Card"}
          </Button>
        </Box>
      </DialogActions>

      {/* Snackbar para notificação de compartilhamento */}
      <Snackbar
        open={shareSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setShareSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShareSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Link copiado para a área de transferência!
        </Alert>
      </Snackbar>

      {/* Attachment Delete Confirmation Dialog */}
      <ConfirmDialog
        open={attachmentDeleteDialogOpen}
        onClose={cancelDeleteAttachment}
        onConfirm={confirmDeleteAttachment}
        title="Excluir Anexo?"
        description={`Tem certeza que deseja excluir o arquivo "${attachmentToDelete?.name}"?`}
        confirmText="Excluir Anexo"
        variant="danger"
        loading={deletingAttachment}
      />
    </Dialog>
  );
}
