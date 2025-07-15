'use client';

import { Stack } from '@mui/material';
import VacancyCard, { Vacancy } from './vacancy-card';

interface VacancyListSectionProps {
  vacancies: Vacancy[];
  onVacancySelect?: (vacancyId?: number) => void;
  selectedVacancyId?: number;
}

export default function VacancyListSection({
  vacancies,
  onVacancySelect,
  selectedVacancyId,
}: VacancyListSectionProps) {
  const handleVacancySelect = (vacancyId: number) => {
    if (selectedVacancyId === vacancyId) {
      onVacancySelect?.(undefined); 
    } else {
      onVacancySelect?.(vacancyId);
    }
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
          isSelected={selectedVacancyId === vacancy.id}
          onSelect={() => handleVacancySelect(vacancy.id)}
        />
      ))}
    </Stack>
  );
}
