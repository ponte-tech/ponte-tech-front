"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Avatar, Fade, Grow, Zoom } from "@mui/material";
import { keyframes } from "@mui/system";

interface WelcomeScreenProps {
  userName: string;
  userPhoto?: string;
  onComplete: () => void;
}

// Animações customizadas
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.3);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

// Componente de partícula individual
const Particle = ({ delay, duration, left }: { delay: number; duration: number; left: number }) => (
  <Box
    sx={{
      position: "absolute",
      width: { xs: 8, md: 12 },
      height: { xs: 8, md: 12 },
      borderRadius: "50%",
      background: "linear-gradient(135deg, #8270FF, #E363EB)",
      left: `${left}%`,
      animation: `${float} ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.6,
      filter: "blur(1px)",
    }}
  />
);

export default function WelcomeScreen({ userName, userPhoto, onComplete }: WelcomeScreenProps) {
  const [show, setShow] = useState(true);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  // Primeiro nome do usuário
  const firstName = userName.split(" ")[0];

  // Iniciais do usuário para avatar padrão
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    // Esconder após 2.5 segundos e chamar onComplete
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300); // Espera a animação de saída
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8270FF 0%, #411EFE 50%, #E363EB 100%)",
          overflow: "hidden",
        }}
      >
        {/* Partículas flutuantes de fundo */}
        <Particle delay={0} duration={3} left={10} />
        <Particle delay={0.5} duration={4} left={20} />
        <Particle delay={1} duration={3.5} left={80} />
        <Particle delay={0.3} duration={4.5} left={90} />
        <Particle delay={0.8} duration={3.8} left={50} />
        <Particle delay={1.2} duration={4.2} left={30} />
        <Particle delay={0.6} duration={3.3} left={70} />

        {/* Círculos de fundo animados */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: { xs: 300, md: 500 },
            height: { xs: 300, md: 500 },
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(227, 99, 235, 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: `${pulse} 4s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-15%",
            left: "-10%",
            width: { xs: 400, md: 600 },
            height: { xs: 400, md: 600 },
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(65, 30, 254, 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: `${pulse} 5s ease-in-out infinite`,
            animationDelay: "1s",
          }}
        />

        {/* Conteúdo central */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            px: 4,
          }}
        >
          {/* Avatar com animação */}
          <Zoom in={show} timeout={500}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                mb: 4,
              }}
            >
              {/* Anel externo pulsante */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: 130, md: 150 },
                  height: { xs: 130, md: 150 },
                  borderRadius: "50%",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                  animation: `${scaleIn} 0.6s ease-out, ${pulse} 2s ease-in-out infinite 0.6s`,
                }}
              />

              {/* Avatar */}
              <Avatar
                src={userPhoto}
                alt={userName}
                onLoad={() => setAvatarLoaded(true)}
                sx={{
                  width: { xs: 120, md: 140 },
                  height: { xs: 120, md: 140 },
                  fontSize: { xs: "2.5rem", md: "3rem" },
                  fontWeight: 700,
                  background: userPhoto
                    ? "transparent"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                  color: "#FFFFFF",
                  border: "4px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                  animation: userPhoto && !avatarLoaded ? `${shimmer} 2s infinite` : undefined,
                  backgroundImage: userPhoto && !avatarLoaded
                    ? "linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)"
                    : undefined,
                  backgroundSize: "1000px 100%",
                }}
              >
                {!userPhoto && initials}
              </Avatar>
            </Box>
          </Zoom>

          {/* Texto de boas-vindas */}
          <Grow in={show} timeout={700}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                  mb: 1,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  animation: `${slideUp} 0.7s ease-out`,
                  letterSpacing: "0.05em",
                }}
              >
                Bem-vindo de volta,
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  animation: `${slideUp} 0.8s ease-out`,
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  lineHeight: 1.2,
                }}
              >
                {firstName}!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 400,
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  animation: `${slideUp} 0.9s ease-out`,
                  maxWidth: 400,
                  mx: "auto",
                }}
              >
                Estamos preparando tudo para você...
              </Typography>
            </Box>
          </Grow>

          {/* Indicador de loading */}
          <Fade in={show} timeout={1000}>
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Fade>
  );
}
