export interface Cliente {
  cliente_id: string;
  empresa_id: string;
  empresa_razao_social?: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateClienteRequest {
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

export interface UpdateClienteRequest {
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

export interface ListClientesResponse {
  clientes: Cliente[];
  total: number;
}
