import { Box, Typography } from "@mui/material";
import VacancieCard from "../cards/vacancie-card";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useState } from "react";
import {AnimatePresence, motion} from "framer-motion";

const vacancies = [
  {
    title: "Desenvolvedor Frontend React",
    description:
      "Desenvolvimento de interfaces modernas e responsivas utilizando React e TypeScript.",
    location: "Remoto",
    level: "Pleno",
  },
  {
    title: "Desenvolvedor Backend Node.js",
    description: "Desenvolvimento de APIs RESTful e microsserviços em Node.js.",
    location: "Híbrido - São Paulo",
    level: "Sênior",
  },
  {
    title: "UX/UI Designer",
    description:
      "Design de interfaces e experiências de usuário para produtos digitais.",
    location: "Remoto",
    level: "Pleno",
  },
  {
    title: "Engenheiro de Dados",
    description: "Criação e manutenção de pipelines de dados escaláveis.",
    location: "Remoto",
    level: "Sênior",
  },
  {
    title: "Analista de QA",
    description:
      "Garantia de qualidade em aplicações web e mobile.",
    location: "Híbrido - Rio de Janeiro",
    level: "Pleno",
  },
  {
    title: "Scrum Master",
    description:
      "Facilitação de cerimônias ágeis e gestão de times.",
    location: "Presencial - Curitiba",
    level: "Sênior",
  },
  {
    title: "DevOps Engineer",
    description: "Automatização de processos e infraestrutura como código.",
    location: "Remoto",
    level: "Pleno",
  },
  {
    title: "Product Owner",
    description:
      "Gestão de backlog e priorização de funcionalidades.",
    location: "Híbrido - Belo Horizonte",
    level: "Sênior",
  },
  {
    title: "Desenvolvedor Mobile Flutter",
    description: "Criação de aplicativos multiplataforma utilizando Flutter.",
    location: "Remoto",
    level: "Pleno",
  },
];

const MotionBox = motion(Box);

export default function VacanciesSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < vacancies.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedVacancies = vacancies.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "90vw",
        mx: "auto",
        gap: { xs: "40px", md: "60px" },
        pt: { xs: "40px", md: "80px" },
      }}
    >
      {/* Título e Subtítulo */}
      <Box
        sx={{
          textAlign: "center",
          width: "100%",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "24px", md: "28px" },
            fontWeight: 700,
            lineHeight: { xs: "32px", md: "40px" },
            fontFamily: "Sora, sans-serif",
            color: "#000000",
            mb: "8px",
          }}
        >
          Vagas Abertas
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 400,
            lineHeight: { xs: "24px", md: "32px" },
            fontFamily: "Sora, sans-serif",
            color: "#4F4F4F",
            mb: "24px",
          }}
        >
          Faça parte do nosso time e transforme o futuro da tecnologia
        </Typography>
      </Box>

      {/* Cards de Vagas */}
      <Box
        sx={{
          width: "100%",
          display: { xs: "flex", md: "flex" },
          flexDirection: { xs: "row", md: "row" },
          overflowX: { xs: "auto", md: "unset" },
          scrollSnapType: { xs: "x mandatory", md: "none" },
          gap: { xs: "16px", md: "24px" },
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
          <AnimatePresence mode="wait">
              <MotionBox
                  key={currentPage}
                  sx={{
                      width: "100%",
                      display: "flex",
                      gap: { xs: "16px", md: "24px" },
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
              >
                  {paginatedVacancies.map((vacancie, index) => (
                      <Box
                          key={index}
                          sx={{
                              flex: 1,
                              display: "flex",
                              height: "100%",
                          }}
                      >
                          <VacancieCard vacancie={vacancie} />
                      </Box>
                  ))}
              </MotionBox>
          </AnimatePresence>
      </Box>
      {/* Paginação */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Box
          onClick={handlePrevPage}
          sx={{
            backgroundColor: currentPage === 0 ? "#E0E0E0" : "#7F56D9",
            color: currentPage === 0 ? "#9E9E9E" : "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            "&:hover": {
              backgroundColor: currentPage === 0 ? "#E0E0E0" : "#6E4FC7",
            },
          }}
        >
          <ArrowBackIosNewIcon sx={{ background: "transparent" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "Sora, sans-serif",
            color: "#4F4F4F",
          }}
        >
          Página {currentPage + 1} de{" "}
          {Math.ceil(vacancies.length / itemsPerPage)}
        </Typography>
        <Box
          onClick={handleNextPage}
          sx={{
            backgroundColor:
              (currentPage + 1) * itemsPerPage >= vacancies.length
                ? "#E0E0E0"
                : "#7F56D9",
            color:
              (currentPage + 1) * itemsPerPage >= vacancies.length
                ? "#9E9E9E"
                : "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor:
              (currentPage + 1) * itemsPerPage >= vacancies.length
                ? "not-allowed"
                : "pointer",
            "&:hover": {
              backgroundColor:
                (currentPage + 1) * itemsPerPage >= vacancies.length
                  ? "#E0E0E0"
                  : "#6E4FC7",
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ background: "transparent" }} />
        </Box>
      </Box>
    </Box>
  );
}
