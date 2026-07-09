import { describe, expect, it } from "vitest";

import { calculateOfferPaymentSimulation } from "@/modules/offers/domain/payment-simulation";
import { calculateOfferQuality } from "@/modules/offers/domain/quality";
import type {
  OfferConversionContent,
  OfferProductDraft,
} from "@/modules/offers/domain/types";

const product: OfferProductDraft = {
  category: "Educação",
  description:
    "Uma oferta estruturada com promessa clara, entrega objetiva e detalhes suficientes para o comprador decidir.",
  imageUrl: "https://cdn.velto.test/produto.jpg",
  name: "Produto premium",
  price: "97,00",
  status: "active",
};

const conversion: OfferConversionContent = {
  benefits: [
    { id: "b1", text: "Acesso imediato" },
    { id: "b2", text: "Método validado" },
    { id: "b3", text: "Material de apoio" },
  ],
  bonuses: [{ description: "Planilha", id: "bonus", title: "Bônus", value: "" }],
  countdownEnabled: false,
  countdownEndsAt: "",
  faqs: [
    { answer: "Sim.", id: "f1", question: "Tem suporte?" },
    { answer: "Por e-mail.", id: "f2", question: "Como recebo acesso?" },
  ],
  guarantee: "Garantia simples de 7 dias para aumentar confiança na compra.",
  testimonials: [
    {
      id: "t1",
      name: "Ana",
      quote: "O material ajudou a organizar minha oferta em poucos dias.",
      role: "Produtora",
    },
  ],
  trustSeals: [{ id: "s1", label: "Pagamento seguro" }],
  urgencyText: "",
};

describe("offer quality", () => {
  it("scores a complete offer as 100%", () => {
    const quality = calculateOfferQuality({
      checkoutStatus: "published",
      conversion,
      product,
    });

    expect(quality.score).toBe(100);
    expect(quality.suggestions).toHaveLength(0);
  });

  it("suggests missing conversion elements", () => {
    const quality = calculateOfferQuality({
      checkoutStatus: "draft",
      conversion: {
        ...conversion,
        benefits: [],
        bonuses: [],
        faqs: [],
        guarantee: "",
        testimonials: [],
      },
      product: {
        ...product,
        description: "Curta",
        imageUrl: "",
        status: "draft",
      },
    });

    expect(quality.score).toBeLessThan(50);
    expect(quality.suggestions).toContain(
      "Adicione uma garantia para aumentar confiança.",
    );
    expect(quality.suggestions).toContain("Cadastre depoimentos.");
  });
});

describe("offer payment simulation", () => {
  it("adds fixed and percentage fees without changing producer receivable", () => {
    const simulation = calculateOfferPaymentSimulation({
      fixedFeeCents: 290,
      percentage: 10,
      priceCents: 9700,
    });

    expect(simulation.veltoFeeCents).toBe(1260);
    expect(simulation.clientPaysCents).toBe(10960);
    expect(simulation.producerReceivesCents).toBe(9700);
  });
});
