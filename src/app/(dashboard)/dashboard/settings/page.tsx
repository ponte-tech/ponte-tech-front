"use client";

import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Configurações
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Notificações
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                }
                label="Notificações por Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                }
                label="Notificações Push"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Aparência
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Modo Escuro"
            />
          </Paper>
        </Grid>

        <Grid xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Alterar Senha
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Senha Atual"
                  autoComplete="current-password"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Nova Senha"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmar Nova Senha"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              sx={{ mt: 2 }}
            >
              Alterar Senha
            </Button>
          </Paper>
        </Grid>

        <Grid xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderColor: "error.main" }}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="error">
              Zona de Perigo
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
              Esta ação não pode ser desfeita.
            </Typography>
            <Button variant="outlined" color="error">
              Excluir Conta
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
