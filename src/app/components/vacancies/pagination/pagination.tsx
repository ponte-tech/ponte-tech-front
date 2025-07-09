'use client';

import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPaginationArray(current: number, total: number) {
  const delta = 2; // Quantas páginas antes/depois mostrar
  const range: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  let pages: (number | string)[] = [];
  let last: number | undefined;
  for (let i of range) {
    if (last && typeof i === 'number' && typeof last === 'number') {
      if (i - last === 2) {
        pages.push(last + 1);
      } else if (i - last > 2) {
        pages.push('...');
      }
    }
    pages.push(i);
    last = i as number;
  }
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = getPaginationArray(currentPage, totalPages);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ gap: 1 }}
    >
      <IconButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        sx={{
          color: '#8C6EFF',
          '&:disabled': { color: '#E0E0E0' },
        }}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon fontSize="medium" />
      </IconButton>
      {pages.map((item, idx) =>
        item === '...' ? (
          <Typography key={`dots-${idx}`} color="#AAA" fontWeight={400} fontSize={14} mx={0.5}>
            ...
          </Typography>
        ) : (
          <Box
            key={item}
            component="button"
            type="button"
            onClick={() => typeof item === 'number' && onPageChange(item)}
            disabled={currentPage === item}
            sx={{
              all: 'unset',
              cursor: currentPage === item ? 'default' : 'pointer',
              color: currentPage === item ? '#222' : '#757575',
              fontWeight: currentPage === item ? 700 : 400,
              fontSize: 14,
              px: 0.5,
              transition: 'color 0.2s',
              '&:hover': {
                color: currentPage === item ? '#222' : '#8C6EFF',
                textDecoration: currentPage === item ? 'none' : 'underline',
              },
            }}
            aria-current={currentPage === item ? 'page' : undefined}
            aria-label={`Página ${item}`}
            tabIndex={currentPage === item ? -1 : 0}
          >
            {item}
          </Box>
        )
      )}
      <IconButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        sx={{
          color: '#8C6EFF',
          '&:disabled': { color: '#E0E0E0' },
        }}
        aria-label="Próxima página"
      >
        <ChevronRightIcon fontSize="medium" />
      </IconButton>
    </Box>
  );
}
