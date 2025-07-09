'use client';

import { Box, Typography, Stack, Chip, Divider, Button } from '@mui/material';
import { Vacancy } from '../list/vacancy-card';

interface VacancyDetailsSectionProps {
  vacancy?: Vacancy;
}

export default function VacancyDetailsSection({
  vacancy
}: VacancyDetailsSectionProps) {
  const hasVacancy = Boolean(vacancy && vacancy.title);

  return (
    <Box
      component="aside"
      role="complementary"
      aria-label="Detalhes da vaga selecionada"
      sx={{
        width: '100%',
        bgcolor: '#FEFEFE',
        borderRadius: '16px',
        p: { xs: 2, md: '32px 24px' },
        boxShadow: '0px 4px 24px 0px rgba(0,0,0,0.04)',
        minHeight: { lg: 400 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: { lg: 'sticky' },
        top: { lg: 24 },
      }}
    >
      {/* Título da Vaga */}
      <Typography
        component="h3"
        fontFamily="'Sora', sans-serif"
        fontWeight={600}
        fontSize={28}
        color="#292929"
        mb={2}
        sx={{ textAlign: hasVacancy ? 'left' : 'center', minHeight: 36 }}
      >
        {hasVacancy ? vacancy?.title : 'Visualizar a vaga aqui'}
      </Typography>

      {/* Se nenhuma vaga selecionada */}
      {!hasVacancy ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Typography
            fontFamily="'Sora', sans-serif"
            fontSize={18}
            color="#A9A9A9"
            textAlign="center"
          >
            Selecione uma vaga da lista<br />
            para visualizar os detalhes completos aqui.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Chips/Info */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={2}>
            {vacancy?.location && (
              <Chip
                label={vacancy.location}
                sx={{
                  bgcolor: '#F2F2F2',
                  color: '#4B4B4B',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: '16px',
                  height: 32,
                  px: 2,
                }}
              />
            )}
            {vacancy?.contractType && (
              <Chip
                label={vacancy.contractType}
                sx={{
                  bgcolor: '#F2F2F2',
                  color: '#4B4B4B',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: '16px',
                  height: 32,
                  px: 2,
                }}
              />
            )}
            {vacancy?.level && (
              <Chip
                label={vacancy.level}
                sx={{
                  bgcolor: '#F2F2F2',
                  color: '#4B4B4B',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: '16px',
                  height: 32,
                  px: 2,
                }}
              />
            )}
            {vacancy?.badge && (
              <Chip
                label={vacancy.badge}
                sx={{
                  bgcolor: '#F2F2F2',
                  color: '#4B4B4B',
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: '16px',
                  height: 32,
                  px: 2,
                }}
              />
            )}
          </Stack>

          {/* Descrição */}
          <Divider sx={{ my: 2 }} />
          <Typography
            fontFamily="'Sora', sans-serif"
            fontSize={18}
            color="#4B4B4B"
            fontWeight={400}
            lineHeight={1.5}
            sx={{ mb: 2 }}
          >
            {vacancy?.description}
          </Typography>

          {/* Botão */}
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#8270FF',
              color: '#FEFEFE',
              fontFamily: "'Sora', sans-serif",
              fontSize: 16,
              fontWeight: 400,
              borderRadius: '4px',
              padding: '14px 32px',
              textTransform: 'none',
              boxShadow: 'none',
              mt: 'auto',
              '&:hover': { bgcolor: '#6e57ff' },
            }}
            aria-label={`Candidatar-se para a vaga de ${vacancy?.title}`}
          >
            Candidatar-se
          </Button>
        </>
      )}
    </Box>
  );
}
