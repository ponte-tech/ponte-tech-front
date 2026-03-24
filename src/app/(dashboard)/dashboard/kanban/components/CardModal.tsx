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
} from "@mui/icons-material";
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
}

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

  // Attachment state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      setFormData({
        title: "",
        description: "",
        client_id: "",
        identificador_demanda_cliente: "",
        delivery_date: "",
        assigned_to: [],
      });
      setSelectedColumnId(columnId);
      setActiveTab(0);
      setLastCardId(null);
    }
    setObservation("");
  }, [card, open, columnId, lastCardId]);

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
          console.error("Error loading attachments:", error);
        }
      } else {
        setAttachments([]);
      }
    };
    loadAttachments();
  }, [card?.card_id]);

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
      console.error("Error uploading file:", error);
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
      console.error("Error downloading file:", error);
      alert("Erro ao baixar arquivo");
    }
  };

  // Handle file deletion
  const handleFileDelete = async (attachmentId: string) => {
    if (!card) return;

    if (!confirm("Tem certeza que deseja excluir este anexo?")) {
      return;
    }

    try {
      await kanbanService.deleteAttachment(card.card_id, attachmentId);

      // Reload attachments
      const response = await kanbanService.listAttachments(card.card_id);
      setAttachments(response.attachments || []);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Erro ao excluir arquivo");
    }
  };

  // Get column name
  const currentColumn = columns.find(c => c.column_id === selectedColumnId);

  // Helper to get colaborador name by ID
  const getColaboradorNameById = (id: string) => {
    const colab = colaboradores.find(c => c.colaborador_id === id || c.id === id);
    return colab?.nome || colab?.nome_completo || "Usuário desconhecido";
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha("#8270FF", 0.05),
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          py: 1.5,
        }}
      >
        <ArticleIcon sx={{ color: "#8270FF" }} />
        <Box component="span" sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#8270FF" }}>
          {card ? `#${card.card_id.replace("CARD#", "").substring(0, 8)}` : "Novo Card"}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: "flex", height: "calc(90vh - 130px)" }}>
        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: "#8270FF !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#8270FF",
              },
            }}
          >
            <Tab label="Detalhes" />
            <Tab label="Observações" disabled={!card} />
            <Tab label="Anexos" disabled={!card} />
            <Tab label="Histórico" disabled={!card} />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
            {/* Detalhes Tab */}
            {activeTab === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Título"
                  fullWidth
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fff",
                      transition: "all 0.2s ease-in-out",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused": {
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

                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fff",
                      transition: "all 0.2s ease-in-out",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused": {
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

                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fff",
                      transition: "all 0.2s ease-in-out",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused": {
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
                >
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formData.client_id}
                    label="Cliente"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        client_id: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                        {cliente.nome_fantasia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                            transition: "all 0.2s ease-in-out",
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
                              src={option.foto_perfil_url || ""}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: option.foto_perfil_url ? "transparent" : "#8270FF",
                                color: "white",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                              }}
                            >
                              {!option.foto_perfil_url && (option.nome?.substring(0, 2).toUpperCase() || "??")}
                            </Avatar>
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
                            src={option.foto_perfil_url || ""}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: option.foto_perfil_url ? "transparent" : "#8270FF",
                              color: "white",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {!option.foto_perfil_url && (option.nome?.substring(0, 2).toUpperCase() || "??")}
                          </Avatar>
                          <span>{option.nome || "Sem nome"}</span>
                        </Box>
                      </li>
                    )}
                  />
                </Box>

                <TextField
                  label="Identificador da Demanda"
                  fullWidth
                  size="small"
                  value={formData.identificador_demanda_cliente}
                  onChange={(e) =>
                    setFormData({ ...formData, identificador_demanda_cliente: e.target.value })
                  }
                  placeholder="Ex: TICKET-1234"
                  sx={{
                    "& input::placeholder": {
                      fontSize: "0.75rem",
                      opacity: 0.6,
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fff",
                      transition: "all 0.2s ease-in-out",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused": {
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

                <TextField
                  label="Data de Entrega"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.delivery_date}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_date: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fff",
                      transition: "all 0.2s ease-in-out",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#8270FF",
                      },
                      "&.Mui-focused": {
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
                        transition: "all 0.2s ease-in-out",
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
                    transition: "all 0.2s ease-in-out",
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
                              onClick={() => handleFileDelete(attachment.attachment_id)}
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
                {card.history && card.history.length > 0 ? (
                  <List sx={{ maxHeight: 500, overflow: "auto" }}>
                    {[...card.history].reverse().map((hist) => (
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
                          src={colab.foto_perfil_url || ""}
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: colab.foto_perfil_url ? "transparent" : "#8270FF",
                            color: "white",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                          }}
                        >
                          {!colab.foto_perfil_url && (colab.nome?.substring(0, 2).toUpperCase() || "??")}
                        </Avatar>
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
                  ? format(new Date(formData.delivery_date), "dd/MM/yyyy", { locale: ptBR })
                  : "-"}
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
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#8270FF",
            "&:hover": {
              bgcolor: alpha("#8270FF", 0.8),
            },
          }}
          disabled={!formData.title.trim()}
        >
          {card ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
