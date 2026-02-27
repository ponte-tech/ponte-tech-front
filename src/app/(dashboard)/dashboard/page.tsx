"use client";

import { Box, Paper, Typography, Card, CardContent, alpha, IconButton, Grid } from "@mui/material";

import { TrendingUp, People, School, ShoppingCart, MoreVert } from "@mui/icons-material";
import { useAuth } from "@/app/hooks/useAuth";

const stats = [
  {
    title: "Total de Alunos",
    value: "1,234",
    change: "+12%",
    icon: <People sx={{ fontSize: 32 }} />,
    color: "#8270FF",
    bgColor: alpha("#8270FF", 0.1),
  },
  {
    title: "Cursos Ativos",
    value: "42",
    change: "+5%",
    icon: <School sx={{ fontSize: 32 }} />,
    color: "#10b981",
    bgColor: alpha("#10b981", 0.1),
  },
  {
    title: "Vendas do Mês",
    value: "R$ 45.2K",
    change: "+23%",
    icon: <ShoppingCart sx={{ fontSize: 32 }} />,
    color: "#f59e0b",
    bgColor: alpha("#f59e0b", 0.1),
  },
  {
    title: "Taxa de Crescimento",
    value: "18.5%",
    change: "+8%",
    icon: <TrendingUp sx={{ fontSize: 32 }} />,
    color: "#06b6d4",
    bgColor: alpha("#06b6d4", 0.1),
  },
];

const recentActivities = [
  { title: "Novo aluno cadastrado", time: "5 min atrás", type: "success" },
  { title: "Curso atualizado", time: "2 horas atrás", type: "info" },
  { title: "Pagamento aprovado", time: "5 horas atrás", type: "success" },
  { title: "Relatório gerado", time: "1 dia atrás", type: "info" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#202031",
            mb: 0.5,
          }}
        >
          Olá, {user?.name?.split(" ")[0] || "Usuário"}! 👋
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
          }}
        >
          Aqui está o resumo das suas atividades hoje
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid xs={12} sm={6} lg={3} key={index}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                  borderColor: stat.color,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box
                    sx={{
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {stat.change}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#202031",
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                  }}
                >
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Atividades Recentes
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <Box sx={{ p: 3 }}>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 2,
                    borderBottom:
                      index < recentActivities.length - 1
                        ? "1px solid"
                        : "none",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor:
                        activity.type === "success" ? "#10b981" : "#8270FF",
                      mr: 2,
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #8270FF 0%, #6a5dd9 100%)",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Desempenho Mensal
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                92%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Meta atingida este mês
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Continue assim! Você está se saindo muito bem. 🎉
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Notificações
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              Você está em dia!
              Nenhuma notificação pendente.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
