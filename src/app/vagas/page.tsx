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
    id: 1,
    title: "UX/UI design",
    category: "Design",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    id: 2,
    title: "Dev fullstack",
    category: "Back End",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    id: 3,
    title: "Product Owner",
    category: "Gestão",
    location: "Híbrido",
    publishedDate: "Publicado há 2 dias",
  },
  {
    id: 4,
    title: "UX/UI design2",
    category: "Design",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    id: 5,
    title: "Dev fullstack2",
    category: "Back End",
    location: "Remoto",
    publishedDate: "Publicado há 3 dias",
  },
  {
    id: 6,
    title: "Product Owner2",
    category: "Gestão",
    location: "Híbrido",
    publishedDate: "Publicado há 3 dias",
  },
  {
    id: 7,
    title: "Product Owner 3",
    category: "Back end",
    location: "Híbrido",
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

  const vacanciesPerPage = 4;
  const totalVacancyPages = Math.ceil(mockVacancies.length / vacanciesPerPage);
  const paginatedVacancies = mockVacancies.slice(
    (paginaAtual - 1) * vacanciesPerPage,
    paginaAtual * vacanciesPerPage
  );

  const highlightPerPage = 3;
  const totalHighlightPages = Math.ceil(highlightVacancies.length / highlightPerPage);
  const paginatedHighlights = highlightVacancies.slice(
    (highlightPage - 1) * highlightPerPage,
    highlightPage * highlightPerPage
  );

  const selectedVacancy = mockVacancies.find(v => v.id === selectedVacancyId);

  const handleVacancySelect = (vacancyId?: number) => {
  if (selectedVacancyId === vacancyId) {
    setSelectedVacancyId(undefined);
    setMobileDetailsOpen(false);
  } else {
    setSelectedVacancyId(vacancyId);
    if (isMobile) setMobileDetailsOpen(true);
  }
};


  return (
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
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        mx: 'auto',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 3.5, md: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 3.5, md: 4 },
        }}
      >
        {/* Filtros - Desktop */}
        {!isMobile && (
          <Box sx={{ flex: { lg: '1 0 20%' } }}>
            <FiltersSection onFiltroChange={() => {}} />
          </Box>
        )}

        {/* Coluna Central */}
        <Box
          sx={{
            flex: '2 1 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            width: '100%',
            px: { xs: 0 },
          }}
        >
          {/* Busca */}
          <Box sx={{ width: '100%' }}>
            <SearchSection />
          </Box>

          {/* Destaques */}
          <Box
            sx={{
              width: '100%',
              minHeight: 180,
              px: { xs: 1.5, sm: 2, md: 0 },
              overflowX: { xs: 'auto', md: 'visible' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography component="h2" fontSize={18} fontWeight={700} fontFamily="'Sora', sans-serif">
                Vagas em destaque
              </Typography>
              <Pagination
                currentPage={highlightPage}
                totalPages={totalHighlightPages}
                onPageChange={setHighlightPage}
              />
            </Box>
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              sx={{
                overflowX: { xs: 'auto', xl: 'visible' },
                width: '100%',
                pt: 3,
                pb: 1,
                px: { xs: 2, md: 0 },
                scrollSnapType: { xs: 'x mandatory' },
              }}
            >
              {paginatedHighlights.map((vacancy) => (
                <Box
                  key={vacancy.title}
                  sx={{
                    scrollSnapAlign: { xs: 'start', md: 'none' },
                    flexShrink: 0,
                  }}
                >
                  <VacancyHighlightCard {...vacancy} />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Lista de vagas */}
          <Box
            sx={{
              borderRadius: 3,
              boxShadow: '0px 2px 8px rgba(44,39,56,0.02)',
              width: '100%',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" pb={3}>
              <Typography component="h2" fontSize={18} fontWeight={600} fontFamily="'Sora', sans-serif">
                Todas as vagas
              </Typography>
              <Typography fontSize={14} color="#888" fontWeight={400}>
                {mockVacancies.length} vagas disponíveis
              </Typography>
            </Box>

            <VacancyListSection
              onVacancySelect={handleVacancySelect}
              selectedVacancyId={selectedVacancyId}
              vacancies={paginatedVacancies}
            />

            <Box pb={3} display="flex" justifyContent="center">
              <Pagination
                currentPage={paginaAtual}
                totalPages={totalVacancyPages}
                onPageChange={setPaginaAtual}
              />
            </Box>
          </Box>
        </Box>

        {/* Detalhes - Desktop */}
        {!isMobile && (
          <Box
            sx={{
              flex: '1 1 420px',
              maxWidth: 420,
              width: '100%',
              alignSelf: 'flex-start',
              bgcolor: '#fff',
              borderRadius: 3,
            }}
          >
            <VacancyDetailsSection vacancy={selectedVacancy!} />
          </Box>
        )}
      </Box>
    </Container>

      {/* FAB Filtros - Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Abrir filtros"
          sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1000 }}
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FilterListIcon />
        </Fab>
      )}

      {/* FAB Detalhes - Mobile */}
      {isMobile && selectedVacancyId && (
        <Fab
          color="primary"
          aria-label="Ver detalhes da vaga"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          onClick={() => setMobileDetailsOpen(true)}
        >
          <VisibilityIcon />
        </Fab>
      )}

      {/* Drawer de filtros - Mobile */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 320 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between'}}>
          <IconButton onClick={() => setMobileFiltersOpen(false)} aria-label="Fechar filtros">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <FiltersSection onFiltroChange={() => {}} />
        </Box>
      </Drawer>

      {/* Drawer de detalhes - Mobile */}
      <Drawer
        anchor="right"
        open={mobileDetailsOpen}
        onClose={() => setMobileDetailsOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="h3" fontSize={18} fontWeight={600} m={0}>
            Detalhes da Vaga
          </Typography>
          <IconButton onClick={() => setMobileDetailsOpen(false)} aria-label="Fechar detalhes">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <VacancyDetailsSection vacancy={selectedVacancy!} />
        </Box>
      </Drawer>
    </Box>
  );
}