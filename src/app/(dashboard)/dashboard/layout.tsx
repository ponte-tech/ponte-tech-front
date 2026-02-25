"use client";

import { Box, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

const DRAWER_WIDTH = 240;

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
