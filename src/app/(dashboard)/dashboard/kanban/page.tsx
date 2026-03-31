"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
  Chip,
  Avatar,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Divider as MuiDivider,
  Badge,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import kanbanService from "@/app/services/kanbanService";
import clienteService from "@/app/services/clienteService";
import contratoService from "@/app/services/contratoService";
import colaboradoresService from "@/app/services/colaboradoresService";
import { Board, Column, Card } from "@/app/types/kanban";
import { Cliente, Contrato, Colaborador } from "@/app/types/api";
import KanbanColumn from "./components/KanbanColumn";
import KanbanCard from "./components/KanbanCard";
import CardModal from "./components/CardModal";
import ColumnModal from "./components/ColumnModal";
import BoardModal from "./components/BoardModal";
import FilterPopover from "./components/FilterPopover";
import DeleteDialog from "@/app/shared/components/DeleteDialog";
import ConfirmDialog from "@/app/shared/components/ConfirmDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

function KanbanPageContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);

  // Auto-scroll refs
  const boardContainerRef = React.useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Scroll arrows state
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingColumns, setLoadingColumns] = useState(false);

  // Modal states
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedColumnForCard, setSelectedColumnForCard] = useState<string>("");

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Column delete confirmation
  const [columnDeleteDialogOpen, setColumnDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingColumn, setDeletingColumn] = useState(false);

  // Board delete confirmation
  const [boardDeleteDialogOpen, setBoardDeleteDialogOpen] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState(false);

  // Due date alert states
  const [dueDateAlertOpen, setDueDateAlertOpen] = useState(false);
  const [dueTodayCards, setDueTodayCards] = useState<Card[]>([]);

  // Colaboradores overview modal
  const [colaboradoresOverviewOpen, setColaboradoresOverviewOpen] = useState(false);
  const [urgentTasksByColaborador, setUrgentTasksByColaborador] = useState<Array<{
    colaborador: any;
    tasks: Array<{
      card: Card;
      urgencyType: 'overdue' | 'today' | 'next_business_day';
    }>;
  }>>([]);

  // Drag state
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Drag sensors with maximum responsiveness
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1, // Almost instant drag activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // Minimal delay for touch
        tolerance: 2,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Almost instant
      },
    })
  );

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Filters
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [selectedContratos, setSelectedContratos] = useState<string[]>([]);
  const [selectedColaboradores, setSelectedColaboradores] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [peopleAnchorEl, setPeopleAnchorEl] = useState<HTMLElement | null>(null);

  // Auto-scroll handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = boardContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; // Mouse position relative to container
    const containerWidth = rect.width;
    const edgeThreshold = 150; // pixels from edge to trigger scroll
    const scrollSpeed = 20; // pixels per interval

    // Clear any existing interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    // Check if mouse is near right edge
    if (mouseX > containerWidth - edgeThreshold && mouseX < containerWidth) {
      const intensity = (mouseX - (containerWidth - edgeThreshold)) / edgeThreshold;
      const speed = Math.max(5, scrollSpeed * intensity);

      autoScrollIntervalRef.current = setInterval(() => {
        const currentContainer = boardContainerRef.current;
        if (!currentContainer) return;

        if (currentContainer.scrollLeft < currentContainer.scrollWidth - currentContainer.clientWidth) {
          currentContainer.scrollLeft += speed;
        } else {
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
        }
      }, 30);
    }
    // Check if mouse is near left edge
    else if (mouseX < edgeThreshold && mouseX > 0) {
      const intensity = (edgeThreshold - mouseX) / edgeThreshold;
      const speed = Math.max(5, scrollSpeed * intensity);

      autoScrollIntervalRef.current = setInterval(() => {
        const currentContainer = boardContainerRef.current;
        if (!currentContainer) return;

        if (currentContainer.scrollLeft > 0) {
          currentContainer.scrollLeft -= speed;
        } else {
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
        }
      }, 30);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = useCallback(() => {
    const container = boardContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll by click
  const handleScrollLeft = useCallback(() => {
    const container = boardContainerRef.current;
    if (!container) return;

    container.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(checkScrollPosition, 300);
  }, [checkScrollPosition]);

  const handleScrollRight = useCallback(() => {
    const container = boardContainerRef.current;
    if (!container) return;

    container.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(checkScrollPosition, 300);
  }, [checkScrollPosition]);

  // Check scroll position on scroll
  useEffect(() => {
    const container = boardContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    const handleScroll = () => {
      checkScrollPosition();
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScrollPosition, columns]);

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

  // Check authentication
  useEffect(() => {
    if (isAuthenticated && user && user.userType !== "admin" && user.userType !== "colaborador") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Load boards and clientes
  useEffect(() => {
    if (isAuthenticated && (user?.userType === "admin" || user?.userType === "colaborador")) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.userType]);

  // Load columns when board changes
  useEffect(() => {
    if (selectedBoardId) {
      loadBoardData(selectedBoardId);
    }
  }, [selectedBoardId]);

  // Abrir modal de card quando houver card_id na URL
  useEffect(() => {
    const cardId = searchParams.get('card');
    if (cardId && cards.length > 0) {
    // console.log('[SHARE DEBUG] Procurando card com ID:', cardId);
    // console.log('[SHARE DEBUG] Cards disponíveis:', cards.map(c => c.card_id));

      const card = cards.find(c => c.card_id === cardId);
      if (card) {
    // console.log('[SHARE DEBUG] Card encontrado:', card.title);
        setSelectedCard(card);
        setCardModalOpen(true);
        // Remover o parâmetro da URL sem recarregar a página
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else {
    // console.log('[SHARE DEBUG] Card NÃO encontrado');
      }
    }
  }, [searchParams, cards]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Always load boards (kanban API)
      const boardsRes = await kanbanService.listBoards();
      const boardsList = (boardsRes as any).data?.boards || boardsRes.boards || [];
      setBoards(boardsList);

      // Load clientes, contratos and colaboradores for all users (admin and colaborador)
      // These endpoints are now accessible by both profiles for kanban functionality
      const [clientesRes, contratosRes, colaboradoresRes] = await Promise.all([
        clienteService.list(),
        contratoService.list(),
        colaboradoresService.list(),
      ]);

      setClientes(clientesRes.clientes || []);
      setContratos(contratosRes.contratos || []);

      // Include ALL colaboradores (active and inactive) for history lookup
      const allColaboradores = colaboradoresRes.colaboradores || [];
      setColaboradores(allColaboradores);

      // Select first board if exists
      if (boardsList && boardsList.length > 0) {
        setSelectedBoardId(boardsList[0].board_id);
      } else {
        // Create default board
        const response = await kanbanService.createBoard({
          name: "Meu Board",
          description: "Board principal",
        });
        // Handle wrapped response
        const newBoard = (response as any).data || response;
        setBoards([newBoard]);
        setSelectedBoardId(newBoard.board_id);
      }
    } catch (error: any) {
    // console.error("Erro ao carregar dados iniciais:", error);
      setSnackbar({
        open: true,
        message: error.message || "Erro ao carregar dados",
        severity: "error",
      });
      setLoading(false); // Ensure loading is set to false on error
    } finally {
      setLoading(false);
    }
  };

  const loadBoardData = async (boardId: string) => {
    try {
      setLoadingColumns(true);
      const columnsRes = await kanbanService.listColumnsByBoard(boardId);

      // Handle wrapped response
      const columnsList = (columnsRes as any).data?.columns || columnsRes.columns || [];
      setColumns(columnsList);

      // Load cards for all columns
      const allCards: Card[] = [];
      for (const column of columnsList) {
        const cardsRes = await kanbanService.listCardsByColumn(column.column_id);
        const cardsList = (cardsRes as any).data?.cards || cardsRes.cards || [];
        allCards.push(...cardsList);
      }
      setCards(allCards);

      // Verificar se há parâmetro 'card' na URL (compartilhamento)
      const hasCardParam = searchParams.get('card');

      // Verificar tasks com vencimento hoje (passar columnsList ao invés de usar state)
      // NÃO mostrar alerta se houver link compartilhado na URL
      if (!hasCardParam) {
        checkDueTodayCards(allCards, columnsList);
      }

      // Calcular tarefas urgentes por colaborador
      calculateUrgentTasksByColaborador(allCards, columnsList);
    } catch (error: any) {
    // console.error("Erro ao carregar board:", error);
      setSnackbar({
        open: true,
        message: error.message || "Erro ao carregar board",
        severity: "error",
      });
      setLoadingColumns(false); // Ensure loading is set to false on error
    } finally {
      setLoadingColumns(false);
    }
  };

  const checkDueTodayCards = (cardsList: Card[], columnsList: Column[]) => {
    // Buscar o colaborador_id do usuário logado
    // O colaborador.id é igual ao user.id (ambos são o mesmo ID)
    const loggedColaborador = colaboradores.find((c: any) => c.id === user?.id);
    if (!loggedColaborador) {
      return;
    }
    const colaboradorId = loggedColaborador.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Calcular próximo dia útil (segunda-feira se hoje for sexta/sábado)
    const nextBusinessDay = new Date(today);
    const dayOfWeek = today.getDay(); // 0 = domingo, 5 = sexta, 6 = sábado
    if (dayOfWeek === 5) { // Sexta-feira
      nextBusinessDay.setDate(today.getDate() + 3); // Pular para segunda
    } else if (dayOfWeek === 6) { // Sábado
      nextBusinessDay.setDate(today.getDate() + 2); // Pular para segunda
    } else {
      nextBusinessDay.setDate(today.getDate() + 1); // Próximo dia
    }
    const nextBusinessDayStr = nextBusinessDay.toISOString().split('T')[0];

    // Identificar colunas finalizadas (por nome)
    const completedColumnNames = ['concluído', 'concluido', 'finalizado', 'done', 'completed', 'fechado'];
    const completedColumnIds = columnsList
      .filter(col =>
        completedColumnNames.some(name =>
          col.name.toLowerCase().includes(name)
        )
      )
      .map(col => col.column_id);

    const dueTodayList = cardsList.filter(card => {
      if (!card.delivery_date) return false;

      // Verificar se não está em coluna finalizada
      const isCompleted = completedColumnIds.includes(card.column_id);
      if (isCompleted) return false;

      // Verificar se o colaborador logado está atribuído à task
      if (!card.assigned_to || card.assigned_to.length === 0) return false;
      if (!card.assigned_to.includes(colaboradorId)) return false;

      // Verificar se está vencida OU vence hoje OU vence no próximo dia útil
      const isOverdue = card.delivery_date < todayStr; // Vencida
      const matchesToday = card.delivery_date === todayStr; // Vence hoje
      const matchesNextBusinessDay = card.delivery_date === nextBusinessDayStr; // Vence próximo dia útil

      return isOverdue || matchesToday || matchesNextBusinessDay;
    });

    if (dueTodayList.length > 0) {
      setDueTodayCards(dueTodayList);
      setDueDateAlertOpen(true);
    }
  };

  const calculateUrgentTasksByColaborador = (cardsList: Card[], columnsList: Column[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const nextBusinessDay = new Date(today);
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 5) {
      nextBusinessDay.setDate(today.getDate() + 3);
    } else if (dayOfWeek === 6) {
      nextBusinessDay.setDate(today.getDate() + 2);
    } else {
      nextBusinessDay.setDate(today.getDate() + 1);
    }
    const nextBusinessDayStr = nextBusinessDay.toISOString().split('T')[0];

    // console.log('[OVERVIEW DEBUG] Hoje:', todayStr);
    // console.log('[OVERVIEW DEBUG] Próximo dia útil:', nextBusinessDayStr);
    // console.log('[OVERVIEW DEBUG] Total de cards:', cardsList.length);

    // Identificar colunas finalizadas
    const completedColumnNames = ['concluído', 'concluido', 'finalizado', 'done', 'completed', 'fechado'];
    const completedColumnIds = columnsList
      .filter(col => completedColumnNames.some(name => col.name.toLowerCase().includes(name)))
      .map(col => col.column_id);

    // console.log('[OVERVIEW DEBUG] Colunas finalizadas:', completedColumnIds);

    // Agrupar tarefas urgentes por colaborador
    const tasksByColab: Record<string, Array<{ card: Card; urgencyType: 'overdue' | 'today' | 'next_business_day' }>> = {};

    cardsList.forEach(card => {
    // console.log('[OVERVIEW DEBUG] Verificando card:', card.title, '| delivery_date:', card.delivery_date, '| assigned_to:', card.assigned_to);

      if (!card.delivery_date) {
    // console.log('[OVERVIEW DEBUG]   -> Sem delivery_date');
        return;
      }
      if (!card.assigned_to || card.assigned_to.length === 0) {
    // console.log('[OVERVIEW DEBUG]   -> Sem assigned_to');
        return;
      }
      if (completedColumnIds.includes(card.column_id)) {
    // console.log('[OVERVIEW DEBUG]   -> Está em coluna finalizada');
        return;
      }

      const isOverdue = card.delivery_date < todayStr;
      const isToday = card.delivery_date === todayStr;
      const isNextBusinessDay = card.delivery_date === nextBusinessDayStr;

    // console.log('[OVERVIEW DEBUG]   -> isOverdue:', isOverdue, '| isToday:', isToday, '| isNextBusinessDay:', isNextBusinessDay);

      if (!isOverdue && !isToday && !isNextBusinessDay) {
    // console.log('[OVERVIEW DEBUG]   -> Não atende critério de urgência');
        return;
      }

      const urgencyType = isOverdue ? 'overdue' : isToday ? 'today' : 'next_business_day';
    // console.log('[OVERVIEW DEBUG]   -> ADICIONADA! urgencyType:', urgencyType);

      card.assigned_to.forEach(colabId => {
        if (!tasksByColab[colabId]) {
          tasksByColab[colabId] = [];
        }
        tasksByColab[colabId].push({ card, urgencyType });
      });
    });

    // console.log('[OVERVIEW DEBUG] Total de colaboradores com tarefas urgentes:', Object.keys(tasksByColab).length);

    // Converter para array e adicionar dados do colaborador
    const result = Object.entries(tasksByColab)
      .map(([colabId, tasks]) => ({
        colaborador: colaboradores.find(c => c.id === colabId),
        tasks,
      }))
      .filter(item => item.colaborador) // Filtrar colaboradores não encontrados
      .sort((a, b) => {
        // Ordenar por quantidade de tarefas vencidas primeiro, depois total
        const aOverdue = a.tasks.filter(t => t.urgencyType === 'overdue').length;
        const bOverdue = b.tasks.filter(t => t.urgencyType === 'overdue').length;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return b.tasks.length - a.tasks.length;
      });

    // console.log('[OVERVIEW DEBUG] Resultado final:', result.length, 'colaboradores');
    setUrgentTasksByColaborador(result);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if dragging a card
    const card = cards.find((c) => c.card_id === activeId);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're moving a column
    const activeColumn = columns.find((c) => c.column_id === activeId);
    if (activeColumn) {
      const overColumn = columns.find((c) => c.column_id === overId);
      if (overColumn) {
        const oldIndex = columns.findIndex((c) => c.column_id === activeId);
        const newIndex = columns.findIndex((c) => c.column_id === overId);

        // Reorder columns locally
        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(oldIndex, 1);
        newColumns.splice(newIndex, 0, movedColumn);

        // Update positions
        const updatedColumns = newColumns.map((col, index) => ({
          ...col,
          position: index,
        }));

        setColumns(updatedColumns);

        // Update on server
        try {
          await kanbanService.updateColumn(activeId, { position: newIndex });
          setSnackbar({
            open: true,
            message: "Coluna reordenada com sucesso",
            severity: "success",
          });
        } catch (error: any) {
          setSnackbar({
            open: true,
            message: error.message || "Erro ao reordenar coluna",
            severity: "error",
          });
          // Reload on error
          loadBoardData(selectedBoardId);
        }
      }
      return;
    }

    // Otherwise, we're moving a card
    const card = cards.find((c) => c.card_id === activeId);
    if (!card) return;

    // Determine the target column
    // overId can be either a column_id or a card_id (if dropped on another card)
    let newColumnId = overId;
    const targetColumn = columns.find((c) => c.column_id === overId);

    if (!targetColumn) {
      // overId is a card, find its column
      const targetCard = cards.find((c) => c.card_id === overId);
      if (targetCard) {
        newColumnId = targetCard.column_id;
      } else {
        return; // Invalid drop target
      }
    }

    if (card.column_id === newColumnId) return;

    // Check if the new column belongs to the same board
    const newColumn = columns.find((c) => c.column_id === newColumnId);
    if (!newColumn || newColumn.board_id !== card.board_id) {
      setSnackbar({
        open: true,
        message: "Não é possível mover cards entre boards diferentes",
        severity: "error",
      });
      return;
    }

    try {
      // Calculate new position
      const cardsInNewColumn = cards.filter((c) => c.column_id === newColumnId);
      const newPosition = cardsInNewColumn.length;

      // Update locally first
      setCards((prev) =>
        prev.map((c) =>
          c.card_id === activeId
            ? { ...c, column_id: newColumnId, position: newPosition }
            : c
        )
      );

      // Update on server
      await kanbanService.moveCard(activeId, {
        column_id: newColumnId,
        position: newPosition,
      });

      setSnackbar({
        open: true,
        message: "Card movido com sucesso",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao mover card",
        severity: "error",
      });
      // Reload on error
      loadBoardData(selectedBoardId);
    }
  };

  const handleAddColumn = async () => {
    setSelectedColumn(null);
    setColumnModalOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setSelectedColumn(column);
    setColumnModalOpen(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find((c) => c.column_id === columnId);
    if (column) {
      setColumnToDelete({ id: columnId, name: column.name });
      setColumnDeleteDialogOpen(true);
    }
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;

    try {
      setDeletingColumn(true);
      await kanbanService.deleteColumn(columnToDelete.id);
      setColumns((prev) => prev.filter((c) => c.column_id !== columnToDelete.id));
      setCards((prev) => prev.filter((c) => c.column_id !== columnToDelete.id));
      setColumnDeleteDialogOpen(false);
      setColumnToDelete(null);
      setSnackbar({
        open: true,
        message: "Coluna excluída com sucesso",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao excluir coluna",
        severity: "error",
      });
    } finally {
      setDeletingColumn(false);
    }
  };

  const cancelDeleteColumn = () => {
    setColumnDeleteDialogOpen(false);
    setColumnToDelete(null);
  };

  const handleSaveColumn = async (data: any) => {
    try {
      if (selectedColumn) {
        // Update
        const response = await kanbanService.updateColumn(selectedColumn.column_id, data);
        const updated = (response as any).data || response;
        setColumns((prev) =>
          prev.map((c) => (c.column_id === selectedColumn.column_id ? updated : c))
        );
      } else {
        // Create
        const response = await kanbanService.createColumn(data);
        const newColumn = (response as any).data || response;
        setColumns((prev) => [...prev, newColumn].sort((a, b) => a.position - b.position));
      }
      setColumnModalOpen(false);
      setSnackbar({
        open: true,
        message: selectedColumn ? "Coluna atualizada" : "Coluna criada",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao salvar coluna",
        severity: "error",
      });
    }
  };

  const handleAddCard = (columnId: string) => {
    setSelectedCard(null);
    setSelectedColumnForCard(columnId);
    setCardModalOpen(true);
  };

  const handleEditCard = (card: Card) => {
    setSelectedCard(card);
    setSelectedColumnForCard(card.column_id);
    setCardModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    const card = cards.find((c) => c.card_id === cardId);
    if (card) {
      setCardToDelete({ id: cardId, title: card.title });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      setDeleting(true);
      await kanbanService.deleteCard(cardToDelete.id);
      setCards((prev) => prev.filter((c) => c.card_id !== cardToDelete.id));
      setDeleteDialogOpen(false);
      setCardToDelete(null);
      setSnackbar({
        open: true,
        message: "Card excluído com sucesso",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao excluir card",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteCard = () => {
    setDeleteDialogOpen(false);
    setCardToDelete(null);
  };

  const handleOpenCardFromAlert = (card: Card) => {
    setDueDateAlertOpen(false);
    setSelectedCard(card);
    setSelectedColumnForCard(card.column_id);
    setCardModalOpen(true);
  };

  const handleQuickCreateCard = async (columnId: string, title: string) => {
    try {
      const cardsInColumn = cards.filter((c) => c.column_id === columnId);

      // Buscar o colaborador_id do usuário logado
      const loggedColaborador = colaboradores.find((c: any) => c.id === user?.id);

      const cardData: any = {
        board_id: selectedBoardId,
        column_id: columnId,
        title,
        position: cardsInColumn.length,
        // Atribuir automaticamente ao colaborador que está criando
        assigned_to: loggedColaborador ? [loggedColaborador.id] : [],
      };

      const response = await kanbanService.createCard(cardData);

      const newCard = (response as any).data || response;
      setCards((prev) => [...prev, newCard]);

      setSnackbar({
        open: true,
        message: "Card criado! Clique nele para adicionar mais detalhes.",
        severity: "success",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Erro ao criar card";

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      throw error;
    }
  };

  const handleSaveCard = async (data: any) => {
    try {
      if (selectedCard) {
        // Update
        const response = await kanbanService.updateCard(selectedCard.card_id, data);
        const updated = (response as any).data || response;
        setCards((prev) =>
          prev.map((c) => (c.card_id === selectedCard.card_id ? updated : c))
        );
      } else {
        // Create - need board_id and position
        const cardsInColumn = cards.filter((c) => c.column_id === data.column_id);

        // Buscar o colaborador_id do usuário logado
        const loggedColaborador = colaboradores.find((c: any) => c.id === user?.id);

        // Se o usuário não selecionou responsáveis, atribuir automaticamente ao criador
        const assignedTo = data.assigned_to && data.assigned_to.length > 0
          ? data.assigned_to
          : (loggedColaborador ? [loggedColaborador.id] : []);

        const response = await kanbanService.createCard({
          ...data,
          board_id: selectedBoardId,
          position: cardsInColumn.length,
          assigned_to: assignedTo,
        });
        const newCard = (response as any).data || response;
        setCards((prev) => [...prev, newCard]);
      }
      setCardModalOpen(false);
      setSnackbar({
        open: true,
        message: selectedCard ? "Card atualizado" : "Card criado",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || "Erro ao salvar card",
        severity: "error",
      });
    }
  };

  const handleChangeColumn = async (cardId: string, newColumnId: string) => {
    try {
      const card = cards.find((c) => c.card_id === cardId);
      if (!card) return;

      // Get cards in the new column to determine position
      const cardsInNewColumn = cards.filter((c) => c.column_id === newColumnId);

      const response = await kanbanService.moveCard(cardId, {
        column_id: newColumnId,
        position: cardsInNewColumn.length,
      });
      const updated = (response as any).data || response;

      // Update the card in the list
      setCards((prev) =>
        prev.map((c) => (c.card_id === cardId ? updated : c))
      );

      // Update the selected card if it's open in the modal
      if (selectedCard && selectedCard.card_id === cardId) {
        setSelectedCard(updated);
      }

      setSnackbar({
        open: true,
        message: "Card movido com sucesso",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao mover card",
        severity: "error",
      });
    }
  };

  const handleAddObservation = async (content: string) => {
    if (!selectedCard) return;

    try {
      const response = await kanbanService.addObservation(selectedCard.card_id, { content });
      const updated = (response as any).data || response;

      // Update the card in the list
      setCards((prev) =>
        prev.map((c) => (c.card_id === selectedCard.card_id ? updated : c))
      );

      // Update the selected card so the modal shows the new observation
      setSelectedCard(updated);

      setSnackbar({
        open: true,
        message: "Observação adicionada",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao adicionar observação",
        severity: "error",
      });
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return "";
    const cliente = clientes.find((c) => c.cliente_id === clientId);
    return cliente?.nome_fantasia || "";
  };

  const getColaboradorName = (colaboradorId: string) => {
    const colaborador = colaboradores.find((c: any) => c.id === colaboradorId);
    return colaborador?.nome_completo || "";
  };

  const getColaboradorFoto = (colaboradorId: string) => {
    const colaborador = colaboradores.find((c: any) => c.id === colaboradorId);
    return colaborador?.foto_perfil_url;
  };

  const handleAssignCard = async (cardId: string, colaboradorId: string | null) => {
    try {
      // Get current card
      const card = cards.find((c) => c.card_id === cardId);
      if (!card) return;

      let newAssignedTo: string[];

      if (colaboradorId === null) {
        // Remove all assignments
        newAssignedTo = [];
      } else {
        // Toggle collaborator: if already assigned, remove it; otherwise, add it
        const currentAssigned = card.assigned_to || [];
        if (currentAssigned.includes(colaboradorId)) {
          newAssignedTo = currentAssigned.filter((id) => id !== colaboradorId);
        } else {
          newAssignedTo = [...currentAssigned, colaboradorId];
        }
      }

      const response = await kanbanService.updateCard(cardId, {
        assigned_to: newAssignedTo,
      });
      const updated = (response as any).data || response;
      setCards((prev) => prev.map((c) => (c.card_id === cardId ? updated : c)));

      const message =
        colaboradorId === null
          ? "Atribuições removidas"
          : newAssignedTo.includes(colaboradorId)
            ? "Responsável adicionado"
            : "Responsável removido";

      setSnackbar({
        open: true,
        message,
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao atribuir responsável",
        severity: "error",
      });
    }
  };

  // Filter cards based on selected filters
  const getFilteredCards = (columnId: string) => {
    let filtered = cards.filter((c) => c.column_id === columnId);

    if (selectedClientes.length > 0) {
      filtered = filtered.filter((c) => c.client_id && selectedClientes.includes(c.client_id));
    }

    if (selectedContratos.length > 0) {
      filtered = filtered.filter((c) => selectedContratos.includes(c.contract_id));
    }

    if (selectedColaboradores.length > 0) {
      filtered = filtered.filter((c) => {
        // assigned_to é um array, então verificar se algum dos colaboradores selecionados está no array
        if (!c.assigned_to || c.assigned_to.length === 0) return false;
        return c.assigned_to.some((assignedId) => selectedColaboradores.includes(assignedId));
      });
    }

    return filtered;
  };

  const handleToggleColaborador = (id: string) => {
    setSelectedColaboradores((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleCliente = (id: string) => {
    setSelectedClientes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (!selectedClientes.includes(id)) {
      setSelectedContratos([]);
    }
  };

  const handleToggleContrato = (id: string) => {
    setSelectedContratos((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSelectedColaboradores([]);
    setSelectedClientes([]);
    setSelectedContratos([]);
  };

  const handleAddBoard = () => {
    setSelectedBoard(null);
    setBoardModalOpen(true);
  };

  const handleSaveBoard = async (data: any) => {
    try {
      if (selectedBoard) {
        // Update
        const response = await kanbanService.updateBoard(selectedBoard.board_id, data);
        const updated = (response as any).data || response;
        setBoards((prev) =>
          prev.map((b) => (b.board_id === selectedBoard.board_id ? updated : b))
        );
      } else {
        // Create
        const response = await kanbanService.createBoard(data);
        const newBoard = (response as any).data || response;
        setBoards((prev) => [...prev, newBoard]);
        setSelectedBoardId(newBoard.board_id);
      }
      setBoardModalOpen(false);
      setSnackbar({
        open: true,
        message: selectedBoard ? "Board atualizado" : "Board criado",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao salvar board",
        severity: "error",
      });
    }
  };

  const handleDeleteBoard = () => {
    if (!selectedBoardId) return;

    // Check if it's the default board (first board)
    const currentBoard = boards.find((b) => b.board_id === selectedBoardId);
    if (currentBoard && (currentBoard.is_default || boards[0]?.board_id === selectedBoardId)) {
      setSnackbar({
        open: true,
        message: "O board principal não pode ser excluído",
        severity: "error",
      });
      return;
    }

    setBoardDeleteDialogOpen(true);
  };

  const confirmDeleteBoard = async () => {
    if (!selectedBoardId) return;

    try {
      setDeletingBoard(true);
      await kanbanService.deleteBoard(selectedBoardId);
      const remainingBoards = boards.filter((b) => b.board_id !== selectedBoardId);
      setBoards(remainingBoards);

      // Select another board or create a new one
      if (remainingBoards.length > 0) {
        setSelectedBoardId(remainingBoards[0].board_id);
      } else {
        // Create a new default board
        const response = await kanbanService.createBoard({
          name: "Meu Board",
          description: "Board principal",
        });
        const newBoard = (response as any).data || response;
        setBoards([newBoard]);
        setSelectedBoardId(newBoard.board_id);
      }

      setBoardDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Board excluído com sucesso",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao excluir board",
        severity: "error",
      });
    } finally {
      setDeletingBoard(false);
    }
  };

  const cancelDeleteBoard = () => {
    setBoardDeleteDialogOpen(false);
  };

  if (!isAuthenticated || !user || (user.userType !== "admin" && user.userType !== "colaborador")) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
        {/* Header Skeleton */}
        <Box sx={{ px: 2, py: 1, bgcolor: "#ffffff", borderBottom: "1px solid #e0e0e0" }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Board Skeleton - Simplified */}
        <Box
          sx={{
            flexGrow: 1,
            p: 1.5,
            bgcolor: "#fafafa",
            display: "flex",
            gap: 1.5,
          }}
        >
          {[1, 2, 3, 4].map((colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rectangular"
              width={300}
              height="100%"
              sx={{ borderRadius: 2, minWidth: 300 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      {/* Header - Modern Minimalist Design */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Single row with Board, Filters and Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "nowrap",
          }}
        >
          {/* Board Selector - Minimal Style */}
          <FormControl variant="standard" sx={{ minWidth: 140 }}>
            <Select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              disableUnderline
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
                "& .MuiSelect-select": {
                  py: 0,
                  pr: "24px !important",
                },
                "& .MuiSelect-icon": {
                  color: "#8270FF",
                  fontSize: "1.2rem",
                },
              }}
            >
              {boards.map((board, index) => (
                <MenuItem
                  key={board.board_id}
                  value={board.board_id}
                  sx={{
                    fontSize: "0.938rem",
                    fontWeight: 500,
                    "&:hover": {
                      bgcolor: "rgba(130, 112, 255, 0.08)",
                    },
                    "&.Mui-selected": {
                      bgcolor: "rgba(130, 112, 255, 0.12)",
                      "&:hover": {
                        bgcolor: "rgba(130, 112, 255, 0.16)",
                      },
                    },
                  }}
                >
                  {board.is_default || index === 0 ? "Principal" : board.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Divider */}
          <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(0, 0, 0, 0.08)" }} />

          {/* Colaboradores Filter - Avatar Style */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {selectedColaboradores.slice(0, 5).map((colabId) => {
              const colab = colaboradores.find((c) => c.id === colabId);
              return (
                <Tooltip key={colabId} title={`${colab?.nome_completo || ""} (clique para remover)`}>
                  <Badge
                    badgeContent={
                      <CloseIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleColaborador(colabId);
                        }}
                        sx={{
                          fontSize: "0.45rem",
                          color: "rgba(0, 0, 0, 0.3)",
                        }}
                      />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleColaborador(colabId);
                    }}
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: "rgba(158, 158, 158, 0.2)",
                        width: 12,
                        height: 12,
                        minWidth: 12,
                        borderRadius: "50%",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "none",
                        transition: "background-color 0.2s, border-color 0.2s",
                        "&:hover": {
                          bgcolor: "rgba(120, 120, 120, 0.4)",
                          borderColor: "rgba(0, 0, 0, 0.2)",
                          "& svg": {
                            color: "rgba(0, 0, 0, 0.6)",
                          },
                        },
                      },
                    }}
                  >
                    <Avatar
                      src={colab?.foto_perfil_url || "/avatar.svg"}
                      onClick={() => handleToggleColaborador(colabId)}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "transparent",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8,
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.2s",
                      }}
                    />
                  </Badge>
                </Tooltip>
              );
            })}
            {selectedColaboradores.length > 5 && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  bgcolor: "#666",
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
                onClick={(e) => setPeopleAnchorEl(e.currentTarget)}
              >
                +{selectedColaboradores.length - 5}
              </Avatar>
            )}
            <Tooltip title="Adicionar pessoas">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#e8e8e8",
                  color: "#5e5e5e",
                  cursor: "pointer",
                  border: "none",
                  "&:hover": {
                    bgcolor: "#d8d8d8",
                  },
                }}
                onClick={(e) => setPeopleAnchorEl(e.currentTarget)}
              >
                <PersonAddIcon sx={{ fontSize: "1.1rem" }} />
              </Avatar>
            </Tooltip>
          </Box>

          {/* Other Filters - Minimal Modern */}
          <Badge
            badgeContent={selectedClientes.length + selectedContratos.length}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#8270FF",
                fontSize: "0.625rem",
                height: 18,
                minWidth: 18,
                fontWeight: 600,
              },
            }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={<FilterListIcon sx={{ fontSize: "1.125rem" }} />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{
                color: selectedClientes.length + selectedContratos.length > 0 ? "#8270FF" : "#64748b",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                py: 0.75,
                px: 1.25,
                borderRadius: 1.5,
                minHeight: "36px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: "rgba(130, 112, 255, 0.08)",
                  color: "#8270FF",
                },
              }}
            >
              Filtros
            </Button>
          </Badge>

          <Box sx={{ flexGrow: 1 }} />

          {/* Keyboard Shortcut Hint */}
          <Tooltip title="Atalho: C para criar card" placement="bottom">
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                fontSize: "0.75rem",
                fontWeight: 500,
                display: { xs: "none", md: "block" },
                fontFamily: "monospace",
                bgcolor: "rgba(148, 163, 184, 0.08)",
                px: 1,
                py: 0.375,
                borderRadius: 0.75,
              }}
            >
              C
            </Typography>
          </Tooltip>

          {/* Actions - Modern Icon Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip
              title={
                urgentTasksByColaborador.length > 0
                  ? `${urgentTasksByColaborador.length} ${urgentTasksByColaborador.length === 1 ? "colaborador com tarefas urgentes" : "colaboradores com tarefas urgentes"}`
                  : "Nenhum colaborador com tarefas urgentes"
              }
              arrow
            >
              <IconButton
                size="small"
                onClick={() => setColaboradoresOverviewOpen(true)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  color: urgentTasksByColaborador.length > 0 ? "#8270FF" : "#64748b",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(130, 112, 255, 0.08)",
                    color: "#8270FF",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Badge
                  badgeContent={urgentTasksByColaborador.length}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: urgentTasksByColaborador.length > 0 ? "#8270FF" : "transparent",
                      color: "white",
                      fontSize: "0.625rem",
                      height: 18,
                      minWidth: 18,
                      fontWeight: 600,
                    },
                  }}
                >
                  <PeopleIcon sx={{ fontSize: "1.25rem" }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                dueTodayCards.length > 0
                  ? `${dueTodayCards.length} ${dueTodayCards.length === 1 ? "tarefa urgente" : "tarefas urgentes"}`
                  : "Nenhuma tarefa urgente"
              }
              arrow
            >
              <IconButton
                size="small"
                onClick={() => {
                  if (dueTodayCards.length > 0) {
                    setDueDateAlertOpen(true);
                  }
                }}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  color: dueTodayCards.length > 0 ? "#8270FF" : "#64748b",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(130, 112, 255, 0.08)",
                    color: "#8270FF",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Badge
                  badgeContent={dueTodayCards.length}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: dueTodayCards.length > 0 ? "#8270FF" : "transparent",
                      color: "white",
                      fontSize: "0.625rem",
                      height: 18,
                      minWidth: 18,
                      fontWeight: 600,
                    },
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: "1.25rem" }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Divider */}
            <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(0, 0, 0, 0.08)", mx: 0.5 }} />

            <Tooltip
              title={
                boards.find((b) => b.board_id === selectedBoardId)?.is_default ||
                boards[0]?.board_id === selectedBoardId
                  ? "O board principal não pode ser excluído"
                  : "Excluir Board"
              }
              arrow
            >
              <span>
                <IconButton
                  size="small"
                  onClick={handleDeleteBoard}
                  disabled={
                    boards.find((b) => b.board_id === selectedBoardId)?.is_default ||
                    boards[0]?.board_id === selectedBoardId
                  }
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    color: "#64748b",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover:not(:disabled)": {
                      color: "#ef4444",
                      bgcolor: "rgba(239, 68, 68, 0.08)",
                      transform: "scale(1.05)",
                    },
                    "&.Mui-disabled": {
                      color: "#cbd5e1",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: "1.25rem" }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Board */}
      <Box sx={{ position: "relative", flexGrow: 1, height: "calc(100vh - 120px)" }}>
        {/* Left Arrow */}
        {showLeftArrow && (
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              width: 36,
              height: 36,
              color: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                bgcolor: "rgba(130, 112, 255, 0.9)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(130, 112, 255, 0.3)",
              },
              transition: "all 0.2s",
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <IconButton
            onClick={handleScrollRight}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              width: 36,
              height: 36,
              color: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                bgcolor: "rgba(130, 112, 255, 0.9)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(130, 112, 255, 0.3)",
              },
              transition: "all 0.2s",
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}

        <Box
          ref={boardContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          sx={{
            flexGrow: 1,
            overflowX: "auto",
            overflowY: "hidden",
            p: 2.5,
            bgcolor: "#f8fafc",
            height: "100%",
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.04) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            "&::-webkit-scrollbar": {
              height: "10px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "transparent",
              borderRadius: "5px",
              my: 1,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(148, 163, 184, 0.3)",
              borderRadius: "5px",
              border: "2px solid transparent",
              backgroundClip: "content-box",
              transition: "background-color 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(130, 112, 255, 0.4)",
              },
            },
          }}
        >
        {loadingColumns && !loading ? (
          <Box sx={{ display: "flex", gap: 1.5, height: "100%", flexWrap: "nowrap" }}>
            {[1, 2, 3].map((colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                width={300}
                height="100%"
                sx={{ borderRadius: 2, minWidth: 300 }}
              />
            ))}
          </Box>
        ) : !loadingColumns && !loading ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
          >
            <SortableContext items={columns.map((c) => c.column_id)} strategy={horizontalListSortingStrategy}>
              <Box sx={{ display: "flex", gap: 1.5, height: "100%", flexWrap: "nowrap", alignItems: "stretch" }}>
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.column_id}
                    column={column}
                    cards={getFilteredCards(column.column_id)}
                    onEditColumn={handleEditColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                    onAddCard={handleAddCard}
                    onQuickCreateCard={handleQuickCreateCard}
                    onAssignCard={handleAssignCard}
                    getClientName={getClientName}
                    getColaboradorName={getColaboradorName}
                    getColaboradorFoto={getColaboradorFoto}
                    colaboradores={colaboradores.filter((c: any) => c.status === "ativo").map((c: any) => ({
                      id: c.id,
                      nome: c.nome_completo,
                      foto_perfil_url: c.foto_perfil_url
                    }))}
                    isDraggingCard={!!activeCard}
                  />
                ))}

              {/* Add Column Button */}
              {columns.length > 0 && (
                <Box
                  onClick={handleAddColumn}
                  sx={{
                    minWidth: 80,
                    maxWidth: 80,
                    bgcolor: "transparent",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(130, 112, 255, 0.05)",
                      "& .add-icon": {
                        bgcolor: "#8270FF",
                        color: "#fff",
                        transform: "scale(1.1)",
                      },
                    },
                  }}
                >
                  <Box
                    className="add-icon"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "2px dashed #8270FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8270FF",
                      transition: "all 0.2s",
                    }}
                  >
                    <AddIcon />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: "#8270FF",
                      fontWeight: 500,
                    }}
                  >
                    Nova Coluna
                  </Typography>
                </Box>
              )}

              {columns.length === 0 && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 8,
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#999" }}>
                    Carregando colunas padrão...
                  </Typography>
                </Box>
              )}
            </Box>
            </SortableContext>

            <DragOverlay>
              {activeCard ? (
                <KanbanCard
                  card={activeCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  clientName={getClientName(activeCard.client_id)}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : null}
        </Box>
      </Box>

      {/* Modals */}
      <CardModal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        onSave={handleSaveCard}
        onAddObservation={handleAddObservation}
        onChangeColumn={handleChangeColumn}
        card={selectedCard}
        columnId={selectedColumnForCard}
        clientes={clientes}
        columns={columns}
        colaboradores={colaboradores.map((c: any) => ({ colaborador_id: c.id, id: c.id, nome: c.nome_completo, nome_completo: c.nome_completo, status: c.status, foto_perfil_url: c.foto_perfil_url }))}
        currentUserId={user?.id}
      />

      <ColumnModal
        open={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSave={handleSaveColumn}
        column={selectedColumn}
        boardId={selectedBoardId}
        nextPosition={columns.length}
      />

      <BoardModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        onSave={handleSaveBoard}
        board={selectedBoard}
      />

      <FilterPopover
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        colaboradores={colaboradores}
        clientes={clientes}
        contratos={contratos}
        selectedColaboradores={selectedColaboradores}
        selectedClientes={selectedClientes}
        selectedContratos={selectedContratos}
        onToggleColaborador={handleToggleColaborador}
        onToggleCliente={handleToggleCliente}
        onToggleContrato={handleToggleContrato}
        onClearFilters={handleClearFilters}
      />

      {/* People Picker Popover with Autocomplete */}
      <Popover
        open={Boolean(peopleAnchorEl)}
        anchorEl={peopleAnchorEl}
        onClose={() => setPeopleAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 280,
              maxHeight: 400,
              borderRadius: 2,
              boxShadow: 3,
              overflow: "visible",
            },
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.8rem", mb: 1 }}>
            Selecionar pessoas
          </Typography>
          <Autocomplete
            multiple
            options={colaboradores}
            disableCloseOnSelect
            getOptionLabel={(option) => option.nome_completo || ""}
            value={colaboradores.filter((c) => selectedColaboradores.includes(c.id))}
            onChange={(event, newValue) => {
              const newSelectedIds = newValue.map((colab) => colab.id);
              setSelectedColaboradores(newSelectedIds);
            }}
            renderOption={(props, option, { selected }) => {
              const { key, ...otherProps } = props;
              return (
                <li key={key} {...otherProps}>
                  <Checkbox
                    checked={selected}
                    size="small"
                    sx={{
                      color: "#8270FF",
                      "&.Mui-checked": {
                        color: "#8270FF",
                      },
                      mr: 0.75,
                    }}
                  />
                  <Avatar
                    src={option.foto_perfil_url || "/avatar.svg"}
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "transparent",
                      mr: 1,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.8rem" }}>
                    {option.nome_completo}
                  </Typography>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Buscar..."
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.8rem",
                    "&:hover fieldset": {
                      borderColor: "#8270FF",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8270FF",
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.8rem",
                    py: 0.5,
                  },
                }}
              />
            )}
            sx={{
              "& .MuiAutocomplete-popupIndicator": {
                color: "#8270FF",
              },
              "& .MuiAutocomplete-clearIndicator": {
                color: "#8270FF",
              },
              "& .MuiAutocomplete-tag": {
                height: 22,
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        itemName={cardToDelete?.title || ""}
        itemType="o card"
        onConfirm={confirmDeleteCard}
        onCancel={cancelDeleteCard}
        loading={deleting}
      />

      {/* Column Delete Confirmation Dialog */}
      <ConfirmDialog
        open={columnDeleteDialogOpen}
        onClose={cancelDeleteColumn}
        onConfirm={confirmDeleteColumn}
        title="Excluir Coluna?"
        description={`Tem certeza que deseja excluir a coluna "${columnToDelete?.name}"? Todos os cards desta coluna também serão excluídos.`}
        confirmText="Excluir Coluna"
        variant="danger"
        loading={deletingColumn}
      />

      {/* Board Delete Confirmation Dialog */}
      <ConfirmDialog
        open={boardDeleteDialogOpen}
        onClose={cancelDeleteBoard}
        onConfirm={confirmDeleteBoard}
        title="Excluir Board?"
        description="Tem certeza que deseja excluir este board? Todas as colunas e cards serão perdidos permanentemente."
        confirmText="Excluir Board"
        variant="danger"
        loading={deletingBoard}
      />

      {/* Due Date Alert Dialog */}
      <Dialog
        open={dueDateAlertOpen}
        onClose={() => setDueDateAlertOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box component="span" sx={{ display: "block", fontWeight: 600, fontSize: "1.125rem" }}>
            Tarefas Urgentes
          </Box>
          <Typography variant="caption" color="text.secondary">
            {dueTodayCards.length} {dueTodayCards.length === 1 ? "tarefa requer" : "tarefas requerem"} atenção
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {dueTodayCards.map((card) => (
              <Box
                key={card.card_id}
                onClick={() => handleOpenCardFromAlert(card)}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                  {card.title}
                </Typography>
                {card.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    {card.description}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todayStr = today.toISOString().split('T')[0];

                    const nextBusinessDay = new Date(today);
                    const dayOfWeek = today.getDay();
                    if (dayOfWeek === 5) {
                      nextBusinessDay.setDate(today.getDate() + 3);
                    } else if (dayOfWeek === 6) {
                      nextBusinessDay.setDate(today.getDate() + 2);
                    } else {
                      nextBusinessDay.setDate(today.getDate() + 1);
                    }
                    const nextBusinessDayStr = nextBusinessDay.toISOString().split('T')[0];

                    const isOverdue = card.delivery_date && card.delivery_date < todayStr;
                    const isToday = card.delivery_date === todayStr;
                    const isNextBusinessDay = card.delivery_date === nextBusinessDayStr;

                    if (isOverdue) {
                      return (
                        <Chip
                          label="Vencida"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.688rem",
                            bgcolor: "#F44336",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      );
                    } else if (isToday) {
                      return (
                        <Chip
                          label="Hoje"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.688rem",
                            bgcolor: "#FF9800",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      );
                    } else if (isNextBusinessDay) {
                      return (
                        <Chip
                          label="Próximo dia útil"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.688rem",
                            bgcolor: "#8270FF",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                  {columns.find((col) => col.column_id === card.column_id) && (
                    <Chip
                      label={columns.find((col) => col.column_id === card.column_id)?.name}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.688rem",
                        bgcolor: "grey.100",
                        color: "text.secondary",
                      }}
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setDueDateAlertOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#8270FF",
              color: "white",
              "&:hover": {
                bgcolor: "#6B5FCC",
              },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Colaboradores Overview Modal */}
      <Dialog
        open={colaboradoresOverviewOpen}
        onClose={() => setColaboradoresOverviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box component="span" sx={{ display: "block", fontWeight: 600, fontSize: "1.125rem" }}>
            Visão Geral - Tarefas Urgentes por Colaborador
          </Box>
          <Typography variant="caption" color="text.secondary">
            {urgentTasksByColaborador.length} {urgentTasksByColaborador.length === 1 ? "colaborador" : "colaboradores"} com tarefas urgentes
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {urgentTasksByColaborador.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum colaborador com tarefas urgentes
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Colaborador</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarefa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vencimento</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urgentTasksByColaborador.map(({ colaborador, tasks }) =>
                    tasks.map((task, taskIndex) => (
                      <TableRow
                        key={`${colaborador.id}-${task.card.card_id}`}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "action.hover" },
                          borderLeft: task.urgencyType === 'overdue' ? '3px solid #F44336' :
                                     task.urgencyType === 'today' ? '3px solid #FF9800' : '3px solid #8270FF'
                        }}
                      >
                        {taskIndex === 0 ? (
                          <TableCell rowSpan={tasks.length} sx={{ verticalAlign: "top", fontWeight: 500 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar
                                src={colaborador.foto_perfil_url || "/avatar.svg"}
                                sx={{ width: 32, height: 32, bgcolor: "transparent" }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {colaborador.nome_completo}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Typography variant="body2" noWrap maxWidth={250}>
                            {task.card.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                            #{task.card.card_id.substring(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontSize="0.813rem">
                            {new Date(task.card.delivery_date || '').toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              task.urgencyType === 'overdue' ? 'Vencida' :
                              task.urgencyType === 'today' ? 'Hoje' : 'Próximo dia útil'
                            }
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.688rem",
                              bgcolor: task.urgencyType === 'overdue' ? '#F44336' :
                                      task.urgencyType === 'today' ? '#FF9800' : '#8270FF',
                              color: "white",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => {
                              setSelectedCard(task.card);
                              setCardModalOpen(true);
                              setColaboradoresOverviewOpen(false);
                            }}
                            sx={{
                              color: "#8270FF",
                              textDecoration: "none",
                              fontWeight: 500,
                              fontSize: "0.813rem",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            Ver tarefa
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setColaboradoresOverviewOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#8270FF",
              color: "white",
              "&:hover": {
                bgcolor: "#6B5FCC",
              },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function KanbanPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress />
        </Box>
      }
    >
      <KanbanPageContent />
    </Suspense>
  );
}
