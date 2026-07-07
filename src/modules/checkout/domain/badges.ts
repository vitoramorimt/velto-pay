export type CheckoutBadgeId = "secure_payment" | "guarantee" | "support";

export type CheckoutBadge = {
  enabled: boolean;
  id: CheckoutBadgeId;
  label: string;
};

export const CHECKOUT_BADGE_ORDER: CheckoutBadgeId[] = [
  "secure_payment",
  "guarantee",
  "support",
];

export const CHECKOUT_BADGE_DEFAULTS: Record<CheckoutBadgeId, string> = {
  guarantee: "Garantia de 7 dias",
  secure_payment: "Pagamento 100% seguro",
  support: "Suporte dedicado",
};

function isCheckoutBadgeId(value: unknown): value is CheckoutBadgeId {
  return (
    typeof value === "string" &&
    CHECKOUT_BADGE_ORDER.includes(value as CheckoutBadgeId)
  );
}

export function normalizeCheckoutBadges(raw: unknown): CheckoutBadge[] {
  const rawList = Array.isArray(raw) ? raw : [];
  const byId = new Map<CheckoutBadgeId, CheckoutBadge>();

  for (const item of rawList) {
    if (
      typeof item !== "object" ||
      item === null ||
      !isCheckoutBadgeId((item as { id?: unknown }).id)
    ) {
      continue;
    }

    const entry = item as { enabled?: unknown; id: CheckoutBadgeId; label?: unknown };
    const label =
      typeof entry.label === "string" && entry.label.trim()
        ? entry.label.trim().slice(0, 60)
        : CHECKOUT_BADGE_DEFAULTS[entry.id];

    byId.set(entry.id, {
      enabled: Boolean(entry.enabled),
      id: entry.id,
      label,
    });
  }

  return CHECKOUT_BADGE_ORDER.map(
    (id) =>
      byId.get(id) ?? {
        enabled: true,
        id,
        label: CHECKOUT_BADGE_DEFAULTS[id],
      },
  );
}
