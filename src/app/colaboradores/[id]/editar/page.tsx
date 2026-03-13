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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import colaboradoresService from "@/app/services/colaboradoresService";
import contratosService from "@/app/services/contratosService";
import authService from "@/app/services/authService";
import { Colaborador, UpdateColaboradorRequest, CreateContratoRequest, TipoChavePix, Contrato } from "@/app/types/api";
import { useAuth } from "@/app/hooks/useAuth";
import ContractModal from "../../components/ContractModal";
import empresaService from "@/app/services/empresaService";
import type { Empresa } from "@/app/types/empresa";

export default function EditarColaboradorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [contracts, setContracts] = useState<Contrato[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contrato | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [contractsKey, setContractsKey] = useState(0);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.userType === "admin";
  const isColaborador = user?.userType === "colaborador";
  const colaboradorId = params.id as string;

  // Evita erro de hidratação - só renderiza após montagem no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      // Colaboradores só podem editar seu próprio perfil
      if (isColaborador && user.id !== colaboradorId) {
        router.push(`/colaboradores/${user.id}/editar`);
      } else if (!isAdmin && !isColaborador) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, isColaborador, colaboradorId, router]);

  useEffect(() => {
    if (isAdmin || isColaborador) {
      loadColaborador();
      loadContracts();
      // Apenas admins podem listar todas as empresas
      if (isAdmin) {
        loadEmpresas();
      }
    }
  }, [colaboradorId, isAdmin, isColaborador]);

  const loadEmpresas = async () => {
    try {
      const empresasResponse = await empresaService.list();
      setEmpresas(empresasResponse.empresas || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  const loadColaborador = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await colaboradoresService.getById(colaboradorId, isColaborador);
      setColaborador(data);

      // Para colaboradores, usar o nome da empresa retornado pela API
      if (isColaborador && data.empresa_id) {
        setEmpresas([{
          empresa_id: data.empresa_id,
          razao_social: (data as any).empresa_nome || data.empresa_id,
          cnpj: '',
          endereco: {} as any,
          contatos: [],
          status: 'ativo' as any,
          data_cadastro: '',
        }]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar colaborador");
      console.error("Erro ao carregar colaborador:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      console.log('[DEBUG] Carregando contratos:', { colaboradorId, isColaborador });
      const data = await contratosService.getByUserId(colaboradorId, isColaborador);
      console.log('[DEBUG] Contratos carregados:', data);
      setContracts(data);
    } catch (err: any) {
      console.error("Erro ao carregar contratos:", err);
      console.error("Detalhes do erro:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    }
  };

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

  const applyMaskEmail = (value: string) => {
    return value.toLowerCase().trim();
  };

  const applyMaskAleatoria = (value: string) => {
    return value.replace(/[^a-zA-Z0-9-]/g, "");
  };

  const applyMaskNumero = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 6);
  };

  const applyPixMask = (value: string, tipo: TipoChavePix) => {
    switch (tipo) {
      case "cpf":
        return applyMaskCPF(value);
      case "cnpj":
        return applyMaskCNPJ(value);
      case "telefone":
        return applyMaskPhone(value);
      case "email":
        return applyMaskEmail(value);
      case "aleatoria":
        return applyMaskAleatoria(value);
      default:
        return value;
    }
  };

  const fetchAddressByCEP = async (cep: string) => {
    const cleanedCEP = cep.replace(/\D/g, "");
    if (cleanedCEP.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        setFieldErrors((prev) => ({ ...prev, "endereco.cep": "CEP não encontrado" }));
        return;
      }

      setColaborador((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: data.logradouro || prev.endereco?.logradouro || "",
            bairro: data.bairro || prev.endereco?.bairro || "",
            cidade: data.localidade || prev.endereco?.cidade || "",
            estado: data.uf || prev.endereco?.estado || "",
          },
        };
      });

      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["endereco.cep"];
        return newErrors;
      });

    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      setFieldErrors((prev) => ({ ...prev, "endereco.cep": "Erro ao buscar CEP" }));
    }
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
    if (!colaborador) return;

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
    } else if (field === "endereco.numero") {
      maskedValue = applyMaskNumero(value);
    } else if (field === "endereco.estado") {
      maskedValue = value.toUpperCase().slice(0, 2);
    } else if (field === "dados_financeiros.chave_pix") {
      const tipoChavePix = colaborador.dados_financeiros?.tipo_chave_pix || "cpf";
      maskedValue = applyPixMask(value, tipoChavePix);
    } else if (field === "dados_financeiros.tipo_chave_pix") {
      const chaveAtual = colaborador.dados_financeiros?.chave_pix || "";
      const novaChaveMascarada = applyPixMask(chaveAtual, value as TipoChavePix);

      setColaborador((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          dados_financeiros: {
            ...prev.dados_financeiros,
            tipo_chave_pix: value,
            chave_pix: novaChaveMascarada,
          },
        };
      });

      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setError(null);
      return;
    }

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setColaborador((prev) => {
        if (!prev) return prev;
        const currentParentValue = prev[parent as keyof Colaborador];
        return {
          ...prev,
          [parent]: {
            ...(typeof currentParentValue === 'object' && currentParentValue !== null ? currentParentValue : {}),
            [child]: maskedValue,
          },
        };
      });
    } else {
      setColaborador((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: maskedValue };
      });
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
      } else {
        fetchAddressByCEP(value);
      }
    } else if (field === "nome_completo" && value) {
      if (value.trim().split(" ").length < 2) {
        errorMessage = "Informe nome e sobrenome";
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
    const activeContracts = contracts.filter(c => c.status === 'ativo');
    const totalHoras = activeContracts.reduce((sum, c) => sum + c.total_hora_mes, 0);
    const totalValor = activeContracts.reduce((sum, c) => sum + (c.valor_hora * c.total_hora_mes), 0);
    return { totalHoras, totalValor };
  };

  const { totalHoras, totalValor } = calculateTotals();

  const handleAddContract = async (contract: CreateContratoRequest, contratoId?: string) => {
    try {
      if (contratoId) {
        // Editar contrato existente
        await contratosService.update(colaboradorId, contratoId, contract);
      } else {
        // Criar novo contrato
        await contratosService.create(colaboradorId, contract);
      }
      await loadContracts();
      setModalOpen(false);
      setEditingContract(null);
      setContractsKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Erro ao salvar contrato:", err);
      setError(err.message || "Erro ao salvar contrato");
    }
  };

  const handleEditContract = (contract: Contrato) => {
    setEditingContract(contract);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingContract(null);
  };

  const handleDeleteContract = async (contractId: string) => {
    try {
      await contratosService.delete(contractId);
      await loadContracts();
      setContractsKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Erro ao deletar contrato:", err);
      setError(err.message || "Erro ao deletar contrato");
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

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "#f44336";
    if (strength < 70) return "#ff9800";
    return "#4caf50";
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return "Fraca";
    if (strength < 70) return "Média";
    return "Forte";
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Por favor, preencha todos os campos de senha");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("A nova senha e a confirmação não coincidem");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("A nova senha deve ser diferente da senha atual");
      return;
    }

    setLoadingPassword(true);

    try {
      await authService.changePassword(currentPassword, newPassword);

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    } catch (error: any) {
      setPasswordError(error.message || "Erro ao alterar senha. Verifique sua senha atual.");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaborador) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validações básicas
      if (!colaborador.nome_completo || !colaborador.cnpj || !colaborador.empresa_id || !colaborador.celular) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Validar nome (deve ter pelo menos nome e sobrenome)
      if (colaborador.nome_completo.trim().split(" ").length < 2) {
        throw new Error("Por favor, informe o nome completo");
      }

      // Validar CNPJ
      if (!validateCNPJ(colaborador.cnpj)) {
        throw new Error("CNPJ inválido");
      }

      // Validar celular
      if (!validatePhone(colaborador.celular)) {
        throw new Error("Celular inválido. Use o formato (00) 00000-0000");
      }

      // Validar telefone de emergência se preenchido
      if (colaborador.telefone_contato_emergencia && !validatePhone(colaborador.telefone_contato_emergencia)) {
        throw new Error("Telefone de emergência inválido. Use o formato (00) 00000-0000");
      }

      // Validar CEP
      if (!validateCEP(colaborador.endereco?.cep || "")) {
        throw new Error("CEP inválido. Use o formato 00000-000");
      }

      // Validar endereço
      if (
        !colaborador.endereco?.cep ||
        !colaborador.endereco?.logradouro ||
        !colaborador.endereco?.numero ||
        !colaborador.endereco?.bairro ||
        !colaborador.endereco?.cidade ||
        !colaborador.endereco?.estado
      ) {
        throw new Error("Por favor, preencha todos os campos do endereço");
      }

      // Validar estado
      if (colaborador.endereco.estado.length !== 2) {
        throw new Error("Estado inválido. Use a sigla com 2 letras (ex: SP)");
      }

      // Validar dados financeiros
      if (!colaborador.dados_financeiros?.chave_pix) {
        throw new Error("Por favor, informe a chave PIX");
      }

      // Validar dia do pagamento
      const diaPagamento = parseInt(colaborador.dados_financeiros.data_pagamento);
      if (isNaN(diaPagamento) || diaPagamento < 1 || diaPagamento > 31) {
        throw new Error("Dia do pagamento deve ser entre 1 e 31");
      }

      const updateData: UpdateColaboradorRequest = {
        nome_completo: colaborador.nome_completo,
        cnpj: colaborador.cnpj,
        empresa_id: colaborador.empresa_id,
        celular: colaborador.celular,
        nome_contato_emergencia: colaborador.nome_contato_emergencia,
        telefone_contato_emergencia: colaborador.telefone_contato_emergencia,
        endereco: colaborador.endereco,
        dados_contratuais: colaborador.dados_contratuais,
        dados_financeiros: colaborador.dados_financeiros,
        status: colaborador.status,
      };

      await colaboradoresService.update(colaboradorId, updateData, isColaborador);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/colaboradores/${colaboradorId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar colaborador");
      console.error("Erro ao atualizar colaborador:", err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !colaborador) {
    return (
      <Box sx={{ p: 3 }}>
        {mounted && isAdmin && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/colaboradores")}
            sx={{ mb: 3, textTransform: "none" }}
          >
            Voltar
          </Button>
        )}
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!colaborador) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push(`/colaboradores/${colaboradorId}`)}
            sx={{ mb: 1, textTransform: "none" }}
          >
            Voltar
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Editar Colaborador
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atualize as informações do colaborador
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
          Colaborador atualizado com sucesso! Redirecionando...
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
                      value={colaborador.nome_completo}
                      onChange={(e) => handleChange("nome_completo", e.target.value)}
                      onBlur={(e) => handleBlur("nome_completo", e.target.value)}
                      disabled={saving}
                      error={!!fieldErrors.nome_completo}
                      helperText={fieldErrors.nome_completo}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CPF"
                      value={colaborador.cpf}
                      disabled
                      helperText="CPF não pode ser alterado"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CNPJ"
                      required
                      value={colaborador.cnpj}
                      onChange={(e) => handleChange("cnpj", e.target.value)}
                      onBlur={(e) => handleBlur("cnpj", e.target.value)}
                      disabled={saving}
                      placeholder="00.000.000/0000-00"
                      error={!!fieldErrors.cnpj}
                      helperText={fieldErrors.cnpj}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!fieldErrors.empresa_id}>
                      <InputLabel>Empresa</InputLabel>
                      <Select
                        value={colaborador.empresa_id || ""}
                        label="Empresa"
                        onChange={(e) => handleChange("empresa_id", e.target.value)}
                        disabled={saving || isColaborador}
                      >
                        {empresas.map((empresa) => (
                          <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>
                            {empresa.razao_social}
                          </MenuItem>
                        ))}
                      </Select>
                      {mounted && isColaborador && (
                        <FormHelperText>Empresa não pode ser alterada</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Celular"
                      required
                      value={colaborador.celular}
                      onChange={(e) => handleChange("celular", e.target.value)}
                      onBlur={(e) => handleBlur("celular", e.target.value)}
                      disabled={saving}
                      placeholder="(00) 00000-0000"
                      error={!!fieldErrors.celular}
                      helperText={fieldErrors.celular}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={colaborador.email}
                      disabled
                      helperText="Email não pode ser alterado"
                    />
                  </Grid>
                  {/* Campo Status - apenas para admins */}
                  {isAdmin && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        required
                        value={colaborador.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        disabled={saving}
                      >
                        <MenuItem value="ativo">Ativo</MenuItem>
                        <MenuItem value="inativo">Inativo</MenuItem>
                      </TextField>
                    </Grid>
                  )}
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
                      value={colaborador.nome_contato_emergencia || ""}
                      onChange={(e) => handleChange("nome_contato_emergencia", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone do Contato"
                      value={colaborador.telefone_contato_emergencia || ""}
                      onChange={(e) => handleChange("telefone_contato_emergencia", e.target.value)}
                      onBlur={(e) => handleBlur("telefone_contato_emergencia", e.target.value)}
                      disabled={saving}
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
                      value={colaborador.endereco?.cep || ""}
                      onChange={(e) => handleChange("endereco.cep", e.target.value)}
                      onBlur={(e) => handleBlur("endereco.cep", e.target.value)}
                      disabled={saving}
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
                      value={colaborador.endereco?.logradouro || ""}
                      onChange={(e) => handleChange("endereco.logradouro", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Número"
                      required
                      value={colaborador.endereco?.numero || ""}
                      onChange={(e) => handleChange("endereco.numero", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Complemento"
                      value={colaborador.endereco?.complemento || ""}
                      onChange={(e) => handleChange("endereco.complemento", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bairro"
                      required
                      value={colaborador.endereco?.bairro || ""}
                      onChange={(e) => handleChange("endereco.bairro", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      required
                      value={colaborador.endereco?.cidade || ""}
                      onChange={(e) => handleChange("endereco.cidade", e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Estado"
                      required
                      value={colaborador.endereco?.estado || ""}
                      onChange={(e) => handleChange("endereco.estado", e.target.value)}
                      disabled={saving}
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
                        value={colaborador.dados_financeiros?.tipo_chave_pix || "cpf"}
                        label="Tipo de Chave PIX"
                        onChange={(e) => handleChange("dados_financeiros.tipo_chave_pix", e.target.value as TipoChavePix)}
                        disabled={saving}
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
                      value={colaborador.dados_financeiros?.chave_pix || ""}
                      onChange={(e) => handleChange("dados_financeiros.chave_pix", e.target.value)}
                      disabled={saving}
                      placeholder={
                        colaborador.dados_financeiros?.tipo_chave_pix === "cpf" ? "000.000.000-00" :
                        colaborador.dados_financeiros?.tipo_chave_pix === "cnpj" ? "00.000.000/0000-00" :
                        colaborador.dados_financeiros?.tipo_chave_pix === "telefone" ? "(00) 00000-0000" :
                        colaborador.dados_financeiros?.tipo_chave_pix === "email" ? "email@exemplo.com" :
                        "Chave aleatória"
                      }
                      helperText={
                        colaborador.dados_financeiros?.tipo_chave_pix === "aleatoria"
                          ? "Cole aqui a chave aleatória gerada pelo banco"
                          : undefined
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Dia do Pagamento"
                      type="number"
                      required
                      value={colaborador.dados_financeiros?.data_pagamento || "5"}
                      onChange={(e) => handleChange("dados_financeiros.data_pagamento", e.target.value)}
                      disabled={saving}
                      inputProps={{ min: 1, max: 31 }}
                      helperText="Dia do mês (1-31)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Segurança - Alterar Senha */}
          {mounted && isColaborador && user?.id === colaboradorId && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Segurança
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Altere sua senha para manter sua conta segura
                  </Typography>

                  {/* Password Alerts */}
                  {passwordError && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPasswordError("")}>
                      {passwordError}
                    </Alert>
                  )}
                  {passwordSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setPasswordSuccess(false)}>
                      Senha alterada com sucesso!
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Senha Atual"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loadingPassword}
                        autoComplete="off"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: "#8270FF" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                                sx={{ color: "#8270FF" }}
                              >
                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nova Senha"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loadingPassword}
                        autoComplete="off"
                        helperText="Mínimo de 8 caracteres"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: "#8270FF" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                                sx={{ color: "#8270FF" }}
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {newPassword && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Força da senha:
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="600"
                              sx={{ color: getPasswordStrengthColor(passwordStrength) }}
                            >
                              {getPasswordStrengthLabel(passwordStrength)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getPasswordStrengthColor(passwordStrength),
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Confirmar Nova Senha"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loadingPassword}
                        autoComplete="off"
                        error={confirmPassword !== "" && newPassword !== confirmPassword}
                        helperText={
                          confirmPassword !== "" && newPassword !== confirmPassword
                            ? "As senhas não coincidem"
                            : undefined
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: "#8270FF" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                sx={{ color: "#8270FF" }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          variant="contained"
                          onClick={handlePasswordChange}
                          disabled={
                            loadingPassword ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword ||
                            newPassword !== confirmPassword
                          }
                          sx={{
                            bgcolor: "#8270FF",
                            "&:hover": { bgcolor: "#6c5ce7" },
                            textTransform: "none",
                            minWidth: 150,
                          }}
                        >
                          {loadingPassword ? (
                            <>
                              <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                              Alterando...
                            </>
                          ) : (
                            "Alterar Senha"
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Totais dos Contratos */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: "#f8f9fa" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Resumo dos Contratos Ativos
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
                      helperText="Somatória de horas de todos os contratos ativos"
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
                      helperText="Somatória de valores de todos os contratos ativos"
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
                  {isAdmin && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setModalOpen(true)}
                      disabled={saving}
                      sx={{
                        bgcolor: "#8270FF",
                        "&:hover": { bgcolor: "#6c5ce7" },
                        textTransform: "none",
                      }}
                    >
                      Adicionar Contrato
                    </Button>
                  )}
                </Box>

                {contracts.length === 0 ? (
                  <Alert severity="info">
                    {isAdmin
                      ? 'Nenhum contrato adicionado. Clique em "Adicionar Contrato" para começar.'
                      : 'Nenhum contrato cadastrado.'}
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
                          <TableCell align="center">Status</TableCell>
                          {isAdmin && <TableCell align="center">Ações</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contracts.map((contract) => (
                          <TableRow key={contract.contrato_id}>
                            <TableCell>{contract.nome_cliente}</TableCell>
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
                              {contract.status === 'ativo' ? (
                                <Typography color="success.main" fontWeight="500">Ativo</Typography>
                              ) : (
                                <Typography color="text.secondary">Inativo</Typography>
                              )}
                            </TableCell>
                            {isAdmin && (
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEditContract(contract)}
                                  disabled={saving}
                                  title="Editar contrato"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteContract(contract.contrato_id)}
                                  disabled={saving}
                                  title="Deletar contrato"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            )}
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
                onClick={() => router.push(`/colaboradores/${colaboradorId}`)}
                disabled={saving}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                sx={{
                  bgcolor: "#8270FF",
                  "&:hover": { bgcolor: "#6c5ce7" },
                  textTransform: "none",
                  minWidth: 150,
                }}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Modal de Contrato - Apenas Admin */}
      {mounted && isAdmin && (
        <ContractModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleAddContract}
          loading={false}
          error={null}
          editingContract={editingContract}
        />
      )}
    </Box>
  );
}
