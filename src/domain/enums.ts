export enum ProductCategory {
  ELETRONICO = "ELETRONICO",
  LIVRO = "LIVRO",
  ROUPA = "ROUPA",
}

export enum PaymentMethod {
  PIX = "PIX",
  CARTAO_CREDITO = "CARTAO_CREDITO",
  BOLETO = "BOLETO",
}

export enum ShippingType {
  PADRAO = "PADRAO",
  EXPRESSO = "EXPRESSO",
}

export enum OrderStatus {
  CRIADO = "CRIADO",
  PAGO = "PAGO",
  CANCELADO = "CANCELADO",
}

export enum OrderEventType {
  ORDER_PLACED = "ORDER_PLACED",
  PAYMENT_APPROVED = "PAYMENT_APPROVED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
}