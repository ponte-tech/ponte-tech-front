'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import {
  generateId,
  keyboardNavigation,
  ariaUtils,
  focusUtils,
  screenReaderUtils,
} from '../../utils/accessibility-helpers';

interface AccessibleVacancyCardProps {
  id: string;
  title: string;
  description: string;
  company: string;
  workMode: string;
  level: string;
  salary: string;
  contractType: string;
  publishedDate: string;
  badge?: string;
  onSelect?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  isSelected?: boolean;
  isBookmarked?: boolean;
  tabIndex?: number;
}

export default function AccessibleVacancyCard({
  title,
  description,
  company,
  workMode,
  level,
  salary,
  contractType,
  publishedDate,
  badge,
  onSelect,
  onBookmark,
  onShare,
  isSelected = false,
  isBookmarked = false,
  tabIndex = 0,
}: AccessibleVacancyCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = generateId('vacancy-title');
  const descriptionId = generateId('vacancy-description');
  const detailsId = generateId('vacancy-details');

  // Gera ARIA label descritivo
  const ariaLabel = ariaUtils.getVacancyCardLabel(title, company, workMode);

  // Manipula clique e navegação por teclado
  const handleActivation = () => {
    onSelect?.();
    screenReaderUtils.announce(`Vaga selecionada: ${title}`);
  };

  const handleBookmarkToggle = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    onBookmark?.();
    const action = isBookmarked ? 'removida dos' : 'adicionada aos';
    screenReaderUtils.announce(`Vaga ${action} favoritos`);
  };

  const handleShare = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    onShare?.();
    screenReaderUtils.announce('Opções de compartilhamento abertas');
  };

  // Efeito para gerenciar foco
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  return (
    <Box
      ref={cardRef}
      component="article"
      role="button"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-describedby={`${descriptionId} ${detailsId}`}
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        position: 'relative',
        ...focusUtils.interactiveFocusStyles,
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-1px)',
        },
      }}
      onClick={handleActivation}
      onKeyDown={(e) => keyboardNavigation.handleKeyDown(e, handleActivation)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/* Indicador visual para leitores de tela */}
      {isSelected && (
        <Box
          sx={{
            ...screenReaderUtils.srOnlyClass,
          }}
          aria-live="polite"
        >
          Vaga selecionada
        </Box>
      )}

      {/* Header com ícone, título e ações */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <CodeIcon 
            sx={{ 
              fontSize: 20, 
              color: 'primary.main' 
            }} 
          />
        </Box>
        
        <Box flex={1}>
          <Typography 
            id={titleId}
            variant="h6" 
            component="h3"
            fontWeight={600}
            fontSize={{ xs: 16, md: 18 }}
            lineHeight={1.3}
            mb={0.5}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            fontSize={{ xs: 13, md: 14 }}
          >
            {company}
          </Typography>
        </Box>

        {/* Ações da vaga */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={isBookmarked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
            <IconButton
              size="small"
              aria-label={isBookmarked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={handleBookmarkToggle}
              onKeyDown={(e) => keyboardNavigation.handleKeyDown(e, () => handleBookmarkToggle(e))}
              sx={{
                color: isBookmarked ? 'primary.main' : 'text.secondary',
                ...focusUtils.interactiveFocusStyles,
              }}
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Compartilhar vaga">
            <IconButton
              size="small"
              aria-label="Compartilhar vaga"
              onClick={handleShare}
              onKeyDown={(e) => keyboardNavigation.handleKeyDown(e, () => handleShare(e))}
              sx={{
                color: 'text.secondary',
                ...focusUtils.interactiveFocusStyles,
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Descrição */}
      <Typography 
        id={descriptionId}
        variant="body2" 
        color="text.secondary"
        fontSize={{ xs: 13, md: 14 }}
        lineHeight={1.4}
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </Typography>

      {/* Informações da vaga */}
      <Stack 
        id={detailsId}
        direction="row" 
        spacing={2} 
        flexWrap="wrap" 
        gap={1}
        role="list"
        aria-label="Detalhes da vaga"
      >
        <Stack 
          direction="row" 
          spacing={0.5} 
          alignItems="center"
          role="listitem"
        >
          <LocationOnIcon 
            sx={{ fontSize: 16, color: 'text.secondary' }} 
            aria-hidden="true"
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            fontSize={{ xs: 12, md: 13 }}
          >
            <Box component="span" sx={screenReaderUtils.srOnlyClass}>
              Modalidade:
            </Box>
            {workMode}
          </Typography>
        </Stack>

        <Stack 
          direction="row" 
          spacing={0.5} 
          alignItems="center"
          role="listitem"
        >
          <PersonIcon 
            sx={{ fontSize: 16, color: 'text.secondary' }} 
            aria-hidden="true"
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            fontSize={{ xs: 12, md: 13 }}
          >
            <Box component="span" sx={screenReaderUtils.srOnlyClass}>
              Nível:
            </Box>
            {level}
          </Typography>
        </Stack>

        <Stack 
          direction="row" 
          spacing={0.5} 
          alignItems="center"
          role="listitem"
        >
          <AttachMoneyIcon 
            sx={{ fontSize: 16, color: 'text.secondary' }} 
            aria-hidden="true"
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            fontSize={{ xs: 12, md: 13 }}
          >
            <Box component="span" sx={screenReaderUtils.srOnlyClass}>
              Salário:
            </Box>
            {salary}
          </Typography>
        </Stack>

        <Stack 
          direction="row" 
          spacing={0.5} 
          alignItems="center"
          role="listitem"
        >
          <WorkIcon 
            sx={{ fontSize: 16, color: 'text.secondary' }} 
            aria-hidden="true"
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            fontSize={{ xs: 12, md: 13 }}
          >
            <Box component="span" sx={screenReaderUtils.srOnlyClass}>
              Contrato:
            </Box>
            {contractType}
          </Typography>
        </Stack>
      </Stack>

      {/* Footer com badge e data */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        mt={1}
      >
        {badge && (
          <Chip 
            label={badge}
            size="small"
            aria-label={`Categoria: ${badge}`}
            sx={{
              fontSize: { xs: 11, md: 12 },
              height: 24,
              bgcolor: '#f3f4f6',
              color: 'text.primary',
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        )}
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          fontSize={{ xs: 11, md: 12 }}
          aria-label={`Data de publicação: ${publishedDate}`}
        >
          {publishedDate}
        </Typography>
      </Stack>

      {/* Região live para anúncios dinâmicos */}
      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={screenReaderUtils.srOnlyClass}
      >
        {/* Conteúdo será atualizado dinamicamente via JavaScript */}
      </Box>
    </Box>
  );
}

