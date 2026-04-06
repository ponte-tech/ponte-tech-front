export type StatusNotaFiscal = 'PENDENTE' | 'APROVADA' | 'REPROVADA' | 'PAGA';

export interface NotaFiscal {
  nota_fiscal_id: string;
  user_id: string;
  contrato_id: string;
  nome_cliente: string;
  mes_referencia: string; // YYYY-MM
  status: StatusNotaFiscal;
  arquivo_nome: string;
  arquivo_tamanho: number;
  arquivo_url?: string;
  motivo_rejeicao?: string;
  data_envio: string;
  data_atualizacao: string;
}

export interface NotaFiscalComColaborador extends NotaFiscal {
  colaborador_nome: string;
  colaborador_foto_perfil_url?: string;
  empresa_nome?: string;
  empresa_cnpj?: string;
}

export interface ListNotasFiscaisResponse {
  notas_fiscais: NotaFiscalComColaborador[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface InitiateUploadRequest {
  contrato_id: string;
  mes_referencia: string; // YYYY-MM
  arquivo_nome: string;
  arquivo_tamanho: number;
}

export interface InitiateUploadResponse {
  nota_fiscal_id: string;
  upload_url: string;
  s3_key: string;
}

export interface AtualizarStatusNotaRequest {
  status: 'APROVADA' | 'REPROVADA' | 'PAGA' | 'PENDENTE';
  motivo_rejeicao?: string;
}
