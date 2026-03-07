// ===== TYPES BASE =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: {
    errors?: Record<string, string[]>;
  } | null;
}

export type UserProfile = "vendedor" | "professor" | "aluno" | "colaborador" | "contador" | "administrador";

// ===== AUTENTICAÇÃO =====

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface User {
  id: string;
  nome_completo: string;
  email: string;
  perfis: UserProfile[];
  status: string;
  data_cadastro: string;
  codigo_vendedor?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
  expires_in: number;
}

export interface LoginResponse extends AuthResponseData {}

export interface SelectProfileRequest {
  perfil: UserProfile;
}

export interface SelectProfileResponse extends AuthResponseData {}

// ===== CADASTRO VENDEDOR =====

export interface SignupVendedorRequest {
  nome_completo: string;
  email: string;
  senha: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  termos_aceite: boolean;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
  };
}

export interface VendedorSignupResponse {
  id: string;
  nome_completo: string;
  email: string;
  codigo_vendedor: string;
  status: string;
  data_cadastro: string;
}

// ===== CADASTRO PROFESSOR =====

export interface SignupProfessorRequest {
  nome_completo: string;
  email: string;
  senha: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  especialidade: string;
  area_atuacao: string;
  biografia?: string;
  linkedin_url?: string;
  termos_aceite: boolean;
}

export interface ProfessorSignupResponse {
  id: string;
  nome_completo: string;
  email: string;
  especialidade: string;
  status: string;
  data_cadastro: string;
}

// ===== CADASTRO COLABORADOR =====

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface DadosContratuais {
  data_contratacao?: string;
  valor_hora?: number;
  total_hora_mes?: number;
}

export interface DadosFinanceiros {
  chave_pix?: string;
  data_pagamento?: string;
}

export interface SignupColaboradorRequest {
  nome_completo: string;
  cpf: string;
  cnpj: string;
  celular: string;
  senha: string;
  endereco: Endereco;
  dados_contratuais: DadosContratuais;
  dados_financeiros: DadosFinanceiros;
}

export interface ColaboradorSignupResponse {
  id: string;
  nome_completo: string;
  email: string;
  cnpj: string;
  celular: string;
  status: string;
  data_cadastro: string;
}

// ===== CADASTRO CONTADOR =====

export interface SignupContadorRequest {
  nome_completo: string;
  email: string;
  senha: string;
  cpf: string;
  celular: string;
}

export interface ContadorSignupResponse {
  id: string;
  nome_completo: string;
  email: string;
  status: string;
  data_cadastro: string;
}

// ===== LEGACY TYPES (keep for backwards compatibility) =====

export type RegisterVendedorRequest = SignupVendedorRequest;
export type RegisterProfessorRequest = SignupProfessorRequest;
export type RegisterColaboradorRequest = SignupColaboradorRequest;
export type RegisterContadorRequest = SignupContadorRequest;

export type RegisterResponse =
  | VendedorSignupResponse
  | ProfessorSignupResponse
  | ColaboradorSignupResponse
  | ContadorSignupResponse;

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
export interface EnderecoMatricula {
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
  endereco: EnderecoMatricula;
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
export type FechamentoStatus = "ABERTO" | "SUBMETIDO" | "APROVADO" | "REJEITADO";
export type FeriadoTipo = "NACIONAL" | "ESTADUAL" | "MUNICIPAL";

export interface LancamentoItemRequest {
  data: string;
  hora_inicio: string;
  hora_fim: string;
  observacao?: string;
}

export interface CreateApontamentoRequest {
  lancamentos: LancamentoItemRequest[];
}

export interface UpdateApontamentoRequest {
  hora_inicio: string;
  hora_fim: string;
  observacao?: string;
}

export interface ApontamentoResponse {
  apontamento_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos: number;
  duracao_horas_ajustada: number;
  tipo: "NORMAL" | "EXTRA" | "FERIADO";
  status: ApontamentoStatus;
  is_atrasado: boolean;
  observacao: string;
  data_cadastro: string;
  data_atualizacao: string;
  warnings: string[];
}

export interface DiaResponse {
  data: string;
  lancamentos: ApontamentoResponse[];
  e_feriado: boolean;
  nome_feriado?: string;
}

export interface MesResponse {
  mes: string;
  dias: DiaResponse[];
  feriados: FeriadoResponse[];
}

export interface FeriadoResponse {
  data: string;
  nome: string;
  tipo: FeriadoTipo;
  recorrente: boolean;
  data_criacao?: string;
}

export interface CreateFeriadoRequest {
  data: string;
  nome: string;
  tipo: FeriadoTipo;
  estado?: string;
  recorrente: boolean;
}

export interface UpdateFeriadoRequest {
  nome: string;
  tipo: FeriadoTipo;
  estado?: string;
  recorrente: boolean;
}

export interface FechamentoStatusItemRequest {
  user_id: string;
  ano_mes: string;
}

export interface AtualizarStatusFechamentosRequest {
  acao: "APROVADO" | "REJEITADO";
  comentario?: string;
  fechamentos: FechamentoStatusItemRequest[];
}

export interface FechamentoListItem {
  id: string;
  user_id: string;
  user_nome: string;
  ano_mes: string;
  total_horas: number;
  status: FechamentoStatus;
  data_submissao: string;
}

export interface TimesheetConfigRequest {
  multiplicadores: Record<string, number>;
  limites_diarios: Record<string, number>;
  limites_mensais: Record<string, number>;
  limite_submissao_dia: number;
  comportamento_atraso: "BLOQUEAR" | "PERMITIR_ATRASADO";
}

export interface TimesheetConfigResponse {
  multiplicadores: Record<string, number>;
  limites_diarios: Record<string, number>;
  limites_mensais: Record<string, number>;
  limite_submissao_dia: number;
  comportamento_atraso: "BLOQUEAR" | "PERMITIR_ATRASADO";
  data_atualizacao?: string;
}

export interface AuditoriaFechamentoItem {
  id: string;
  ano_mes: string;
  status_anterior: "ABERTO" | "SUBMETIDO" | "APROVADO" | "REJEITADO";
  status_novo: "ABERTO" | "SUBMETIDO" | "APROVADO" | "REJEITADO";
  usuario_admin: string;
  motivo: string;
  data_alteracao: string;
}

export interface AuditoriaLancamentoItem {
  id: string;
  apontamento_id: string;
  acao: "CRIADA" | "ATUALIZADA" | "DELETADA";
  valores_novos: Record<string, unknown>;
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
  tolerancia_pct: number;
  bloquear_pagamento_sem_nota: boolean;
  data_atualizacao?: string;
}

export interface FiscalConfigRequest {
  prazo_maximo_dia: number;
  tolerancia_pct: number;
  bloquear_pagamento_sem_nota: boolean;
}
