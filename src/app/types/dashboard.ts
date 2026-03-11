// Dashboard types for Colaborador
export interface NotasFiscaisResumo {
  total: number;
  pendentes: number;
  aprovadas: number;
  pagas: number;
  reprovadas: number;
}

export interface DashboardColaboradorResponse {
  mes_atual: string;
  horas_lancadas: number;
  horas_contratadas: number;
  percentual_lancado: number;
  status_fechamento: string;
  qtd_contratos_ativos: number;
  notas_fiscais: NotasFiscaisResumo;
  valor_estimado_mes: number;
}

// Dashboard types for Admin
export interface ColaboradoresResumo {
  total: number;
  ativos: number;
}

export interface TimesheetResumo {
  aguardando_aprovacao: number;
  aprovados: number;
  reprovados: number;
  total_horas_aprovadas: number;
}

export interface NotasFiscaisResumoAdmin {
  total: number;
  pendentes_aprovacao: number;
  aprovadas_aguardando_pagamento: number;
  pagas: number;
}

export interface DashboardAdminResponse {
  mes_atual: string;
  colaboradores: ColaboradoresResumo;
  timesheet: TimesheetResumo;
  notas_fiscais: NotasFiscaisResumoAdmin;
  qtd_contratos_ativos: number;
  custo_total_mes: number;
}

// Tipos para dados financeiros por empresa
export interface MesFinanceiro {
  mes: string; // Formato: "2026-01"
  receitas: number; // Lançamentos contábeis (receita)
  despesas_notas: number; // Notas fiscais dos colaboradores (despesa)
  despesas_impostos: number; // Impostos (despesa)
}

export interface EmpresaFinanceiro {
  empresa_id: string;
  nome_fantasia: string;
  meses: MesFinanceiro[];
}

export interface ConsolidadoFinanceiro {
  meses: MesFinanceiro[];
}

export interface FinanceirosPorEmpresaResponse {
  empresas: EmpresaFinanceiro[];
  consolidado: ConsolidadoFinanceiro;
}
