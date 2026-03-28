/**
 * Serviço para extração de dados de documentos usando AWS (Textract/Bedrock)
 * Chama o backend Lambda que processa documentos com AWS Textract
 */

export interface ValidationResult {
  valor_match: boolean;
  valor_message?: string;
  cnpj_emitente_match: boolean;
  cnpj_emitente_message?: string;
  cnpj_destinatario_match: boolean;
  cnpj_destinatario_message?: string;
  all_valid: boolean;
  can_proceed: boolean;
}

export interface ExtractionResult {
  valor: number | null;
  confidence: number;
  rawText?: string;
  error?: string;
  method?: string; // textract, bedrock, regex
  cnpj_emitente?: string;
  cnpj_destinatario?: string;
  validations?: ValidationResult;
  valorAprovadoAdmin?: number; // Valor aprovado pelo admin no fechamento
  statusMes?: string; // Status do fechamento (APROVADO, PENDENTE, etc)
}

export interface ExtractionOptions {
  expectedValor?: number;
  colaboradorCNPJ?: string;
  empresaCNPJ?: string;
}

class AWSDocumentExtractionService {
  private apiUrl: string;

  constructor() {
    // URL da API Gateway que chama a Lambda
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Converte arquivo para base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extrai valor monetário de um documento usando AWS Textract
   * @param file Arquivo a ser processado
   * @param options Opções de validação (valor esperado, CNPJs, etc.)
   */
  async extractValueFromDocument(file: File, options?: ExtractionOptions): Promise<ExtractionResult> {
    try {
    // console.log('🔍 [AWS Extraction] Iniciando extração para:', file.name);
    // console.log('📊 [AWS Extraction] Tamanho:', file.size, 'bytes');
    // console.log('📄 [AWS Extraction] Tipo:', file.type);

      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
    // console.error('❌ [AWS Extraction] Tipo não suportado:', file.type);
        return {
          valor: null,
          confidence: 0,
          error: 'Tipo de arquivo não suportado para extração automática',
        };
      }

      // Validar tamanho (máx 10MB para Textract)
      if (file.size > 10 * 1024 * 1024) {
    // console.error('❌ [AWS Extraction] Arquivo muito grande:', file.size);
        return {
          valor: null,
          confidence: 0,
          error: 'Arquivo muito grande. Máximo 10MB para extração automática',
        };
      }

    // console.log('🔄 [AWS Extraction] Convertendo para base64...');
      const base64Data = await this.fileToBase64(file);
    // console.log('✅ [AWS Extraction] Conversão concluída');

    // console.log('🚀 [AWS Extraction] Enviando para backend AWS...');
    // console.log('📡 [AWS Extraction] URL:', `${this.apiUrl}/document-extraction`);

      // if (options) {
      //   console.log('🔍 [AWS Extraction] Validação ativa:', {
      //     valorEsperado: options.expectedValor,
      //     colaboradorCNPJ: options.colaboradorCNPJ,
      //     empresaCNPJ: options.empresaCNPJ,
      //   });
      // }

      // Chamar backend Lambda
      const response = await fetch(`${this.apiUrl}/document-extraction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_base64: base64Data,
          file_name: file.name,
          file_type: file.type,
          expected_valor: options?.expectedValor,
          colaborador_cnpj: options?.colaboradorCNPJ,
          empresa_cnpj: options?.empresaCNPJ,
        }),
      });

    // console.log('📡 [AWS Extraction] Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
    // console.error('❌ [AWS Extraction] Erro no backend:', errorData);
        return {
          valor: null,
          confidence: 0,
          error: `Erro ${response.status}: ${errorData.error || 'Erro ao processar documento'}`,
        };
      }

      const data = await response.json();
    // console.log('✅ [AWS Extraction] Resposta recebida:', data);

      if (data.valor) {
    // console.log('✅ [AWS Extraction] Valor extraído:', data.valor);
    // console.log('📊 [AWS Extraction] Confiança:', data.confidence);
    // console.log('🔧 [AWS Extraction] Método:', data.method);
      } else if (data.error) {
    // console.warn('⚠️ [AWS Extraction] Erro:', data.error);
      } else {
    // console.warn('⚠️ [AWS Extraction] Nenhum valor encontrado');
      }

      if (data.cnpj_emitente) {
    // console.log('📄 [AWS Extraction] CNPJ Emitente:', data.cnpj_emitente);
      }

      if (data.cnpj_destinatario) {
    // console.log('📄 [AWS Extraction] CNPJ Destinatário:', data.cnpj_destinatario);
      }

      if (data.validations) {
    // console.log('🔍 [AWS Extraction] Validações:', data.validations);
        if (data.validations.all_valid) {
    // console.log('✅ [AWS Extraction] Todas validações passaram!');
        } else {
    // console.warn('⚠️ [AWS Extraction] Algumas validações falharam');
        }
      }

      return {
        valor: data.valor,
        confidence: data.confidence || 0,
        rawText: data.raw_text,
        error: data.error,
        method: data.method,
        cnpj_emitente: data.cnpj_emitente,
        cnpj_destinatario: data.cnpj_destinatario,
        validations: data.validations,
      };
    } catch (error: any) {
    // console.error('❌ [AWS Extraction] Erro ao extrair valor do documento:', error);
    // console.error('❌ [AWS Extraction] Stack:', error.stack);
      return {
        valor: null,
        confidence: 0,
        error: error.message || 'Erro desconhecido na extração',
      };
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return this.apiUrl.length > 0;
  }

  /**
   * Extrai valores de múltiplos arquivos em paralelo
   */
  async extractValuesFromFiles(files: File[]): Promise<ExtractionResult[]> {
    const promises = files.map(file => this.extractValueFromDocument(file));
    return Promise.all(promises);
  }
}

export const awsDocumentExtractionService = new AWSDocumentExtractionService();
export default awsDocumentExtractionService;
