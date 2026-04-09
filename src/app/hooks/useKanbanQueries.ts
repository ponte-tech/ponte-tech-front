import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import kanbanService from "@/app/services/kanbanService";
import clienteService from "@/app/services/clienteService";
import contratoService from "@/app/services/contratoService";
import colaboradoresService from "@/app/services/colaboradoresService";

// ================== QUERY KEYS ==================
export const kanbanKeys = {
  all: ["kanban"] as const,
  boards: () => [...kanbanKeys.all, "boards"] as const,
  board: (boardId: string) => [...kanbanKeys.all, "board", boardId] as const,
  boardFull: (boardId: string) => [...kanbanKeys.all, "board-full", boardId] as const,
  clientes: () => ["clientes"] as const,
  contratos: () => ["contratos"] as const,
  colaboradores: () => ["colaboradores"] as const,
};

// ================== BOARDS ==================
export function useBoards() {
  return useQuery({
    queryKey: kanbanKeys.boards(),
    queryFn: async () => {
      const response = await kanbanService.listBoards();
      return (response as any).data?.boards || response.boards || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useBoardFull(boardId: string | null) {
  return useQuery({
    queryKey: kanbanKeys.boardFull(boardId || ""),
    queryFn: async () => {
      if (!boardId) return null;
      const response = await kanbanService.getBoardFull(boardId);
      return (response as any).data || response;
    },
    enabled: !!boardId, // Só executa se tiver boardId
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => kanbanService.createBoard(data),
    onSuccess: (newBoard) => {
      // Invalida lista de boards para refetch
      queryClient.invalidateQueries(kanbanKeys.boards());
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: any }) =>
      kanbanService.updateBoard(boardId, data),
    onSuccess: (updatedBoard, variables) => {
      // Atualiza lista de boards
      queryClient.invalidateQueries(kanbanKeys.boards());
      // Atualiza board específico
      queryClient.invalidateQueries(kanbanKeys.boardFull(variables.boardId));
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => kanbanService.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries(kanbanKeys.boards());
    },
  });
}

// ================== COLUMNS ==================
export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => kanbanService.createColumn(data),
    onSuccess: (newColumn, variables) => {
      // Invalida board full para refetch com nova coluna
      queryClient.invalidateQueries(kanbanKeys.boardFull(variables.board_id));
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: any }) =>
      kanbanService.updateColumn(columnId, data),
    onMutate: async (variables) => {
      // Pega o boardId da coluna para invalidar o cache correto
      const { columnId, data } = variables;

      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: kanbanKeys.all });

      return { columnId, data };
    },
    onSettled: () => {
      // Invalida todos os boards full (não sabemos qual board tem essa coluna)
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => kanbanService.deleteColumn(columnId),
    onSuccess: () => {
      // Invalida todos os boards (não sabemos qual board tinha essa coluna)
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
  });
}

// ================== CARDS ==================
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => kanbanService.createCard(data),
    onMutate: async (newCard) => {
      // Cancela queries em andamento para esse board
      await queryClient.cancelQueries(kanbanKeys.boardFull(newCard.board_id));

      // Snapshot do estado anterior
      const previousData = queryClient.getQueryData(kanbanKeys.boardFull(newCard.board_id));

      // Atualização otimista - adiciona card com ID temporário
      queryClient.setQueryData(kanbanKeys.boardFull(newCard.board_id), (old: any) => {
        if (!old) return old;

        const updatedColumns = old.columns.map((col: any) => {
          if (col.column_id === newCard.column_id) {
            return {
              ...col,
              cards: [
                ...col.cards,
                {
                  ...newCard,
                  card_id: `temp-${Date.now()}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
          }
          return col;
        });

        return { ...old, columns: updatedColumns };
      });

      return { previousData, boardId: newCard.board_id };
    },
    onError: (err, newCard, context: any) => {
      // Rollback em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(kanbanKeys.boardFull(context.boardId), context.previousData);
      }
    },
    onSuccess: (createdCard, variables, context: any) => {
      // Atualiza com dados reais da API
      queryClient.setQueryData(kanbanKeys.boardFull(context.boardId), (old: any) => {
        if (!old) return old;

        const updatedColumns = old.columns.map((col: any) => {
          if (col.column_id === createdCard.column_id) {
            // Remove card temporário e adiciona real
            const filteredCards = col.cards.filter((c: any) => !c.card_id.startsWith("temp-"));
            return {
              ...col,
              cards: [...filteredCards, createdCard],
            };
          }
          return col;
        });

        return { ...old, columns: updatedColumns };
      });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: any }) =>
      kanbanService.updateCard(cardId, data),
    onMutate: async (variables) => {
      const { cardId, data } = variables;

      // Encontra o boardId (precisa iterar pelos boards cached)
      const boardsFullQueries = queryClient.getQueriesData({ queryKey: kanbanKeys.all });
      let targetBoardId: string | null = null;

      for (const [queryKey, queryData] of boardsFullQueries) {
        if (queryKey[1] === "board-full" && queryData) {
          const boardData = queryData as any;
          const hasCard = boardData.columns?.some((col: any) =>
            col.cards?.some((card: any) => card.card_id === cardId)
          );
          if (hasCard) {
            targetBoardId = queryKey[2] as string;
            break;
          }
        }
      }

      if (!targetBoardId) return;

      // Cancela queries
      await queryClient.cancelQueries(kanbanKeys.boardFull(targetBoardId));

      // Snapshot
      const previousData = queryClient.getQueryData(kanbanKeys.boardFull(targetBoardId));

      // Atualização otimista
      queryClient.setQueryData(kanbanKeys.boardFull(targetBoardId), (old: any) => {
        if (!old) return old;

        const updatedColumns = old.columns.map((col: any) => ({
          ...col,
          cards: col.cards.map((card: any) =>
            card.card_id === cardId ? { ...card, ...data, updated_at: new Date().toISOString() } : card
          ),
        }));

        return { ...old, columns: updatedColumns };
      });

      return { previousData, boardId: targetBoardId };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData && context?.boardId) {
        queryClient.setQueryData(kanbanKeys.boardFull(context.boardId), context.previousData);
      }
    },
    onSuccess: (updatedCard, variables, context: any) => {
      if (context?.boardId) {
        queryClient.invalidateQueries(kanbanKeys.boardFull(context.boardId));
      }
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => kanbanService.deleteCard(cardId),
    onSuccess: () => {
      // Invalida todos os boards
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: any }) =>
      kanbanService.moveCard(cardId, data),
    onSuccess: () => {
      // Invalida todos os boards (o card pode ter mudado de coluna)
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
  });
}

export function useAddObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, content }: { cardId: string; content: string }) =>
      kanbanService.addObservation(cardId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
  });
}

export function useUpdateObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, observationId, content }: { cardId: string; observationId: string; content: string }) =>
      kanbanService.updateObservation(cardId, observationId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
  });
}

// ================== AUXILIARES ==================
export function useClientes() {
  return useQuery({
    queryKey: kanbanKeys.clientes(),
    queryFn: async () => {
      const response = await clienteService.list();
      return response.clientes || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - clientes mudam raramente
  });
}

export function useContratos() {
  return useQuery({
    queryKey: kanbanKeys.contratos(),
    queryFn: async () => {
      const response = await contratoService.list();
      return response.contratos || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useColaboradores() {
  return useQuery({
    queryKey: kanbanKeys.colaboradores(),
    queryFn: async () => {
      const response = await colaboradoresService.list();
      return response.colaboradores || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
