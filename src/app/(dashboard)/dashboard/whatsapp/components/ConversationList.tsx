"use client";

import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  alpha,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon, WhatsApp as WhatsAppIcon } from "@mui/icons-material";
import { Conversation } from "@/app/types/comunicacao";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationListProps {
  conversations: Conversation[];
  selectedPhone: string | null;
  onSelectConversation: (phone: string) => void;
  loading: boolean;
}

export default function ConversationList({
  conversations,
  selectedPhone,
  onSelectConversation,
  loading,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.phone.includes(searchTerm)
  );

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "";
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 360 },
        borderRight: { xs: 0, md: 1 },
        borderColor: "divider",
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
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#8270FF",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WhatsAppIcon />
          Conversas
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar conversa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
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
      </Box>

      {/* Conversations List */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <CircularProgress sx={{ color: "#8270FF" }} />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              px: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {searchTerm
                ? "Nenhuma conversa encontrada"
                : "Nenhuma conversa ainda. Envie uma mensagem para começar!"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {filteredConversations.map((conversation) => {
              const isSelected = selectedPhone === conversation.phone;
              return (
                <ListItem key={conversation.phone} disablePadding>
                  <ListItemButton
                    onClick={() => onSelectConversation(conversation.phone)}
                    selected={isSelected}
                    sx={{
                      py: 1.5,
                      px: 2,
                      transition: "all 0.2s ease-in-out",
                      borderLeft: isSelected ? 4 : 0,
                      borderColor: "#8270FF",
                      bgcolor: isSelected ? alpha("#8270FF", 0.08) : "transparent",
                      "&:hover": {
                        bgcolor: isSelected
                          ? alpha("#8270FF", 0.12)
                          : alpha("#8270FF", 0.04),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unread_count}
                        color="error"
                        overlap="circular"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.7rem",
                            height: 20,
                            minWidth: 20,
                            fontWeight: 600,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: isSelected ? "#8270FF" : alpha("#8270FF", 0.2),
                            color: isSelected ? "#ffffff" : "#8270FF",
                            fontWeight: 600,
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          {getInitials(conversation.name)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: conversation.unread_count > 0 ? 600 : 500,
                            color: isSelected ? "#8270FF" : "text.primary",
                          }}
                        >
                          {conversation.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.875rem",
                              display: "block",
                            }}
                          >
                            {conversation.last_message || "Nenhuma mensagem"}
                          </Typography>
                          {conversation.last_message_at && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem", mt: 0.5, display: "block" }}
                            >
                              {formatTime(conversation.last_message_at)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}
