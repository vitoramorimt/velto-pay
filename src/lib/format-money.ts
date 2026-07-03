export function formatCents(amountInCents: number, currency: "BRL" = "BRL", locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amountInCents / 100,
  );
}
