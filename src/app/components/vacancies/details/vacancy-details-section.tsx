'use client';

import { Box, Typography, Stack, Chip, Divider, Button } from '@mui/material';

export interface Vacancy {
  title: string;
  location?: string;
  contractType?: string;
  level?: string;
  badge?: string;
  description?: string;
}

interface VacancyDetailsSectionProps {
  vacancy: Vacancy;
}

export default function VacancyDetailsSection({
  vacancy,
}: VacancyDetailsSectionProps) {
  const hasVacancy = Boolean(vacancy?.title);

  return (
    <Box
      component="aside"
      role="complementary"
      aria-label="Detalhes da vaga selecionada"
      sx={{
        width: '100%',
        bgcolor: '#FEFEFE',
        borderRadius: '16px',
        p: { xs: 3, md: 4 },
        boxShadow: '0px 4px 24px 0px rgba(0,0,0,0.04)',
        minHeight: { lg: 400 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        position: { lg: 'sticky' },
        top: { lg: 24 },
      }}
    >
      {/* Título */}
      <Typography
        component="h3"
        fontFamily="'Sora', sans-serif"
        fontWeight={600}
        fontSize={24}
        color="#292929"
        sx={{ textAlign: hasVacancy ? 'left' : 'center' }}
      >
        {hasVacancy ? vacancy.title : 'Visualizar a vaga aqui'}
      </Typography>

      {/* Sem vaga selecionada */}
      {!hasVacancy ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Typography
            fontFamily="'Sora', sans-serif"
            fontSize={16}
            color="#A9A9A9"
            textAlign="center"
          >
            Selecione uma vaga da lista<br />
            para visualizar os detalhes completos aqui.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Chips */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent="flex-start"
          >
            {vacancy.location && <Chip label={vacancy.location} sx={chipStyle} />}
            {vacancy.contractType && <Chip label={vacancy.contractType} sx={chipStyle} />}
            {vacancy.level && <Chip label={vacancy.level} sx={chipStyle} />}
            {vacancy.badge && <Chip label={vacancy.badge} sx={chipStyle} />}
          </Stack>

          {/* Descrição */}
          <Divider />
          <Typography
            fontFamily="'Sora', sans-serif"
            fontSize={16}
            color="#4B4B4B"
            fontWeight={400}
            lineHeight={1.6}
            sx={{ mb: 2 }}
          >
            {vacancy.description}
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
              fontWeight: 500,
              borderRadius: '8px',
              padding: '14px',
              textTransform: 'none',
              boxShadow: 'none',
              mt: 'auto',
              '&:hover': { bgcolor: '#6e57ff' },
            }}
            aria-label={`Candidatar-se para a vaga de ${vacancy.title}`}
          >
            Candidatar-se
          </Button>
        </>
      )}
    </Box>
  );
}

const chipStyle = {
  bgcolor: '#F2F2F2',
  color: '#4B4B4B',
  fontFamily: "'Sora', sans-serif",
  fontWeight: 600,
  fontSize: 14,
  borderRadius: '16px',
  height: 32,
  px: 2,
};
