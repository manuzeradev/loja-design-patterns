/** Repositório genérico em memória (uso de Generics com restrição). */
export class InMemoryRepository<T extends { id: string }> {
  private readonly items = new Map<string, T>();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return Array.from(this.items.values());
  }
}