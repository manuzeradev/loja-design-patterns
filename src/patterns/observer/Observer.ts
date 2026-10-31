import type { Order } from "../../domain/Order";
import { OrderEventType } from "../../domain/enums";

export interface Observer<T> {
  update(event: T): void;
}

/** Padrão Observer: Subject genérico que notifica todos os observadores inscritos. */
export class Subject<T> {
  private readonly observers = new Set<Observer<T>>();

  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers.delete(observer);
  }

  notify(event: T): void {
    this.observers.forEach((o) => o.update(event));
  }
}

export interface OrderEvent {
  readonly type: OrderEventType;
  readonly order: Order;
  readonly timestamp: Date;
}