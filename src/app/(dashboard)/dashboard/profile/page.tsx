"use client";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    // TODO: Implementar salvamento no backend
    alert("Perfil atualizado com sucesso!");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
                fontSize: 48,
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user?.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user?.email}
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            >
              Alterar Foto
            </Button>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Informações Pessoais
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Cargo"
                  defaultValue={user?.role || ""}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
              <Button
                variant="outlined"
                size="large"
              >
                Cancelar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
