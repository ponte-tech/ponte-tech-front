'use client';

import { Box, Typography, Stack, Chip } from '@mui/material';

export interface Vacancy {
  id: number;
  title: string;
  description: string;
  location: string;
  level: string;
  salary?: string;
  contractType?: string;
  publishedDate?: string;
  badge?: string;
  category?: string; 
}

export interface VacancyCardProps extends Vacancy {
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function VacancyCard({
  title,
  location,
  level,
  salary,
  description,
  contractType,
  badge,
  onSelect,
  isSelected = false,
}: VacancyCardProps) {
  return (
    <Box
      component="article"
      tabIndex={0}
      aria-label={`Vaga: ${title}`}
      aria-pressed={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: '#FFF',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          cursor: 'pointer',
          transition: 'box-shadow 0.18s',
          '&:hover': {
          boxShadow: '0 8px 32px 0 rgba(43, 43, 43, 0.08)',
        },
          border: isSelected ? '2px solid #8270FF' : '2px solid transparent',
          outline: 'none',
            
          
        }}
    >
      {/* HEADER */}
      <Stack direction="row" spacing={1} alignItems="center" >
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
        <Typography
          fontFamily="'Sora', sans-serif"
          fontWeight={600}
          fontSize={20}
          color="#232323"
          sx={{ lineHeight: 1.1 }}
        >
          {title}
        </Typography>
      </Stack>
           {/* Descrição */}
      <Typography
        fontFamily="'Sora', sans-serif"
        color="#232323"
        fontSize={16}
        lineHeight={1.1}
        sx={{
          mb: 1.2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </Typography>

      {/* Infos */}
      <Stack direction="row" spacing={2.5} flexWrap="wrap" alignItems="center">
        <Stack direction="row" spacing={0.8} alignItems="center">
          <img
          src="./svg/location.svg"
          alt=""
          style={{
            width: 18,
            height: 18,
            objectFit: 'contain',
          }}
          aria-hidden="true"
        />
          <Typography variant="body2" color="#575757" fontSize={15} fontFamily="'Sora', sans-serif">
            {location}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <img
          src="./svg/user.svg"
          alt=""
          style={{
            width: 18,
            height: 18,
            objectFit: 'contain',
          }}
          aria-hidden="true"
        />
          <Typography variant="body2" color="#575757" fontSize={15} fontFamily="'Sora', sans-serif">
            {level}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <img
          src="./svg/currency-dollar.svg"
          alt=""
          style={{
            width: 20,
            height: 20,
            objectFit: 'contain',
          }}
          aria-hidden="true"
        />
          <Typography variant="body2" color="#575757" fontSize={15} fontFamily="'Sora', sans-serif">
            {salary}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <img
          src="./svg/briefcase.svg"
          alt=""
          style={{
            width: 18,
            height: 18,
            objectFit: 'contain',
          }}
          aria-hidden="true"
        />
          <Typography variant="body2" color="#575757" fontSize={15} fontFamily="'Sora', sans-serif">
            {contractType}
          </Typography>
        </Stack>
      </Stack>

      {/* Footer */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1.5}>
        <Chip
          label={badge}
          size="small"
          sx={{
            fontSize: 15,
            height: 28,
            bgcolor: '#F2F2F2',
            color: '#575757',
            borderRadius: '14px',
            px: 2,
            fontWeight: 500,
            boxShadow: 'none',
          }}
        />
      </Stack>
    </Box>
  );
}
