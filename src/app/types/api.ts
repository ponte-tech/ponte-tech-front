// Tipos base de resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Tipos de perfil de usuário
export type UserProfile = "admin" | "vendedor" | "professor" | "aluno" | "colaborador" | "contador";

// Tipos de usuário
export interface User {
  id: string;
  nome_completo: string;
  email: string;
  perfil: UserProfile;
  perfis?: UserProfile[]; // Quando usuário tem múltiplos perfis
  status: string;
  data_cadastro: string;
  codigo_vendedor?: string; // Apenas para vendedores
}

// Resposta de login
export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

// Resposta de seleção de perfil
export interface SelectProfileResponse {
  perfil_ativo: UserProfile;
  token: string;
  expires_in: number;
  codigo_vendedor?: string; // Apenas para vendedores
}

// Request de login
export interface LoginRequest {
  email: string;
  senha: string;
}

// Request de seleção de perfil
export interface SelectProfileRequest {
  perfil: UserProfile;
}

// Request de cadastro de vendedor
export interface RegisterVendedorRequest {
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  termos_aceite: boolean;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    cidade: string;
    estado: string;
  };
}

// Request de cadastro de professor
export interface RegisterProfessorRequest {
  nome_completo: string;
  data_nascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  termos_aceite: boolean;
  especialidade: string;
  area_atuacao: string;
  biografia: string;
  linkedin_url?: string;
}

// Resposta de cadastro
export interface RegisterResponse {
  id: string;
  nome_completo: string;
  email: string;
  status: string;
  data_cadastro: string;
  codigo_vendedor?: string; // Apenas para vendedor
}

// Tipos de curso
export type CursoStatus = "rascunho" | "aberto_venda" | "em_andamento" | "encerrado";
export type CursoNivel = "basico" | "intermediario" | "avancado";

export interface Professor {
  id: string;
  nome: string;
  especialidade?: string;
  biografia?: string;
  foto_url?: string;
}

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string;
  carga_horaria: number;
  categoria: string;
  nivel: CursoNivel;
  status: CursoStatus;
  pre_requisitos?: string;
  ementa?: string;
  conteudo_programatico?: string;
  objetivos_curso?: string;
  quantidade_limite_alunos: number;
  quantidade_alunos_matriculados: number;
  imagem_capa_url?: string;
  professor?: Professor;
  data_cadastro: string;
  data_atualizacao?: string;
}

export interface CursoListItem {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string;
  carga_horaria: number;
  categoria: string;
  nivel: CursoNivel;
  status: CursoStatus;
  quantidade_limite_alunos: number;
  quantidade_alunos_matriculados: number;
  imagem_capa_url?: string;
  professor?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export interface ListCursosResponse {
  cursos: CursoListItem[];
  pagination: PaginationInfo;
}

export interface CreateCursoRequest {
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string;
  carga_horaria: number;
  categoria: string;
  nivel: CursoNivel;
  status: CursoStatus;
  quantidade_limite_alunos: number;
  pre_requisitos?: string;
  professor_responsavel_id: string;
  ementa?: string;
  conteudo_programatico?: string;
  objetivos_curso?: string;
  imagem_capa_url?: string;
}

export type UpdateCursoRequest = Partial<CreateCursoRequest>;

// Tipos de Matrícula
export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  cidade: string;
  estado: string;
}

export interface AlunoMatriculaRequest {
  nome_completo: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  senha: string;
  termos_aceite: boolean;
  endereco: Endereco;
}

export interface CreateMatriculaRequest {
  codigo_vendedor: string;
  codigo_curso: string;
  aluno: AlunoMatriculaRequest;
}

export interface MatriculaInfoResponse {
  curso_id: string;
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string;
  quantidade_limite_alunos: number;
  quantidade_alunos_matriculados: number;
  carga_horaria: number;
  categoria: string;
  nivel: CursoNivel;
  status: CursoStatus;
  vendedor_id: string;
  vendedor_nome: string;
  imagem_capa_url?: string;
}

export interface PagamentoInfo {
  id: string;
  valor: number;
  checkout_url: string;
  expira_em: string;
}

export interface CreateMatriculaResponse {
  matricula_id: string;
  aluno_id: string;
  curso_id: string;
  status_matricula: string;
  status_pagamento: string;
  pagamento: PagamentoInfo;
}

// ===== TIMESHEET TYPES =====

export type ApontamentoStatus = "RASCUNHO" | "SUBMETIDO" | "APROVADO";
export type FechamentoStatus = "ABERTO" | "SUBMETIDO" | "APROVADO" | "RECUSADO";
export type FeriadoTipo = "nacional" | "estadual" | "municipal";

export interface CreateApontamentoRequest {
  data: string;
  horas: number;
  descricao?: string;
}

export interface UpdateApontamentoRequest {
  data?: string;
  horas?: number;
  descricao?: string;
}

export interface ApontamentoResponse {
  id: string;
  user_id: string;
  data: string;
  horas: number;
  descricao: string;
  status: ApontamentoStatus;
  data_criacao: string;
  data_atualizacao?: string;
}

export interface MesResponse {
  ano_mes: string;
  user_id: string;
  total_horas: number;
  horas_submetidas: number;
  horas_aprovadas: number;
  status: FechamentoStatus;
  data_fechamento: string | null;
  lancamentos: ApontamentoResponse[];
}

export interface FeriadoResponse {
  data: string;
  descricao: string;
  tipo: FeriadoTipo;
  data_criacao?: string;
}

export interface CreateFeriadoRequest {
  data: string;
  descricao: string;
  tipo: FeriadoTipo;
}

export interface UpdateFeriadoRequest {
  descricao?: string;
  tipo?: FeriadoTipo;
}

export interface AtualizarStatusFechamentoRequest {
  user_id: string;
  ano_mes: string;
  status: "APROVADO" | "RECUSADO" | "PENDENTE";
  motivo?: string;
}

export interface FechamentoListItem {
  id: string;
  user_id: string;
  user_nome: string;
  ano_mes: string;
  total_horas: number;
  status: FechamentoStatus;
  data_submissao?: string;
}

export interface TimesheetConfigResponse {
  horas_maximas_dia: number;
  horas_minimas_mes: number;
  permitir_horas_extras: boolean;
  taxa_hora_extra: number;
  data_atualizacao?: string;
}

export interface TimesheetConfigRequest {
  horas_maximas_dia: number;
  horas_minimas_mes: number;
  permitir_horas_extras: boolean;
  taxa_hora_extra: number;
}

export interface AuditoriaFechamentoItem {
  id: string;
  ano_mes: string;
  status_anterior: string;
  status_novo: string;
  usuario_admin: string;
  motivo: string;
  data_alteracao: string;
}

// ===== FISCAL TYPES =====

export type NotaFiscalStatus = "PENDENTE" | "APROVADO" | "RECUSADO" | "PAGO";

export interface ArquivoFiscalResponse {
  arquivo_id: string;
  nome_original: string;
  content_type: string;
  tamanho_bytes: number;
  data_upload: string;
}

export interface NotaFiscalResponse {
  nota_id: string;
  user_id: string;
  user_nome?: string;
  ano_mes: string;
  numero_nota: string;
  data_emissao: string;
  valor_nota: number;
  status: NotaFiscalStatus;
  is_atrasado: boolean;
  comentario_recusa: string | null;
  data_upload: string;
  data_aprovacao: string | null;
  data_pagamento: string | null;
  data_atualizacao: string | null;
  arquivos: ArquivoFiscalResponse[];
}

export interface NotaFiscalListResponse {
  total: number;
  items: NotaFiscalResponse[];
}

export interface CreateNotaFiscalRequest {
  ano_mes: string;
  numero_nota: string;
  data_emissao: string;
  valor_nota: number;
}

export interface UpdateNotaFiscalRequest {
  numero_nota?: string;
  data_emissao?: string;
  valor_nota?: number;
}

export interface AtualizarStatusNotaRequest {
  status: "APROVADO" | "RECUSADO" | "PAGO";
  comentario?: string;
}

export interface DownloadZipItem {
  nota_id: string;
  arquivo_id: string;
}

export interface DownloadZipRequest {
  items: DownloadZipItem[];
}

export interface FiscalConfigResponse {
  prazo_maximo_dia: number;
  tolerancia_valor_pct: number;
  bloquear_pagamento_sem_nota: boolean;
  data_atualizacao?: string;
}

export interface FiscalConfigRequest {
  prazo_maximo_dia: number;
  tolerancia_valor_pct: number;
  bloquear_pagamento_sem_nota: boolean;
}
