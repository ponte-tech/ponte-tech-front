"use client";

import { Box, Toolbar } from "@mui/material";
import { ReactNode, useState } from "react";
import Sidebar from "../(dashboard)/dashboard/components/Sidebar";
import Navbar from "../(dashboard)/dashboard/components/Navbar";

export default function ColaboradoresLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "#f8f9fa",
          ml: { xs: 0, md: sidebarOpen ? "280px" : "80px" },
          transition: "margin 0.3s ease-in-out",
        }}
      >
        <Navbar
          onMenuClick={handleDrawerToggle}
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
        />
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1400px",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
