"use client";

import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, alpha, Tooltip, useMediaQuery, useTheme, Grid } from "@mui/material";
import { Dashboard as DashboardIcon, Person as PersonIcon, Settings as SettingsIcon, Logout as LogoutIcon, School as SchoolIcon, AccessTime as AccessTimeIcon, ReceiptLong as ReceiptLongIcon } from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

interface SidebarProps {
  open: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const getMenuItems = (userType?: string) => {
  const isColaborador = userType === "colaborador";
  const isAdmin = userType === "admin";
  const isContador = userType === "contador";

  return [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Cursos", icon: <SchoolIcon />, path: "/cursos" },
    ...((isColaborador || isAdmin) ? [
      { text: "Timesheet", icon: <AccessTimeIcon />, path: "/dashboard/timesheet" },
    ] : []),
    ...((isColaborador || isAdmin || isContador) ? [
      { text: "Fiscal", icon: <ReceiptLongIcon />, path: "/dashboard/fiscal" },
    ] : []),
    { text: "Perfil", icon: <PersonIcon />, path: "/dashboard/profile" },
    { text: "Configurações", icon: <SettingsIcon />, path: "/dashboard/settings" },
  ];
};

export default function Sidebar({ open, mobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const menuItems = getMenuItems(user?.userType);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onMobileClose();
    }
  };

  const drawerContent = (isCollapsed: boolean) => (
    <>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 80,
        }}
      >
        {!isCollapsed ? (
          <Box
            sx={{
              width: 160,
              height: 50,
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => router.push("/dashboard")}
          >
            <Image
              src="/logo-menu.svg"
              alt="Ponte Tech"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha("#8270FF", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => router.push("/dashboard")}
          >
            <DashboardIcon sx={{ color: "#8270FF" }} />
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Menu Items */}
      <Box sx={{ overflow: "auto", flexGrow: 1, px: 2 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const button = (
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: isCollapsed ? 0 : 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  transition: "all 0.2s ease-in-out",
                  position: "relative",
                  overflow: "hidden",
                  ...(isActive
                    ? {
                        bgcolor: alpha("#8270FF", 0.1),
                        color: "#8270FF",
                        "&:hover": {
                          bgcolor: alpha("#8270FF", 0.15),
                        },
                        "&::before": !isCollapsed ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 4,
                          height: "60%",
                          bgcolor: "#8270FF",
                          borderRadius: "0 4px 4px 0",
                        } : {},
                      }
                    : {
                        "&:hover": {
                          bgcolor: alpha("#8270FF", 0.05),
                          transform: isCollapsed ? "scale(1.05)" : "translateX(4px)",
                        },
                      }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? "auto" : 40,
                    color: isActive ? "#8270FF" : "text.secondary",
                    transition: "color 0.2s ease-in-out",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9375rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#8270FF" : "text.primary",
                    }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                {isCollapsed ? (
                  <Tooltip title={item.text} placement="right" arrow>
                    {button}
                  </Tooltip>
                ) : (
                  button
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        {isCollapsed ? (
          <Tooltip title="Sair" placement="right" arrow>
            <ListItemButton
              onClick={logout}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 0,
                justifyContent: "center",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: alpha("#f44336", 0.08),
                  color: "#f44336",
                  transform: "scale(1.05)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  color: "inherit",
                  transition: "color 0.2s ease-in-out",
                  justifyContent: "center",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ) : (
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: alpha("#f44336", 0.08),
                color: "#f44336",
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: "inherit",
                transition: "color 0.2s ease-in-out",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Sair"
              primaryTypographyProps={{
                fontSize: "0.9375rem",
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        )}
      </Box>
    </>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "#ffffff",
          },
        }}
      >
        {drawerContent(false)}
      </Drawer>
    );
  }

  // Desktop drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        transition: "width 0.3s ease-in-out",
        "& .MuiDrawer-paper": {
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "#ffffff",
          boxShadow: "0 0 40px rgba(0,0,0,0.05)",
          transition: "width 0.3s ease-in-out",
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent(!open)}
    </Drawer>
  );
}
