import { round2 } from "../../utils/format";

/** Padrão Strategy: algoritmos de desconto intercambiáveis. */
export interface DiscountStrategy {
  readonly label: string;
  calculate(subtotal: number): number;
}

export class NoDiscount implements DiscountStrategy {
  readonly label = "sem desconto";
  calculate(): number {
    return 0;
  }
}

export class PercentageDiscount implements DiscountStrategy {
  constructor(private readonly percent: number) {}

  get label(): string {
    return `${this.percent}% de desconto`;
  }

  calculate(subtotal: number): number {
    return round2((subtotal * this.percent) / 100);
  }
}

export class FixedDiscount implements DiscountStrategy {
  constructor(private readonly value: number) {}

  get label(): string {
    return `cupom de R$ ${this.value}`;
  }

  calculate(subtotal: number): number {
    return Math.min(this.value, subtotal);
  }
}