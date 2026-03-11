'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
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

  // Paleta de cores moderna para clientes (gradientes e cores vibrantes)
  const clienteColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#667eea', text: '#FFFFFF', solid: '#667eea' }, // Roxo/Azul
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: '#f093fb', text: '#FFFFFF', solid: '#f093fb' }, // Rosa
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: '#4facfe', text: '#FFFFFF', solid: '#4facfe' }, // Azul Ciano
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', border: '#43e97b', text: '#FFFFFF', solid: '#43e97b' }, // Verde
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', border: '#fa709a', text: '#FFFFFF', solid: '#fa709a' }, // Pêssego
    { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', border: '#30cfd0', text: '#FFFFFF', solid: '#30cfd0' }, // Azul Escuro
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', border: '#a8edea', text: '#333333', solid: '#a8edea' }, // Pastel
    { bg: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', border: '#ff9a56', text: '#FFFFFF', solid: '#ff9a56' }, // Laranja/Rosa
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', border: '#ffecd2', text: '#333333', solid: '#ffecd2' }, // Pêssego Claro
    { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', border: '#a1c4fd', text: '#333333', solid: '#a1c4fd' }, // Azul Claro
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
          title: `🎉 ${dia.nome_feriado || 'Feriado'}`,
          start: dia.data,
          allDay: true,
          backgroundColor: '#ff6b6b',
          borderColor: '#ff6b6b',
          textColor: '#FFFFFF',
          extendedProps: {
            tipo: 'feriado',
            data: dia.data,
            gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
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
            title: `${lanc.nome_cliente} • ${totalHoras.toFixed(2)}h`,
            start: dia.data,
            allDay: true,
            backgroundColor: clienteColor.solid,
            borderColor: clienteColor.border,
            textColor: clienteColor.text,
            extendedProps: {
              tipo: 'lancamento',
              data: dia.data,
              cliente: lanc.nome_cliente,
              horas: totalHoras,
              gradient: clienteColor.bg,
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
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 1,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            fontSize: arg.isToday ? '1.1rem' : '0.95rem',
            fontWeight: arg.isToday ? 700 : 600,
            color: arg.isToday ? '#8270FF' : 'inherit',
            background: arg.isToday ? 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)' : 'transparent',
            WebkitBackgroundClip: arg.isToday ? 'text' : 'unset',
            WebkitTextFillColor: arg.isToday ? 'transparent' : 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          {arg.dayNumberText}
        </Box>
        {totalHoras > 0 && (
          <Box
            sx={{
              fontSize: '0.7rem',
              color: '#FFFFFF',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              px: 1,
              py: 0.25,
              borderRadius: '12px',
              mt: 0.5,
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
            }}
          >
            {totalHoras.toFixed(1)}h
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid',
        borderColor: alpha('#8270FF', 0.1),
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* FullCalendar */}
        <Box sx={{
          '& .fc': {
            fontFamily: theme.typography.fontFamily,
            border: 'none',
          },
          '& .fc-toolbar': {
            mb: 3,
          },
          '& .fc-toolbar-title': {
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
          '& .fc-button': {
            background: 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)',
            border: 'none',
            textTransform: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            padding: '8px 16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(130, 112, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7059e5 0%, #9575e6 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(130, 112, 255, 0.4)',
            },
            '&:focus': {
              boxShadow: '0 0 0 3px rgba(130, 112, 255, 0.2)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              background: alpha('#8270FF', 0.3),
              opacity: 0.6,
            },
          },
          '& .fc-button-primary:not(:disabled).fc-button-active': {
            background: 'linear-gradient(135deg, #6850d4 0%, #8565d6 100%)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
          },
          '& .fc-daygrid-day': {
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: `1px solid ${alpha('#e5e7eb', 0.8)} !important`,
            '&:hover': {
              backgroundColor: alpha('#8270FF', 0.05),
              transform: 'scale(1.02)',
              zIndex: 1,
              boxShadow: '0 4px 12px rgba(130, 112, 255, 0.15)',
            },
          },
          '& .fc-daygrid-day.fc-day-today': {
            background: `linear-gradient(135deg, ${alpha('#8270FF', 0.08)} 0%, ${alpha('#a78bfa', 0.05)} 100%) !important`,
            border: `2px solid ${alpha('#8270FF', 0.3)} !important`,
            boxShadow: '0 2px 8px rgba(130, 112, 255, 0.2)',
          },
          '& .fc-col-header-cell': {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#6b7280',
            padding: '12px 8px',
            border: 'none !important',
          },
          '& .fc-event': {
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '8px',
            marginBottom: '3px',
            border: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              zIndex: 10,
            },
          },
          '& .fc-daygrid-event-harness': {
            marginTop: '2px',
          },
          '& .fc-daygrid-day-number': {
            padding: '8px',
            fontSize: '0.9rem',
          },
          '& .fc-day-sat, & .fc-day-sun': {
            backgroundColor: alpha('#f3f4f6', 0.5),
          },
          '& .fc-daygrid-day-frame': {
            minHeight: '90px',
            padding: '4px',
          },
          '& .fc-scrollgrid': {
            border: 'none !important',
            borderRadius: '12px',
            overflow: 'hidden',
          },
          '& .fc-scrollgrid-section-body > td': {
            border: 'none !important',
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
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: alpha('#e5e7eb', 0.8),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Feriados */}
            <Chip
              icon={<Box component="span">🎉</Box>}
              label="Feriado"
              size="medium"
              sx={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                border: 'none',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
                },
                '& .MuiChip-icon': {
                  fontSize: '1rem',
                  marginLeft: '8px',
                },
              }}
            />

            {/* Clientes */}
            {clientesUnicos.map((cliente) => {
              const color = getClienteColor(cliente);
              return (
                <Chip
                  key={cliente}
                  label={cliente}
                  size="medium"
                  sx={{
                    background: color.bg,
                    color: color.text,
                    fontWeight: 600,
                    border: 'none',
                    boxShadow: `0 2px 8px ${alpha(color.solid, 0.3)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(color.solid, 0.4)}`,
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
