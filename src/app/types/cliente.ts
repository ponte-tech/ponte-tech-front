export interface Cliente {
  cliente_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateClienteRequest {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

export interface UpdateClienteRequest {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

export interface ListClientesResponse {
  clientes: Cliente[];
  total: number;
}
