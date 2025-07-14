'use client';

import { useState } from 'react';
import { Container, Box, useMediaQuery, useTheme, Drawer, IconButton, Fab, Typography, Stack } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchSection from '../components/vacancies/search/search-section';
import FiltersSection from '../components/vacancies/filters/filters-section';
import VacancyHighlightCard from '../components/vacancies/highlights/vacancy-highlight-card';
import VacancyListSection from '../components/vacancies/list/vacancy-list-section';
import VacancyDetailsSection from '../components/vacancies/details/vacancy-details-section';
import Pagination from '../components/vacancies/pagination/pagination';
import { Vacancy } from '../components/vacancies/list/vacancy-card';

const mockVacancies: Vacancy[] = [
  {
    id: 1,
    title: "Desenvolvedor Full Stack",
    description: "Estamos em busca de um desenvolvedor Full Stack...Estamos em busca de um desenvolvedor Full Stack...Estamos em busca de um desenvolvedor Full Stack...Estamos em busca de um desenvolvedor Full Stack...",
    location: "Remoto",
    level: "Júnior",
    salary: "R$ 5.000,00 - R$ 10.000,00",
    contractType: "CLT",
    badge: "Urgente",
  },
  {
    id: 2,
    title: "Product Owner",
    description: "Buscamos PO para squads ágeis...",
    location: "Híbrido",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
  {
    id: 3,
    title: "Desenvolvedor Mobile Flutter",
    description: "Criação de aplicativos multiplataforma utilizando Flutter.",
    location: "Remoto",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
  {
    id: 4,
    title: "Product Owner",
    description: "Buscamos PO para squads ágeis...",
    location: "Híbrido",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
  {
    id: 5,
    title: "Product Owner",
    description: "Buscamos PO para squads ágeis...",
    location: "Híbrido",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
    {
    id: 6,
    title: "Desenvolvedor Full Stack2",
    description: "Estamos em busca de um desenvolvedor Full Stack...",
    location: "Remoto",
    level: "Júnior",
    salary: "R$ 5.000,00 - R$ 10.000,00",
    contractType: "CLT",
    badge: "Urgente",
  },
  {
    id: 7,
    title: "Product Owner2",
    description: "Buscamos PO para squads ágeis...",
    location: "Híbrido",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
  {
    id: 8,
    title: "Desenvolvedor Mobile Flutter2",
    description: "Criação de aplicativos multiplataforma utilizando Flutter.",
    location: "Remoto",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
  {
    id: 9,
    title: "Product Owner2",
    description: "Buscamos PO para squads ágeis...",
    location: "Híbrido",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },
  {
    id: 10,
    title: "Product Owner2",
    description: "Buscamos PO para squads ágeis...",
    location: "Híbrido",
    level: "Pleno",
    salary: "R$ 8.000,00",
    contractType: "PJ",
    badge: "Nova",
  },

];

// Vacancies em destaque
const highlightVacancies = [
  {
    title: "UX/UI design",
    category: "Design",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    title: "Dev fullstack",
    category: "Back End",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    title: "Product Owner",
    category: "Gestão",
    location: "Híbrido",
    publishedDate: "Publicado há 2 dias",
  },
  {
    title: "UX/UI design2",
    category: "Design",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    title: "Dev fullstack2",
    category: "Back End",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    title: "Product Owner2",
    category: "Gestão",
    location: "Híbrido",
    publishedDate: "Publicado há 2 dias",
  },
  {
    title: "Product Owner 3",
    category: "Back end",
    location: "Hibrido",
    publishedDate: "Publicado há 3 dias",
  },
];

export default function VagasPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xl'));

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | undefined>();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [highlightPage, setHighlightPage] = useState(1);

  const vacanciesPerPage = 3;
  const totalVacancyPages = Math.ceil(mockVacancies.length / vacanciesPerPage);
  const startVacancyIndex = (paginaAtual - 1) * vacanciesPerPage;
  const paginatedVacancies = mockVacancies.slice(startVacancyIndex, startVacancyIndex + vacanciesPerPage);

  const highlightPerPage = 3;
  const totalHighlightPages = Math.ceil(highlightVacancies.length / highlightPerPage);
  const startHighlight = (highlightPage - 1) * highlightPerPage;
  const paginatedHighlights = highlightVacancies.slice(startHighlight, startHighlight + highlightPerPage);

  const selectedVacancy = mockVacancies.find(v => v.id === selectedVacancyId);

  const handleVacancySelect = (vacancyId: number) => {
    setSelectedVacancyId(vacancyId);
    if (isMobile) setMobileDetailsOpen(true);
  };

  return (
    // Container principal da página
    <Box
      component="main"
      sx={{
         bgcolor: '#f7f7f7',
        minHeight: '100vh',
        maxWidth: '90vw',
        margin: '0 auto',
        py: { xs: 2, sm: 3, md: 4, lg: 6 },
        position: 'relative',
      }}
    >
      <Container disableGutters maxWidth={false}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '20% 2fr 1fr' }, // Define colunas da grid
            gap: { xs: 2, md: 3.5, lg: 4 }, // Espaço entre colunas
            width: '100%',
          }}
        >
          {/* Sidebar de filtros (desktop) */}
          {!isMobile && (
            <Box sx={{ gridColumn: '1', width: "100%", display: 'flex', justifyContent: 'flex-start' }}>
              <FiltersSection onFiltroChange={() => {}} />
            </Box>
          )}

          {/* Coluna central (busca, destaques, vagas) */}
          <Box
            sx={{
              gridColumn: { xs: '1', lg: '2' },
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 3.5,
              alignItems: 'stretch',
              width: '100%',
            }}
          >
            {/* Barra de busca */}
            <Box width="100%" sx={{ mx: 'auto', mb: 2.5 }}>
              <SearchSection />
            </Box>

            {/* Destaques com scroll responsivo */}
            <Box
              sx={{
                width: '100%',
                mb: 0,
                minHeight: 180,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography
                  component="h2"
                  fontSize={18}
                  fontWeight={700}
                  fontFamily="'Sora', sans-serif"
                  sx={{ m: 0 }}
                >
                  Vagas em destaque
                </Typography>
                <Box>
                  <Pagination
                    currentPage={highlightPage}
                    totalPages={totalHighlightPages}
                    onPageChange={setHighlightPage}
                  />
                </Box>
              </Box>
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  overflowX: { xs: 'auto', md: 'visible' },
                  width: '100%',
                  pt: 4,
                  pb: 2,
                  px: 2,
                  scrollSnapType: { xs: 'x mandatory', md: 'none' },
                  "&::-webkit-scrollbar": { display: "none" }
                  ,
                }}
              >
                {paginatedHighlights.map((vacancy) => (
                  <Box 
                  key={vacancy.title} 
                  sx={{ scrollSnapAlign: { xs: 'start', md: 'none' } }}>
                    <VacancyHighlightCard {...vacancy} />
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Lista de todas as vagas */}
            <Box
              sx={{
                borderRadius: 3,
                boxShadow: '0px 2px 8px 0px rgba(44,39,56,0.02)',
                width: '100%',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" pb={3}>
                <Typography component="h2" fontSize={18} fontWeight={600} fontFamily="'Sora', sans-serif" sx={{ m: 0 }}>
                  Todas as vagas
                </Typography>
                <Typography fontSize={14} color="#888" aria-live="polite" sx={{ fontWeight: 400 }}>
                  {mockVacancies.length} vagas disponíveis
                </Typography>
              </Box>
              <Box>
                <VacancyListSection
                  onVacancySelect={handleVacancySelect}
                  selectedVacancyId={selectedVacancyId}
                  vacancies={paginatedVacancies}
                />
              </Box>
              <Box px={3} pb={3} display="flex" justifyContent="center" alignItems="center">
                <Pagination
                  currentPage={paginaAtual}
                  totalPages={totalVacancyPages}
                  onPageChange={setPaginaAtual}
                />
              </Box>
            </Box>
          </Box>

          {/* Detalhes da vaga (painel lateral, visível apenas em desktop) */}
          {!isMobile && (
            <Box
              sx={{
                gridColumn: '3',
                minWidth: 0,
                maxWidth: 420,
                width: '100%',
                alignSelf: 'flex-start',
                bgcolor: '#fff',
                borderRadius: 3,
                boxShadow: '0px 2px 8px 0px rgba(44,39,56,0.02)',
                ml: 0,
                p: 0,
              }}
            >
              <VacancyDetailsSection vacancy={selectedVacancy} />
            </Box>
          )}
        </Box>
      </Container>

      {/* FAB Filtros mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Abrir filtros"
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1000,
          }}
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FilterListIcon />
        </Fab>
      )}

      {/* FAB Detalhes mobile */}
      {isMobile && selectedVacancyId && (
        <Fab
          color="primary"
          aria-label="Ver detalhes da vaga"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => setMobileDetailsOpen(true)}
        >
          <VisibilityIcon />
        </Fab>
      )}

      {/* Drawer de filtros mobile */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 320 },
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Fechar filtros"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <FiltersSection onFiltroChange={() => {}} />
        </Box>
      </Drawer>

      {/* Drawer de detalhes mobile */}
      <Drawer
        anchor="right"
        open={mobileDetailsOpen}
        onClose={() => setMobileDetailsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="h3" fontSize={18} fontWeight={600} m={0}>
            Detalhes da Vaga
          </Box>
          <IconButton
            onClick={() => setMobileDetailsOpen(false)}
            aria-label="Fechar detalhes"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <VacancyDetailsSection vacancy={selectedVacancy} />
        </Box>
      </Drawer>
    </Box>
  );
}