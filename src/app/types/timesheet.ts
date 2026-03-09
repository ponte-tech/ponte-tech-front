export interface Contrato {
  contrato_id: string;
  nome_cliente: string;
  valor_hora: number;
  total_hora_mes: number;
  status: string;
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
}

export interface ResumoMesResponse {
  mes: string; // YYYY-MM
  contratos: ResumoContratoMes[];
  total_horas_lancadas: number;
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

export interface ColaboradorTimesheetStatus {
  colaborador_id: string;
  nome_completo: string;
  mes: string;
  status_mes: StatusMes;
  total_horas_lancadas: number;
  total_horas_contratadas: number;
  percentual_lancado: number;
  data_envio?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  motivo_reprovacao?: string;
  qtd_contratos_ativos: number;
}

export interface ListaTimesheetAprovacaoResponse {
  colaboradores: ColaboradorTimesheetStatus[];
  mes: string;
}
