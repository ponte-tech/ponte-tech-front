export type StatusContrato = "ATIVO" | "CANCELADO" | "FINALIZADO";

export interface Contrato {
  contrato_id: string;
  cliente_id: string;
  cliente_nome?: string;
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string; // YYYY-MM-DD
  data_fim?: string; // YYYY-MM-DD (opcional)
  status: StatusContrato;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateContratoRequest {
  cliente_id: string;
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string; // YYYY-MM-DD
  data_fim?: string; // YYYY-MM-DD (opcional)
}

export interface UpdateContratoRequest {
  titulo: string;
  descricao: string;
  valor: number;
  data_inicio: string; // YYYY-MM-DD
  data_fim?: string; // YYYY-MM-DD (opcional)
}

export interface ListContratosResponse {
  contratos: Contrato[];
  total: number;
}

export interface ChangeStatusRequest {
  status: StatusContrato;
}
