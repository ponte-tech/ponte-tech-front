"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Bem-vindo de volta! Faça login para continuar.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />

            <Box sx={{ mt: 1, mb: 2, textAlign: "right" }}>
              <Link
                href="/forgot-password"
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 2, mb: 2 }}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  variant="body2"
                  sx={{ cursor: "pointer", fontWeight: 600 }}
                >
                  Cadastre-se
                </Link>
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Link
                href="/"
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                ← Voltar para o site
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
