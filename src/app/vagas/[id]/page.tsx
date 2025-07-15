// 'use client';

import { notFound } from 'next/navigation';
import { Box, Typography, Container, Chip, Stack, Paper, Button, Divider, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import Header from '@/app/components/header/header';
import Footer from '@/app/components/footer/footer';

const mockVagas = [
  {
    id: 1,
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
  },
  {
    id: 2,
    titulo: 'UX/UI Designer Pleno',
    descricao: `Estamos contratando um(a) designer com experiência em UI/UX para trabalhar em interfaces responsivas e acessíveis.

Requisitos:
• Figma avançado
• Conhecimento em acessibilidade
• Experiência com Design Systems
• Colaboração com times de produto`,
    modalidade: 'Remoto',
    nivel: 'Pleno',
    salario: 'R$ 7.000,00 - R$ 8.000,00',
    contrato: 'PJ',
    categoria: 'Design',
    empresa: 'Ponte Tech',
    dataPublicacao: 'Publicado há 2 dias'
  }
];

export default function VagaDetalhePage({ params }: { params: { id: string } }) {
  const vaga = mockVagas.find(v => v.id.toString() === params.id);
  if (!vaga) return notFound();

  return (
    <>
      <Header />
      <Box component="main" sx={{ bgcolor: '#f5f5f5', pt: 10, pb: 4, minHeight: '100vh' }}>
        <Container maxWidth="md">
          <IconButton onClick={() => history.back()} sx={{ mb: 3, bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>

          <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
            <Typography variant="h3" fontSize={{ xs: 24, md: 32 }} fontWeight={700} gutterBottom>
              {vaga.titulo}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              {vaga.empresa} • {vaga.dataPublicacao}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
              <Chip icon={<LocationOnIcon />} label={vaga.modalidade} variant="outlined" />
              <Chip icon={<PersonIcon />} label={vaga.nivel} variant="outlined" />
              <Chip icon={<AttachMoneyIcon />} label={vaga.salario} variant="outlined" />
              <Chip icon={<WorkIcon />} label={vaga.contrato} variant="outlined" />
              <Chip icon={<CategoryIcon />} label={vaga.categoria} variant="outlined" />
            </Stack>

            <Button variant="contained" size="large" sx={{ mb: 4 }}>
              Candidatar-se
            </Button>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              Descrição da Vaga
            </Typography>
            <Typography variant="body1" whiteSpace="pre-line">
              {vaga.descricao}
            </Typography>

            <Box mt={4} textAlign="center">
              <Button variant="contained" size="large">
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
