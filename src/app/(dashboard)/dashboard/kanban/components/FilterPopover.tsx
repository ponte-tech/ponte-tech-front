import React, { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Chip,
  Badge,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Cliente, Contrato, Colaborador } from "@/app/types/api";

interface FilterPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  colaboradores: any[];
  clientes: Cliente[];
  contratos: Contrato[];
  selectedColaboradores: string[];
  selectedClientes: string[];
  selectedContratos: string[];
  onToggleColaborador: (id: string) => void;
  onToggleCliente: (id: string) => void;
  onToggleContrato: (id: string) => void;
  onClearFilters: () => void;
}

type MenuType = "colaboradores" | "clientes" | null;

export default function FilterPopover({
  anchorEl,
  onClose,
  colaboradores,
  clientes,
  contratos,
  selectedColaboradores,
  selectedClientes,
  selectedContratos,
  onToggleColaborador,
  onToggleCliente,
  onToggleContrato,
  onClearFilters,
}: FilterPopoverProps) {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const [submenuAnchor, setSubmenuAnchor] = useState<HTMLElement | null>(null);

  const activeFiltersCount =
    selectedColaboradores.length + selectedClientes.length;

  const handleMenuHover = (menu: MenuType, event: React.MouseEvent<HTMLElement>) => {
    setActiveMenu(menu);
    setSubmenuAnchor(event.currentTarget);
  };

  const handleSubmenuClose = () => {
    setActiveMenu(null);
    setSubmenuAnchor(null);
  };

  return (
    <>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 220,
              maxHeight: 400,
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            Filtros
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} ativo${activeFiltersCount > 1 ? "s" : ""}`}
              size="small"
              onDelete={onClearFilters}
              sx={{
                bgcolor: "rgba(130, 112, 255, 0.1)",
                color: "#8270FF",
                height: 20,
                fontSize: "0.7rem",
                "& .MuiChip-deleteIcon": {
                  color: "#8270FF",
                  fontSize: "1rem",
                },
              }}
            />
          )}
        </Box>

        {/* Main Menu */}
        <List dense sx={{ py: 0 }}>
          <ListItemButton
            onMouseEnter={(e) => handleMenuHover("clientes", e)}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: "rgba(130, 112, 255, 0.08)",
              },
            }}
          >
            <ListItemText
              primary="Cliente"
              primaryTypographyProps={{
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {selectedClientes.length > 0 && (
                <Badge
                  badgeContent={selectedClientes.length}
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
              )}
              <ChevronRightIcon fontSize="small" sx={{ color: "#999" }} />
            </Box>
          </ListItemButton>
        </List>
      </Popover>

      {/* Submenu */}
      <Popover
        open={Boolean(activeMenu && submenuAnchor)}
        anchorEl={submenuAnchor}
        onClose={handleSubmenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              ml: 0.5,
              width: 280,
              maxHeight: 400,
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                bgcolor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#bdbdbd",
                borderRadius: "4px",
                "&:hover": {
                  bgcolor: "#9e9e9e",
                },
              },
            },
          },
        }}
      >
        <List dense sx={{ py: 0 }}>
          {activeMenu === "clientes" && (
            <>
              {clientes.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="Nenhum cliente encontrado"
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      color: "#999",
                      textAlign: "center",
                    }}
                  />
                </ListItem>
              ) : (
                clientes.map((cliente) => (
                    <ListItemButton
                      key={cliente.cliente_id}
                      onClick={() => onToggleCliente(cliente.cliente_id)}
                      sx={{
                        py: 0.5,
                        "&:hover": {
                          bgcolor: "rgba(130, 112, 255, 0.08)",
                        },
                      }}
                    >
                      <Checkbox
                        checked={selectedClientes.includes(cliente.cliente_id)}
                        size="small"
                        sx={{
                          color: "#8270FF",
                          "&.Mui-checked": {
                            color: "#8270FF",
                          },
                        }}
                      />
                      <ListItemText
                        primary={cliente.nome_fantasia}
                        primaryTypographyProps={{
                          fontSize: "0.875rem",
                        }}
                      />
                    </ListItemButton>
                ))
              )}
            </>
          )}
        </List>
      </Popover>
    </>
  );
}
