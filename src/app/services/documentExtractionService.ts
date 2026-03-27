/**
 * Serviço para extração de dados de documentos usando IA
 * Utiliza Claude Vision API para extrair valores de PDFs e imagens
 */

interface ExtractionResult {
  valor: number | null;
  confidence: number;
  rawText?: string;
  error?: string;
}

class DocumentExtractionService {
  private apiKey: string;
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    // API key será configurada via variável de ambiente
    this.apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
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
   * Determina o media type do arquivo
   */
  private getMediaType(file: File): string {
    const type = file.type;
    if (type === 'application/pdf') return 'application/pdf';
    if (type.startsWith('image/')) return type;
    return 'application/pdf'; // fallback
  }

  /**
   * Extrai valor monetário de um documento usando Claude Vision
   */
  async extractValueFromDocument(file: File): Promise<ExtractionResult> {
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        return {
          valor: null,
          confidence: 0,
          error: 'Tipo de arquivo não suportado para extração automática',
        };
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          valor: null,
          confidence: 0,
          error: 'Arquivo muito grande. Máximo 5MB para extração automática',
        };
      }

      // Converter arquivo para base64
      const base64Data = await this.fileToBase64(file);
      const mediaType = this.getMediaType(file);

      // Chamar API do Claude
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: 'text',
                  text: `Analise este documento fiscal brasileiro (DARF, guia de impostos, boleto, etc.) e extraia o VALOR TOTAL a pagar.

INSTRUÇÕES IMPORTANTES:
- Procure por: "Valor do Documento", "Valor Total", "Total a Pagar", "Valor a Recolher", "Total", etc.
- Ignore valores parciais, multas isoladas ou juros isolados
- Retorne APENAS o valor principal total
- Se houver múltiplos valores, retorne o maior (geralmente é o total)
- Formato esperado: número com vírgula para centavos (ex: 1234,56 ou 1.234,56)

RESPONDA NO SEGUINTE FORMATO JSON:
{
  "valor": <número>,
  "confidence": <0-100>,
  "explanation": "<breve explicação>"
}

Exemplo:
{
  "valor": 1234.56,
  "confidence": 95,
  "explanation": "Valor Total encontrado no campo principal do documento"
}

Se não encontrar valor claro, retorne:
{
  "valor": null,
  "confidence": 0,
  "explanation": "Não foi possível identificar o valor total"
}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na API Claude:', errorData);
        return {
          valor: null,
          confidence: 0,
          error: 'Erro ao processar documento com IA',
        };
      }

      const data = await response.json();

      // Extrair texto da resposta
      const textContent = data.content.find((c: any) => c.type === 'text');
      if (!textContent) {
        return {
          valor: null,
          confidence: 0,
          error: 'Resposta da IA inválida',
        };
      }

      // Tentar parsear JSON da resposta
      try {
        // A resposta pode conter markdown, então vamos limpar
        let jsonText = textContent.text.trim();

        // Remover markdown code blocks se existirem
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const result = JSON.parse(jsonText);

        return {
          valor: result.valor,
          confidence: result.confidence || 0,
          rawText: result.explanation,
        };
      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        console.error('Texto recebido:', textContent.text);

        // Fallback: tentar extrair valor usando regex
        const valorMatch = textContent.text.match(/valor["\s:]+([0-9.,]+)/i);
        if (valorMatch) {
          const valorStr = valorMatch[1].replace(/\./g, '').replace(',', '.');
          const valor = parseFloat(valorStr);
          if (!isNaN(valor)) {
            return {
              valor,
              confidence: 50, // Baixa confiança por ser fallback
              rawText: 'Extraído via fallback regex',
            };
          }
        }

        return {
          valor: null,
          confidence: 0,
          error: 'Não foi possível interpretar a resposta da IA',
          rawText: textContent.text,
        };
      }
    } catch (error: any) {
      console.error('Erro ao extrair valor do documento:', error);
      return {
        valor: null,
        confidence: 0,
        error: error.message || 'Erro desconhecido na extração',
      };
    }
  }

  /**
   * Verifica se a API key está configurada
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Extrai valores de múltiplos arquivos em paralelo
   */
  async extractValuesFromFiles(files: File[]): Promise<ExtractionResult[]> {
    const promises = files.map(file => this.extractValueFromDocument(file));
    return Promise.all(promises);
  }
}

export const documentExtractionService = new DocumentExtractionService();
export default documentExtractionService;
