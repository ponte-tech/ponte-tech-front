"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Badge,
  Divider,
  alpha,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
} from "@mui/icons-material";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

interface NavbarProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ onMenuClick, onSidebarToggle, sidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    router.push("/dashboard/profile");
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  // Função para gerar as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: {
          xs: "100%",
          md: sidebarOpen
            ? `calc(100% - ${DRAWER_WIDTH}px)`
            : `calc(100% - ${DRAWER_WIDTH_COLLAPSED}px)`,
        },
        ml: {
          xs: 0,
          md: sidebarOpen ? `${DRAWER_WIDTH}px` : `${DRAWER_WIDTH_COLLAPSED}px`,
        },
        bgcolor: "white",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(8px)",
        backgroundColor: alpha("#ffffff", 0.95),
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, justifyContent: "space-between" }}>
        {/* Left Section - Menu Toggle */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              display: { md: "none" },
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: alpha("#8270FF", 0.08),
                color: "#8270FF",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Sidebar Toggle */}
          <IconButton
            color="inherit"
            onClick={onSidebarToggle}
            sx={{
              display: { xs: "none", md: "flex" },
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: alpha("#8270FF", 0.08),
                color: "#8270FF",
              },
            }}
          >
            {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Right Section - Notifications and User */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <IconButton
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: alpha("#8270FF", 0.08),
                color: "#8270FF",
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              ml: 1,
              cursor: "pointer",
              px: 1.5,
              py: 1,
              borderRadius: 3,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: alpha("#8270FF", 0.05),
              },
            }}
            onClick={handleMenuOpen}
          >
            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  lineHeight: 1.2,
                }}
              >
                {user?.name || "Usuário"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                {user?.userType === "aluno" ? "Aluno" : "Vendedor"}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
                background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
                width: 40,
                height: 40,
                fontWeight: 600,
                fontSize: "0.875rem",
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(130, 112, 255, 0.3)",
              }}
            >
              {user?.name ? getInitials(user.name) : "U"}
            </Avatar>
          </Box>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                borderRadius: 2,
                minWidth: 200,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: "1px solid",
                borderColor: "divider",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name || "Usuário"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={handleProfile}
              sx={{
                py: 1.5,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: alpha("#8270FF", 0.05),
                  color: "#8270FF",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 36,
                }}
              >
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Meu Perfil"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: alpha("#f44336", 0.05),
                  color: "#f44336",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 36,
                }}
              >
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
