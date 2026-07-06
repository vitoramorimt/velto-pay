import "server-only";

import { createSupabaseAdminClient } from "@/shared/supabase/admin";

export type PlatformFinancialSummary = {
  pendingWithdrawalsCents: number;
  platformFeeRevenueCents: number;
  producerAvailableBalanceCents: number;
  producerPendingBalanceCents: number;
  totalProcessedVolumeCents: number;
};

export class AdminWalletUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminWalletUseCaseError";
  }
}

export async function getPlatformFinancialSummaryUseCase(): Promise<PlatformFinancialSummary> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new AdminWalletUseCaseError(
      "A chave administrativa do servidor não está configurada.",
    );
  }

  const [revenueResult, withdrawalsResult, walletsResult] = await Promise.all([
    supabase
      .from("platform_revenue")
      .select("gross_amount_cents, platform_fee_amount_cents")
      .limit(10_000),
    supabase
      .from("withdrawal_requests")
      .select("amount_cents, status")
      .in("status", ["requested", "processing"])
      .limit(10_000),
    supabase
      .from("wallets")
      .select("available_balance_cents, pending_balance_cents")
      .limit(10_000),
  ]);

  if (revenueResult.error || withdrawalsResult.error || walletsResult.error) {
    throw new AdminWalletUseCaseError(
      "Não foi possível carregar o resumo financeiro.",
    );
  }

  return {
    pendingWithdrawalsCents: (withdrawalsResult.data ?? []).reduce(
      (total, withdrawal) => total + withdrawal.amount_cents,
      0,
    ),
    platformFeeRevenueCents: (revenueResult.data ?? []).reduce(
      (total, revenue) => total + revenue.platform_fee_amount_cents,
      0,
    ),
    producerAvailableBalanceCents: (walletsResult.data ?? []).reduce(
      (total, wallet) => total + wallet.available_balance_cents,
      0,
    ),
    producerPendingBalanceCents: (walletsResult.data ?? []).reduce(
      (total, wallet) => total + wallet.pending_balance_cents,
      0,
    ),
    totalProcessedVolumeCents: (revenueResult.data ?? []).reduce(
      (total, revenue) => total + revenue.gross_amount_cents,
      0,
    ),
  };
}
