export type CurrencyCode = "BRL";

export class Money {
  private constructor(
    private readonly amountInCents: number,
    private readonly currency: CurrencyCode,
  ) {}

  static fromCents(amountInCents: number, currency: CurrencyCode = "BRL"): Money {
    if (!Number.isInteger(amountInCents) || amountInCents < 0) {
      throw new Error("amountInCents must be a non-negative integer");
    }
    return new Money(amountInCents, currency);
  }

  get cents(): number {
    return this.amountInCents;
  }

  get currencyCode(): CurrencyCode {
    return this.currency;
  }

  toDecimal(): number {
    return this.amountInCents / 100;
  }

  format(locale = "pt-BR"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currency,
    }).format(this.toDecimal());
  }
}
