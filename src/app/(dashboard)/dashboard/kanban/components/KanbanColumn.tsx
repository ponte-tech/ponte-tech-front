import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Badge,
  TextField,
  Card as MuiCard,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Card } from "@/app/types/kanban";
import KanbanCard from "./KanbanCard";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: (columnId: string) => void;
  onQuickCreateCard: (columnId: string, title: string) => Promise<void>;
  getClientName: (clientId?: string) => string;
  isDraggingCard?: boolean;
  onAssignCard?: (cardId: string, colaboradorId: string | null) => void;
  colaboradores?: Array<{ id: string; nome: string; foto_perfil_url?: string }>;
  getColaboradorName?: (colaboradorId: string) => string;
  getColaboradorFoto?: (colaboradorId: string) => string | undefined;
}

export default function KanbanColumn({
  column,
  cards,
  onEditColumn,
  onDeleteColumn,
  onEditCard,
  onDeleteCard,
  onAddCard,
  onQuickCreateCard,
  getClientName,
  isDraggingCard = false,
  onAssignCard,
  colaboradores = [],
  getColaboradorName,
  getColaboradorFoto,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.column_id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.column_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Combine sortable and droppable refs
  const setRefs = (node: HTMLDivElement | null) => {
    setSortableNodeRef(node);
  };

  const [isCreating, setIsCreating] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleStartCreating = () => {
    setIsCreating(true);
    setNewCardTitle("");
  };

  const handleCancelCreating = () => {
    setIsCreating(false);
    setNewCardTitle("");
  };

  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) return;

    try {
      setCreating(true);
      await onQuickCreateCard(column.column_id, newCardTitle.trim());
      setIsCreating(false);
      setNewCardTitle("");
    } catch (error) {
      // Error handled by parent component
    } finally {
      setCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateCard();
    } else if (e.key === "Escape") {
      handleCancelCreating();
    }
  };

  return (
    <Paper
      ref={setRefs}
      style={style}
      {...attributes}
      elevation={isOver ? 8 : 2}
      sx={{
        minWidth: 320,
        maxWidth: 320,
        height: "100%",
        bgcolor: isOver ? "#F3F0FF" : isDraggingCard ? "#FAFAFA" : "#f5f5f5",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        border: isOver
          ? "2px solid #8270FF"
          : isDraggingCard
            ? "2px dashed #8270FF"
            : "2px solid transparent",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isOver ? "scale(1.02)" : "scale(1)",
        boxShadow: isOver
          ? "0 8px 24px rgba(130, 112, 255, 0.3)"
          : undefined,
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#ffffff",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Drag Handle */}
          <Box
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              color: "#bdbdbd",
              "&:hover": {
                color: "#8270FF",
              },
              "&:active": {
                cursor: "grabbing",
              },
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: "1.2rem" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#333",
              fontSize: "0.9rem",
            }}
          >
            {column.name}
          </Typography>
          <Box sx={{ ml: 1 }}>
            <Badge
              badgeContent={cards.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#8270FF",
                  fontSize: "0.65rem",
                  height: 16,
                  minWidth: 16,
                },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 0.25 }}>
          <IconButton
            size="small"
            onClick={() => onAddCard(column.column_id)}
            sx={{
              width: 24,
              height: 24,
              color: "#999",
              "&:hover": { color: "#8270FF", bgcolor: "rgba(130, 112, 255, 0.08)" },
            }}
          >
            <AddIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onEditColumn(column)}
            sx={{
              width: 24,
              height: 24,
              color: "#999",
              "&:hover": { color: "#8270FF" },
            }}
          >
            <EditIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDeleteColumn(column.column_id)}
            sx={{
              width: 24,
              height: 24,
              color: "#999",
              "&:hover": { color: "#f44336" },
            }}
          >
            <DeleteIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Cards Container */}
      <Box
        ref={setNodeRef}
        sx={{
          p: 1.5,
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          height: 0,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "#f0f0f0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#8270FF",
            borderRadius: "4px",
            "&:hover": {
              bgcolor: "#6a5ce0",
            },
          },
        }}
      >
        {/* Drop Zone Indicator */}
        {isOver && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              bottom: 12,
              border: "3px dashed #8270FF",
              borderRadius: 2,
              bgcolor: "rgba(130, 112, 255, 0.05)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  opacity: 0.6,
                },
                "50%": {
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#8270FF",
                fontWeight: 600,
                textAlign: "center",
                px: 2,
              }}
            >
              Solte aqui
            </Typography>
          </Box>
        )}

        <SortableContext
          items={cards.map((c) => c.card_id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.card_id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onAssignCard={onAssignCard}
              clientName={getClientName(card.client_id)}
              colaboradores={colaboradores}
              getColaboradorName={getColaboradorName}
              getColaboradorFoto={getColaboradorFoto}
            />
          ))}
        </SortableContext>

        {/* Create Card Inline Form */}
        {isCreating ? (
          <MuiCard
            sx={{
              mt: cards.length > 0 ? 1.5 : 0,
              border: "2px solid #8270FF",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                placeholder="Digite o título do card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={creating}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
                    "&.Mui-focused fieldset": {
                      borderColor: "#8270FF",
                    },
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={handleCreateCard}
                  disabled={!newCardTitle.trim() || creating}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "#8270FF",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#6a5ce0",
                    },
                    "&:disabled": {
                      bgcolor: "#ccc",
                      color: "#999",
                    },
                  }}
                >
                  {creating ? (
                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                  ) : (
                    <CheckIcon sx={{ fontSize: "1rem" }} />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancelCreating}
                  disabled={creating}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "#999",
                    "&:hover": {
                      color: "#f44336",
                      bgcolor: "rgba(244, 67, 54, 0.08)",
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Box>
            </CardContent>
          </MuiCard>
        ) : (
          <Box
            onClick={handleStartCreating}
            sx={{
              mt: cards.length > 0 ? 1.5 : 0,
              p: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              cursor: "pointer",
              color: "#999",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(130, 112, 255, 0.08)",
                color: "#8270FF",
              },
            }}
          >
            <AddIcon sx={{ fontSize: "1rem" }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8rem" }}>
              Criar card
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
