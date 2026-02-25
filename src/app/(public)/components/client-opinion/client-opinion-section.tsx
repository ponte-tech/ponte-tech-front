import { Box, Typography } from "@mui/material";

const opinions = [
    {
        text: "A Ponte Tech encontrou rapidamente os profissionais certos para nossa equipe de desenvolvimento. Superou nossas expectativas.",
        name: "Ana Silva",
        role: "CTO, TechSolutions, TechSolutions",
    },
    {
        text: "O squad montado pela Ponte Tech entregou nosso projeto com qualidade e dentro do prazo. Excelente trabalho.",
        name: "Marcos Oliveira",
        role: "Diretor de Tecnologia, Inovação Digital",
    },
    {
        text: "A Ponte Tech foi essencial na entrega do nosso projeto. A equipe foi extremamente dedicada e entregou tudo dentro dos prazos estabelecidos.",
        name: "Roberta Costa",
        role: "Gerente de Projetos, Inovação Digital"
    },
];

export default function ClientOpinionSection() {
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
                    O que nossos clientes dizem
                </Typography>
                <Typography
                    sx={{
                        fontSize: { xs: "16px", md: "18px" },
                        fontWeight: 400,
                        lineHeight: { xs: "24px", md: "32px" },
                        fontFamily: "Sora, sans-serif",
                        color: "#4F4F4F",
                        mb: { xs: "0px", md: "24px" },
                    }}
                >
                    Parcerias de sucesso que transformam negócios
                </Typography>
            </Box>

            {/* Cards de Opinião */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "row", md: "row" },
                    overflowX: { xs: "auto", md: "unset" },
                    scrollSnapType: { xs: "x mandatory", md: "none" },
                    gap: { xs: "16px", md: "24px" },
                    width: "100%",
                    alignItems: "stretch",
                    WebkitOverflowScrolling: "touch",
                    "&::-webkit-scrollbar": { display: "none" },
                    paddingX: { xs: 2, md: 0 },
                }}
            >
                {opinions.map((opinion, index) => (
                    <Box
                        key={index}
                        sx={{
                            scrollSnapAlign: { xs: "center", md: "unset" },
                            flex: { xs: "0 0 80%", md: "unset" },
                            maxWidth: { xs: "80%", md: "unset" },
                            border: "1px solid rgba(233, 233, 233, 1)",
                            borderRadius: "8px",
                            padding: "16px",
                            backgroundColor: "#FFFFFF",
                            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "16px",
                                fontWeight: 400,
                                fontFamily: "Sora, sans-serif",
                                color: "#4F4F4F",
                                mb: "16px",
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            "{opinion.text}"
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end", // Coloca o nome e o cargo no final do card
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    fontFamily: "Sora, sans-serif",
                                    color: "#000000",
                                }}
                            >
                                {opinion.name}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    fontFamily: "Sora, sans-serif",
                                    color: "#4F4F4F",
                                }}
                            >
                                {opinion.role}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
