export interface LancamentoContabil {
  lancamento_id: string;
  cliente_id: string;
  empresa_id: string;

  // Dados da empresa
  empresa_razao_social: string;
  empresa_cnpj: string;

  // Dados do cliente
  cliente_razao_social: string;
  cliente_nome_fantasia: string;
  cliente_cnpj?: string;

  // Dados da nota fiscal
  mes_referencia: string; // YYYY-MM
  valor_nota_fiscal?: number;
  emitir_nota_fiscal?: boolean;
  nota_fiscal_id?: string;
  nota_fiscal_arquivo_nome?: string;
  nota_fiscal_arquivo_url?: string;
  nota_fiscal_data_upload?: string;

  data_cadastro: string;
  data_atualizacao: string;
}

export interface ListLancamentosRequest {
  mes_referencia: string; // YYYY-MM
}

export interface ListLancamentosResponse {
  lancamentos: LancamentoContabil[];
  total: number;
}

export interface CreateLancamentoRequest {
  cliente_id: string;
  mes_referencia: string; // YYYY-MM
  valor_nota_fiscal: number;
  emitir_nota_fiscal?: boolean;
}

export interface UpdateValorNotaRequest {
  valor_nota_fiscal: number;
}

export interface InitiateUploadNotaRequest {
  lancamento_id: string;
  mes_referencia: string; // YYYY-MM
  arquivo_nome: string;
  arquivo_tamanho: number;
}

export interface InitiateUploadNotaResponse {
  nota_fiscal_id: string;
  upload_url: string; // Presigned URL do S3
  s3_key: string;
}

export interface DownloadNotaResponse {
  download_url: string;
  arquivo_nome: string;
}
