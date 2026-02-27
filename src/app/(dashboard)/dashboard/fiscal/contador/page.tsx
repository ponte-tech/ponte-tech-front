"use client";

import { Box, Card, CardContent, Typography, TextField, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, alpha, Grid } from "@mui/material";

import { Download as DownloadIcon, InsertDriveFile as FileIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import fiscalService from "@/app/services/fiscalService";
import { NotaFiscalResponse, NotaFiscalStatus } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatCurrency, formatDate, formatMonthYear } from "@/app/utils/format-utils";
import StatusChip from "../../components/StatusChip";

export default function ContadorFiscalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notas, setNotas] = useState<NotaFiscalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isContador = user?.userType === "contador";
  const isAdmin = user?.userType === "admin";

  const loadNotas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fiscalService.contadorListNotas();
      setNotas(response.items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar notas fiscais";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isContador && !isAdmin) {
      router.push("/dashboard/fiscal");
      return;
    }
    loadNotas();
  }, [isContador, isAdmin, router, loadNotas]);

  const handleDownloadFile = (notaId: string, arquivoId: string) => {
    const url = fiscalService.getDownloadUrl(notaId, arquivoId);
    window.open(url, "_blank");
  };

  const filteredNotas = notas.filter(
    (nota) =>
      (nota.user_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.numero_nota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isContador && !isAdmin) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Notas Fiscais - Contador
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualização de todas as notas fiscais dos colaboradores
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Pesquisar por colaborador ou número da nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotas.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma nota fiscal encontrada
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Colaborador</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nota</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mês/Ano</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Data Envio</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Arquivos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotas.map((nota) => (
                    <TableRow
                      key={nota.nota_id}
                      hover
                      sx={{ "&:hover": { bgcolor: alpha("#8270FF", 0.03) } }}
                    >
                      <TableCell>{nota.user_nome || nota.user_id}</TableCell>
                      <TableCell>{nota.numero_nota}</TableCell>
                      <TableCell>{formatMonthYear(nota.ano_mes)}</TableCell>
                      <TableCell>{formatCurrency(nota.valor_nota)}</TableCell>
                      <TableCell>
                        <StatusChip status={nota.status} />
                      </TableCell>
                      <TableCell>{formatDate(nota.data_upload)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {nota.arquivos.map((arquivo) => (
                            <IconButton
                              key={arquivo.arquivo_id}
                              size="small"
                              onClick={() => handleDownloadFile(nota.nota_id, arquivo.arquivo_id)}
                              title={arquivo.nome_original}
                            >
                              <FileIcon fontSize="small" sx={{ color: "#8270FF" }} />
                            </IconButton>
                          ))}
                          {nota.arquivos.length === 0 && (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
