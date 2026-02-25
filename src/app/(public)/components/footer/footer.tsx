import { Box, Typography, Link, Divider } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { scrollToElement } from "@/app/utils/scrollToElement";

export default function Footer() {
    
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#F9F5FF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "90vw",
        mx: "auto",
        gap: { xs: "40px", md: "60px" },
      }}
    >
      {/* Conteúdo Principal */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          gap: { xs: "24px", md: "0" },
          background: "transparent",
          pt: { xs: "40px", md: "80px" },
        }}
      >
        {/* Logo e Descrição */}
        <Box sx={{ flex: 1, background: "transparent" }}>
          <img
            src="/svg/logo-footer.svg"
            alt="Ponte Tech Logo"
            style={{ width: "150px", background: "transparent" }}
          />
          <Typography
            sx={{
              background: "transparent",
              fontSize: "14px",
              fontWeight: 400,
              fontFamily: "Sora, sans-serif",
              color: "#4F4F4F",
              mt: "16px",
              maxWidth: { xs: "100%", md: "300px" },
            }}
          >
            Conectando empresas a talentos de tecnologia que fazem a diferença.
          </Typography>
          <Box
            sx={{
              background: "transparent",
              display: "flex",
              gap: "16px",
              mt: "16px",
            }}
          >
            <Link
              href="https://www.instagram.com/pontetechoficial"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ background: "transparent", display: "flex", alignItems: "center" }}
            >
              <InstagramIcon sx={{ color: "#7F56D9", cursor: "pointer" }} />
            </Link>
            <Link
              href="https://www.linkedin.com/company/100767141"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ background: "transparent", display: "flex", alignItems: "center" }}
            >
              <LinkedInIcon sx={{ color: "#7F56D9", cursor: "pointer" }} />
            </Link>
            <Link
              href="https://www.tiktok.com/@pontetechoficial"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ background: "transparent", display: "flex", alignItems: "center" }}
            >
              <Box
                component="img"
                src="/svg/tiktok.svg"
                alt="TikTok"
                sx={{
                  width: 21,
                  height: 21,
                  cursor: "pointer",
                  color: "#7F56D9",
                }}
              />
            </Link>
            <Link
              href="https://www.youtube.com/@pontetechoficial"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ background: "transparent", display: "flex", alignItems: "center" }}
            >
              <YouTubeIcon sx={{ color: "#7F56D9", cursor: "pointer", fontSize: 24 }} />
            </Link>
          </Box>
        </Box>

        {/* Navegação */}
        <Box sx={{ flex: 1, background: "transparent" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "Sora, sans-serif",
              background: "transparent",
              color: "#000000",
              mb: "16px",
            }}
          >
            Navegação
          </Typography>
          <Box
            sx={{
              display: "flex",
              background: "transparent",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Link
              onClick={() => scrollToElement("home")}
              underline="hover"
              color="#4F4F4F"
              sx={{ fontFamily: "Sora, sans-serif", fontSize: "14px" }}
            >
              Home
            </Link>
            <Link
              onClick={() => scrollToElement("about")}
              underline="hover"
              color="#4F4F4F"
              sx={{ fontFamily: "Sora, sans-serif", fontSize: "14px" }}
            >
              Quem somos
            </Link>
            <Link
              onClick={() => scrollToElement("services")}
              underline="hover"
              color="#4F4F4F"
              sx={{ fontFamily: "Sora, sans-serif", fontSize: "14px" }}
            >
              Nossos Serviços
            </Link>
            <Link
              onClick={() => scrollToElement("vacancies")}
              underline="hover"
              color="#4F4F4F"
              sx={{ fontFamily: "Sora, sans-serif", fontSize: "14px" }}
            >
              Vagas
            </Link>
          </Box>
        </Box>

        {/* Contato */}
        <Box sx={{ flex: 1, background: "transparent" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              background: "transparent",
              fontFamily: "Sora, sans-serif",
              color: "#000000",
              mb: "16px",
            }}
          >
            Contato
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "transparent",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EmailIcon sx={{ color: "#7F56D9" }} />
              <Link
                href="mailto:contato@ponte-tech.com.br"
                underline="hover"
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  fontFamily: "Sora, sans-serif",
                  color: "#4F4F4F",
                }}
              >
                contato@ponte-tech.com.br
              </Link>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PhoneIcon sx={{ color: "#7F56D9" }} />
              <Link
                href="tel:+5511915788441"
                underline="hover"
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  fontFamily: "Sora, sans-serif",
                  color: "#4F4F4F",
                }}
              >
                (11) 91578-8441
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Rodapé */}
      <Box
        sx={{ width: "100%", textAlign: "center", background: "transparent" }}
      >
        <Divider sx={{ mb: 2, width: { md: "auto", xs: "95%" } }} />
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: "Sora, sans-serif",
            color: "#4F4F4F",
            mb: 2,
          }}
        >
          © 2025 Ponte Tech. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  );
}
