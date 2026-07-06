export type PlatformFeeInput = {
  fixedAmountCents?: number;
  grossAmountCents: number;
  percentage?: number;
};

export type WalletSettlementInput = PlatformFeeInput & {
  gatewayFeeAmountCents?: number;
};

export type WalletSettlement = {
  gatewayFeeAmountCents: number;
  grossAmountCents: number;
  netAmountCents: number;
  platformFeeAmountCents: number;
};

export function calculatePlatformFee({
  fixedAmountCents = 0,
  grossAmountCents,
  percentage = 0,
}: PlatformFeeInput): number {
  const safeGross = Math.max(Math.round(grossAmountCents), 0);
  const fixedFee = Math.max(Math.round(fixedAmountCents), 0);
  const percentageFee = Math.round(safeGross * (Math.max(percentage, 0) / 100));

  return Math.min(safeGross, fixedFee + percentageFee);
}

export function calculateWalletSettlement({
  fixedAmountCents = 0,
  gatewayFeeAmountCents = 0,
  grossAmountCents,
  percentage = 0,
}: WalletSettlementInput): WalletSettlement {
  const safeGross = Math.max(Math.round(grossAmountCents), 0);
  const platformFeeAmountCents = calculatePlatformFee({
    fixedAmountCents,
    grossAmountCents: safeGross,
    percentage,
  });
  const safeGatewayFee = Math.max(Math.round(gatewayFeeAmountCents), 0);
  const cappedGatewayFeeAmountCents = Math.min(
    safeGatewayFee,
    Math.max(safeGross - platformFeeAmountCents, 0),
  );

  return {
    gatewayFeeAmountCents: cappedGatewayFeeAmountCents,
    grossAmountCents: safeGross,
    netAmountCents: Math.max(
      safeGross - platformFeeAmountCents - cappedGatewayFeeAmountCents,
      0,
    ),
    platformFeeAmountCents,
  };
}
