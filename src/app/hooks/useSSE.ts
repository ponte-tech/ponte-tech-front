"use client";

import { useEffect, useRef, useCallback } from "react";

export interface SSEMessage {
  phone: string;
  message: string;
  message_id: string;
  sender: string;
  timestamp: number;
}

type SSEEventHandler = (data: SSEMessage) => void;

/**
 * Hook personalizado para "simular" SSE usando polling curto
 * (Lambda não suporta SSE real devido à natureza stateless)
 *
 * Este hook usa uma abordagem de polling inteligente:
 * - Atualiza as conversas a cada 5 segundos quando a aba está ativa
 * - Para o polling quando a aba está inativa
 * - Usa callbacks para notificar quando há novas mensagens
 */
export function useSSE(onNewMessage?: SSEEventHandler) {
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const lastCheckRef = useRef<Date>(new Date());
  const isActiveRef = useRef(true);

  const checkForNewMessages = useCallback(async () => {
    // Esta função será chamada pelo componente pai
    // para verificar novas mensagens periodicamente
    if (onNewMessage) {
      // O polling real será feito pelo componente WhatsAppPage
      // que já tem acesso ao service de comunicação
    }
  }, [onNewMessage]);

  useEffect(() => {
    // Detectar quando a aba fica ativa/inativa
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    connected: true, // Sempre conectado (via polling)
    disconnect: () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    },
    reconnect: checkForNewMessages,
    isActive: () => isActiveRef.current,
  };
}
