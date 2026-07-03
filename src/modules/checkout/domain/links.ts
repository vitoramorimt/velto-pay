const PRODUCTION_CHECKOUT_ORIGIN = "https://pay.veltopay.com.br";
const LOCAL_CHECKOUT_ORIGIN = "http://localhost:3000";

export function getCheckoutOrigin(): string {
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_CHECKOUT_ORIGIN
    : LOCAL_CHECKOUT_ORIGIN;
}

export function createCheckoutUrl(slug: string): string {
  if (process.env.NODE_ENV === "production") {
    return `${getCheckoutOrigin()}/${slug}`;
  }

  return `${getCheckoutOrigin()}/pay/${slug}`;
}
