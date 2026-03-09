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

// Tipos de Colaborador
export type ColaboradorStatus = "ativo" | "inativo";

export interface EnderecoColaborador {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface DadosContratuais {
  data_inicio: string;
  data_fim: string;
  valor_hora: number;
  total_hora_mes: number;
}

export type TipoChavePix = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

export interface DadosFinanceiros {
  tipo_chave_pix: TipoChavePix;
  chave_pix: string;
  data_pagamento: string;
}

export interface Colaborador {
  id: string;
  user_id: string;
  nome_completo: string;
  cpf: string;
  cnpj: string;
  empresa_id: string;
  celular: string;
  email: string;
  endereco: EnderecoColaborador;
  dados_contratuais: DadosContratuais;
  dados_financeiros: DadosFinanceiros;
  status: ColaboradorStatus;
  data_cadastro: string;
  data_atualizacao?: string;
}

export interface ColaboradorListItem {
  id: string;
  nome_completo: string;
  cpf: string;
  cnpj: string;
  empresa_id: string;
  celular: string;
  email: string;
  clientes: string[];    // Lista de nomes de clientes (dos contratos ativos)
  valor_total: number;   // Soma dos valores totais de todos os contratos ativos
  status: ColaboradorStatus;
  data_cadastro: string;
}

export interface ListColaboradoresResponse {
  colaboradores: ColaboradorListItem[];
  pagination: PaginationInfo;
}

export interface CreateColaboradorRequest {
  nome_completo: string;
  cpf: string;
  cnpj: string;
  empresa_id: string;
  email: string;
  celular: string;
  senha: string;
  nome_contato_emergencia?: string;
  telefone_contato_emergencia?: string;
  endereco: EnderecoColaborador;
  dados_contratuais?: DadosContratuais;
  dados_financeiros?: DadosFinanceiros;
}

export interface UpdateColaboradorRequest {
  nome_completo?: string;
  cnpj?: string;
  empresa_id?: string;
  celular?: string;
  endereco?: EnderecoColaborador;
  dados_contratuais?: DadosContratuais;
  dados_financeiros?: DadosFinanceiros;
  status?: ColaboradorStatus;
}

// Tipos de Contrato
export type ContratoStatus = "ativo" | "inativo";

export interface Contrato {
  contrato_id: string;
  user_id: string;
  cliente_id: string;
  nome_cliente: string; // deprecated - mantido para compatibilidade
  descricao: string;
  data_inicio: string;
  data_fim: string;
  data_contratacao: string; // deprecated
  valor_hora: number;
  total_hora_mes: number;
  valor_total: number;
  status: ContratoStatus;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateContratoRequest {
  cliente_id: string;
  nome_cliente?: string; // deprecated - mantido para compatibilidade
  descricao: string;
  data_inicio: string;
  data_fim: string;
  valor_hora: number;
  total_hora_mes: number;
}

export interface UpdateContratoRequest {
  cliente_id?: string;
  nome_cliente?: string; // deprecated - mantido para compatibilidade
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_hora?: number;
  total_hora_mes?: number;
}

export interface ListContratosResponse {
  contratos: Contrato[];
}

// Tipos de Lançamento de Horas
export type TipoLancamento = "desenvolvimento" | "reuniao" | "planejamento" | "documentacao" | "suporte" | "outros";
export type StatusLancamento = "pendente" | "aprovado" | "rejeitado";

export interface LancamentoHoras {
  id: string;
  colaborador_id: string;
  data: string;
  horas: number;
  tipo: TipoLancamento;
  descricao: string;
  projeto?: string;
  status: StatusLancamento;
  observacao_aprovacao?: string;
  data_cadastro: string;
  data_atualizacao?: string;
}

export interface LancamentoHorasListItem {
  id: string;
  data: string;
  horas: number;
  tipo: TipoLancamento;
  descricao: string;
  projeto?: string;
  status: StatusLancamento;
}

export interface ListLancamentosResponse {
  lancamentos: LancamentoHorasListItem[];
  total_horas_mes: number;
  total_horas_pendentes: number;
  total_horas_aprovadas: number;
  pagination: PaginationInfo;
}

export interface CreateLancamentoRequest {
  data: string;
  horas: number;
  tipo: TipoLancamento;
  descricao: string;
  projeto?: string;
}

export interface CreateMultipleLancamentosRequest {
  datas: string[];
  horas: number;
  tipo: TipoLancamento;
  descricao: string;
  projeto?: string;
}

export interface UpdateLancamentoRequest {
  horas?: number;
  tipo?: TipoLancamento;
  descricao?: string;
  projeto?: string;
}

export interface ResumoHorasMes {
  mes: number;
  ano: number;
  total_horas: number;
  horas_aprovadas: number;
  horas_pendentes: number;
  horas_rejeitadas: number;
  meta_horas_mes: number;
}
