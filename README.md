# Loja Virtual: Design Patterns em TypeScript

## Descrição do Projeto

Simulador de **checkout de e-commerce** executado via terminal. O sistema resolve o problema de
processar um pedido de ponta a ponta: validar produtos e estoque, aplicar cupons de desconto,
escolher a forma de pagamento, compor o frete com serviços adicionais (expresso, seguro, embalagem
de presente) e notificar os demais módulos (e-mail, estoque, relatório de vendas) quando o pedido
muda de estado.

Recursos de TypeScript utilizados: interfaces, classes abstratas, enums, generics com restrição
(`InMemoryRepository<T extends { id: string }>`, `Subject<T>`), tipos utilitários (`Record`, `Pick`,
`Readonly`, `ReadonlyArray`), `import type`, getters e modificadores `private`/`protected`/`readonly`.

## Instruções de Execução

Pré-requisito: Node.js 18+.

```bash
npm install        # instala as dependências
npm start          # executa a demonstração (src/index.ts)
npm test           # executa os testes automatizados
npm run build      # compila para dist/
npm run start:prod # executa o código compilado
```

## Estrutura

```
src/
├── domain/      # entidades, enums e tipos
├── patterns/    # um subdiretório por padrão
├── services/    # serviço de estoque
├── shared/      # repositório genérico
├── utils/       # formatação
└── index.ts     # demonstração
tests/           # testes automatizados
```

## Mapeamento dos Padrões

### 1. Singleton (Criacional)
- **Onde:** `src/patterns/singleton/Logger.ts`, classe `Logger`.
- **Justificativa:** todo o sistema precisa registrar eventos em um único histórico de log. O
  Singleton garante uma instância única e global, evitando logs duplicados ou dispersos e permitindo
  consultar o histórico completo em um só lugar.

### 2. Factory Method (Criacional)
- **Onde:** `src/patterns/factory/ProductCreator.ts`: `ProductCreator` (abstrata) e as subclasses
  `ElectronicCreator`, `BookCreator` e `ClothingCreator`.
- **Justificativa:** cada categoria de produto tem uma classe concreta com sua alíquota de imposto.
  O Factory Method centraliza a criação e o fluxo comum de cadastro (log), delegando às subclasses
  apenas a instanciação. Novas categorias são adicionadas sem alterar o código cliente (Open/Closed).

### 3. Builder (Criacional)
- **Onde:** `src/patterns/builder/OrderBuilder.ts`, classe `OrderBuilder`.
- **Justificativa:** o `Order` possui muitos componentes (cliente, itens, desconto, pagamento, frete),
  alguns opcionais. O Builder monta o objeto passo a passo com interface fluente e valida a
  consistência em `build()`, evitando construtores com muitos parâmetros e pedidos inválidos.

### 4. Strategy (Comportamental)
- **Onde:** `src/patterns/strategy/DiscountStrategy.ts` (`NoDiscount`, `PercentageDiscount`,
  `FixedDiscount`) e `src/patterns/strategy/PaymentStrategy.ts` (`PixPayment`, `CreditCardPayment`,
  `BoletoPayment`).
- **Justificativa:** regras de desconto e formas de pagamento são algoritmos que variam por pedido.
  Encapsulá-los em estratégias intercambiáveis elimina `if/else` extensos em `Order` e permite
  trocar o comportamento em tempo de execução, adicionando novas regras sem alterar as existentes.

### 5. Observer (Comportamental)
- **Onde:** `src/patterns/observer/Observer.ts` (`Subject<T>`, `Observer<T>`) e
  `src/patterns/observer/OrderObservers.ts` (`EmailNotifier`, `StockUpdater`, `SalesReport`).
- **Justificativa:** quando um pedido muda de estado, vários módulos precisam reagir (e-mail, baixa
  de estoque, relatório). Com o Observer, o checkout apenas publica eventos, sem conhecer quem os
  consome, o que reduz o acoplamento e permite incluir novos observadores sem tocar no fluxo principal.

### 6. Decorator (Estrutural)
- **Onde:** `src/patterns/decorator/ShippingOption.ts`: `StandardShipping` (componente),
  `ShippingDecorator` (base) e `ExpressShipping`, `GiftWrapShipping`, `InsuranceShipping`.
- **Justificativa:** o frete aceita combinações de serviços adicionais. Com herança haveria uma
  explosão de subclasses (expresso+seguro, expresso+presente, etc.). O Decorator permite compor
  essas opções dinamicamente, acumulando custo, prazo e descrição.

### 7. Facade (Estrutural)
- **Onde:** `src/patterns/facade/CheckoutFacade.ts`, classe `CheckoutFacade`.
- **Justificativa:** finalizar um pedido envolve catálogo, estoque, Builder, Strategy, Decorator e
  Observer. A fachada expõe um único método, `placeOrder(request)`, escondendo essa orquestração e
  mantendo o código cliente (`index.ts`) simples.