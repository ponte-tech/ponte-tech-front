import type { Metadata } from "next";
import { Box } from "@mui/material";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

export const metadata: Metadata = {
  title: "Ponte Tech - Vagas",
  description: "Encontre as melhores vagas de tecnologia na Ponte Tech.",
};

export default function VagasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        bgcolor: '#f7f7f7', 
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        {children}
      </Box>
      <Box
        sx={{ 
          width: '100vw',
          bgcolor: '#f9f5ff'
         }}>
        <Footer />
      </Box>
    </Box>
  );
}
