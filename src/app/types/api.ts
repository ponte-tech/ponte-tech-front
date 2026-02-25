// Tipos base de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Tipos de perfil de usuário
export type UserProfile = "admin" | "vendedor" | "professor" | "aluno";

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

export interface UpdateCursoRequest extends Partial<CreateCursoRequest> {}

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
