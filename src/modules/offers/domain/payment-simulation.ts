import type { OfferPaymentSimulation } from "@/modules/offers/domain/types";

type OfferPaymentSimulationInput = {
  fixedFeeCents?: number;
  percentage?: number;
  priceCents: number;
};

export function calculateOfferPaymentSimulation({
  fixedFeeCents = 0,
  percentage = 0,
  priceCents,
}: OfferPaymentSimulationInput): OfferPaymentSimulation {
  const safePriceCents = Math.max(Math.round(priceCents), 0);
  const fixedFee = Math.max(Math.round(fixedFeeCents), 0);
  const percentageFee = Math.round(
    safePriceCents * (Math.max(percentage, 0) / 100),
  );
  const veltoFeeCents = Math.max(fixedFee + percentageFee, 0);

  return {
    clientPaysCents: safePriceCents + veltoFeeCents,
    fixedFeeCents: fixedFee,
    percentage: Math.max(percentage, 0),
    priceCents: safePriceCents,
    producerReceivesCents: safePriceCents,
    veltoFeeCents,
  };
}
