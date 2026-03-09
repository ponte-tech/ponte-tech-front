/**
 * Traduções de mensagens de erro da API
 */
const errorTranslations: Record<string, string> = {
  // Erros de autenticação
  "Email already registered": "Este email já está cadastrado no sistema",
  "Invalid credentials": "Email ou senha incorretos",
  "User not found": "Usuário não encontrado",
  "Unauthorized": "Você não tem permissão para acessar este recurso",
  "Token expired": "Sua sessão expirou. Por favor, faça login novamente",
  "Invalid token": "Token inválido. Por favor, faça login novamente",

  // Erros de validação
  "Invalid email format": "Formato de email inválido",
  "Invalid CPF": "CPF inválido",
  "Invalid CNPJ": "CNPJ inválido",
  "Password too short": "A senha deve ter no mínimo 8 caracteres",
  "Required field": "Campo obrigatório",
  "Invalid phone number": "Número de telefone inválido",

  // Erros de colaborador
  "Colaborador not found": "Colaborador não encontrado",
  "Failed to create colaborador": "Erro ao criar colaborador",
  "Failed to update colaborador": "Erro ao atualizar colaborador",
  "Failed to delete colaborador": "Erro ao excluir colaborador",

  // Erros de contrato
  "Contract not found": "Contrato não encontrado",
  "Failed to create contract": "Erro ao criar contrato",
  "Failed to update contract": "Erro ao atualizar contrato",
  "Failed to delete contract": "Erro ao excluir contrato",
  "Cannot have multiple active contracts": "Não é possível ter múltiplos contratos ativos",

  // Erros de cliente
  "Client not found": "Cliente não encontrado",
  "Failed to create client": "Erro ao criar cliente",
  "Failed to update client": "Erro ao atualizar cliente",

  // Erros de empresa
  "Company not found": "Empresa não encontrada",
  "Failed to create company": "Erro ao criar empresa",
  "Failed to update company": "Erro ao atualizar empresa",

  // Erros genéricos
  "Internal server error": "Erro interno do servidor. Tente novamente mais tarde",
  "Network error": "Erro de conexão. Verifique sua internet",
  "Bad request": "Requisição inválida",
  "Not found": "Recurso não encontrado",
  "Forbidden": "Acesso negado",
  "Timeout": "Tempo de resposta esgotado. Tente novamente",
  "Conflict": "Este registro já existe no sistema",

  // Status codes HTTP
  "Request failed with status code 400": "Dados inválidos. Verifique as informações e tente novamente",
  "Request failed with status code 401": "Não autorizado. Faça login novamente",
  "Request failed with status code 403": "Acesso negado. Você não tem permissão para esta ação",
  "Request failed with status code 404": "Recurso não encontrado",
  "Request failed with status code 409": "Este registro já existe no sistema",
  "Request failed with status code 422": "Dados inválidos. Verifique as informações e tente novamente",
  "Request failed with status code 500": "Erro no servidor. Tente novamente mais tarde",
  "Request failed with status code 502": "Serviço temporariamente indisponível",
  "Request failed with status code 503": "Serviço temporariamente indisponível",
};

/**
 * Traduz uma mensagem de erro da API para português
 * @param message - Mensagem de erro original (geralmente em inglês)
 * @returns Mensagem traduzida ou mensagem original se não houver tradução
 */
export function translateErrorMessage(message: string): string {
  if (!message) return "Erro desconhecido";

  // Verifica se há uma tradução exata
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }

  // Busca por palavras-chave para traduzir mensagens parciais
  const lowerMessage = message.toLowerCase();

  // Verifica status codes HTTP
  if (lowerMessage.includes("status code")) {
    if (lowerMessage.includes("400")) {
      return "Dados inválidos. Verifique as informações e tente novamente";
    }
    if (lowerMessage.includes("401")) {
      return "Não autorizado. Faça login novamente";
    }
    if (lowerMessage.includes("403")) {
      return "Acesso negado. Você não tem permissão para esta ação";
    }
    if (lowerMessage.includes("404")) {
      return "Recurso não encontrado";
    }
    if (lowerMessage.includes("409")) {
      return "Este registro já existe no sistema";
    }
    if (lowerMessage.includes("422")) {
      return "Dados inválidos. Verifique as informações e tente novamente";
    }
    if (lowerMessage.includes("500") || lowerMessage.includes("502") || lowerMessage.includes("503")) {
      return "Erro no servidor. Tente novamente mais tarde";
    }
  }

  if (lowerMessage.includes("email") && lowerMessage.includes("already")) {
    return "Este email já está cadastrado no sistema";
  }

  if (lowerMessage.includes("cpf") && lowerMessage.includes("already")) {
    return "Este CPF já está cadastrado no sistema";
  }

  if (lowerMessage.includes("cnpj") && lowerMessage.includes("already")) {
    return "Este CNPJ já está cadastrado no sistema";
  }

  if (lowerMessage.includes("not found")) {
    return "Registro não encontrado";
  }

  if (lowerMessage.includes("unauthorized") || lowerMessage.includes("permission")) {
    return "Você não tem permissão para realizar esta ação";
  }

  if (lowerMessage.includes("invalid") && lowerMessage.includes("credentials")) {
    return "Email ou senha incorretos";
  }

  if (lowerMessage.includes("required")) {
    return "Preencha todos os campos obrigatórios";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return "Erro de conexão. Verifique sua internet";
  }

  if (lowerMessage.includes("conflict")) {
    return "Este registro já existe no sistema";
  }

  // Retorna a mensagem original se não houver tradução
  return message;
}

/**
 * Extrai e traduz a mensagem de erro de uma resposta de API ou erro
 * @param error - Erro capturado (pode ser AxiosError, Error ou objeto com message)
 * @returns Mensagem de erro traduzida
 */
export function getErrorMessage(error: any): string {
  // Se for um erro do Axios com resposta da API
  if (error.response?.data?.message) {
    return translateErrorMessage(error.response.data.message);
  }

  // Se for um Error padrão com message
  if (error.message) {
    return translateErrorMessage(error.message);
  }

  // Se for uma string
  if (typeof error === "string") {
    return translateErrorMessage(error);
  }

  // Erro desconhecido
  return "Ocorreu um erro inesperado. Tente novamente";
}
