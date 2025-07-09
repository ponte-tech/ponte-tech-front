'use client';

import { Box, Typography, Stack, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';

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
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        cursor: 'pointer',
        border: isSelected ? '2px solid #8270FF' : '2px solid transparent',
        outline: 'none',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 8px 32px 0 rgba(130,112,255,0.08)',
        },
        '&:focus': {
          outline: '2px solid #8270FF',
        },
        minWidth: 320,
      }}
    >
      {/* HEADER */}
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
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
          fontSize={22}
          color="#232323"
          sx={{ lineHeight: 1.1 }}
        >
          {title}
        </Typography>
      </Stack>
           {/* DESCRIÇÃO */}
      <Typography
        fontFamily="'Sora', sans-serif"
        color="#232323"
        fontSize={16}
        lineHeight={1.35}
        sx={{
          mb: 1.2,
          maxWidth: '98%',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </Typography>

      {/* INFOS */}
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
