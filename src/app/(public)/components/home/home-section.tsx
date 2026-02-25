import {Box, Typography} from "@mui/material";
import ContainedPurpleButton from "../buttons/contened-purple";
import OutlinedWhiteButton from "../buttons/outlined-white";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import {scrollToElement} from "@/app/utils/scrollToElement";

export default function HomeSection() {
    return (
        <Box
            sx={{
                    position: "relative",
                    width: "100vw",
                    minHeight: {xs: "auto", md: "100vh"},
                    background:
                        "linear-gradient(94.63deg, rgba(130, 112, 255, 0.08) 17.19%, rgba(65, 30, 254, 0.08) 58.6%, rgba(227, 99, 235, 0.08) 100%)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: {xs: "column", md: "row"},
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: {xs: "0", md: "84px"},
            }}
        >
            {/* Container centralizado com conteúdo */}
            <Box
                sx={{
                    backgroundColor: "transparent",
                    maxWidth: "90vw",
                    mx: "auto",
                    display: "flex",
                    flexDirection: {xs: "column", md: "row"},
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Texto e Botões */}
                <Box
                    sx={{
                        bgcolor: "transparent",
                        maxWidth: {xs: "100%", md: "53%"},
                        textAlign: {xs: "center", md: "left"},
                        mt: {xs: "98px", md: "0"},
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            bgcolor: "transparent",
                            textAlign: "left",
                            fontSize: {xs: "36px", sm: "52px", md: "58px"},
                            fontWeight: 700,
                            lineHeight: {xs: "46px", sm: "60px", md: "66px"},
                            fontFamily: "Sora, sans-serif",
                            color: "#000000",
                            "@media (max-width: 350px)": {
                                fontSize: "32px",
                                lineHeight: "40px",
                            },
                        }}
                    >
                        Construímos, <br/>
                        desenvolvemos, <br/>
                        <Typography
                            component="span"
                            sx={{
                                background:
                                    "linear-gradient(90deg, #8270FF 0%, #411EFE 50%, #E363EB 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontSize: {xs: "40px", sm: "52px", md: "58px"},
                                fontWeight: 700,
                                lineHeight: {xs: "46px", sm: "60px", md: "66px"},
                                fontFamily: "Sora, sans-serif",
                                "@media (max-width: 350px)": {
                                    fontSize: "32px",
                                    lineHeight: "40px",
                                },
                            }}
                        >
                            gerenciamos e <br/>
                            impulsionamos
                        </Typography>
                    </Typography>
                    <Typography
                        sx={{
                            bgcolor: "transparent",
                            maxWidth: "100%",
                            fontSize: {xs: "14px", md: "18px"},
                            textAlign: "left",
                            fontWeight: 500,
                            lineHeight: {xs: "20px", md: "28px"},
                            fontFamily: "Sora, sans-serif",
                            color: "#4F4F4F",
                            mt: "16px",
                        }}
                    >
                        Oferecemos outsourcing de profissionais de TI para transformar
                        desafios complexos em soluções eficientes, produtivas e de alta
                        qualidade.
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "16px",
                            bgcolor: "transparent",
                            mt: "24px",
                        }}
                    >
                        <ContainedPurpleButton height={42} onClick={() => scrollToElement("contact")}>
                            Fale conosco <ArrowRightAltIcon sx={{ bgcolor: "transparent" }} />
                        </ContainedPurpleButton>
                        <OutlinedWhiteButton height={42} isTransparent onClick={() => scrollToElement("vacancies")}>
                            Ver vagas
                        </OutlinedWhiteButton>
                    </Box>
                </Box>
            </Box>

            {/* Robô absoluto ao container pai */}
            <Box
                sx={{
                    position: { xs: "static", md: "absolute" },
                    right: { md: 0 },
                    width: { xs: "100%", md: "auto" },
                    maxWidth: { xs: "100%", md: "50%" },
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-end" },
                    zIndex: 1,
                    mt: 0,
                }}
            >
                <img
                    src="/svg/robot.svg"
                    alt="Robô"
                    style={{
                        width: "100%",
                        height: "auto",
                    }}
                />
            </Box>
        </Box>
    )
}
