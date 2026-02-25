import {Box, List, ListItem, Collapse, Divider, useMediaQuery} from "@mui/material";
import ContainedPurpleButton from "../buttons/contened-purple";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

interface HeaderMobileProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isMobileMenuOpen: boolean;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function HeaderMobile({
  setIsMobileMenuOpen,
  isMobileMenuOpen,
  activeSection,
  scrollToSection,
}: Readonly<HeaderMobileProps>) {
  const isMobile = useMediaQuery("(max-width:1049px)");

  return (
    <Box
      sx={{
        display: isMobile ? "flex" : "none",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "90vw",
          mx: "auto",
          pl: 0,
          gap: 2,
          alignItems: "center",
        }}
      >
        <img width={94} src="/svg/logo.svg" alt="Logo" />

        <Box
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          sx={{ borderRadius: 2, display: "flex", alignItems: "center", gap: 3 }}
        >
          <ContainedPurpleButton height={42}>Login</ContainedPurpleButton>
          {isMobileMenuOpen ? (
            <CloseIcon sx={{ color: "#8270FF", fontSize: 46, p: 1 }} />
          ) : (
            <MenuIcon
              sx={{
                bgcolor: "#8270FF",
                color: "white",
                fontSize: 42,
                p: 1,
                borderRadius: 2,
              }}
            />
          )}
        </Box>
      </Box>
      {/* Expandable Menu */}
      <Collapse in={isMobileMenuOpen} sx={{ width: "100%" }}>
        <Divider sx={{ marginTop: "20px" }}/>
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            color: "#8270FF",
            fontWeight: 500,
            fontFamily: "Sora, sans-serif",
            width: "100%",
            maxWidth: "90vw",
            mx: "auto",
            pt: "24px",
            pb: "4px"
          }}
        >
          {[
            { label: "Home", id: "home" },
            { label: "Nossos Serviços", id: "services" },
            { label: "Quem Somos", id: "about" },
            { label: "Vagas", id: "vacancies" },
          ].map((item) => (
              <ListItem
                  key={item.id}
                  sx={{
                      padding: 0,
                      color: activeSection === item.id ? "#6F60E0" : "#4B4B4B",
                      fontWeight: activeSection === item.id ? 500 : 400,
                      "&:hover": {
                          color: "#6F60E0",
                          cursor: "pointer",
                      },
                  }}
                  onClick={() => scrollToSection(item.id)}
              >
                  <Box
                      sx={{
                          display: 'inline-block',
                          position: 'relative',
                          "&::after": {
                              content: activeSection === item.id ? '""' : 'none',
                              position: 'absolute',
                              bottom: -4,
                              left: 0,
                              width: '100%',
                              height: '1.6px',
                              backgroundColor: '#6F60E0',
                              borderRadius: '2px',
                          },
                      }}
                  >
                      {item.label}
                  </Box>
              </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
