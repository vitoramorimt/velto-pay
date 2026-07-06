const LOCAL_CHECKOUT_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value?: string | null): string | null {
  const origin = value?.trim();

  if (!origin) {
    return null;
  }

  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

export function getCheckoutOrigin(): string {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return normalizeOrigin(`https://${vercelUrl}`) ?? LOCAL_CHECKOUT_ORIGIN;
  }

  return LOCAL_CHECKOUT_ORIGIN;
}

export function createCheckoutUrl(slug: string): string {
  return `${getCheckoutOrigin()}/pay/${slug}`;
}
