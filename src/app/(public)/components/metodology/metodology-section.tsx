import { Box, Typography } from "@mui/material";
import SmallInfoCard from "../cards/small-info";

export default function MethodologySection() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
          Metodologia H2T
        </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography
                  sx={{
                      fontSize: { xs: "16px", md: "18px" },
                      fontWeight: 400,
                      fontFamily: "Sora, sans-serif",
                      color: "#4F4F4F",
                      maxWidth: "500px",
                  }}
              >
                  Potencialize o crescimento do seu negócio com a nossa experiência
              </Typography>
          </Box>

      </Box>

      {/* Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" },
          gap: { xs: "16px", md: "24px" },
          width: "100%",
        }}
      >
        <SmallInfoCard
          invertImageOrder
          image="./svg/smart-proccess.svg"
          title="Processo inteligente de recrutamento e seleção"
          description="Atraímos e selecionamos candidatos altamente capacitados com qualidade e precisão."
        />
        <SmallInfoCard
          invertImageOrder
          image="./svg/trophy.svg"
          title="Experiência consolidada"
          description="Validamos técnica e comportamento com histórico de entregas bem-sucedidas."
        />
        <SmallInfoCard
          invertImageOrder
          image="./svg/tech-fit.svg"
          title="FIT técnico e cultural com o cliente"
          description="Integração produtiva com valores e expectativas alinhadas."
        />
        <SmallInfoCard
          invertImageOrder
          image="./svg/sync.svg"
          title="Envolvimento do início ao fim do projeto"
          description="Desde concepção até manutenção — cobertura completa do ciclo de vida do software."
        />
      </Box>
    </Box>
  );
}
