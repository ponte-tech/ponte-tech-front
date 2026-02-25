"use client";

import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  TrendingUp,
  People,
  Assignment,
  CheckCircle,
} from "@mui/icons-material";

const stats = [
  {
    title: "Total de Usuários",
    value: "1,234",
    icon: <People sx={{ fontSize: 40 }} />,
    color: "#1976d2",
  },
  {
    title: "Projetos Ativos",
    value: "42",
    icon: <Assignment sx={{ fontSize: 40 }} />,
    color: "#2e7d32",
  },
  {
    title: "Tarefas Concluídas",
    value: "856",
    icon: <CheckCircle sx={{ fontSize: 40 }} />,
    color: "#ed6c02",
  },
  {
    title: "Taxa de Crescimento",
    value: "+23%",
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    color: "#9c27b0",
  },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      gutterBottom
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Atividades Recentes
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography color="text.secondary">
                Nenhuma atividade recente para mostrar.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Notificações
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography color="text.secondary">
                Você não tem notificações no momento.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
