"use client";

import { Box, Typography, Container, alpha, Fade, CircularProgress } from "@mui/material";
import { Construction, Schedule, Email } from "@mui/icons-material";
import Image from "next/image";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `
          linear-gradient(135deg,
            ${alpha('#8270FF', 0.03)} 0%,
            ${alpha('#FFFFFF', 1)} 40%,
            ${alpha('#E363EB', 0.03)} 100%
          )
        `,
      }}
    >
      {/* Decorative animated circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: { xs: 300, md: 500, lg: 700 },
          height: { xs: 300, md: 500, lg: 700 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha('#8270FF', 0.08)} 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "pulse 8s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)", opacity: 0.6 },
            "50%": { transform: "scale(1.1)", opacity: 0.8 },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: { xs: 400, md: 600, lg: 800 },
          height: { xs: 400, md: 600, lg: 800 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha('#E363EB', 0.06)} 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "pulse-reverse 10s ease-in-out infinite",
          "@keyframes pulse-reverse": {
            "0%, 100%": { transform: "scale(1.1)", opacity: 0.5 },
            "50%": { transform: "scale(1)", opacity: 0.7 },
          },
        }}
      />

      {/* Main content */}
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Fade in timeout={800}>
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 6, md: 8 },
              px: { xs: 3, md: 6 },
              backgroundColor: alpha("#FFFFFF", 0.9),
              backdropFilter: "blur(20px)",
              borderRadius: 6,
              border: `1px solid ${alpha('#8270FF', 0.1)}`,
              boxShadow: `
                0 20px 60px ${alpha('#8270FF', 0.12)},
                0 8px 24px ${alpha('#000000', 0.08)},
                inset 0 1px 0 ${alpha('#FFFFFF', 0.8)}
              `,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 5,
              }}
            >
              <Box
                sx={{
                  width: { xs: 180, sm: 220, md: 260 },
                  height: { xs: 65, sm: 80, md: 95 },
                  position: "relative",
                }}
              >
                <Image
                  src="/logo-login.svg"
                  alt="Ponte Tech"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>
            </Box>

            {/* Icon with animation */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha('#8270FF', 0.1)} 0%, ${alpha('#E363EB', 0.1)} 100%)`,
                border: `2px solid ${alpha('#8270FF', 0.2)}`,
                mb: 4,
                animation: "rotate 3s linear infinite",
                "@keyframes rotate": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              <Construction
                sx={{
                  fontSize: { xs: 40, md: 50 },
                  color: "#8270FF",
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #8270FF 0%, #E363EB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Estamos em Manutenção
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                color: "#6b7280",
                fontWeight: 500,
                mb: 4,
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                lineHeight: 1.6,
              }}
            >
              Nossa plataforma está sendo atualizada para oferecer uma experiência ainda melhor
            </Typography>

            {/* Status cards */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
                mt: 5,
                mb: 4,
              }}
            >
              {/* Time estimate card */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: alpha("#f9fafb", 0.8),
                  border: `1px solid ${alpha('#e5e7eb', 0.8)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${alpha('#8270FF', 0.15)}`,
                    borderColor: alpha('#8270FF', 0.3),
                  },
                }}
              >
                <Schedule
                  sx={{
                    fontSize: 36,
                    color: "#8270FF",
                    mb: 1.5,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                    mb: 0.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Previsão
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1f2937",
                    fontWeight: 700,
                    fontSize: { xs: "1rem", md: "1.125rem" },
                  }}
                >
                  Retornamos em breve
                </Typography>
              </Box>

              {/* Contact card */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: alpha("#f9fafb", 0.8),
                  border: `1px solid ${alpha('#e5e7eb', 0.8)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${alpha('#E363EB', 0.15)}`,
                    borderColor: alpha('#E363EB', 0.3),
                  },
                }}
              >
                <Email
                  sx={{
                    fontSize: 36,
                    color: "#E363EB",
                    mb: 1.5,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                    mb: 0.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Suporte
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#8270FF",
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "0.95rem" },
                    wordBreak: "break-word",
                  }}
                >
                  suporte@pontetech.com.br
                </Typography>
              </Box>
            </Box>

            {/* Loading indicator */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mt: 5,
              }}
            >
              <CircularProgress
                size={24}
                thickness={4}
                sx={{
                  color: "#8270FF",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#9ca3af",
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                }}
              >
                Trabalhando nas melhorias...
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
