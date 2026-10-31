export class InventoryService {
  private readonly stock = new Map<string, number>();

  addStock(productId: string, quantity: number): void {
    this.stock.set(productId, this.getStock(productId) + quantity);
  }

  getStock(productId: string): number {
    return this.stock.get(productId) ?? 0;
  }

  hasStock(productId: string, quantity: number): boolean {
    return this.getStock(productId) >= quantity;
  }

  remove(productId: string, quantity: number): void {
    this.stock.set(productId, Math.max(0, this.getStock(productId) - quantity));
  }
}