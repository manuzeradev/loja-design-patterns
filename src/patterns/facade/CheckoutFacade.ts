import { Order } from "../../domain/Order";
import type { Product } from "../../domain/Product";
import { OrderEventType, OrderStatus, PaymentMethod, ShippingType } from "../../domain/enums";
import type { CheckoutItem, CustomerInfo } from "../../domain/types";
import { InventoryService } from "../../services/InventoryService";
import { InMemoryRepository } from "../../shared/InMemoryRepository";
import { OrderBuilder } from "../builder/OrderBuilder";
import {
  ExpressShipping,
  GiftWrapShipping,
  InsuranceShipping,
  StandardShipping,
  type ShippingOption,
} from "../decorator/ShippingOption";
import type { OrderEvent, Subject } from "../observer/Observer";
import { Logger } from "../singleton/Logger";
import {
  FixedDiscount,
  NoDiscount,
  PercentageDiscount,
  type DiscountStrategy,
} from "../strategy/DiscountStrategy";
import {
  BoletoPayment,
  CreditCardPayment,
  PixPayment,
  type PaymentStrategy,
} from "../strategy/PaymentStrategy";

export interface CheckoutRequest {
  customer: CustomerInfo;
  items: CheckoutItem[];
  paymentMethod: PaymentMethod;
  shipping: ShippingType;
  couponCode?: string;
  creditLimit?: number;
  giftWrap?: boolean;
  insurance?: boolean;
}

/**
 * Padrão Facade: interface única e simples (placeOrder) que esconde a
 * coordenação entre catálogo, estoque, Builder, Strategy, Decorator e Observer.
 */
export class CheckoutFacade {
  private static readonly COUPONS: Readonly<Record<string, DiscountStrategy>> = {
    BEMVINDO10: new PercentageDiscount(10),
    MENOS50: new FixedDiscount(50),
  };

  private readonly orders = new InMemoryRepository<Order>();

  constructor(
    private readonly catalog: InMemoryRepository<Product>,
    private readonly inventory: InventoryService,
    private readonly events: Subject<OrderEvent>
  ) {}

  placeOrder(request: CheckoutRequest): Order {
    const log = Logger.getInstance();

    const items = request.items.map(({ productId, quantity }) => {
      const product = this.catalog.findById(productId);
      if (!product) throw new Error(`Produto não encontrado: ${productId}`);
      if (!this.inventory.hasStock(productId, quantity)) {
        throw new Error(`Estoque insuficiente para "${product.name}".`);
      }
      return { product, quantity };
    });

    const declaredValue = items.reduce(
      (acc, i) => acc + i.product.priceWithTax() * i.quantity,
      0
    );

    const builder = new OrderBuilder()
      .forCustomer(request.customer)
      .withDiscount(this.resolveDiscount(request.couponCode))
      .withPayment(this.resolvePayment(request))
      .withShipping(this.buildShipping(request, declaredValue));
    items.forEach((i) => builder.addItem(i.product, i.quantity));

    const order = builder.build();
    this.orders.add(order);
    this.emit(OrderEventType.ORDER_PLACED, order);

    const result = order.payment.pay(order.total());
    log.info(`[Pagamento] ${result.message} (${result.transactionId})`);

    if (result.approved) {
      order.status = OrderStatus.PAGO;
      this.emit(OrderEventType.PAYMENT_APPROVED, order);
    } else {
      order.status = OrderStatus.CANCELADO;
      this.emit(OrderEventType.PAYMENT_FAILED, order);
    }
    return order;
  }

  private emit(type: OrderEventType, order: Order): void {
    this.events.notify({ type, order, timestamp: new Date() });
  }

  private resolveDiscount(code?: string): DiscountStrategy {
    if (!code) return new NoDiscount();
    return CheckoutFacade.COUPONS[code.toUpperCase()] ?? new NoDiscount();
  }

  private resolvePayment(request: CheckoutRequest): PaymentStrategy {
    const strategies: Record<PaymentMethod, () => PaymentStrategy> = {
      [PaymentMethod.PIX]: () => new PixPayment(),
      [PaymentMethod.CARTAO_CREDITO]: () => new CreditCardPayment(request.creditLimit ?? 5000),
      [PaymentMethod.BOLETO]: () => new BoletoPayment(),
    };
    return strategies[request.paymentMethod]();
  }

  /** Composição de Decorators conforme as opções escolhidas. */
  private buildShipping(request: CheckoutRequest, declaredValue: number): ShippingOption {
    let shipping: ShippingOption = new StandardShipping();
    if (request.shipping === ShippingType.EXPRESSO) shipping = new ExpressShipping(shipping);
    if (request.giftWrap) shipping = new GiftWrapShipping(shipping);
    if (request.insurance) shipping = new InsuranceShipping(shipping, declaredValue);
    return shipping;
  }
}