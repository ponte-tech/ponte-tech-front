"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Button,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CloudDownload as CloudDownloadIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import impostoService from "@/app/services/impostoService";
import empresaService from "@/app/services/empresaService";
import type { Imposto, Anexo } from "@/app/types/imposto";
import { TIPOS_IMPOSTO } from "@/app/types/imposto";
import type { Empresa } from "@/app/types/empresa";
import { PageHeader } from "@/app/shared/components";

export default function DetalhesImpostoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const impostoId = params.id as string;
  const empresaId = searchParams.get("empresa_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imposto, setImposto] = useState<Imposto | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [downloadingAnexoKey, setDownloadingAnexoKey] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [impostoId]);

  const loadData = async () => {
    if (!empresaId) {
      setError("ID da empresa não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const impostoData = await impostoService.getById(impostoId, empresaId);

      setImposto(impostoData);

      // Carregar dados da empresa
      const empresasData = await empresaService.list();
      const empresaEncontrada = empresasData.empresas?.find(
        (e) => e.empresa_id === impostoData.empresa_id
      );
      setEmpresa(empresaEncontrada || null);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar detalhes do imposto");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAnexo = async (anexo: Anexo) => {
    if (!imposto) return;

    try {
      setDownloadingAnexoKey(anexo.s3_key);

      const response = await impostoService.getAnexoDownloadUrl(
        imposto.imposto_id,
        imposto.empresa_id,
        anexo.s3_key
      );


      // Abrir em nova aba para download
      window.open(response.download_url, "_blank");
    } catch (err) {
      console.error("❌ [DOWNLOAD] Erro ao fazer download do anexo:", err);
      setError("Erro ao fazer download do anexo");
    } finally {
      setDownloadingAnexoKey(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMesReferencia = (mesRef: string): string => {
    const [year, month] = mesRef.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTipoImpostoLabel = (tipo: string): string => {
    const tipoObj = TIPOS_IMPOSTO.find((t) => t.value === tipo);
    return tipoObj?.label || tipo;
  };

  const getColorForTipo = (tipo: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      IRPJ: "primary",
      CSLL: "secondary",
      PIS: "info",
      COFINS: "info",
      ISS: "success",
      ICMS: "warning",
      IPI: "warning",
      INSS: "error",
      FGTS: "error",
      SIMPLES_NACIONAL: "success",
      HONORARIOS_CONTABEIS: "primary",
      OUTROS: "default",
    };
    return colorMap[tipo] || "default";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !imposto) {
    return (
      <Box>
        <Alert severity="error">{error || "Imposto não encontrado"}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/contabilidade/impostos")}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Detalhes do Imposto"
        description="Informações completas e documentos anexados"
        actionButton={{
          label: "Voltar",
          icon: <ArrowBackIcon />,
          onClick: () => router.push("/dashboard/contabilidade/impostos"),
          visible: true,
        }}
      />

      <Grid container spacing={3}>
        {/* Cabeçalho com Informações Principais - Destaque */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)" }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Empresa e CNPJ */}
                <Grid item xs={12} md={5}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Empresa
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {empresa?.nome_fantasia || "Não informado"}
                  </Typography>
                  {empresa?.cnpj && (
                    <Typography variant="body2" color="text.secondary">
                      CNPJ: {empresa.cnpj}
                    </Typography>
                  )}
                </Grid>

                {/* Tipo e Mês Referência */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Tipo de Imposto
                      </Typography>
                      <Chip
                        label={getTipoImpostoLabel(imposto.tipo_imposto)}
                        color={getColorForTipo(imposto.tipo_imposto)}
                        size="medium"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Mês de Referência
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatMesReferencia(imposto.mes_referencia)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Valor em Destaque */}
                <Grid item xs={12} md={3}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      bgcolor: "success.50",
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: "success.200",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Valor do Imposto
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {formatCurrency(imposto.valor)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Descrição */}
        {imposto.descricao && (
          <Grid item xs={12}>
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Descrição
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}>
                  {imposto.descricao}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Metadados e Resumo */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Resumo de Anexos */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Total de Anexos
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {imposto.anexos?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Tamanho Total */}
            {imposto.anexos && imposto.anexos.length > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Tamanho Total
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {formatFileSize(
                        imposto.anexos.reduce((sum, anexo) => sum + anexo.tamanho_bytes, 0)
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Data de Cadastro */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Data de Cadastro
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(imposto.data_cadastro)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Última Atualização */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Última Atualização
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(imposto.data_atualizacao)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Tabela de Anexos - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Anexos
                </Typography>
                <Chip
                  label={`${imposto.anexos?.length || 0} arquivo(s)`}
                  color="primary"
                  size="small"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />

              {!imposto.anexos || imposto.anexos.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, bgcolor: "grey.50", borderRadius: 2 }}>
                  <AttachFileIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nenhum anexo disponível
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="medium" sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>Arquivo</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Tamanho</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Data de Upload</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100 }} align="center">
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {imposto.anexos.map((anexo, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1,
                                  bgcolor: "primary.50",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <AttachFileIcon sx={{ color: "primary.main", fontSize: 20 }} />
                              </Box>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 300,
                                }}
                              >
                                {anexo.nome_arquivo}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getTipoImpostoLabel(anexo.tipo_imposto || "OUTROS")}
                              color={getColorForTipo(anexo.tipo_imposto || "OUTROS")}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {formatFileSize(anexo.tamanho_bytes)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {formatDateTime(anexo.data_upload)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Baixar arquivo" arrow>
                              <span>
                                <IconButton
                                  onClick={() => handleDownloadAnexo(anexo)}
                                  disabled={downloadingAnexoKey === anexo.s3_key}
                                  color="primary"
                                  size="small"
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "primary.50",
                                    },
                                  }}
                                >
                                  {downloadingAnexoKey === anexo.s3_key ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <CloudDownloadIcon />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
