import { OrderStatus } from "./enums";
import type { CustomerInfo, OrderItem } from "./types";
import type { DiscountStrategy } from "../patterns/strategy/DiscountStrategy";
import type { PaymentStrategy } from "../patterns/strategy/PaymentStrategy";
import type { ShippingOption } from "../patterns/decorator/ShippingOption";
import { formatBRL, round2 } from "../utils/format";

export class Order {
  status: OrderStatus = OrderStatus.CRIADO;

  constructor(
    public readonly id: string,
    public readonly customer: CustomerInfo,
    public readonly items: ReadonlyArray<OrderItem>,
    public readonly discount: DiscountStrategy,
    public readonly payment: PaymentStrategy,
    public readonly shipping: ShippingOption
  ) {}

  subtotal(): number {
    return round2(
      this.items.reduce((acc, i) => acc + i.product.priceWithTax() * i.quantity, 0)
    );
  }

  discountValue(): number {
    return this.discount.calculate(this.subtotal());
  }

  shippingCost(): number {
    return this.shipping.getCost();
  }

  total(): number {
    return round2(this.subtotal() - this.discountValue() + this.shippingCost());
  }

  summary(): string {
    const lines = this.items.map(
      (i) =>
        `    - ${i.quantity}x ${i.product.name}: ${formatBRL(i.product.priceWithTax() * i.quantity)}`
    );
    return [
      `Pedido ${this.id} [${this.status}] - ${this.customer.name}`,
      ...lines,
      `    Subtotal: ${formatBRL(this.subtotal())}`,
      `    Desconto (${this.discount.label}): -${formatBRL(this.discountValue())}`,
      `    Frete (${this.shipping.getDescription()}, ${this.shipping.getDays()} dias): ${formatBRL(this.shippingCost())}`,
      `    TOTAL: ${formatBRL(this.total())}`,
    ].join("\n");
  }
}