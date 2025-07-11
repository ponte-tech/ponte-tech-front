'use client';

import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Stack, 
  Chip, 
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';

export default function VagaPage() {
  const { id } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mock de dados até conectar com o backend
  const vaga = {
    id,
    titulo: 'Desenvolvedor Full Stack',
    descricao: `Estamos em busca de um desenvolvedor Full Stack com experiência em React e Node.js para integrar nosso time de desenvolvimento.

Responsabilidades:
• Desenvolver e manter aplicações web utilizando React no frontend
• Criar e manter APIs RESTful utilizando Node.js
• Colaborar com equipes de design e produto para implementar novas funcionalidades
• Participar de code reviews e garantir a qualidade do código
• Trabalhar com metodologias ágeis (Scrum/Kanban)

Requisitos:
• Experiência mínima de 2 anos com React e Node.js
• Conhecimento em TypeScript
• Experiência com bancos de dados relacionais (PostgreSQL, MySQL)
• Conhecimento em Git e versionamento de código
• Experiência com testes unitários e de integração

Diferenciais:
• Conhecimento em Docker e Kubernetes
• Experiência com AWS ou outras plataformas de cloud
• Conhecimento em metodologias ágeis
• Experiência com GraphQL`,
    modalidade: 'Remoto',
    nivel: 'Júnior',
    salario: 'R$ 9.000,00 - R$ 10.000,00',
    contrato: 'CLT',
    categoria: 'Fullstack',
    empresa: 'Ponte Tech',
    dataPublicacao: 'Publicado há 3 dias'
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleCandidatar = () => {
    // Implementar lógica de candidatura
    console.log('Candidatar-se à vaga:', id);
  };

  return (
    <>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          bgcolor: '#f5f5f5', 
          minHeight: '100vh',
          pt: { xs: 10, md: 12 },
          pb: 4
        }}
      >
        <Container maxWidth="lg">
          {/* Botão Voltar */}
          <Box sx={{ mb: 3 }}>
            <IconButton 
              onClick={handleVoltar}
              sx={{ 
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Paper 
            elevation={1}
            sx={{ 
              p: { xs: 3, md: 4 },
              borderRadius: 2
            }}
          >
            {/* Cabeçalho da Vaga */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h3" 
                component="h1"
                fontWeight={700}
                fontSize={{ xs: 24, md: 32 }}
                color="text.primary"
                gutterBottom
              >
                {vaga.titulo}
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {vaga.empresa} • {vaga.dataPublicacao}
              </Typography>

              {/* Informações principais */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                flexWrap="wrap"
                sx={{ mb: 3 }}
              >
                <Chip
                  icon={<LocationOnIcon />}
                  label={vaga.modalidade}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={vaga.nivel}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }}
                />
                <Chip
                  icon={<AttachMoneyIcon />}
                  label={vaga.salario}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }}
                />
                <Chip
                  icon={<WorkIcon />}
                  label={vaga.contrato}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }}
                />
                <Chip
                  icon={<CategoryIcon />}
                  label={vaga.categoria}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }}
                />
              </Stack>

              {/* Botão Candidatar-se */}
              <Button 
                variant="contained" 
                size="large"
                onClick={handleCandidatar}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Candidatar-se
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Descrição da Vaga */}
            <Box>
              <Typography 
                variant="h5" 
                component="h2"
                fontWeight={600}
                color="text.primary"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Descrição da Vaga
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.primary"
                lineHeight={1.7}
                sx={{ 
                  whiteSpace: 'pre-line',
                  fontSize: { xs: 14, md: 16 }
                }}
              >
                {vaga.descricao}
              </Typography>
            </Box>

            {/* Botão Candidatar-se no final */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleCandidatar}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Candidatar-se a esta vaga
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

