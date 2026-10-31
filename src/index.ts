import type { Product } from "./domain/Product";
import { PaymentMethod, ProductCategory, ShippingType } from "./domain/enums";
import type { ProductData } from "./domain/types";
import { getProductCreator } from "./patterns/factory/ProductCreator";
import { CheckoutFacade } from "./patterns/facade/CheckoutFacade";
import { Subject, type OrderEvent } from "./patterns/observer/Observer";
import { EmailNotifier, SalesReport, StockUpdater } from "./patterns/observer/OrderObservers";
import { Logger } from "./patterns/singleton/Logger";
import { InventoryService } from "./services/InventoryService";
import { InMemoryRepository } from "./shared/InMemoryRepository";

const title = (text: string): void => console.log(`\n=== ${text} ===`);

// ---------- Singleton ----------
title("1. SINGLETON: Logger único");
const logger = Logger.getInstance();
logger.info(`Mesma instância em dois pontos? ${logger === Logger.getInstance()}`);

// ---------- Factory Method ----------
title("2. FACTORY METHOD: cadastro de produtos");
const catalog = new InMemoryRepository<Product>();
const inventory = new InventoryService();

const seed: Array<{ category: ProductCategory; data: ProductData; stock: number }> = [
  { category: ProductCategory.ELETRONICO, data: { id: "N1", name: "Notebook", price: 4500 }, stock: 5 },
  { category: ProductCategory.ELETRONICO, data: { id: "E2", name: "Fone Bluetooth", price: 350 }, stock: 10 },
  { category: ProductCategory.LIVRO, data: { id: "L1", name: "Design Patterns (GoF)", price: 120 }, stock: 10 },
  { category: ProductCategory.ROUPA, data: { id: "R1", name: "Camiseta", price: 80 }, stock: 20 },
];

seed.forEach(({ category, data, stock }) => {
  const product = getProductCreator(category).register(data);
  catalog.add(product);
  inventory.addStock(product.id, stock);
});

// ---------- Observer ----------
const events = new Subject<OrderEvent>();
const report = new SalesReport();
events.subscribe(new EmailNotifier());
events.subscribe(new StockUpdater(inventory));
events.subscribe(report);

// ---------- Facade (usa Builder + Strategy + Decorator + Observer por dentro) ----------
const checkout = new CheckoutFacade(catalog, inventory, events);

title("3. CHECKOUT 1: Pix + cupom (Strategy) + frete decorado (Decorator)");
const order1 = checkout.placeOrder({
  customer: { name: "Ana", email: "ana@email.com" },
  items: [
    { productId: "L1", quantity: 2 },
    { productId: "R1", quantity: 1 },
  ],
  paymentMethod: PaymentMethod.PIX,
  couponCode: "BEMVINDO10",
  shipping: ShippingType.EXPRESSO,
  giftWrap: true,
  insurance: true,
});
console.log(order1.summary());

title("4. CHECKOUT 2: cartão recusado por limite");
const order2 = checkout.placeOrder({
  customer: { name: "Bruno", email: "bruno@email.com" },
  items: [{ productId: "N1", quantity: 1 }],
  paymentMethod: PaymentMethod.CARTAO_CREDITO,
  creditLimit: 3000,
  shipping: ShippingType.PADRAO,
});
console.log(order2.summary());

title("5. CHECKOUT 3: boleto + cupom de valor fixo");
const order3 = checkout.placeOrder({
  customer: { name: "Diego", email: "diego@email.com" },
  items: [{ productId: "E2", quantity: 2 }],
  paymentMethod: PaymentMethod.BOLETO,
  couponCode: "MENOS50",
  shipping: ShippingType.PADRAO,
});
console.log(order3.summary());

title("6. CHECKOUT 4: estoque insuficiente (erro tratado)");
try {
  checkout.placeOrder({
    customer: { name: "Carla", email: "carla@email.com" },
    items: [{ productId: "R1", quantity: 100 }],
    paymentMethod: PaymentMethod.PIX,
    shipping: ShippingType.PADRAO,
  });
} catch (error) {
  logger.error((error as Error).message);
}

title("7. RESULTADO FINAL");
report.print();
console.log(
  `Estoque restante -> Livro: ${inventory.getStock("L1")}, Camiseta: ${inventory.getStock("R1")}, Notebook: ${inventory.getStock("N1")}, Fone: ${inventory.getStock("E2")}`
);