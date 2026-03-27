export interface Anexo {
  s3_key: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  content_type: string;
  tipo_imposto?: TipoImposto;
  data_upload: string;
}

export interface Imposto {
  imposto_id: string;
  empresa_id: string;
  descricao: string;
  tipo_imposto: TipoImposto;
  mes_referencia: string; // formato: YYYY-MM
  valor: number;
  anexos?: Anexo[]; // Arquivos anexados
  data_cadastro: string;
  data_atualizacao: string;
}

export type TipoImposto =
  | 'TFE' // TFE
  | 'RECIBO_PROLABORE' // Recibo Prolabore
  | 'FOLHA' // Folha
  | 'INSS' // Instituto Nacional do Seguro Social
  | 'SIMPLES_NACIONAL' // Simples Nacional
  | 'HONORARIOS_CONTABEIS'; // Honorários Contábeis

export const TIPOS_IMPOSTO: { value: TipoImposto; label: string }[] = [
  { value: 'TFE', label: 'TFE' },
  { value: 'RECIBO_PROLABORE', label: 'Recibo Prolabore' },
  { value: 'FOLHA', label: 'Folha' },
  { value: 'INSS', label: 'INSS' },
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { value: 'HONORARIOS_CONTABEIS', label: 'Honorários Contábeis' },
];

export interface CreateImpostoRequest {
  empresa_id: string;
  descricao: string;
  tipo_imposto?: TipoImposto;
  mes_referencia: string;
  valor: number;
  anexos?: File[]; // Arquivos a serem enviados
}

export interface UpdateImpostoRequest {
  descricao: string;
  tipo_imposto: TipoImposto;
  mes_referencia: string;
  valor: number;
  anexos?: File[]; // Novos arquivos a serem enviados
}

export interface ListImpostosResponse {
  impostos: Imposto[];
  total: number;
}
