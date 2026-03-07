/**
 * Service para integração com API viaCEP
 * https://viacep.com.br/
 */

export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

class CepService {
  private static readonly API_URL = "https://viacep.com.br/ws";

  /**
   * Busca dados de endereço pelo CEP
   * @param cep - CEP sem formatação (8 dígitos)
   * @returns EnderecoViaCEP ou null se não encontrado
   */
  async buscarEndereco(cep: string): Promise<EnderecoViaCEP | null> {
    try {
      // Remove formatação do CEP (apenas números)
      const cepLimpo = cep.replace(/\D/g, "");

      // Valida se tem 8 dígitos
      if (cepLimpo.length !== 8) {
        throw new Error("CEP deve ter 8 dígitos");
      }

      const response = await fetch(`${CepService.API_URL}/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data: EnderecoViaCEP = await response.json();

      // viaCEP retorna { erro: true } quando CEP não é encontrado
      if (data.erro) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  }

  /**
   * Transforma resposta viaCEP em formato esperado pelos formulários
   */
  transformarParaFormulario(endereco: EnderecoViaCEP): {
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
  } {
    return {
      logradouro: endereco.logradouro,
      bairro: endereco.bairro,
      cidade: endereco.localidade,
      estado: endereco.uf,
    };
  }
}

const cepService = new CepService();
export default cepService;
