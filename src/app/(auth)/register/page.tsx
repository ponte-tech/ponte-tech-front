"use client";

import { Suspense } from "react";
import { Box, CircularProgress, Grid } from "@mui/material";
import RegisterContent from "./RegisterContent";

function RegisterFallback() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8270FF 100%)",
      }}
    >
      <CircularProgress sx={{ color: "white" }} />
    </Box>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}
