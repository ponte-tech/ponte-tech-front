'use client';

import { Stack } from '@mui/material';
import VacancyCard, { Vacancy } from './vacancy-card';
import { useState, useEffect } from 'react';

interface VacancyListSectionProps {
  vacancies: Vacancy[];
  onVacancySelect?: (vacancyId: number) => void;
  selectedVacancyId?: number;
}

export default function VacancyListSection({ 
  vacancies,
  onVacancySelect,
  selectedVacancyId 
}: VacancyListSectionProps) {
  const [selectedId, setSelectedId] = useState<number | undefined>(selectedVacancyId);

  useEffect(() => {
    setSelectedId(selectedVacancyId);
  }, [selectedVacancyId]);

  const handleVacancySelect = (vacancyId: number) => {
    setSelectedId(vacancyId);
    onVacancySelect?.(vacancyId);
  };

  return (
    <Stack 
      component="section"
      aria-label="Lista de vagas disponíveis"
      spacing={{ xs: 1.5, md: 2 }}
    >
      {vacancies.map((vacancy) => (
        <VacancyCard
          key={vacancy.id}
          {...vacancy}
          isSelected={selectedId === vacancy.id}
          onSelect={() => handleVacancySelect(vacancy.id)}
        />
      ))}
    </Stack>
  );
}
