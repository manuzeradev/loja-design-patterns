import {
  BookProduct,
  ClothingProduct,
  ElectronicProduct,
  Product,
} from "../../domain/Product";
import { ProductCategory } from "../../domain/enums";
import type { ProductData } from "../../domain/types";
import { Logger } from "../singleton/Logger";

/**
 * Padrão Factory Method: a classe base define o fluxo (register)
 * e delega às subclasses a criação do produto concreto (createProduct).
 */
export abstract class ProductCreator {
  protected abstract createProduct(data: ProductData): Product;

  register(data: ProductData): Product {
    const product = this.createProduct(data);
    Logger.getInstance().info(`Produto cadastrado: ${product.describe()}`);
    return product;
  }
}

export class ElectronicCreator extends ProductCreator {
  protected createProduct(d: ProductData): Product {
    return new ElectronicProduct(d.id, d.name, d.price);
  }
}

export class BookCreator extends ProductCreator {
  protected createProduct(d: ProductData): Product {
    return new BookProduct(d.id, d.name, d.price);
  }
}

export class ClothingCreator extends ProductCreator {
  protected createProduct(d: ProductData): Product {
    return new ClothingProduct(d.id, d.name, d.price);
  }
}

const creators: Record<ProductCategory, ProductCreator> = {
  [ProductCategory.ELETRONICO]: new ElectronicCreator(),
  [ProductCategory.LIVRO]: new BookCreator(),
  [ProductCategory.ROUPA]: new ClothingCreator(),
};

export function getProductCreator(category: ProductCategory): ProductCreator {
  return creators[category];
}