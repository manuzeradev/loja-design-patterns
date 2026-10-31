import type { Product } from "./Product";

export interface CustomerInfo {
  name: string;
  email: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

/** Item de entrada do checkout (tipo utilitário Pick + intersecção). */
export type CheckoutItem = Pick<OrderItem, "quantity"> & { productId: string };