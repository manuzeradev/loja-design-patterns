import { round2 } from "../../utils/format";

/** Componente do Decorator. */
export interface ShippingOption {
  getCost(): number;
  getDays(): number;
  getDescription(): string;
}

/** Componente concreto. */
export class StandardShipping implements ShippingOption {
  getCost(): number {
    return 15;
  }
  getDays(): number {
    return 7;
  }
  getDescription(): string {
    return "Frete padrão";
  }
}

/** Decorator base: envolve outro ShippingOption e repassa as chamadas. */
export abstract class ShippingDecorator implements ShippingOption {
  constructor(protected readonly wrapped: ShippingOption) {}

  getCost(): number {
    return this.wrapped.getCost();
  }
  getDays(): number {
    return this.wrapped.getDays();
  }
  getDescription(): string {
    return this.wrapped.getDescription();
  }
}

export class ExpressShipping extends ShippingDecorator {
  getCost(): number {
    return this.wrapped.getCost() + 20;
  }
  getDays(): number {
    return Math.max(1, this.wrapped.getDays() - 5);
  }
  getDescription(): string {
    return `${this.wrapped.getDescription()} + Expresso`;
  }
}

export class GiftWrapShipping extends ShippingDecorator {
  getCost(): number {
    return this.wrapped.getCost() + 5;
  }
  getDescription(): string {
    return `${this.wrapped.getDescription()} + Embalagem de presente`;
  }
}

export class InsuranceShipping extends ShippingDecorator {
  constructor(wrapped: ShippingOption, private readonly declaredValue: number) {
    super(wrapped);
  }
  getCost(): number {
    return round2(this.wrapped.getCost() + this.declaredValue * 0.02);
  }
  getDescription(): string {
    return `${this.wrapped.getDescription()} + Seguro`;
  }
}