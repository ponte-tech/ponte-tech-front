import { Box, Typography } from "@mui/material";
import SmallInfoCard from "../cards/small-info";
import ContainedPurpleButton from "../buttons/contened-purple";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import {scrollToElement} from "@/app/utils/scrollToElement";

export default function OutsourcingSection() {
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
          Outsourcing
        </Typography>
          <Box sx={{display: "flex", justifyContent: "center"}}>
              <Typography
                  sx={{
                      fontSize: { xs: "16px", md: "18px" },
                      fontWeight: 400,
                      lineHeight: { xs: "28px", md: "32px" },
                      fontFamily: "Sora, sans-serif",
                      color: "#4F4F4F",
                      maxWidth: "500px",
                  }}
              >
                  Conectamos talento e eficiência para transformar desafios em soluções estratégicas que impulsionam resultados.
              </Typography>
          </Box>
      </Box>

      {/* Cards e Imagem */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: { xs: "24px", md: "40px" },
        }}
      >
        <Box sx={{
          display: "flex",
          flexDirection: "column",
        }}>
          <Typography
            sx={{
              fontSize: { xs: "14px", md: "16px" },
              fontWeight: 400,
              lineHeight: { xs: "20px", md: "28px" },
              fontFamily: "Sora, sans-serif",
              color: "#4F4F4F",
              maxWidth: "800px",
              mx: "auto",
              textAlign: "left",
            }}
          >
              Disponibilizamos especialistas para fortalecer o ecossistema de desenvolvimento de software. Por meio do modelo body shop, alocamos profissionais em projetos desafiadores que exigem agilidade, eficácia e alto desempenho para atender às necessidades dos nossos clientes.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: "16px", md: "24px" },
              width: "100%",
              mt: 4,
            }}
          >
            <SmallInfoCard
              image="svg/flexibilizy.svg"
              title="Flexibilização"
              description="Prioridades adaptáveis e resposta ágil a mudanças constantes."
            />
            <SmallInfoCard
              image="svg/visibility.svg"
              title="Visibilidade"
              description="Interação constante com visibilidade clara das entregas."
            />
            <SmallInfoCard
              image="svg/knowledge.svg"
              title="Conhecimento"
              description="Profissionais prontos para resolver desafios reais com eficiência."
              imageBg="rgba(227, 99, 235, 0.1)"
            />
            <SmallInfoCard
              image="svg/strategy.svg"
              title="Estratégia"
              description="Adaptabilidade com foco nas necessidades estratégicas do cliente."
              imageBg="rgba(227, 99, 235, 0.1)"
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            order: { xs: 2, md: 1 },
          }}
        >
          <img
            src="/svg/outsourcing-robot.svg"
            alt="Outsourcing Robot"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
