const MIN_PRODUCT_PRICE_CENTS = 500;
const MAX_PRODUCT_PRICE_CENTS = 5_000_000;

export function parseProductPriceToCents(value: string): number | null {
  const normalized = value.replace(/[^\d.,-]/g, "").trim();

  if (!normalized || normalized.startsWith("-")) {
    return null;
  }

  const lastCommaIndex = normalized.lastIndexOf(",");
  const lastDotIndex = normalized.lastIndexOf(".");
  const separatorIndex = Math.max(lastCommaIndex, lastDotIndex);

  if (separatorIndex === -1) {
    const digits = normalized.replace(/\D/g, "");

    return digits ? Number(digits) * 100 : null;
  }

  const integerPart = normalized.slice(0, separatorIndex).replace(/\D/g, "");
  const decimalPart = normalized.slice(separatorIndex + 1).replace(/\D/g, "");

  if (!integerPart || decimalPart.length > 2) {
    return null;
  }

  return Number(integerPart) * 100 + Number(decimalPart.padEnd(2, "0"));
}

export function isProductPriceInRange(value: string): boolean {
  const cents = parseProductPriceToCents(value);

  return (
    cents !== null &&
    cents >= MIN_PRODUCT_PRICE_CENTS &&
    cents <= MAX_PRODUCT_PRICE_CENTS
  );
}

export function formatCentsToCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(cents / 100);
}

export function formatCentsToDecimalInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatCentsToMaskedInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function maskPriceInputFromDigits(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "");
  const cents = digits ? Number(digits) : 0;

  return formatCentsToMaskedInput(cents);
}

export { MAX_PRODUCT_PRICE_CENTS, MIN_PRODUCT_PRICE_CENTS };
