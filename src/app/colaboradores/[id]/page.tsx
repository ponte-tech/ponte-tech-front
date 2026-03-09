"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Alert,
  Avatar,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Pix as PixIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import colaboradoresService from "@/app/services/colaboradoresService";
import contratosService from "@/app/services/contratosService";
import { Colaborador, ColaboradorStatus, Contrato } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import ContractsList from "../components/ContractsList";

const statusLabels: Record<ColaboradorStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

const statusColors: Record<ColaboradorStatus, "success" | "error"> = {
  ativo: "success",
  inativo: "error",
};

export default function ColaboradorDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractsKey, setContractsKey] = useState(0);

  const isAdmin = user?.userType === "admin";
  const isColaborador = user?.userType === "colaborador";
  const colaboradorId = params.id as string;

  useEffect(() => {
    if (user) {
      if (isColaborador && user.id !== colaboradorId) {
        router.push(`/colaboradores/${user.id}`);
      } else if (!isAdmin && !isColaborador) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, isColaborador, colaboradorId, router]);

  useEffect(() => {
    if (isAdmin) {
      loadColaborador();
      loadContratos();
    }
  }, [colaboradorId, isAdmin]);

  const loadColaborador = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await colaboradoresService.getById(colaboradorId);
      setColaborador(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar colaborador");
      console.error("Erro ao carregar colaborador:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContratos = async () => {
    try {
      const data = await contratosService.getByUserId(colaboradorId);
      setContratos(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar contratos:", err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !colaborador) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/colaboradores")}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Voltar
        </Button>
        <Alert severity="error">
          {error || "Colaborador não encontrado"}
        </Alert>
      </Box>
    );
  }

  // Calculate totals from active contracts
  const activeContracts = contratos.filter(c => c.status === 'ativo');
  const totalValorHora = activeContracts.reduce((sum, c) => sum + (c.valor_hora || 0), 0);
  const totalHorasMensais = activeContracts.reduce((sum, c) => sum + (c.total_hora_mes || 0), 0);
  const salarioMensal = totalValorHora * totalHorasMensais;

  const iniciais = colaborador.nome_completo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Box sx={{ p: 3, bgcolor: "#fafbfc", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/colaboradores")}
            sx={{
              mb: 3,
              textTransform: "none",
              color: "text.secondary"
            }}
          >
            Voltar
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "#667eea",
                  fontSize: 24,
                  fontWeight: "600",
                }}
              >
                {iniciais}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="600" sx={{ mb: 0.5 }}>
                  {colaborador.nome_completo}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Chip
                    label={statusLabels[colaborador.status]}
                    color={statusColors[colaborador.status]}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {colaborador.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/colaboradores/${colaboradorId}/editar`)}
              sx={{
                bgcolor: "#667eea",
                textTransform: "none",
                px: 3,
                "&:hover": { bgcolor: "#5568d3" },
              }}
            >
              Editar
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Financial Metrics */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <TrendingUpIcon sx={{ color: "#667eea" }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="500">
                    Valor por Hora
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600">
                  {formatCurrency(totalValorHora)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <WorkIcon sx={{ color: "#667eea" }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="500">
                    Horas Mensais
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600">
                  {totalHorasMensais}h
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <TrendingUpIcon sx={{ color: "#10b981" }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="500">
                    Salário Estimado
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="600" color="#10b981">
                  {formatCurrency(salarioMensal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Dados Pessoais */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <PersonIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h6" fontWeight="600">
                    Dados Pessoais
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      CPF
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {formatCPF(colaborador.cpf)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      CNPJ
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {formatCNPJ(colaborador.cnpj)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Celular
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {formatPhone(colaborador.celular)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {colaborador.email}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <HomeIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h6" fontWeight="600">
                    Endereço
                  </Typography>
                </Box>

                {colaborador.endereco ? (
                  <Stack spacing={0.5}>
                    <Typography variant="body1">
                      {colaborador.endereco.logradouro}, {colaborador.endereco.numero}
                      {colaborador.endereco.complemento && ` - ${colaborador.endereco.complemento}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {colaborador.endereco.bairro} - {colaborador.endereco.cidade}/{colaborador.endereco.estado}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CEP: {formatCEP(colaborador.endereco.cep)}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Endereço não informado
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Contratos */}
            <ContractsList
              userId={colaborador.user_id}
              onContractAdded={contractsKey}
            />
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Dados Financeiros */}
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <PixIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h6" fontWeight="600">
                    Pagamento
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Chave PIX
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {colaborador.dados_financeiros?.chave_pix || "Não informada"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Dia do Pagamento
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {colaborador.dados_financeiros?.data_pagamento
                        ? `Dia ${colaborador.dados_financeiros.data_pagamento}`
                        : "Não informado"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Informações Contratuais */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <WorkIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h6" fontWeight="600">
                    Dados Contratuais
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Data de Contratação
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {colaborador.dados_contratuais?.data_contratacao
                        ? formatDate(colaborador.dados_contratuais.data_contratacao)
                        : "Não informada"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="500">
                      Data de Cadastro
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatDate(colaborador.data_cadastro)}
                    </Typography>
                  </Box>

                  {colaborador.data_atualizacao && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        Última Atualização
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formatDate(colaborador.data_atualizacao)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
