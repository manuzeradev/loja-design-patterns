import { ProductCategory } from "./enums";
import { formatBRL, round2 } from "../utils/format";

/** Classe abstrata: define o contrato comum dos produtos. */
export abstract class Product {
  abstract readonly category: ProductCategory;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number
  ) {}

  protected abstract taxRate(): number;

  priceWithTax(): number {
    return round2(this.price * (1 + this.taxRate()));
  }

  describe(): string {
    return `[${this.category}] ${this.name} - ${formatBRL(this.price)}`;
  }
}

export class ElectronicProduct extends Product {
  readonly category = ProductCategory.ELETRONICO;
  protected taxRate(): number {
    return 0.18;
  }
}

export class BookProduct extends Product {
  readonly category = ProductCategory.LIVRO;
  protected taxRate(): number {
    return 0;
  }
}

export class ClothingProduct extends Product {
  readonly category = ProductCategory.ROUPA;
  protected taxRate(): number {
    return 0.12;
  }
}