"use client";

import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      {children}
    </Box>
  );
}
