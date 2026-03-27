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
    // Previne abrir o modal se clicar em botões de ação
    const target = e.target as HTMLElement;
    if (target.closest('.card-actions') || target.closest('.MuiIconButton-root')) {
      return;
    }

    // Se estiver arrastando, não abre o modal
    if (isDraggingCard) {
      return;
    }
    onEdit(card);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Previne drag se clicar em botões de ação
    const target = e.target as HTMLElement;
    if (target.closest('.card-actions') || target.closest('.MuiIconButton-root')) {
      return;
    }

    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDraggingCard(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartPos) {
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      // Se moveu mais de 3 pixels, considera como drag
      if (deltaX > 3 || deltaY > 3) {
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
    e.preventDefault();
    setAssignMenuAnchor(e.currentTarget);
  };

  const handleAssignClose = () => {
    setAssignMenuAnchor(null);
  };

  const handleAssign = (colaboradorId: string | null, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
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
      {...listeners}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      sx={{
        mb: 1.25,
        cursor: isDragging ? "grabbing" : "pointer",
        bgcolor: "#ffffff",
        backgroundImage: isDragging ? "linear-gradient(135deg, rgba(130, 112, 255, 0.02) 0%, rgba(227, 99, 235, 0.02) 100%)" : "none",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(100, 116, 139, 0.12), 0 0 0 1px rgba(130, 112, 255, 0.1)",
          borderColor: "rgba(130, 112, 255, 0.3)",
          transform: "translateY(-2px)",
          "& .card-actions": {
            opacity: 1,
          },
          "& .card-drag-handle": {
            opacity: 0.6,
          },
        },
        border: isDragging ? "1.5px solid #8270FF" : "1px solid rgba(226, 232, 240, 0.8)",
        borderRadius: 2.5,
        position: "relative",
        transition: isDragging
          ? "none"
          : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isDragging
          ? "0 12px 24px rgba(130, 112, 255, 0.25), 0 0 0 1px rgba(130, 112, 255, 0.5)"
          : "0 1px 3px rgba(100, 116, 139, 0.08)",
        transform: isDragging ? "rotate(1.5deg) scale(1.03)" : "none",
        zIndex: isDragging ? 1000 : 1,
        willChange: isDragging ? "transform" : "auto",
        backdropFilter: isDragging ? "blur(4px)" : "none",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Drag Handle */}
        <Box
          className="card-drag-handle"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            opacity: 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: "1rem", color: "#94a3b8" }} />
        </Box>

        {/* Header with Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.25,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#0f172a",
              fontSize: "0.938rem",
              flex: 1,
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
              pr: 1,
            }}
          >
            {card.title}
          </Typography>
          <Box
            className="card-actions"
            sx={{
              opacity: 0,
              transition: "opacity 0.2s ease",
              display: "flex",
              gap: 0.25,
              ml: "auto",
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1,
                color: "#64748b",
                transition: "all 0.15s ease",
                "&:hover": {
                  color: "#8270FF",
                  bgcolor: "rgba(130, 112, 255, 0.1)",
                },
              }}
            >
              <EditIcon sx={{ fontSize: "1.063rem" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.card_id);
              }}
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1,
                color: "#64748b",
                transition: "all 0.15s ease",
                "&:hover": {
                  color: "#ef4444",
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: "1.063rem" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Metadata Pills */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
          {/* Client Name */}
          {clientName && (
            <Chip
              icon={<PersonIcon sx={{ fontSize: "0.875rem !important", color: "#8270FF !important" }} />}
              label={clientName}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: "rgba(130, 112, 255, 0.08)",
                color: "#8270FF",
                border: "none",
                "& .MuiChip-label": {
                  px: 0.75,
                },
                "& .MuiChip-icon": {
                  ml: 0.75,
                },
              }}
            />
          )}

          {/* Identificador Demanda */}
          {card.identificador_demanda_cliente && (
            <Chip
              label={card.identificador_demanda_cliente}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "monospace",
                bgcolor: "rgba(241, 245, 249, 1)",
                color: "#64748b",
                border: "1px solid rgba(226, 232, 240, 1)",
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 1,
            mt: "auto",
            borderTop: "1px solid rgba(226, 232, 240, 0.6)",
            gap: 1,
          }}
        >
          {/* Card ID - Left Side */}
          <Tooltip title="ID do Card">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.625 }}>
              <CheckBoxOutlineBlankIcon sx={{ fontSize: "0.875rem", color: "#94a3b8" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  fontSize: "0.688rem",
                  fontWeight: 500,
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                }}
              >
                {card.card_id.replace("CARD#", "").substring(0, 8)}
              </Typography>
            </Box>
          </Tooltip>

          {/* Metadata Icons - Right Side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.875, ml: "auto" }}>
            {/* Delivery Date */}
            {card.delivery_date && (
              <Tooltip title={`Entrega: ${format(new Date(card.delivery_date), "dd/MM/yyyy", { locale: ptBR })}`}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontSize: "0.688rem",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {format(new Date(card.delivery_date), "dd/MM/yy", { locale: ptBR })}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 0.75,
                      py: 0.375,
                      borderRadius: 1,
                      bgcolor: "rgba(249, 115, 22, 0.08)",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: "rgba(249, 115, 22, 0.12)",
                      },
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: "0.813rem", color: "#f97316" }} />
                  </Box>
                </Box>
              </Tooltip>
            )}

            {/* Observations */}
            {card.observations && card.observations.length > 0 && (
              <Tooltip title={`${card.observations.length} observação(ões)`}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.375,
                    px: 0.75,
                    py: 0.375,
                    borderRadius: 1,
                    bgcolor: "rgba(130, 112, 255, 0.08)",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: "rgba(130, 112, 255, 0.12)",
                    },
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: "0.813rem", color: "#8270FF" }} />
                </Box>
              </Tooltip>
            )}

            {/* Responsáveis Avatars - Modern Stack */}
            {onAssignCard && (
              card.assigned_to && card.assigned_to.length > 0 ? (
                <Tooltip
                  title={
                    card.assigned_to.length === 1
                      ? (getColaboradorName ? getColaboradorName(card.assigned_to[0]) : "")
                      : `${card.assigned_to.length} responsáveis`
                  }
                >
                  <Box
                    onClick={handleAssignClick}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    {card.assigned_to.slice(0, 3).map((colaboradorId, index) => {
                      const colaboradorName = getColaboradorName ? getColaboradorName(colaboradorId) : colaboradorId;
                      const colaboradorFoto = getColaboradorFoto ? getColaboradorFoto(colaboradorId) : undefined;
                      return (
                        <Avatar
                          key={colaboradorId}
                          src={colaboradorFoto || ""}
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: "0.625rem",
                            fontWeight: 600,
                            bgcolor: colaboradorFoto ? "transparent" : "#8270FF",
                            border: "2px solid white",
                            marginLeft: index > 0 ? "-10px" : 0,
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.15s ease",
                            zIndex: 3 - index,
                            "&:hover": {
                              zIndex: 10,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          {!colaboradorFoto && colaboradorName.substring(0, 2).toUpperCase()}
                        </Avatar>
                      );
                    })}
                    {card.assigned_to.length > 3 && (
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          bgcolor: "#64748b",
                          border: "2px solid white",
                          marginLeft: "-10px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            zIndex: 10,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        +{card.assigned_to.length - 3}
                      </Avatar>
                    )}
                  </Box>
                </Tooltip>
              ) : (
                <Tooltip title="Atribuir responsável">
                  <IconButton
                    size="small"
                    onClick={handleAssignClick}
                    sx={{
                      width: 24,
                      height: 24,
                      padding: 0,
                      borderRadius: "50%",
                      border: "2px dashed rgba(148, 163, 184, 0.3)",
                      color: "#94a3b8",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        color: "#8270FF",
                        borderColor: "#8270FF",
                        bgcolor: "rgba(130, 112, 255, 0.08)",
                      },
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: "0.875rem" }} />
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
            <MenuItem onClick={(e) => handleAssign(null, e)}>
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
                onClick={(e) => handleAssign(colab.id, e)}
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
