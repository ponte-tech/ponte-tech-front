"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import colaboradoresService from "@/app/services/colaboradoresService";
import contratosService from "@/app/services/contratosService";
import { CreateColaboradorRequest, CreateContratoRequest, TipoChavePix } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import ContractModal from "../components/ContractModal";
import clienteService from "@/app/services/clienteService";
import type { Cliente } from "@/app/types/cliente";
import empresaService from "@/app/services/empresaService";
import type { Empresa } from "@/app/types/empresa";

export default function NovoColaboradorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contracts, setContracts] = useState<CreateContratoRequest[]>([]);
  const contractsRef = useRef<CreateContratoRequest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const isAdmin = user?.userType === "admin";

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, router]);

  // Manter ref atualizado com o state de contracts
  useEffect(() => {
    contractsRef.current = contracts;
    console.log("🔄 [CONTRACTS REF] Atualizado:", contracts.length, "contratos");
  }, [contracts]);

  // Carregar clientes
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const clientesResponse = await clienteService.list();
      setClientes(clientesResponse.clientes || []);

      const empresasResponse = await empresaService.list();
      setEmpresas(empresasResponse.empresas || []);
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    }
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.cliente_id === clienteId);
    return cliente?.razao_social || 'Cliente não encontrado';
  };

  const [formData, setFormData] = useState<CreateColaboradorRequest>({
    nome_completo: "",
    cpf: "",
    cnpj: "",
    empresa_id: "",
    email: "",
    celular: "",
    senha: "",
    nome_contato_emergencia: "",
    telefone_contato_emergencia: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    dados_financeiros: {
      tipo_chave_pix: "cpf",
      chave_pix: "",
      data_pagamento: "5",
    },
  });

  // Funções de máscara
  const applyMaskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const applyMaskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const applyMaskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const applyMaskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  // Funções de validação
  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;

    return true;
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    let pos = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * pos;
      pos = pos === 2 ? 9 : pos - 1;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(12))) return false;

    sum = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * pos;
      pos = pos === 2 ? 9 : pos - 1;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(13))) return false;

    return true;
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 || cleaned.length === 11;
  };

  const validateCEP = (cep: string): boolean => {
    const cleaned = cep.replace(/\D/g, "");
    return cleaned.length === 8;
  };

  const handleChange = (field: string, value: any) => {
    let maskedValue = value;

    // Aplicar máscaras
    if (field === "cpf") {
      maskedValue = applyMaskCPF(value);
    } else if (field === "cnpj") {
      maskedValue = applyMaskCNPJ(value);
    } else if (field === "celular" || field === "telefone_contato_emergencia") {
      maskedValue = applyMaskPhone(value);
    } else if (field === "endereco.cep") {
      maskedValue = applyMaskCEP(value);
    } else if (field === "endereco.estado") {
      maskedValue = value.toUpperCase().slice(0, 2);
    }

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateColaboradorRequest] as any),
          [child]: maskedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: maskedValue }));
    }

    // Limpar erro do campo ao digitar
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setError(null);
  };

  const handleBlur = (field: string, value: string) => {
    let errorMessage = "";

    if (field === "cpf" && value) {
      if (!validateCPF(value)) {
        errorMessage = "CPF inválido";
      }
    } else if (field === "cnpj" && value) {
      if (!validateCNPJ(value)) {
        errorMessage = "CNPJ inválido";
      }
    } else if (field === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = "Email inválido";
      }
    } else if (field === "celular" && value) {
      if (!validatePhone(value)) {
        errorMessage = "Telefone inválido";
      }
    } else if (field === "telefone_contato_emergencia" && value) {
      if (!validatePhone(value)) {
        errorMessage = "Telefone inválido";
      }
    } else if (field === "endereco.cep" && value) {
      if (!validateCEP(value)) {
        errorMessage = "CEP inválido";
      }
    } else if (field === "nome_completo" && value) {
      if (value.trim().split(" ").length < 2) {
        errorMessage = "Informe nome e sobrenome";
      }
    } else if (field === "senha" && value) {
      if (value.length < 8) {
        errorMessage = "Mínimo de 8 caracteres";
      }
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [field]: errorMessage }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calcular totais dos contratos ativos
  const calculateTotals = () => {
    const totalHoras = contracts.reduce((sum, c) => sum + c.total_hora_mes, 0);
    const totalValor = contracts.reduce((sum, c) => sum + (c.valor_hora * c.total_hora_mes), 0);
    return { totalHoras, totalValor };
  };

  const { totalHoras, totalValor } = calculateTotals();

  const handleAddContract = (contract: CreateContratoRequest) => {
    console.log("📝 [NOVO COLABORADOR] Contrato adicionado à lista:", contract);
    setContracts((prev) => {
      const newContracts = [...prev, contract];
      console.log("📋 [NOVO COLABORADOR] Total de contratos na lista:", newContracts.length);
      console.log("📋 [NOVO COLABORADOR] Lista completa de contratos:", newContracts);
      return newContracts;
    });
    setModalOpen(false);
  };

  const handleDeleteContract = (index: number) => {
    setContracts((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!formData.nome_completo || !formData.cpf || !formData.cnpj || !formData.empresa_id || !formData.email || !formData.celular) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Validar que pelo menos 1 contrato foi adicionado
      if (contractsRef.current.length === 0) {
        throw new Error("É necessário adicionar pelo menos 1 contrato para o colaborador");
      }

      // Validar nome (deve ter pelo menos nome e sobrenome)
      if (formData.nome_completo.trim().split(" ").length < 2) {
        throw new Error("Por favor, informe o nome completo");
      }

      // Validar CPF
      if (!validateCPF(formData.cpf)) {
        throw new Error("CPF inválido");
      }

      // Validar CNPJ
      if (!validateCNPJ(formData.cnpj)) {
        throw new Error("CNPJ inválido");
      }

      // Validar celular
      if (!validatePhone(formData.celular)) {
        throw new Error("Celular inválido. Use o formato (00) 00000-0000");
      }

      // Validar telefone de emergência se preenchido
      if (formData.telefone_contato_emergencia && !validatePhone(formData.telefone_contato_emergencia)) {
        throw new Error("Telefone de emergência inválido. Use o formato (00) 00000-0000");
      }

      // Validar senha
      if (!formData.senha || formData.senha.length < 8) {
        throw new Error("A senha deve ter no mínimo 8 caracteres");
      }

      // Validar CEP
      if (!validateCEP(formData.endereco.cep)) {
        throw new Error("CEP inválido. Use o formato 00000-000");
      }

      // Validar endereço
      if (
        !formData.endereco.cep ||
        !formData.endereco.logradouro ||
        !formData.endereco.numero ||
        !formData.endereco.bairro ||
        !formData.endereco.cidade ||
        !formData.endereco.estado
      ) {
        throw new Error("Por favor, preencha todos os campos do endereço");
      }

      // Validar estado
      if (formData.endereco.estado.length !== 2) {
        throw new Error("Estado inválido. Use a sigla com 2 letras (ex: SP)");
      }

      // Validar dados financeiros
      if (!formData.dados_financeiros?.chave_pix) {
        throw new Error("Por favor, informe a chave PIX");
      }

      // Validar dia do pagamento
      const diaPagamento = parseInt(formData.dados_financeiros.data_pagamento);
      if (isNaN(diaPagamento) || diaPagamento < 1 || diaPagamento > 31) {
        throw new Error("Dia do pagamento deve ser entre 1 e 31");
      }

      // Usar o ref para garantir que temos a versão mais recente dos contratos
      const currentContracts = contractsRef.current;
      console.log("📊 [NOVO COLABORADOR] INÍCIO DO SUBMIT");
      console.log("📊 [NOVO COLABORADOR] Contratos do STATE:", contracts.length);
      console.log("📊 [NOVO COLABORADOR] Contratos do REF:", currentContracts.length);
      console.log("📊 [NOVO COLABORADOR] Lista de contratos:", JSON.stringify(currentContracts, null, 2));

      // Criar colaborador
      console.log("👤 [NOVO COLABORADOR] Criando colaborador...");
      const response = await colaboradoresService.create(formData);
      const userId = response.user_id || response.id;
      setCreatedUserId(userId);
      console.log("✅ [NOVO COLABORADOR] Colaborador criado:", response);
      console.log("✅ [NOVO COLABORADOR] User ID extraído:", userId);

      // Aguardar 2 segundos para garantir que o colaborador foi persistido no DynamoDB
      if (currentContracts.length > 0 && userId) {
        console.log("⏳ [NOVO COLABORADOR] Aguardando 2 segundos para garantir consistência do DynamoDB...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Criar contratos associados usando o ref
      console.log("📋 [NOVO COLABORADOR] Verificando contratos a serem criados...");
      console.log("📋 [NOVO COLABORADOR] Quantidade de contratos:", currentContracts.length);

      if (currentContracts.length > 0 && userId) {
        console.log("🚀 [NOVO COLABORADOR] Iniciando criação de contratos...");
        for (let i = 0; i < currentContracts.length; i++) {
          const contract = currentContracts[i];
          console.log(`📝 [NOVO COLABORADOR] Criando contrato ${i + 1}/${currentContracts.length}:`, contract);
          try {
            const createdContract = await contratosService.create(userId, contract);
            console.log(`✅ [NOVO COLABORADOR] Contrato ${i + 1} criado com sucesso:`, createdContract);
          } catch (contractError: any) {
            console.error(`❌ [NOVO COLABORADOR] Erro ao criar contrato ${i + 1}:`, contractError);
            console.error("❌ [NOVO COLABORADOR] Detalhes do erro:", contractError.response?.data || contractError.message);
            throw new Error(`Falha ao criar contrato ${i + 1}: ${contractError.response?.data?.message || contractError.message}`);
          }
        }
        console.log("✅ [NOVO COLABORADOR] Todos os contratos foram criados!");
      } else {
        console.warn("⚠️ [NOVO COLABORADOR] Nenhum contrato será criado. Motivo:", {
          temContratos: currentContracts.length > 0,
          temUserId: !!userId,
          contracts: currentContracts,
          userId: userId
        });
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/colaboradores/${response.id}`);
      }, 1500);
    } catch (err: any) {
      // Extrair mensagem do erro da API
      const errorMessage = err.response?.data?.message || err.message || "Erro ao criar colaborador";
      setError(errorMessage);
      console.error("Erro ao criar colaborador:", err);
      // Scroll para o topo para exibir o erro
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/colaboradores")}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Novo Colaborador
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha as informações para cadastrar um novo colaborador
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Colaborador criado com sucesso! Redirecionando...
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Informações Pessoais */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Informações Pessoais
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      required
                      value={formData.nome_completo}
                      onChange={(e) => handleChange("nome_completo", e.target.value)}
                      onBlur={(e) => handleBlur("nome_completo", e.target.value)}
                      disabled={loading}
                      error={!!fieldErrors.nome_completo}
                      helperText={fieldErrors.nome_completo}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CPF"
                      required
                      value={formData.cpf}
                      onChange={(e) => handleChange("cpf", e.target.value)}
                      onBlur={(e) => handleBlur("cpf", e.target.value)}
                      disabled={loading}
                      placeholder="000.000.000-00"
                      error={!!fieldErrors.cpf}
                      helperText={fieldErrors.cpf}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CNPJ"
                      required
                      value={formData.cnpj}
                      onChange={(e) => handleChange("cnpj", e.target.value)}
                      onBlur={(e) => handleBlur("cnpj", e.target.value)}
                      disabled={loading}
                      placeholder="00.000.000/0000-00"
                      error={!!fieldErrors.cnpj}
                      helperText={fieldErrors.cnpj}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!fieldErrors.empresa_id}>
                      <InputLabel>Empresa</InputLabel>
                      <Select
                        value={formData.empresa_id}
                        label="Empresa"
                        onChange={(e) => handleChange("empresa_id", e.target.value)}
                        disabled={loading}
                      >
                        {empresas.map((empresa) => (
                          <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>
                            {empresa.razao_social}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={(e) => handleBlur("email", e.target.value)}
                      disabled={loading}
                      placeholder="colaborador@email.com"
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email || "Email para login no sistema"}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Celular"
                      required
                      value={formData.celular}
                      onChange={(e) => handleChange("celular", e.target.value)}
                      onBlur={(e) => handleBlur("celular", e.target.value)}
                      disabled={loading}
                      placeholder="(00) 00000-0000"
                      error={!!fieldErrors.celular}
                      helperText={fieldErrors.celular}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Senha"
                      type="password"
                      required
                      value={formData.senha}
                      onChange={(e) => handleChange("senha", e.target.value)}
                      onBlur={(e) => handleBlur("senha", e.target.value)}
                      disabled={loading}
                      error={!!fieldErrors.senha}
                      helperText={fieldErrors.senha || "Mínimo de 8 caracteres"}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contato de Emergência */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Contato de Emergência
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Contato"
                      value={formData.nome_contato_emergencia}
                      onChange={(e) => handleChange("nome_contato_emergencia", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone do Contato"
                      value={formData.telefone_contato_emergencia}
                      onChange={(e) => handleChange("telefone_contato_emergencia", e.target.value)}
                      onBlur={(e) => handleBlur("telefone_contato_emergencia", e.target.value)}
                      disabled={loading}
                      placeholder="(00) 00000-0000"
                      error={!!fieldErrors.telefone_contato_emergencia}
                      helperText={fieldErrors.telefone_contato_emergencia}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Endereço */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Endereço
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="CEP"
                      required
                      value={formData.endereco.cep}
                      onChange={(e) => handleChange("endereco.cep", e.target.value)}
                      onBlur={(e) => handleBlur("endereco.cep", e.target.value)}
                      disabled={loading}
                      placeholder="00000-000"
                      error={!!fieldErrors["endereco.cep"]}
                      helperText={fieldErrors["endereco.cep"]}
                    />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      label="Logradouro"
                      required
                      value={formData.endereco.logradouro}
                      onChange={(e) => handleChange("endereco.logradouro", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Número"
                      required
                      value={formData.endereco.numero}
                      onChange={(e) => handleChange("endereco.numero", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Complemento"
                      value={formData.endereco.complemento}
                      onChange={(e) => handleChange("endereco.complemento", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bairro"
                      required
                      value={formData.endereco.bairro}
                      onChange={(e) => handleChange("endereco.bairro", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      required
                      value={formData.endereco.cidade}
                      onChange={(e) => handleChange("endereco.cidade", e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Estado"
                      required
                      value={formData.endereco.estado}
                      onChange={(e) => handleChange("endereco.estado", e.target.value)}
                      disabled={loading}
                      placeholder="SP"
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Dados Financeiros */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Dados Financeiros
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Tipo de Chave PIX</InputLabel>
                      <Select
                        value={formData.dados_financeiros?.tipo_chave_pix || "cpf"}
                        label="Tipo de Chave PIX"
                        onChange={(e) => handleChange("dados_financeiros.tipo_chave_pix", e.target.value as TipoChavePix)}
                        disabled={loading}
                      >
                        <MenuItem value="cpf">CPF</MenuItem>
                        <MenuItem value="cnpj">CNPJ</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="telefone">Telefone</MenuItem>
                        <MenuItem value="aleatoria">Chave Aleatória</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Chave PIX"
                      required
                      value={formData.dados_financeiros?.chave_pix || ""}
                      onChange={(e) => handleChange("dados_financeiros.chave_pix", e.target.value)}
                      disabled={loading}
                      placeholder="Informe a chave PIX"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Dia do Pagamento"
                      type="number"
                      required
                      value={formData.dados_financeiros?.data_pagamento || "5"}
                      onChange={(e) => handleChange("dados_financeiros.data_pagamento", e.target.value)}
                      disabled={loading}
                      inputProps={{ min: 1, max: 31 }}
                      helperText="Dia do mês (1-31)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Totais dos Contratos */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: "#f8f9fa" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Resumo dos Contratos
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total de Horas Mensais"
                      type="text"
                      value={`${totalHoras.toFixed(1)} horas`}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "#000",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        },
                      }}
                      helperText="Somatória de horas de todos os contratos"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Valor Total Mensal"
                      type="text"
                      value={formatCurrency(totalValor)}
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "#2ecc71",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        },
                      }}
                      helperText="Somatória de valores de todos os contratos"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contratos */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    Contratos
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setModalOpen(true)}
                    disabled={loading}
                    sx={{
                      bgcolor: "#8270FF",
                      "&:hover": { bgcolor: "#6c5ce7" },
                      textTransform: "none",
                    }}
                  >
                    Adicionar Contrato
                  </Button>
                </Box>

                {contracts.length === 0 ? (
                  <Alert severity="info">
                    Nenhum contrato adicionado. Clique em "Adicionar Contrato" para começar.
                  </Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
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
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contracts.map((contract, index) => (
                          <TableRow key={index}>
                            <TableCell>{getClienteNome(contract.cliente_id)}</TableCell>
                            <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {contract.descricao}
                            </TableCell>
                            <TableCell>{formatDate(contract.data_inicio)}</TableCell>
                            <TableCell>{formatDate(contract.data_fim)}</TableCell>
                            <TableCell align="right">{formatCurrency(contract.valor_hora)}</TableCell>
                            <TableCell align="right">{contract.total_hora_mes}h</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="600" color="primary">
                                {formatCurrency(contract.valor_hora * contract.total_hora_mes)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteContract(index)}
                                disabled={loading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => router.push("/colaboradores")}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  minWidth: 150,
                }}
              >
                {loading ? "Salvando..." : "Criar Colaborador"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Modal de Contrato */}
      <ContractModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddContract}
        loading={false}
        error={null}
      />
    </Box>
  );
}
