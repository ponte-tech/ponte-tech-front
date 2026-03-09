/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/**
 * Formata um CNPJ no padrão XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(value: string): string {
  const numbers = cleanCNPJ(value);
  if (numbers.length <= 14) {
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers.substring(0, 14);
}

/**
 * Valida um CNPJ brasileiro
 * @param cnpj - CNPJ a ser validado (pode conter formatação)
 * @returns true se o CNPJ for válido, false caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = cleanCNPJ(cnpj);

  // CNPJ deve ter 14 dígitos
  if (cleaned.length !== 14) {
    return false;
  }

  // CNPJs inválidos conhecidos (todos os dígitos iguais)
  const invalidCNPJs = [
    "00000000000000",
    "11111111111111",
    "22222222222222",
    "33333333333333",
    "44444444444444",
    "55555555555555",
    "66666666666666",
    "77777777777777",
    "88888888888888",
    "99999999999999",
  ];

  if (invalidCNPJs.includes(cleaned)) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * multiplier;
    multiplier--;
    if (multiplier === 1) {
      multiplier = 9;
    }
  }

  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) {
    firstDigit = 0;
  }

  const cnpjFirstDigit = parseInt(cleaned.charAt(12));
  if (firstDigit !== cnpjFirstDigit) {
    return false;
  }

  // Calcula o segundo dígito verificador
  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * multiplier;
    multiplier--;
    if (multiplier === 1) {
      multiplier = 9;
    }
  }

  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) {
    secondDigit = 0;
  }

  const cnpjSecondDigit = parseInt(cleaned.charAt(13));
  return secondDigit === cnpjSecondDigit;
}

/**
 * Gera um CNPJ válido aleatório (útil para testes)
 */
export function generateValidCNPJ(): string {
  // Gera os primeiros 12 dígitos aleatórios
  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

  // Calcula o primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 12; i++) {
    sum += base[i] * multiplier;
    multiplier--;
    if (multiplier === 1) {
      multiplier = 9;
    }
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) {
    firstDigit = 0;
  }
  base.push(firstDigit);

  // Calcula o segundo dígito verificador
  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 13; i++) {
    sum += base[i] * multiplier;
    multiplier--;
    if (multiplier === 1) {
      multiplier = 9;
    }
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) {
    secondDigit = 0;
  }
  base.push(secondDigit);

  return base.join("");
}
