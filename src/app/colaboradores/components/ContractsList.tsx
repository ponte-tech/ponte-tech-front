"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CheckCircle as ActiveIcon, Cancel as InactiveIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import contratosService from "@/app/services/contratosService";
import type { Contrato } from "@/app/types/api";

interface ContractsListProps {
  userId: string;
  onContractAdded?: () => void;
}

export default function ContractsList({ userId, onContractAdded }: ContractsListProps) {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const loadContratos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratosService.getByUserId(userId);
      setContratos(data || []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar contratos");
    // console.error("Erro ao carregar contratos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadContratos();
    }
  }, [userId, onContractAdded]);

  const handleActivate = async (contratoId: string) => {
    try {
      setActivating(contratoId);
      setError(null);
      await contratosService.activate(userId, contratoId);
      await loadContratos();
    } catch (err: any) {
      setError(err.message || "Erro ao ativar contrato");
    // console.error("Erro ao ativar contrato:", err);
    } finally {
      setActivating(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Contratos
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!contratos || contratos.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhum contrato encontrado. Adicione o primeiro contrato abaixo.
          </Alert>
        ) : (
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell>Fim</TableCell>
                  <TableCell align="right">Valor/Hora</TableCell>
                  <TableCell align="right">Horas/Mês</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Tipo</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contratos?.map((contrato) => (
                  <TableRow
                    key={contrato.contrato_id}
                    sx={{
                      bgcolor: contrato.status === "ativo" ? "success.50" : "inherit",
                      "&:hover": { bgcolor: contrato.status === "ativo" ? "success.100" : "action.hover" },
                    }}
                  >
                    <TableCell>{contrato.nome_cliente}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contrato.descricao}
                    </TableCell>
                    <TableCell>{formatDate(contrato.data_inicio)}</TableCell>
                    <TableCell>{formatDate(contrato.data_fim)}</TableCell>
                    <TableCell align="right">{formatCurrency(contrato.valor_hora)}</TableCell>
                    <TableCell align="right">{contrato.total_hora_mes}h</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="600" color="primary">
                        {formatCurrency(contrato.valor_total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {contrato.status === "ativo" ? (
                        <Chip
                          label="Ativo"
                          color="success"
                          size="small"
                          icon={<ActiveIcon />}
                        />
                      ) : (
                        <Chip
                          label="Inativo"
                          color="default"
                          size="small"
                          icon={<InactiveIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={contrato.tipo_contrato === "fechado" ? "Fechado" : "Aberto"}
                        size="small"
                        sx={{
                          bgcolor: contrato.tipo_contrato === "fechado" ? "#8270FF" : "#f59e0b",
                          color: "#FFFFFF",
                          fontWeight: 600,
                          minWidth: 80,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {contrato.status === "inativo" && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleActivate(contrato.contrato_id)}
                          disabled={activating === contrato.contrato_id}
                          sx={{ textTransform: "none" }}
                        >
                          {activating === contrato.contrato_id ? (
                            <CircularProgress size={16} />
                          ) : (
                            "Reativar"
                          )}
                        </Button>
                      )}
                      {contrato.status === "ativo" && (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
