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
  Divider,
  alpha,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  AccountBalance as AccountBalanceIcon,
  Groups as GroupsIcon,
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
    // Se for colaborador, redireciona para editar seus dados
    const isColaborador = user?.perfil === 'colaborador' || user?.perfis?.includes('colaborador');
    const userId = user?.id || user?.user_id;

    if (isColaborador && userId) {
      router.push(`/colaboradores/${userId}/editar`);
    } else {
      router.push("/dashboard/profile");
    }
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

  // Função para obter ícone e cor baseado no tipo de usuário
  const getUserTypeConfig = (userType?: string) => {
    switch (userType) {
      case "admin":
        return {
          label: "Administrador",
          icon: <AdminIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#8270FF",
          bgColor: alpha("#8270FF", 0.1),
        };
      case "colaborador":
        return {
          label: "Colaborador",
          icon: <GroupsIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#06b6d4",
          bgColor: alpha("#06b6d4", 0.1),
        };
      case "contador":
        return {
          label: "Contador",
          icon: <AccountBalanceIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#10b981",
          bgColor: alpha("#10b981", 0.1),
        };
      case "vendedor":
        return {
          label: "Vendedor",
          icon: <BusinessIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#f59e0b",
          bgColor: alpha("#f59e0b", 0.1),
        };
      case "professor":
        return {
          label: "Professor",
          icon: <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#6366f1",
          bgColor: alpha("#6366f1", 0.1),
        };
      case "aluno":
        return {
          label: "Aluno",
          icon: <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#8b5cf6",
          bgColor: alpha("#8b5cf6", 0.1),
        };
      default:
        return {
          label: "Usuário",
          icon: <SupervisorIcon sx={{ fontSize: 14, mr: 0.5 }} />,
          color: "#64748b",
          bgColor: alpha("#64748b", 0.1),
        };
    }
  };

  const userTypeConfig = getUserTypeConfig(user?.userType);

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

        {/* Right Section - User Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  mb: 0.5,
                }}
              >
                {user?.name || "Usuário"}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  bgcolor: userTypeConfig.bgColor,
                  color: userTypeConfig.color,
                  px: 1,
                  py: 0.25,
                  borderRadius: 2,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: `1px solid ${alpha(userTypeConfig.color, 0.2)}`,
                }}
              >
                {userTypeConfig.icon}
                {userTypeConfig.label}
              </Box>
            </Box>
            <Avatar
              src={user?.foto_perfil_url || ""}
              sx={{
                bgcolor: userTypeConfig.color,
                background: user?.foto_perfil_url ? "transparent" : `linear-gradient(135deg, ${userTypeConfig.color} 0%, ${alpha(userTypeConfig.color, 0.8)} 100%)`,
                width: 42,
                height: 42,
                fontWeight: 700,
                fontSize: "0.875rem",
                border: "2px solid white",
                boxShadow: `0 4px 12px ${alpha(userTypeConfig.color, 0.4)}`,
                transition: "all 0.2s ease-in-out",
              }}
            >
              {!user?.foto_perfil_url && (user?.name ? getInitials(user.name) : "U")}
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
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {user?.name || "Usuário"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {user?.email}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  bgcolor: userTypeConfig.bgColor,
                  color: userTypeConfig.color,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: `1px solid ${alpha(userTypeConfig.color, 0.2)}`,
                }}
              >
                {userTypeConfig.icon}
                {userTypeConfig.label}
              </Box>
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
