export interface Empresa {
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateEmpresaRequest {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

export interface UpdateEmpresaRequest {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

export interface ListEmpresasResponse {
  empresas: Empresa[];
  total: number;
}
