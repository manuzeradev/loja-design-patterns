export const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const formatBRL = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });