import { OrderEventType } from "../../domain/enums";
import { InventoryService } from "../../services/InventoryService";
import { formatBRL } from "../../utils/format";
import { Logger } from "../singleton/Logger";
import type { Observer, OrderEvent } from "./Observer";

/** Observador 1: simula o envio de e-mails ao cliente. */
export class EmailNotifier implements Observer<OrderEvent> {
  update({ type, order }: OrderEvent): void {
    const log = Logger.getInstance();
    switch (type) {
      case OrderEventType.ORDER_PLACED:
        log.info(`[E-mail] Para ${order.customer.email}: pedido ${order.id} recebido.`);
        break;
      case OrderEventType.PAYMENT_APPROVED:
        log.info(`[E-mail] Para ${order.customer.email}: pagamento do pedido ${order.id} aprovado!`);
        break;
      case OrderEventType.PAYMENT_FAILED:
        log.warn(`[E-mail] Para ${order.customer.email}: pagamento do pedido ${order.id} recusado.`);
        break;
    }
  }
}

/** Observador 2: baixa o estoque quando o pagamento é aprovado. */
export class StockUpdater implements Observer<OrderEvent> {
  constructor(private readonly inventory: InventoryService) {}

  update({ type, order }: OrderEvent): void {
    if (type !== OrderEventType.PAYMENT_APPROVED) return;
    order.items.forEach((i) => this.inventory.remove(i.product.id, i.quantity));
    Logger.getInstance().info(`[Estoque] Baixa realizada para o pedido ${order.id}.`);
  }
}

/** Observador 3: acumula o faturamento das vendas aprovadas. */
export class SalesReport implements Observer<OrderEvent> {
  private total = 0;
  private count = 0;

  update({ type, order }: OrderEvent): void {
    if (type !== OrderEventType.PAYMENT_APPROVED) return;
    this.total += order.total();
    this.count += 1;
  }

  print(): void {
    Logger.getInstance().info(
      `[Relatório] ${this.count} venda(s) aprovada(s), faturamento: ${formatBRL(this.total)}`
    );
  }

  getTotal(): number {
    return this.total;
  }
}