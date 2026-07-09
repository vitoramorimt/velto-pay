import type {
  OfferBenefit,
  OfferBonus,
  OfferConversionContent,
  OfferFaq,
  OfferTestimonial,
  OfferTrustSeal,
} from "@/modules/offers/domain/types";

const MAX_ITEMS = 12;

export const DEFAULT_OFFER_CONVERSION_CONTENT: OfferConversionContent = {
  benefits: [
    {
      id: "benefit-1",
      text: "Acesso imediato ao conteúdo após a confirmação do pagamento.",
    },
    {
      id: "benefit-2",
      text: "Material organizado para aplicar ainda hoje.",
    },
  ],
  bonuses: [],
  countdownEnabled: false,
  countdownEndsAt: "",
  faqs: [],
  guarantee: "",
  testimonials: [],
  trustSeals: [
    {
      id: "trust-1",
      label: "Pagamento seguro",
    },
  ],
  urgencyText: "",
};

function readString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeList<T>(
  raw: unknown,
  mapItem: (item: Record<string, unknown>, index: number) => T | null,
): T[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .slice(0, MAX_ITEMS)
    .map((item, index) =>
      typeof item === "object" && item !== null
        ? mapItem(item as Record<string, unknown>, index)
        : null,
    )
    .filter((item): item is T => Boolean(item));
}

export function normalizeOfferBenefits(raw: unknown): OfferBenefit[] {
  return normalizeList(raw, (item, index) => {
    const text = readString(item.text, 120);

    return text
      ? {
          id: readString(item.id, 60) || `benefit-${index + 1}`,
          text,
        }
      : null;
  });
}

export function normalizeOfferFaqs(raw: unknown): OfferFaq[] {
  return normalizeList(raw, (item, index) => {
    const question = readString(item.question, 140);
    const answer = readString(item.answer, 280);

    return question || answer
      ? {
          answer,
          id: readString(item.id, 60) || `faq-${index + 1}`,
          question,
        }
      : null;
  });
}

export function normalizeOfferTestimonials(
  raw: unknown,
): OfferTestimonial[] {
  return normalizeList(raw, (item, index) => {
    const name = readString(item.name, 80);
    const quote = readString(item.quote, 260);
    const role = readString(item.role, 80);

    return name || quote
      ? {
          id: readString(item.id, 60) || `testimonial-${index + 1}`,
          name,
          quote,
          role,
        }
      : null;
  });
}

export function normalizeOfferBonuses(raw: unknown): OfferBonus[] {
  return normalizeList(raw, (item, index) => {
    const title = readString(item.title, 120);
    const description = readString(item.description, 240);
    const value = readString(item.value, 60);

    return title || description
      ? {
          description,
          id: readString(item.id, 60) || `bonus-${index + 1}`,
          title,
          value,
        }
      : null;
  });
}

export function normalizeOfferTrustSeals(raw: unknown): OfferTrustSeal[] {
  return normalizeList(raw, (item, index) => {
    const label = readString(item.label, 80);

    return label
      ? {
          id: readString(item.id, 60) || `trust-${index + 1}`,
          label,
        }
      : null;
  });
}

export function normalizeOfferConversionContent(raw: {
  benefits?: unknown;
  bonuses?: unknown;
  countdown_enabled?: unknown;
  countdown_ends_at?: unknown;
  countdownEnabled?: unknown;
  countdownEndsAt?: unknown;
  faqs?: unknown;
  guarantee?: unknown;
  testimonials?: unknown;
  trust_seals?: unknown;
  trustSeals?: unknown;
  urgency_text?: unknown;
  urgencyText?: unknown;
} | null): OfferConversionContent {
  if (!raw) {
    return DEFAULT_OFFER_CONVERSION_CONTENT;
  }

  return {
    benefits: normalizeOfferBenefits(raw.benefits),
    bonuses: normalizeOfferBonuses(raw.bonuses),
    countdownEnabled: Boolean(raw.countdown_enabled ?? raw.countdownEnabled),
    countdownEndsAt: readString(
      raw.countdown_ends_at ?? raw.countdownEndsAt,
      80,
    ),
    faqs: normalizeOfferFaqs(raw.faqs),
    guarantee: readString(raw.guarantee, 220),
    testimonials: normalizeOfferTestimonials(raw.testimonials),
    trustSeals: normalizeOfferTrustSeals(raw.trust_seals ?? raw.trustSeals),
    urgencyText: readString(raw.urgency_text ?? raw.urgencyText, 160),
  };
}
