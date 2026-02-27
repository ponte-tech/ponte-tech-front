"use client";

import { Box, Grid } from "@mui/material";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import WhatsAppButton from "./components/social-icons/whatsapp-button";
import { ReactNode } from "react";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box sx={{ bgcolor: "#F9F5FF", minHeight: "100vh" }}>
      <WhatsAppButton />
      <Header />
      <Box component="main">
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
