import { Order } from "../../domain/Order";
import type { Product } from "../../domain/Product";
import type { CustomerInfo, OrderItem } from "../../domain/types";
import { NoDiscount, type DiscountStrategy } from "../strategy/DiscountStrategy";
import type { PaymentStrategy } from "../strategy/PaymentStrategy";
import type { ShippingOption } from "../decorator/ShippingOption";

/** Padrão Builder: monta um Order complexo passo a passo, com validação no build(). */
export class OrderBuilder {
  private static counter = 0;

  private customer?: CustomerInfo;
  private readonly items: OrderItem[] = [];
  private discount: DiscountStrategy = new NoDiscount();
  private payment?: PaymentStrategy;
  private shipping?: ShippingOption;

  forCustomer(customer: CustomerInfo): this {
    this.customer = customer;
    return this;
  }

  addItem(product: Product, quantity = 1): this {
    if (quantity <= 0) {
      throw new Error("Quantidade deve ser maior que zero.");
    }
    this.items.push({ product, quantity });
    return this;
  }

  withDiscount(discount: DiscountStrategy): this {
    this.discount = discount;
    return this;
  }

  withPayment(payment: PaymentStrategy): this {
    this.payment = payment;
    return this;
  }

  withShipping(shipping: ShippingOption): this {
    this.shipping = shipping;
    return this;
  }

  build(): Order {
    if (!this.customer) throw new Error("Pedido sem cliente.");
    if (this.items.length === 0) throw new Error("Pedido sem itens.");
    if (!this.payment) throw new Error("Pedido sem forma de pagamento.");
    if (!this.shipping) throw new Error("Pedido sem frete.");

    const id = `PED-${String(++OrderBuilder.counter).padStart(4, "0")}`;
    return new Order(
      id,
      this.customer,
      [...this.items],
      this.discount,
      this.payment,
      this.shipping
    );
  }
}