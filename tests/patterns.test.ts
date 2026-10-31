import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { PaymentMethod, ProductCategory, ShippingType, OrderStatus } from "../src/domain/enums";
import type { Product } from "../src/domain/Product";
import { OrderBuilder } from "../src/patterns/builder/OrderBuilder";
import {
  ExpressShipping,
  GiftWrapShipping,
  StandardShipping,
} from "../src/patterns/decorator/ShippingOption";
import { CheckoutFacade } from "../src/patterns/facade/CheckoutFacade";
import { getProductCreator } from "../src/patterns/factory/ProductCreator";
import { Subject, type OrderEvent } from "../src/patterns/observer/Observer";
import { StockUpdater } from "../src/patterns/observer/OrderObservers";
import { Logger } from "../src/patterns/singleton/Logger";
import { FixedDiscount, PercentageDiscount } from "../src/patterns/strategy/DiscountStrategy";
import { CreditCardPayment } from "../src/patterns/strategy/PaymentStrategy";
import { InventoryService } from "../src/services/InventoryService";
import { InMemoryRepository } from "../src/shared/InMemoryRepository";

describe("Padrões de projeto", () => {
  it("Singleton: retorna sempre a mesma instância", () => {
    assert.equal(Logger.getInstance(), Logger.getInstance());
  });

  it("Factory Method: cria o produto da categoria correta com imposto", () => {
    const p = getProductCreator(ProductCategory.ELETRONICO).register({
      id: "X",
      name: "Teste",
      price: 1000,
    });
    assert.equal(p.category, ProductCategory.ELETRONICO);
    assert.equal(p.priceWithTax(), 1180);
  });

  it("Builder: recusa pedido incompleto", () => {
    assert.throws(() => new OrderBuilder().build(), /sem cliente/);
  });

  it("Strategy: calcula descontos e recusa cartão sem limite", () => {
    assert.equal(new PercentageDiscount(10).calculate(200), 20);
    assert.equal(new FixedDiscount(50).calculate(30), 30);
    assert.equal(new CreditCardPayment(100).pay(200).approved, false);
  });

  it("Decorator: soma custos e reduz prazo", () => {
    const shipping = new GiftWrapShipping(new ExpressShipping(new StandardShipping()));
    assert.equal(shipping.getCost(), 40);
    assert.equal(shipping.getDays(), 2);
  });

  it("Facade + Observer: pagamento aprovado baixa o estoque", () => {
    const catalog = new InMemoryRepository<Product>();
    const inventory = new InventoryService();
    const events = new Subject<OrderEvent>();
    events.subscribe(new StockUpdater(inventory));

    const book = getProductCreator(ProductCategory.LIVRO).register({
      id: "L1",
      name: "Livro",
      price: 100,
    });
    catalog.add(book);
    inventory.addStock("L1", 10);

    const order = new CheckoutFacade(catalog, inventory, events).placeOrder({
      customer: { name: "Teste", email: "t@t.com" },
      items: [{ productId: "L1", quantity: 2 }],
      paymentMethod: PaymentMethod.PIX,
      shipping: ShippingType.PADRAO,
    });

    assert.equal(order.status, OrderStatus.PAGO);
    assert.equal(order.total(), 215); // 200 + frete padrão de 15
    assert.equal(inventory.getStock("L1"), 8);
  });
});