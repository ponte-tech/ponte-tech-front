"use client";

import React, { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  alpha,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Message, Conversation } from "@/app/types/comunicacao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  sendingMessage: boolean;
}

export default function ChatArea({
  conversation,
  messages,
  loading,
  onSendMessage,
  sendingMessage,
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, conversation]);

  const handleSend = () => {
    if (newMessage.trim() && !sendingMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <DoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
      case "delivered":
        return <DoneAllIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
      case "read":
        return <DoneAllIcon sx={{ fontSize: 16, color: "#8270FF" }} />;
      case "failed":
        return <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha("#8270FF", 0.02),
          p: 4,
        }}
      >
        <WhatsAppIcon sx={{ fontSize: 80, color: alpha("#8270FF", 0.3), mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Selecione uma conversa
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Escolha uma conversa da lista ao lado ou envie uma mensagem em massa
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: alpha("#8270FF", 0.05),
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#8270FF",
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          {getInitials(conversation.name)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#8270FF" }}>
            {conversation.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {conversation.phone}
          </Typography>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          bgcolor: alpha("#8270FF", 0.02),
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${alpha("#8270FF", 0.01)} 10px,
            ${alpha("#8270FF", 0.01)} 20px
          )`,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress sx={{ color: "#8270FF" }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nenhuma mensagem nesta conversa.
              <br />
              Envie a primeira mensagem!
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message) => {
              const isOutbound = message.direction === "outbound";
              return (
                <Box
                  key={message.message_id}
                  sx={{
                    display: "flex",
                    justifyContent: isOutbound ? "flex-end" : "flex-start",
                    mb: 1.5,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      maxWidth: "70%",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isOutbound ? "#8270FF" : "#ffffff",
                      color: isOutbound ? "#ffffff" : "text.primary",
                      position: "relative",
                      ...(isOutbound
                        ? {
                            borderBottomRightRadius: 4,
                          }
                        : {
                            borderBottomLeftRadius: 4,
                          }),
                    }}
                  >
                    {!isOutbound && message.sender_name && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "#8270FF",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        {message.sender_name}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        mb: 0.5,
                      }}
                    >
                      {message.message}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.7rem",
                          color: isOutbound ? alpha("#ffffff", 0.8) : "text.secondary",
                        }}
                      >
                        {formatTime(message.created_at)}
                      </Typography>
                      {isOutbound && getStatusIcon(message.status)}
                    </Box>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: alpha("#8270FF", 0.03),
                "&:hover": {
                  bgcolor: alpha("#8270FF", 0.05),
                },
                "&.Mui-focused": {
                  bgcolor: "#ffffff",
                },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!newMessage.trim() || sendingMessage}
            sx={{
              bgcolor: "#8270FF",
              color: "#ffffff",
              width: 48,
              height: 48,
              "&:hover": {
                bgcolor: alpha("#8270FF", 0.8),
              },
              "&:disabled": {
                bgcolor: alpha("#8270FF", 0.3),
                color: alpha("#ffffff", 0.5),
              },
            }}
          >
            {sendingMessage ? (
              <CircularProgress size={24} sx={{ color: "#ffffff" }} />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
