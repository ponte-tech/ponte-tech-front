import { Box, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import ContainedPurpleButton from "../buttons/contened-purple";

interface Vacancie {
  title: string;
  description: string;
  location: string;
  level: string;
}

export default function VacancieCard({ vacancie }: Readonly<{ vacancie: Vacancie }>) {
  const { title, description, location, level } = vacancie;

  return (
      <Box
          sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(233, 233, 233, 1)",
              borderRadius: "8px",
              padding: "16px",
              gap: "16px",
              backgroundColor: "#FFFFFF",
              width: "100%",
              overflowX: { xs: "auto", md: "unset" },
              scrollSnapType: { xs: "x mandatory", md: "none" },
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { display: "none" },
          }}
      >
      {/* Título */}
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: 700,
          fontFamily: "Sora, sans-serif",
          color: "#000000",
        }}
      >
        {title}
      </Typography>

      {/* Descrição */}
          <Box sx={{ flexGrow: 1 }}>
              <Typography
                  sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      fontFamily: "Sora, sans-serif",
                      color: "#4F4F4F",
                  }}
              >
                  {description}
              </Typography>
          </Box>

      {/* Informações adicionais */}
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        {/* Localização */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <LocationOnIcon sx={{ fontSize: "16px", color: "#4F4F4F" }} />
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              fontFamily: "Sora, sans-serif",
              color: "#4F4F4F",
            }}
          >
            {location}
          </Typography>
        </Box>

        {/* Nível */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <PersonIcon sx={{ fontSize: "16px", color: "#7F56D9" }} />
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              fontFamily: "Sora, sans-serif",
              color: "#7F56D9",
            }}
          >
            {level}
          </Typography>
        </Box>
      </Box>

      {/* Botão */}
      <ContainedPurpleButton width="100%">
        Candidatar-se
      </ContainedPurpleButton>
    </Box>
  );
}
