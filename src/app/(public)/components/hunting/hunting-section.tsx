import { Box, Typography } from "@mui/material";
import SmallInfoCard from "../cards/small-info";
import ContainedPurpleButton from "../buttons/contened-purple";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import {scrollToElement} from "@/app/utils/scrollToElement";

export default function HuntingSection() {
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
            mt: { xs: "40px", md: "80px" },
          }}
        >
          Hunting
        </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography
                  sx={{
                      fontSize: { xs: "16px", md: "18px" },
                      fontWeight: 400,
                      lineHeight: { xs: "24px", md: "32px" },
                      fontFamily: "Sora, sans-serif",
                      color: "#4F4F4F",
                      mb: {xs: "0px", md: "24px"},
                      maxWidth: "500px",
                  }}
              >
                  Conectamos talentos a oportunidades, moldando o futuro do seu negócio
              </Typography>
          </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "start",
          justifyContent: "space-between",
          gap: { xs: "24px", md: "40px" },
        }}
      >
        {/* Imagem */}
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "50%" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            order: { xs: 2, md: 1 },
          }}
        >
          <img
            src="/img/hunting.png"
            alt="Hunting Illustration"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>

        {/* Texto e Cards */}
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            order: { xs: 1, md: 2 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "14px", md: "16px" },
              fontWeight: 400,
              width: {xs: "100%", md: "auto"},
              lineHeight: { xs: "20px", md: "28px" },
              fontFamily: "Sora, sans-serif",
              color: "#4F4F4F",
              mb: "24px",
            }}
          >
              Nosso time de hunting conduz uma seleção criteriosa para identificar o profissional ideal. Utilizamos nossa metodologia exclusiva H2T, que combina análises técnicas, comportamentais e dados estatísticos para garantir a melhor escolha.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr" },
              gap: { xs: "16px", md: "24px" },
              width: "100%",
            }}
          >
            <SmallInfoCard
              image="./svg/search-icon.svg"
              title="Metodologia exclusiva"
              description="Garante a assertividade no preenchimento da vaga."
            />
            <SmallInfoCard
              image="./svg/money-icon.svg"
              title="Redução de custo"
              imageBg="rgba(227, 99, 235, 0.1)"
              description="Elimina processos internos e reduz custos operacionais."
            />
            <SmallInfoCard
              image="./svg/eye-icon.svg"
              title="Transparência"
              description="Detalhamento completo do perfil profissional para validação do cliente."
            />
          </Box>
          {/* Botão */}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              mt: 3,
            }}
          >
              <ContainedPurpleButton height={42} onClick={() => scrollToElement("contact")}>
                  Fale conosco <ArrowRightAltIcon sx={{ bgcolor: "transparent" }} />
              </ContainedPurpleButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
