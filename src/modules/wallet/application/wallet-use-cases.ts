import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { sendNotificationForEvent } from "@/modules/notifications/application/notification-use-cases";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import { validateWithdrawalAmount } from "@/modules/wallet/domain/withdrawals";
import type {
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  WithdrawalSettings,
} from "@/modules/wallet/domain/types";
import type {
  WithdrawalRequestParsedInput,
  WithdrawalSettingsInput,
} from "@/modules/wallet/domain/schemas";
import {
  ensureWalletForProducer,
  getWithdrawalSettingsByProducerId,
  getWalletByProducerId,
  listWalletTransactionsByProducerId,
  listWithdrawalRequestsByProducerId,
  processWalletPaymentEvent,
  releaseDueWalletTransactions,
  requestWalletWithdrawal,
  upsertWithdrawalSettings,
} from "@/modules/wallet/infrastructure/wallet.repository";
import { walletEnv } from "@/shared/config/wallet-env";
import type { Enums } from "@/shared/database.types";
import { createSupabaseServerClient } from "@/shared/supabase";
import { createSupabaseAdminClient } from "@/shared/supabase/admin";

export class WalletUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletUseCaseError";
  }
}

type WalletContext = {
  producer: {
    id: string;
    user_id: string;
  };
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: {
    id: string;
  };
};

export type WalletFinanceMetrics = {
  availableBalanceCents: number;
  chargebacksCents: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  pendingBalanceCents: number;
  refundsCents: number;
  totalFeesPaidCents: number;
  totalReceivedCents: number;
  totalWithdrawnCents: number;
};

export type WalletFinancePageData =
  | {
      metrics: WalletFinanceMetrics;
      state: "missing_producer";
      transactions: [];
      withdrawalRequests: [];
      withdrawalSettings: null;
    }
  | {
      metrics: WalletFinanceMetrics;
      state: "ready";
      transactions: WalletTransaction[];
      withdrawalRequests: WithdrawalRequest[];
      withdrawalSettings: WithdrawalSettings | null;
    };

export type ReceivingSettingsPageData =
  | {
      state: "missing_producer";
      withdrawalSettings: null;
    }
  | {
      state: "ready";
      withdrawalSettings: WithdrawalSettings | null;
    };

const emptyMetrics: WalletFinanceMetrics = {
  availableBalanceCents: 0,
  chargebacksCents: 0,
  grossRevenueCents: 0,
  netRevenueCents: 0,
  pendingBalanceCents: 0,
  refundsCents: 0,
  totalFeesPaidCents: 0,
  totalReceivedCents: 0,
  totalWithdrawnCents: 0,
};

async function getWalletContext(redirectPath: string): Promise<WalletContext> {
  const user = await requireAuthenticatedUser(redirectPath);
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new WalletUseCaseError("Área comercial não encontrada.");
  }

  return {
    producer,
    supabase,
    user,
  };
}

function getGatewayFeeAmountCents(payload?: Record<string, unknown>): number {
  if (!payload) {
    return 0;
  }

  const directFee =
    payload.gateway_fee_amount_cents ??
    payload.gateway_fee_cents ??
    payload.fee_cents;

  if (typeof directFee === "number" && Number.isFinite(directFee)) {
    return Math.max(Math.round(directFee), 0);
  }

  if (typeof directFee === "string") {
    const parsed = Number.parseInt(directFee, 10);

    return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
  }

  return 0;
}

function calculateMetrics(wallet: Wallet, transactions: WalletTransaction[]) {
  const refundsCents = transactions
    .filter((transaction) => transaction.type === "refund")
    .reduce(
      (total, transaction) => total + Math.abs(transaction.net_amount_cents),
      0,
    );
  const chargebacksCents = transactions
    .filter((transaction) => transaction.type === "chargeback")
    .reduce(
      (total, transaction) => total + Math.abs(transaction.net_amount_cents),
      0,
    );
  const grossRevenueCents = transactions
    .filter((transaction) => transaction.type === "sale")
    .reduce((total, transaction) => total + transaction.gross_amount_cents, 0);
  return {
    availableBalanceCents: wallet.available_balance_cents,
    chargebacksCents,
    grossRevenueCents,
    netRevenueCents: Math.max(
      wallet.total_received_cents - refundsCents - chargebacksCents,
      0,
    ),
    pendingBalanceCents: wallet.pending_balance_cents,
    refundsCents,
    totalFeesPaidCents: wallet.total_fees_paid_cents,
    totalReceivedCents: wallet.total_received_cents,
    totalWithdrawnCents: wallet.total_withdrawn_cents,
  };
}

export async function getWalletFinancePageData(): Promise<WalletFinancePageData> {
  let context: WalletContext;

  try {
    context = await getWalletContext("/dashboard/financeiro");
  } catch (error) {
    if (error instanceof WalletUseCaseError) {
      return {
        metrics: emptyMetrics,
        state: "missing_producer",
        transactions: [],
        withdrawalRequests: [],
        withdrawalSettings: null,
      };
    }

    throw error;
  }

  await ensureWalletForProducer(context.supabase, context.producer.id);
  await releaseDueWalletTransactions(context.supabase, context.producer.id);

  const [wallet, transactions, withdrawalRequests, withdrawalSettings] =
    await Promise.all([
      getWalletByProducerId(context.supabase, context.producer.id),
      listWalletTransactionsByProducerId(context.supabase, context.producer.id),
      listWithdrawalRequestsByProducerId(context.supabase, context.producer.id),
      getWithdrawalSettingsByProducerId(context.supabase, context.producer.id),
    ]);

  if (!wallet) {
    return {
      metrics: emptyMetrics,
      state: "missing_producer",
      transactions: [],
      withdrawalRequests: [],
      withdrawalSettings: null,
    };
  }

  return {
    metrics: calculateMetrics(wallet, transactions),
    state: "ready",
    transactions,
    withdrawalRequests,
    withdrawalSettings,
  };
}

export async function getReceivingSettingsPageData(): Promise<ReceivingSettingsPageData> {
  let context: WalletContext;

  try {
    context = await getWalletContext("/dashboard/configuracoes/recebimentos");
  } catch (error) {
    if (error instanceof WalletUseCaseError) {
      return {
        state: "missing_producer",
        withdrawalSettings: null,
      };
    }

    throw error;
  }

  await ensureWalletForProducer(context.supabase, context.producer.id);

  return {
    state: "ready",
    withdrawalSettings: await getWithdrawalSettingsByProducerId(
      context.supabase,
      context.producer.id,
    ),
  };
}

export async function saveWithdrawalSettingsUseCase(
  input: WithdrawalSettingsInput,
): Promise<WithdrawalSettings> {
  const context = await getWalletContext(
    "/dashboard/configuracoes/recebimentos",
  );

  return upsertWithdrawalSettings(context.supabase, {
    bankName: input.defaultBankName,
    holderDocument: input.defaultHolderDocument,
    holderName: input.defaultHolderName,
    pixKey: input.defaultPixKey,
    pixKeyType: input.defaultPixKeyType,
    producerId: context.producer.id,
  });
}

export async function requestWithdrawalUseCase(
  input: WithdrawalRequestParsedInput,
): Promise<void> {
  const context = await getWalletContext("/dashboard/financeiro");
  const wallet = await ensureWalletForProducer(
    context.supabase,
    context.producer.id,
  );
  const validation = validateWithdrawalAmount({
    amountCents: input.amount,
    availableBalanceCents: wallet.available_balance_cents,
  });

  if (!validation.ok) {
    throw new WalletUseCaseError(validation.message);
  }

  const requestResult = await requestWalletWithdrawal(context.supabase, {
    amountCents: input.amount,
    bankName: input.bankName,
    holderDocument: input.holderDocument,
    holderName: input.holderName,
    pixKey: input.pixKey,
    pixKeyType: input.pixKeyType,
    producerId: context.producer.id,
  });

  await sendNotificationForEvent({
    data: {
      amount_cents: String(input.amount),
      withdrawal_request_id: requestResult.withdrawal_request_id,
    },
    eventType: "withdrawal_requested",
    producerId: context.producer.id,
    userId: context.user.id,
  });
}

export async function settleWalletForPaymentEvent(input: {
  paymentId: string;
  payload?: Record<string, unknown>;
  status: Enums<"payment_status">;
}): Promise<void> {
  if (!["paid", "refunded", "chargeback"].includes(input.status)) {
    return;
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    throw new WalletUseCaseError(
      "A chave administrativa do servidor não está configurada.",
    );
  }

  const result = await processWalletPaymentEvent(adminSupabase, {
    gatewayFeeAmountCents: getGatewayFeeAmountCents(input.payload),
    paymentId: input.paymentId,
    platformFeeFixedAmountCents: walletEnv.platformFeeFixedAmountCents,
    platformFeePercentage: walletEnv.platformFeePercentage,
    settlementDays: walletEnv.settlementDays,
    status: input.status,
  });

  if (!result.processed || !result.producer_id || !result.user_id) {
    return;
  }

  if (input.status === "paid" && result.is_available_now) {
    await sendNotificationForEvent({
      data: {
        amount_cents: String(result.net_amount_cents ?? 0),
        payment_id: input.paymentId,
      },
      eventType: "balance_available",
      producerId: result.producer_id,
      userId: result.user_id,
    });
  }
}
