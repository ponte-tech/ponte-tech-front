'use client';

import { Box, Typography, Stack, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

interface VacancyHighlightCardProps {
  title?: string;
  category?: string;
  location?: string;
  publishedDate?: string;
  onViewDetails?: () => void;
  id?: number;
}

export default function VacancyHighlightCard({
  title = "UX/UI design",
  category = "Design",
  location = "Remoto",
  publishedDate = "Publicado há 3 dias",
  onViewDetails,
  id = 1,
}: VacancyHighlightCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/vaga/${id}`);
    onViewDetails?.();
  };

  return (
    <Box
      component="article"
      sx={{
        bgcolor: '#FFF',
        borderRadius: 3,
        boxShadow: '0 2px 8px 0 rgba(44,39,56,0.02)',
        p: 2.5,
        width: 240,
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s',
        '&:hover': {
          boxShadow: '0 8px 32px 0 rgba(43, 43, 43, 0.08)',
        },
      }}
      tabIndex={0}
      onClick={handleViewDetails}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetails();
        }
      }}
      aria-label={`Vaga em destaque: ${title} - ${category}`}
      role="button"
    >
      {/* Ícone + título/categoria */}
      <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="./svg/code-icon.svg"
            alt=""
            style={{
              width: 56,
              height: 56,
              objectFit: 'contain',
            }}
            aria-hidden="true"
          />
        </Box>
        <Box>
          <Typography
            fontFamily="'Sora', sans-serif"
            fontWeight={600}
            fontSize={16}
            color="#222"
            lineHeight={1.2}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 120,
            }}
          >
            {title}
          </Typography>
          <Typography
            fontFamily="'Sora', sans-serif"
            fontWeight={400}
            fontSize={14}
            color="#888"
            sx={{ mt: 0.5 }}
          >
            {category}
          </Typography>
        </Box>
      </Stack>

      {/* Modalidade */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 0.5,
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        <img
          src="./svg/location.svg"
          alt=""
          style={{
            width: 16,
            height: 16,
            objectFit: 'contain',
          }}
          aria-hidden="true"
        />
        {location}
      </Box>

      {/* Publicação */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 0.5,
          fontFamily: "'Sora'",
          fontWeight: 300,
          fontSize: 13,
          color: '#888',
        }}
      >
        <img
          src="./svg/calendar.svg"
          alt=""
          style={{
            width: 16,
            height: 16,
            objectFit: 'contain',
          }}
          aria-hidden="true"
        />
        {publishedDate}
      </Box>

      {/* Ver detalhes */}
      <Button
        variant="text"
        sx={{
          fontFamily: "'Sora', sans-serif",
          textTransform: 'none',
          fontWeight: 400,
          fontSize: 14,
          color: '#7B61FF',
          pl: 0,
          pr: 0,
          mt: 0.5,
          minHeight: 'auto',
          '&:hover': {
            bgcolor: 'transparent',
            textDecoration: 'underline',
            color: '#7B61FF',
          },
        }}
        onClick={e => {
          e.stopPropagation();
          handleViewDetails();
        }}
      >
        Ver detalhes
      </Button>
    </Box>
  );
}
