"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import MatriculaContent from "./MatriculaContent";

function MatriculaFallback() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <CircularProgress size={60} sx={{ color: "#8270FF" }} />
    </Box>
  );
}

export default function MatriculaPage() {
  return (
    <Suspense fallback={<MatriculaFallback />}>
      <MatriculaContent />
    </Suspense>
  );
}
