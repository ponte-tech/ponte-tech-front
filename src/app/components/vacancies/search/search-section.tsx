'use client';

import { Box, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

type SearchSectionProps = {
  onSearch?: (value: string) => void;
};

const SEARCH_PLACEHOLDER = 'Digite aqui...';

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <Box
      component="form"
      role="search"
      aria-label="Buscar vagas"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: 832,
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
      }}
    >
      <TextField
        fullWidth
        placeholder={SEARCH_PLACEHOLDER}
        size="medium"
        variant="outlined"
        value={value}
        onChange={e => setValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  color: '#808080',
                  fontSize: 16,
                }}
              />
            </InputAdornment>
          ),
          sx: {
            bgcolor: '#FEFEFE',
            borderRadius: '8px',
            height: 48,
            padding: '0 16px',
            fontFamily: "'Sora', sans-serif",
            fontSize: 14,
            color: '#808080',
            boxShadow: 'none',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E9E9E9',
              borderWidth: '1px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#C7C7C7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8270FF',
              borderWidth: 2,
            },
          },
        }}
        inputProps={{
          sx: {
            fontFamily: "'Sora', sans-serif",
            fontSize: 14,
            color: '#808080',
            padding: 0,
            height: 48,
          },
        }}
        sx={{
          '.MuiInputBase-root': {
            bgcolor: '#FEFEFE',
            borderRadius: '8px',
            height: 48,
            fontFamily: "'Sora', sans-serif",
          },
          '.MuiInputBase-input::placeholder': {
            color: '#808080',
            opacity: 1,
            fontFamily: "'Sora', sans-serif",
            fontSize: 14,
          },
        }}
        aria-label="Campo de busca de vagas"
      />
    </Box>
  );
}
