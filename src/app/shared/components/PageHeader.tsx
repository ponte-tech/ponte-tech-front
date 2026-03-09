"use client";

import { Box, Typography, Button } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    visible?: boolean;
  };
}

export default function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      {actionButton && actionButton.visible !== false && (
        <Button
          variant="contained"
          startIcon={actionButton.icon}
          onClick={actionButton.onClick}
          sx={{
            bgcolor: "#8270FF",
            "&:hover": { bgcolor: "#6c5ce7" },
            textTransform: "none",
            px: 3,
          }}
        >
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
}
