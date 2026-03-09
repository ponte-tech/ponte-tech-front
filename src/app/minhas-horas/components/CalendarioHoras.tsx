'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  useTheme,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { EventClickArg, DateClickArg, DatesSetArg } from '@fullcalendar/core';
import type { DiaCalendario } from '@/app/types/timesheet';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

interface CalendarioHorasProps {
  dias: DiaCalendario[];
  mesAtual: string; // YYYY-MM
  onMesChange: (novoMes: string) => void;
  onDiaClick: (data: string) => void;
}

export default function CalendarioHoras({
  dias,
  mesAtual,
  onMesChange,
  onDiaClick,
}: CalendarioHorasProps) {
  const theme = useTheme();

  // Paleta de cores para clientes
  const clienteColors = [
    { bg: '#4CAF50', border: '#388E3C', text: '#FFFFFF' }, // Verde
    { bg: '#2196F3', border: '#1976D2', text: '#FFFFFF' }, // Azul
    { bg: '#FF9800', border: '#F57C00', text: '#FFFFFF' }, // Laranja
    { bg: '#9C27B0', border: '#7B1FA2', text: '#FFFFFF' }, // Roxo
    { bg: '#00BCD4', border: '#0097A7', text: '#FFFFFF' }, // Ciano
    { bg: '#FF5722', border: '#E64A19', text: '#FFFFFF' }, // Vermelho
    { bg: '#795548', border: '#5D4037', text: '#FFFFFF' }, // Marrom
    { bg: '#607D8B', border: '#455A64', text: '#FFFFFF' }, // Cinza azulado
    { bg: '#E91E63', border: '#C2185B', text: '#FFFFFF' }, // Rosa
    { bg: '#CDDC39', border: '#AFB42B', text: '#000000' }, // Lima
  ];

  // Função para gerar cor consistente baseada no nome do cliente
  const getClienteColor = (nomeCliente: string) => {
    let hash = 0;
    for (let i = 0; i < nomeCliente.length; i++) {
      hash = nomeCliente.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % clienteColors.length;
    return clienteColors[index];
  };

  // Converter dias do backend para eventos do FullCalendar e coletar clientes únicos
  const { eventos, clientesUnicos } = useMemo(() => {
    const eventosArray: any[] = [];
    const clientesSet = new Set<string>();

    dias.forEach((dia) => {
      // Adicionar eventos de feriados
      if (dia.e_feriado) {
        eventosArray.push({
          id: `feriado-${dia.data}`,
          title: dia.nome_feriado || 'Feriado',
          start: dia.data,
          allDay: true,
          backgroundColor: theme.palette.error.light,
          borderColor: theme.palette.error.main,
          textColor: theme.palette.error.contrastText,
          extendedProps: {
            tipo: 'feriado',
            data: dia.data,
          },
        });
      }

      // Adicionar eventos de lançamentos
      if (dia.lancamentos && dia.lancamentos.length > 0) {
        dia.lancamentos.forEach((lanc, idx) => {
          const totalHoras = lanc.duracao_horas_ajustada;
          const clienteColor = getClienteColor(lanc.nome_cliente);
          clientesSet.add(lanc.nome_cliente);

          eventosArray.push({
            id: `lanc-${dia.data}-${idx}`,
            title: `${lanc.nome_cliente} - ${totalHoras.toFixed(2)}h`,
            start: dia.data,
            allDay: true,
            backgroundColor: clienteColor.bg,
            borderColor: clienteColor.border,
            textColor: clienteColor.text,
            extendedProps: {
              tipo: 'lancamento',
              data: dia.data,
              cliente: lanc.nome_cliente,
              horas: totalHoras,
            },
          });
        });
      }
    });

    return {
      eventos: eventosArray,
      clientesUnicos: Array.from(clientesSet).sort(),
    };
  }, [dias, theme]);

  // Handler de clique em evento
  const handleEventClick = (info: EventClickArg) => {
    const data = info.event.extendedProps.data;
    if (data) {
      onDiaClick(data);
    }
  };

  // Handler de clique em data vazia
  const handleDateClick = (info: DateClickArg) => {
    onDiaClick(info.dateStr);
  };

  // Handler de mudança de mês/visualização
  const handleDatesSet = (info: DatesSetArg) => {
    const dataInicio = info.start;
    const novoMes = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}`;

    // Só atualizar se realmente mudou o mês
    if (novoMes !== mesAtual) {
      onMesChange(novoMes);
    }
  };

  // Função para renderizar conteúdo da célula do dia
  const dayCellContent = (arg: any) => {
    const dia = dias.find(d => d.data === arg.date.toISOString().split('T')[0]);
    const totalHoras = dia?.lancamentos?.reduce(
      (sum, l) => sum + l.duracao_horas_ajustada,
      0
    ) || 0;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          height: '100%',
          p: 0.5,
        }}
      >
        <Box
          sx={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: arg.isToday ? theme.palette.primary.main : 'inherit',
          }}
        >
          {arg.dayNumberText}
        </Box>
        {totalHoras > 0 && (
          <Box
            sx={{
              fontSize: '0.75rem',
              color: theme.palette.success.main,
              fontWeight: 'medium',
            }}
          >
            {totalHoras.toFixed(2)}h
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        {/* FullCalendar */}
        <Box sx={{
          '& .fc': {
            fontFamily: theme.typography.fontFamily,
          },
          '& .fc-button': {
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              borderColor: theme.palette.primary.dark,
            },
            '&:focus': {
              boxShadow: 'none',
            },
          },
          '& .fc-button-active': {
            backgroundColor: theme.palette.primary.dark,
            borderColor: theme.palette.primary.dark,
          },
          '& .fc-daygrid-day': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
          '& .fc-daygrid-day.fc-day-today': {
            backgroundColor: `${theme.palette.primary.light}20`,
          },
          '& .fc-col-header-cell': {
            backgroundColor: theme.palette.grey[100],
            fontWeight: 'bold',
          },
          '& .fc-event': {
            cursor: 'pointer',
            fontSize: '0.85rem',
            padding: '2px 4px',
            borderRadius: '4px',
            marginBottom: '2px',
          },
          '& .fc-daygrid-day-number': {
            padding: '4px',
          },
          '& .fc-day-sat, & .fc-day-sun': {
            backgroundColor: theme.palette.grey[200],
          },
        }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek',
            }}
            locale={ptBrLocale}
            events={eventos}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            dayCellContent={dayCellContent}
            height="auto"
            contentHeight="auto"
            aspectRatio={1.8}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            eventDisplay="block"
            displayEventTime={false}
            weekends={true}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              list: 'Lista',
            }}
          />
        </Box>

        {/* Legenda */}
        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          {/* Feriados */}
          <Chip
            label="Feriado"
            size="small"
            sx={{
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
            }}
          />

          {/* Clientes */}
          {clientesUnicos.map((cliente) => {
            const color = getClienteColor(cliente);
            return (
              <Chip
                key={cliente}
                label={cliente}
                size="small"
                sx={{
                  bgcolor: color.bg,
                  color: color.text,
                  borderColor: color.border,
                  border: '1px solid',
                }}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
