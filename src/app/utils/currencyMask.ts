/**
 * Formata um valor numérico para moeda brasileira (BRL)
 * @param value - Valor numérico
 * @returns String formatada em moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Aplica máscara de moeda brasileira em um input
 * @param value - Valor string do input
 * @returns String formatada como moeda
 */
export function applyCurrencyMask(value: string): string {
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, "");

  // Se não houver valor, retorna vazio
  if (!numericValue) return "";

  // Converte para número dividindo por 100 (para considerar os centavos)
  const numberValue = parseInt(numericValue, 10) / 100;

  // Formata como moeda
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

/**
 * Remove a máscara de moeda e retorna o valor numérico
 * @param value - String com máscara de moeda
 * @returns Valor numérico
 */
export function removeCurrencyMask(value: string): number {
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, "");

  // Se não houver valor, retorna 0
  if (!numericValue) return 0;

  // Converte para número dividindo por 100
  return parseInt(numericValue, 10) / 100;
}

/**
 * Hook personalizado para gerenciar estado de campo com máscara de moeda
 * @param initialValue - Valor inicial numérico
 * @returns [displayValue, numericValue, handleChange]
 */
export function useCurrencyInput(initialValue: number = 0): [
  string,
  number,
  (value: string) => void
] {
  const [displayValue, setDisplayValue] = React.useState(
    formatCurrency(initialValue)
  );
  const [numericValue, setNumericValue] = React.useState(initialValue);

  const handleChange = (value: string) => {
    const masked = applyCurrencyMask(value);
    const numeric = removeCurrencyMask(masked);

    setDisplayValue(masked);
    setNumericValue(numeric);
  };

  return [displayValue, numericValue, handleChange];
}

// Para compatibilidade com React
import React from "react";
