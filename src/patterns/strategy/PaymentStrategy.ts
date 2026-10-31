import { PaymentMethod } from "../../domain/enums";

export interface PaymentResult {
  approved: boolean;
  transactionId: string;
  message: string;
}

/** Padrão Strategy: cada forma de pagamento é um algoritmo independente. */
export interface PaymentStrategy {
  readonly method: PaymentMethod;
  pay(amount: number): PaymentResult;
}

let sequence = 0;
const nextTransaction = (prefix: string): string =>
  `${prefix}-${String(++sequence).padStart(5, "0")}`;

export class PixPayment implements PaymentStrategy {
  readonly method = PaymentMethod.PIX;

  pay(amount: number): PaymentResult {
    return {
      approved: true,
      transactionId: nextTransaction("PIX"),
      message: `Pix de R$ ${amount.toFixed(2)} confirmado.`,
    };
  }
}

export class CreditCardPayment implements PaymentStrategy {
  readonly method = PaymentMethod.CARTAO_CREDITO;

  constructor(private readonly limit: number) {}

  pay(amount: number): PaymentResult {
    if (amount > this.limit) {
      return {
        approved: false,
        transactionId: nextTransaction("CC"),
        message: `Cartão recusado: limite insuficiente (R$ ${this.limit.toFixed(2)}).`,
      };
    }
    return {
      approved: true,
      transactionId: nextTransaction("CC"),
      message: `Cartão aprovado em R$ ${amount.toFixed(2)}.`,
    };
  }
}

export class BoletoPayment implements PaymentStrategy {
  readonly method = PaymentMethod.BOLETO;

  pay(amount: number): PaymentResult {
    return {
      approved: true,
      transactionId: nextTransaction("BOL"),
      message: `Boleto de R$ ${amount.toFixed(2)} gerado e compensado.`,
    };
  }
}