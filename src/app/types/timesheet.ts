export interface Contrato {
  contrato_id: string;
  nome_cliente: string;
  valor_hora: number;
  total_hora_mes: number;
  valor?: number; // Valor total do contrato (valor_hora * total_hora_mes)
  status: string;
  empresa_cnpj?: string; // CNPJ da empresa (tomador do serviço)
  empresa_nome?: string; // Nome da empresa
  colaborador_cnpj?: string; // CNPJ do colaborador logado (emitente da NFS-e)
}

export type StatusApontamento = 'RASCUNHO' | 'SUBMETIDO' | 'APROVADO' | 'REPROVADO';
export type StatusMes = 'PENDENTE_ENVIO' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'REPROVADO';

export interface Apontamento {
  apontamento_id: string;
  contrato_id: string;
  nome_cliente: string;
  data: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  duracao_minutos: number;
  duracao_horas_ajustada: number;
  tipo: string; // NORMAL, EXTRA, FERIADO
  status: StatusApontamento;
  is_atrasado: boolean;
  observacao?: string;
  motivo_reprovacao?: string;
  data_cadastro: string;
  data_atualizacao: string;
  warnings?: string[];
}

export interface DiaCalendario {
  data: string; // YYYY-MM-DD
  lancamentos: Apontamento[];
  e_feriado: boolean;
  nome_feriado?: string;
}

export interface Feriado {
  data: string;
  nome: string;
  tipo: string;
  estado?: string;
  recorrente: boolean;
}

export interface MesResponse {
  mes: string; // YYYY-MM
  dias: DiaCalendario[];
  feriados: Feriado[];
}

export interface ResumoContratoMes {
  contrato_id: string;
  nome_cliente: string;
  valor_hora: number;
  total_hora_mes: number;
  horas_lancadas: number;
  horas_restantes: number;
  valor_total_lancado: number;
  percentual_usado: number;
  tipo_contrato?: string;
}

export interface ResumoMesResponse {
  mes: string; // YYYY-MM
  contratos: ResumoContratoMes[];
  total_horas_lancadas: number;
  total_horas_aprovadas?: number;
  total_valor_lancado: number;
  status_mes?: StatusMes;
  data_envio?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  motivo_reprovacao?: string;
}

export interface LancamentoItem {
  contrato_id: string;
  data: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  observacao?: string;
}

export interface CreateLancamentoRequest {
  lancamentos: LancamentoItem[];
}

export interface NotaFiscalResumo {
  nota_fiscal_id: string;
  numero_nota: string;
  nome_cliente: string;
  valor: number;
  status: string; // PENDENTE, APROVADA, REPROVADA, PAGA
  arquivo_url?: string;
  arquivo_nome?: string;
  data_emissao: string;
}

export interface ContratoTimesheetResumo {
  contrato_id: string;
  nome_cliente: string;
  horas_lancadas: number;
  valor_hora: number;
  valor_total: number;
}

export interface ColaboradorTimesheetStatus {
  colaborador_id: string;
  nome_completo: string;
  foto_perfil_url?: string;
  mes: string;
  status_mes: StatusMes;
  total_horas_lancadas: number;
  total_horas_contratadas: number;
  total_valor_lancado: number;
  valor_hora: number;
  percentual_lancado: number;
  data_envio?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  motivo_reprovacao?: string;
  qtd_contratos_ativos: number;
  contratos: ContratoTimesheetResumo[];
  notas_fiscais: NotaFiscalResumo[];
}

export interface ListaTimesheetAprovacaoResponse {
  colaboradores: ColaboradorTimesheetStatus[];
  mes: string;
}
