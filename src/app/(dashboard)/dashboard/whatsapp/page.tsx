"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Paper,
  alpha,
  Fab,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  CampaignOutlined as CampaignIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import comunicacaoService from "@/app/services/comunicacaoService";
import colaboradoresService from "@/app/services/colaboradoresService";
import {
  Conversation,
  Message,
  BroadcastMessageRequest,
  BroadcastMessageResponse,
} from "@/app/types/comunicacao";
import { ColaboradorListItem } from "@/app/types/api";
import ConversationList from "./components/ConversationList";
import ChatArea from "./components/ChatArea";
import BroadcastModal from "./components/BroadcastModal";

export default function WhatsAppPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorListItem[]>([]);

  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // UI states
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Mobile view state
  const [showChat, setShowChat] = useState(false);

  // Load conversations (with loading indicator)
  const loadConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoadingConversations(true);
      }
      const response = await comunicacaoService.listConversations({ limit: 100 });

      // Ordenar conversas por data da última mensagem (mais recentes primeiro)
      const sortedConversations = (response.conversations || []).sort((a, b) => {
        const dateA = new Date(a.last_message_at || 0).getTime();
        const dateB = new Date(b.last_message_at || 0).getTime();
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
      });

      setConversations(sortedConversations);
    } catch (error: any) {
    // console.error("Erro ao carregar conversas:", error);
      if (!silent) {
        setSnackbar({
          open: true,
          message: error.message || "Erro ao carregar conversas",
          severity: "error",
        });
      }
    } finally {
      if (!silent) {
        setLoadingConversations(false);
      }
    }
  }, []);

  // Load messages for selected conversation (with loading indicator)
  const loadMessages = useCallback(async (phone: string, silent = false) => {
    try {
      if (!silent) {
        setLoadingMessages(true);
      }
      const response = await comunicacaoService.listMessages(phone, { limit: 100 });
      setMessages(response.messages || []);

      // Mark as read
      await comunicacaoService.markAsRead({ phone });

      // Update conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.phone === phone ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error: any) {
    // console.error("Erro ao carregar mensagens:", error);
      if (!silent) {
        setSnackbar({
          open: true,
          message: error.message || "Erro ao carregar mensagens",
          severity: "error",
        });
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }, []);

  // Load colaboradores
  const loadColaboradores = useCallback(async () => {
    try {
      setLoadingColaboradores(true);
      const response = await colaboradoresService.list({ status: "ativo" });
      setColaboradores(response.colaboradores || []);
    } catch (error: any) {
    // console.error("Erro ao carregar colaboradores:", error);
    } finally {
      setLoadingColaboradores(false);
    }
  }, []);

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    (phone: string) => {
      setSelectedPhone(phone);
      loadMessages(phone);
      if (isMobile) {
        setShowChat(true);
      }
    },
    [loadMessages, isMobile]
  );

  // Handle send message
  const handleSendMessage = async (message: string) => {
    if (!selectedPhone) return;

    try {
      setSendingMessage(true);
      const response = await comunicacaoService.sendMessage({
        phone: selectedPhone,
        message,
      });

      // Add message to list optimistically
      const newMessage: Message = {
        message_id: response.message_id,
        phone: selectedPhone,
        message,
        direction: "outbound",
        status: response.status,
        created_at: response.sent_at,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Update conversation and reorder
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.phone === selectedPhone
            ? { ...conv, last_message: message, last_message_at: response.sent_at }
            : conv
        );
        // Reordenar por data da última mensagem (mais recentes primeiro)
        return updated.sort((a, b) => {
          const dateA = new Date(a.last_message_at || 0).getTime();
          const dateB = new Date(b.last_message_at || 0).getTime();
          return dateB - dateA;
        });
      });

      setSnackbar({
        open: true,
        message: "Mensagem enviada com sucesso!",
        severity: "success",
      });
    } catch (error: any) {
    // console.error("Erro ao enviar mensagem:", error);
      setSnackbar({
        open: true,
        message: error.message || "Erro ao enviar mensagem",
        severity: "error",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle broadcast
  const handleBroadcast = async (
    data: BroadcastMessageRequest
  ): Promise<BroadcastMessageResponse> => {
    try {
      const response = await comunicacaoService.broadcastMessage(data);

      setSnackbar({
        open: true,
        message: `Mensagens enviadas: ${response.total_sent}/${response.total_queued}`,
        severity: response.total_failed === 0 ? "success" : "warning",
      });

      // Reload conversations after broadcast
      setTimeout(() => {
        loadConversations();
      }, 2000);

      return response;
    } catch (error: any) {
    // console.error("Erro ao enviar broadcast:", error);
      throw error;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadConversations();
    if (selectedPhone) {
      loadMessages(selectedPhone);
    }
  };

  // Handle back on mobile
  const handleBack = () => {
    setShowChat(false);
    setSelectedPhone(null);
    setMessages([]);
  };

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user && user.userType !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user?.userType === "admin") {
      loadConversations(); // Com loading na primeira carga
      loadColaboradores();

      // Auto-refresh every 5 seconds (polling for new messages)
      const interval = setInterval(() => {
        // Only poll if tab is visible
        if (!document.hidden) {
          loadConversations(true); // SILENT mode - sem loading
          if (selectedPhone) {
            loadMessages(selectedPhone, true); // SILENT mode - sem loading
          }
        }
      }, 5000); // 5 seconds for more responsive updates

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, loadConversations, loadColaboradores, selectedPhone, loadMessages]);

  const selectedConversation = conversations.find((c) => c.phone === selectedPhone) || null;

  // Don't render if not admin
  if (!isAuthenticated || !user || user.userType !== "admin") {
    return null;
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 170px)",
        maxHeight: "calc(100vh - 170px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: alpha("#8270FF", 0.02),
        overflow: "hidden",
      }}
    >
      {/* Header with actions */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#ffffff",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        {isMobile && showChat && (
          <IconButton onClick={handleBack} sx={{ color: "#8270FF" }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Atualizar">
          <IconButton onClick={handleRefresh} sx={{ color: "#8270FF" }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<CampaignIcon />}
          onClick={() => setBroadcastModalOpen(true)}
          sx={{
            bgcolor: "#8270FF",
            "&:hover": {
              bgcolor: alpha("#8270FF", 0.8),
            },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {isMobile ? "WhatsApp" : "Envie mensagem pelo WhatsApp"}
        </Button>
      </Box>

      {/* Main content */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          display: "flex",
          overflow: "hidden",
          bgcolor: "transparent",
        }}
      >
        {/* Conversation List - Hidden on mobile when chat is open */}
        {(!isMobile || !showChat) && (
          <ConversationList
            conversations={conversations}
            selectedPhone={selectedPhone}
            onSelectConversation={handleSelectConversation}
            loading={loadingConversations}
          />
        )}

        {/* Chat Area - Hidden on mobile when chat is not open */}
        {(!isMobile || showChat) && (
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            loading={loadingMessages}
            onSendMessage={handleSendMessage}
            sendingMessage={sendingMessage}
          />
        )}
      </Paper>

      {/* Broadcast Modal */}
      <BroadcastModal
        open={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        onSend={handleBroadcast}
        onSuccess={() => loadConversations(true)} // Atualizar conversas após envio
        colaboradores={colaboradores}
        loadingColaboradores={loadingColaboradores}
      />

      {/* Snackbar for notifications */}
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
