import type { CheckoutBadge } from "@/modules/checkout/domain/badges";
import type { CheckoutTheme } from "@/modules/checkout/domain/types";
import type { EditableProductStatus } from "@/modules/products/domain/types";

export type OfferBenefit = {
  id: string;
  text: string;
};

export type OfferFaq = {
  answer: string;
  id: string;
  question: string;
};

export type OfferTestimonial = {
  id: string;
  name: string;
  quote: string;
  role: string;
};

export type OfferBonus = {
  description: string;
  id: string;
  title: string;
  value: string;
};

export type OfferTrustSeal = {
  id: string;
  label: string;
};

export type OfferConversionContent = {
  benefits: OfferBenefit[];
  bonuses: OfferBonus[];
  countdownEnabled: boolean;
  countdownEndsAt: string;
  faqs: OfferFaq[];
  guarantee: string;
  testimonials: OfferTestimonial[];
  trustSeals: OfferTrustSeal[];
  urgencyText: string;
};

export type OfferProductDraft = {
  category: string;
  description: string;
  imageUrl: string;
  name: string;
  price: string;
  status: EditableProductStatus;
};

export type OfferCheckoutDraft = {
  badges: CheckoutBadge[];
  bannerUrl: string;
  description: string;
  headline: string;
  logoUrl: string;
  primaryColor: string;
  securePurchaseEnabled: boolean;
  theme: CheckoutTheme;
};

export type OfferCenterSaveInput = {
  checkout: OfferCheckoutDraft;
  conversion: OfferConversionContent;
  product: OfferProductDraft;
};

export type OfferPaymentSimulation = {
  clientPaysCents: number;
  fixedFeeCents: number;
  percentage: number;
  priceCents: number;
  producerReceivesCents: number;
  veltoFeeCents: number;
};
