/**
 * Utilitários para formatação de dados conforme esperado pela API
 */

/**
 * Formata CPF para XXX.XXX.XXX-XX
 */
export function formatCPF(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 11) return clean;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

/**
 * Formata CNPJ para XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 14) return clean;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

/**
 * Formata telefone para (XX) XXXXX-XXXX
 */
export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 11) return clean;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
}

/**
 * Formata CEP para XXXXX-XXX
 */
export function formatCEP(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 8) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

/**
 * Remove formatação (retorna apenas dígitos)
 */
export function unformat(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Helper para garantir que valores já estejam formatados
 * Se já estiver formatado, retorna como está
 * Se estiver desformatado, formata
 */
export function ensureFormatted(value: string, type: "cpf" | "cnpj" | "phone" | "cep"): string {
  // Se já contém caracteres de formatação, assume que está formatado
  if ((type === "cpf" && value.includes(".")) ||
      (type === "cnpj" && value.includes(".")) ||
      (type === "phone" && value.includes("(")) ||
      (type === "cep" && value.includes("-"))) {
    return value;
  }

  // Caso contrário, formata
  switch (type) {
    case "cpf":
      return formatCPF(value);
    case "cnpj":
      return formatCNPJ(value);
    case "phone":
      return formatPhone(value);
    case "cep":
      return formatCEP(value);
  }
}
