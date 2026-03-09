"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
} from "@mui/icons-material";

export interface TableAction {
  type: "view" | "edit" | "delete" | "share" | "custom";
  icon?: React.ReactNode;
  tooltip?: string;
  color?: string;
  onClick: () => void;
  visible?: boolean;
}

interface TableActionButtonsProps {
  actions: TableAction[];
}

const defaultIcons = {
  view: <VisibilityIcon fontSize="small" />,
  edit: <EditIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
  share: <ShareIcon fontSize="small" />,
};

const defaultColors = {
  view: "#8270FF",
  edit: "#1976d2",
  delete: "#d32f2f",
  share: "#00c853",
};

const defaultTooltips = {
  view: "Ver detalhes",
  edit: "Editar",
  delete: "Excluir",
  share: "Compartilhar",
};

export default function TableActionButtons({ actions }: TableActionButtonsProps) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
      {actions
        .filter((action) => action.visible !== false)
        .map((action, index) => {
          const icon = action.icon || (action.type !== "custom" ? defaultIcons[action.type] : null);
          const color = action.color || (action.type !== "custom" ? defaultColors[action.type] : undefined);
          const tooltip = action.tooltip || (action.type !== "custom" ? defaultTooltips[action.type] : "");

          return (
            <Tooltip key={index} title={tooltip} arrow>
              <IconButton
                size="small"
                onClick={action.onClick}
                sx={{ color }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          );
        })}
    </Box>
  );
}
