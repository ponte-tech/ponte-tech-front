export interface Imposto {
  imposto_id: string;
  empresa_id: string;
  descricao: string;
  tipo_imposto: TipoImposto;
  mes_referencia: string; // formato: YYYY-MM
  valor: number;
  anexos?: string[]; // URLs dos arquivos anexados
  data_cadastro: string;
  data_atualizacao: string;
}

export type TipoImposto =
  | 'IRPJ' // Imposto de Renda Pessoa Jurídica
  | 'CSLL' // Contribuição Social sobre o Lucro Líquido
  | 'PIS' // Programa de Integração Social
  | 'COFINS' // Contribuição para o Financiamento da Seguridade Social
  | 'ISS' // Imposto Sobre Serviços
  | 'ICMS' // Imposto sobre Circulação de Mercadorias e Serviços
  | 'IPI' // Imposto sobre Produtos Industrializados
  | 'INSS' // Instituto Nacional do Seguro Social
  | 'FGTS' // Fundo de Garantia do Tempo de Serviço
  | 'SIMPLES_NACIONAL' // Simples Nacional
  | 'OUTROS'; // Outros impostos

export const TIPOS_IMPOSTO: { value: TipoImposto; label: string }[] = [
  { value: 'IRPJ', label: 'IRPJ - Imposto de Renda Pessoa Jurídica' },
  { value: 'CSLL', label: 'CSLL - Contribuição Social sobre o Lucro Líquido' },
  { value: 'PIS', label: 'PIS - Programa de Integração Social' },
  { value: 'COFINS', label: 'COFINS - Financiamento da Seguridade Social' },
  { value: 'ISS', label: 'ISS - Imposto Sobre Serviços' },
  { value: 'ICMS', label: 'ICMS - Imposto sobre Circulação de Mercadorias' },
  { value: 'IPI', label: 'IPI - Imposto sobre Produtos Industrializados' },
  { value: 'INSS', label: 'INSS - Instituto Nacional do Seguro Social' },
  { value: 'FGTS', label: 'FGTS - Fundo de Garantia do Tempo de Serviço' },
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { value: 'OUTROS', label: 'Outros' },
];

export interface CreateImpostoRequest {
  empresa_id: string;
  descricao: string;
  tipo_imposto: TipoImposto;
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
