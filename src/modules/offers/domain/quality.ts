import { parseProductPriceToCents } from "@/modules/products/domain/money";
import type {
  OfferConversionContent,
  OfferProductDraft,
} from "@/modules/offers/domain/types";

export type OfferQualityItemId =
  | "image"
  | "price"
  | "description"
  | "faq"
  | "guarantee"
  | "benefits"
  | "testimonials"
  | "published";

export type OfferQualityItem = {
  complete: boolean;
  id: OfferQualityItemId;
  label: string;
};

export type OfferQualityScore = {
  items: OfferQualityItem[];
  score: number;
  suggestions: string[];
};

type OfferQualityInput = {
  checkoutStatus: "disabled" | "draft" | "published";
  conversion: OfferConversionContent;
  product: OfferProductDraft;
};

function hasText(value: string, minLength = 1): boolean {
  return value.trim().length >= minLength;
}

function isPublished(input: OfferQualityInput): boolean {
  return (
    input.checkoutStatus === "published" || input.product.status === "active"
  );
}

export function calculateOfferQuality(
  input: OfferQualityInput,
): OfferQualityScore {
  const items: OfferQualityItem[] = [
    {
      complete: hasText(input.product.imageUrl),
      id: "image",
      label: "Imagem",
    },
    {
      complete: parseProductPriceToCents(input.product.price) !== null,
      id: "price",
      label: "Preço",
    },
    {
      complete: hasText(input.product.description, 60),
      id: "description",
      label: "Descrição",
    },
    {
      complete:
        input.conversion.faqs.filter(
          (faq) => hasText(faq.question) && hasText(faq.answer),
        ).length >= 2,
      id: "faq",
      label: "FAQ",
    },
    {
      complete: hasText(input.conversion.guarantee, 20),
      id: "guarantee",
      label: "Garantia",
    },
    {
      complete:
        input.conversion.benefits.filter((benefit) => hasText(benefit.text))
          .length >= 3,
      id: "benefits",
      label: "Benefícios",
    },
    {
      complete:
        input.conversion.testimonials.filter(
          (testimonial) =>
            hasText(testimonial.name) && hasText(testimonial.quote, 20),
        ).length >= 1,
      id: "testimonials",
      label: "Depoimentos",
    },
    {
      complete: isPublished(input),
      id: "published",
      label: "Checkout publicado",
    },
  ];

  const completed = items.filter((item) => item.complete).length;
  const suggestions: string[] = [];

  if (!items.find((item) => item.id === "guarantee")?.complete) {
    suggestions.push("Adicione uma garantia para aumentar confiança.");
  }

  if (!items.find((item) => item.id === "testimonials")?.complete) {
    suggestions.push("Cadastre depoimentos.");
  }

  if (!items.find((item) => item.id === "benefits")?.complete) {
    suggestions.push("Inclua benefícios.");
  }

  if (
    input.conversion.bonuses.filter((bonus) => hasText(bonus.title)).length < 1
  ) {
    suggestions.push("Adicione bônus.");
  }

  if (!items.find((item) => item.id === "faq")?.complete) {
    suggestions.push("Inclua perguntas frequentes.");
  }

  return {
    items,
    score: Math.round((completed / items.length) * 100),
    suggestions: suggestions.slice(0, 4),
  };
}
