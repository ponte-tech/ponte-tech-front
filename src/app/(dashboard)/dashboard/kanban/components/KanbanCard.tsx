import React, { useState } from "react";
import { Card as MuiCard, CardContent, Typography, Box, Chip, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/app/types/kanban";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ClearIcon from "@mui/icons-material/Clear";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KanbanCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onAssignCard?: (cardId: string, colaboradorId: string | null) => void;
  clientName?: string;
  colaboradores?: Array<{ id: string; nome: string; foto_perfil_url?: string }>;
  getColaboradorName?: (colaboradorId: string) => string;
  getColaboradorFoto?: (colaboradorId: string) => string | undefined;
}

export default function KanbanCard({
  card,
  onEdit,
  onDelete,
  onAssignCard,
  clientName,
  colaboradores = [],
  getColaboradorName,
  getColaboradorFoto,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.card_id });

  const [assignMenuAnchor, setAssignMenuAnchor] = useState<null | HTMLElement>(null);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : (transition || "transform 120ms ease-out"),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    willChange: "transform, opacity",
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Se estiver arrastando, não abre o modal
    if (isDraggingCard) {
      return;
    }
    onEdit(card);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDraggingCard(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartPos) {
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      // Se moveu mais de 5 pixels, considera como drag
      if (deltaX > 5 || deltaY > 5) {
        setIsDraggingCard(true);
      }
    }
  };

  const handleMouseUp = () => {
    setDragStartPos(null);
    // Reseta o estado de dragging após um pequeno delay
    setTimeout(() => setIsDraggingCard(false), 100);
  };

  const handleAssignClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAssignMenuAnchor(e.currentTarget);
  };

  const handleAssignClose = () => {
    setAssignMenuAnchor(null);
  };

  const handleAssign = (colaboradorId: string | null) => {
    if (onAssignCard) {
      onAssignCard(card.card_id, colaboradorId);
    }
    handleAssignClose();
  };

  const assignedColaboradores = card.assigned_to || [];

  return (
    <MuiCard
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        bgcolor: "#ffffff",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(130, 112, 255, 0.2)",
          borderColor: "#8270FF",
          "& .card-actions": {
            opacity: 1,
          },
          "& .drag-handle": {
            opacity: 1,
          },
        },
        border: isDragging ? "2px solid #8270FF" : "1px solid #e0e0e0",
        borderRadius: 2,
        position: "relative",
        transition: isDragging ? "none" : "box-shadow 0.12s ease-out, border-color 0.12s ease-out",
        boxShadow: isDragging
          ? "0 8px 20px rgba(130, 112, 255, 0.35)"
          : "0 1px 3px rgba(0,0,0,0.12)",
        transform: isDragging ? "rotate(2deg) scale(1.02)" : "none",
        zIndex: isDragging ? 1000 : 1,
        willChange: isDragging ? "transform" : "auto",
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        {/* Header with Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, flex: 1 }}>
            {/* Drag Handle */}
            <Box
              {...listeners}
              className="drag-handle"
              onClick={(e) => e.stopPropagation()}
              sx={{
                cursor: isDragging ? "grabbing" : "grab",
                display: "flex",
                alignItems: "center",
                color: "#bdbdbd",
                opacity: 0.3,
                transition: "opacity 0.2s, color 0.2s",
                "&:hover": {
                  color: "#8270FF",
                  opacity: 1,
                },
                "&:active": {
                  cursor: "grabbing",
                },
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: "1rem" }} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#1a1a1a",
                fontSize: "0.875rem",
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {card.title}
            </Typography>
          </Box>
          <Box
            className="card-actions"
            sx={{
              opacity: 0.4,
              transition: "opacity 0.2s",
              display: "flex",
              gap: 0.25,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              sx={{
                width: 24,
                height: 24,
                color: "#8270FF",
              }}
            >
              <EditIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.card_id);
              }}
              sx={{
                width: 24,
                height: 24,
                color: "#f44336",
              }}
            >
              <DeleteIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Client Name */}
        {clientName && (
          <Box sx={{ mb: 0.75, display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 14, color: "#8270FF" }} />
            <Typography
              variant="body2"
              sx={{
                color: "#8270FF",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {clientName}
            </Typography>
          </Box>
        )}

        {/* Identificador Demanda */}
        {card.identificador_demanda_cliente && (
          <Chip
            label={card.identificador_demanda_cliente}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              fontWeight: 500,
              bgcolor: "#F3F0FF",
              color: "#8270FF",
              border: "1px solid #E0D7FF",
              mb: 1,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        )}

        {/* Footer with Card ID */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 0.75,
            mt: 0.5,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckBoxOutlineBlankIcon sx={{ fontSize: 14, color: "#9e9e9e" }} />
            <Typography
              variant="caption"
              sx={{
                color: "#757575",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {card.card_id.replace("CARD#", "").substring(0, 8)}
            </Typography>
          </Box>

          {/* Additional Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {card.delivery_date && (
              <CalendarTodayIcon sx={{ fontSize: 14, color: "#f97316" }} />
            )}
            {card.observations && card.observations.length > 0 && (
              <AssignmentIcon sx={{ fontSize: 14, color: "#8270FF" }} />
            )}

            {/* Responsáveis Avatars */}
            {onAssignCard && (
              card.assigned_to && card.assigned_to.length > 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                    {card.assigned_to.slice(0, 2).map((colaboradorId, index) => {
                      const colaboradorName = getColaboradorName ? getColaboradorName(colaboradorId) : colaboradorId;
                      const colaboradorFoto = getColaboradorFoto ? getColaboradorFoto(colaboradorId) : undefined;
                      return (
                        <Tooltip key={colaboradorId} title={colaboradorName}>
                          <Avatar
                            src={colaboradorFoto || ""}
                            onClick={handleAssignClick}
                            sx={{
                              width: 20,
                              height: 20,
                              fontSize: "0.65rem",
                              bgcolor: colaboradorFoto ? "transparent" : "#8270FF",
                              cursor: "pointer",
                              border: "1.5px solid white",
                              marginLeft: index > 0 ? "-6px" : 0,
                              "&:hover": {
                                bgcolor: colaboradorFoto ? "transparent" : "#6a5ce0",
                                zIndex: 1,
                              },
                            }}
                          >
                            {!colaboradorFoto && colaboradorName.substring(0, 2).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      );
                    })}
                    {card.assigned_to.length > 2 && (
                      <Tooltip title={`+${card.assigned_to.length - 2} responsáveis`}>
                        <Avatar
                          onClick={handleAssignClick}
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: "0.6rem",
                            bgcolor: "#bdbdbd",
                            cursor: "pointer",
                            border: "1.5px solid white",
                            marginLeft: "-6px",
                            "&:hover": {
                              bgcolor: "#9e9e9e",
                              zIndex: 1,
                            },
                          }}
                        >
                          +{card.assigned_to.length - 2}
                        </Avatar>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#757575",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      maxWidth: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getColaboradorName ? getColaboradorName(card.assigned_to[0]) : ""}
                  </Typography>
                </Box>
              ) : (
                <Tooltip title="Atribuir responsável">
                  <IconButton
                    size="small"
                    onClick={handleAssignClick}
                    sx={{
                      width: 20,
                      height: 20,
                      padding: 0,
                      color: "#bdbdbd",
                      "&:hover": {
                        color: "#8270FF",
                        bgcolor: "rgba(130, 112, 255, 0.08)",
                      },
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Assign Menu */}
      {onAssignCard && (
        <Menu
          anchorEl={assignMenuAnchor}
          open={Boolean(assignMenuAnchor)}
          onClose={handleAssignClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 0.5,
              maxHeight: 300,
              minWidth: 200,
            },
          }}
        >
          {assignedColaboradores.length > 0 && (
            <MenuItem onClick={() => handleAssign(null)}>
              <ListItemIcon>
                <ClearIcon fontSize="small" sx={{ color: "#f44336" }} />
              </ListItemIcon>
              <ListItemText primary="Remover todos" />
            </MenuItem>
          )}
          {assignedColaboradores.length > 0 && colaboradores.length > 0 && <MenuItem divider />}
          {colaboradores.map((colab) => {
            const isAssigned = assignedColaboradores.includes(colab.id);
            return (
              <MenuItem
                key={colab.id}
                onClick={() => handleAssign(colab.id)}
                selected={isAssigned}
              >
                <ListItemIcon>
                  <Avatar
                    src={colab.foto_perfil_url || ""}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.7rem",
                      bgcolor: colab.foto_perfil_url ? "transparent" : (isAssigned ? "#8270FF" : "#bdbdbd"),
                    }}
                  >
                    {!colab.foto_perfil_url && colab.nome.substring(0, 2).toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={colab.nome} />
              </MenuItem>
            );
          })}
        </Menu>
      )}
    </MuiCard>
  );
}
