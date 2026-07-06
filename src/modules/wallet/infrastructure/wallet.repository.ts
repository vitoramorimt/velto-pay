import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type {
  PixKeyType,
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  WithdrawalSettings,
} from "@/modules/wallet/domain/types";
import type { Database, Enums, TablesUpdate } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;

const walletPaymentEventResultSchema = z.object({
  available_at: z.string().nullable().optional(),
  gateway_fee_amount_cents: z.number().optional(),
  gross_amount_cents: z.number().optional(),
  is_available_now: z.boolean().optional(),
  net_amount_cents: z.number().optional(),
  payment_id: z.string().optional(),
  platform_fee_amount_cents: z.number().optional(),
  processed: z.boolean(),
  producer_id: z.string().optional(),
  reason: z.string().optional(),
  status: z.string().optional(),
  user_id: z.string().optional(),
});

const withdrawalRequestResultSchema = z.object({
  amount_cents: z.number(),
  producer_id: z.string(),
  status: z.string(),
  user_id: z.string(),
  wallet_transaction_id: z.string(),
  withdrawal_request_id: z.string(),
});

export type ProcessWalletPaymentEventResult = z.infer<
  typeof walletPaymentEventResultSchema
>;
export type WalletWithdrawalRequestResult = z.infer<
  typeof withdrawalRequestResultSchema
>;

function repositoryError(message: string): Error {
  return new Error(message);
}

export async function ensureWalletForProducer(
  supabase: DatabaseClient,
  producerId: string,
): Promise<Wallet> {
  const { data, error } = await supabase.rpc("ensure_wallet_for_producer", {
    p_producer_id: producerId,
  });

  if (error) {
    console.error("[wallet] ensure wallet failed", error);
    throw repositoryError("Não foi possível carregar sua carteira.");
  }

  return data;
}

export async function releaseDueWalletTransactions(
  supabase: DatabaseClient,
  producerId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "release_due_wallet_transactions",
    {
      p_producer_id: producerId,
    },
  );

  if (error) {
    console.error("[wallet] release due transactions failed", error);
    throw repositoryError("Não foi possível atualizar o saldo disponível.");
  }

  return data ?? 0;
}

export async function getWalletByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("producer_id", producerId)
    .maybeSingle();

  if (error) {
    console.error("[wallet] get wallet failed", error);
    throw repositoryError("Não foi possível carregar sua carteira.");
  }

  return data;
}

export async function listWalletTransactionsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
  limit = 50,
): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[wallet] list transactions failed", error);
    throw repositoryError("Não foi possível carregar as movimentações.");
  }

  return data ?? [];
}

export async function getWithdrawalSettingsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<WithdrawalSettings | null> {
  const { data, error } = await supabase
    .from("withdrawal_settings")
    .select("*")
    .eq("producer_id", producerId)
    .maybeSingle();

  if (error) {
    console.error("[wallet] get withdrawal settings failed", error);
    throw repositoryError("Não foi possível carregar os dados de recebimento.");
  }

  return data;
}

export async function upsertWithdrawalSettings(
  supabase: DatabaseClient,
  input: {
    bankName?: string | null;
    holderDocument: string;
    holderName: string;
    pixKey: string;
    pixKeyType: PixKeyType;
    producerId: string;
  },
): Promise<WithdrawalSettings> {
  const { data, error } = await supabase
    .from("withdrawal_settings")
    .upsert(
      {
        default_bank_name: input.bankName || null,
        default_holder_document: input.holderDocument.replace(/\D/g, ""),
        default_holder_name: input.holderName,
        default_pix_key: input.pixKey,
        default_pix_key_type: input.pixKeyType,
        producer_id: input.producerId,
      },
      { onConflict: "producer_id" },
    )
    .select("*")
    .single();

  if (error) {
    console.error("[wallet] upsert withdrawal settings failed", error);
    throw repositoryError("Não foi possível salvar os dados de recebimento.");
  }

  return data;
}

export async function requestWalletWithdrawal(
  supabase: DatabaseClient,
  input: {
    amountCents: number;
    bankName?: string | null;
    holderDocument: string;
    holderName: string;
    pixKey: string;
    pixKeyType: PixKeyType;
    producerId: string;
  },
): Promise<WalletWithdrawalRequestResult> {
  const { data, error } = await supabase.rpc("request_wallet_withdrawal", {
    p_amount_cents: input.amountCents,
    p_bank_name: input.bankName || null,
    p_holder_document: input.holderDocument,
    p_holder_name: input.holderName,
    p_pix_key: input.pixKey,
    p_pix_key_type: input.pixKeyType,
    p_producer_id: input.producerId,
  });

  if (error) {
    console.error("[wallet] request withdrawal failed", error);
    throw repositoryError(
      error.message || "Não foi possível solicitar o saque.",
    );
  }

  const parsed = withdrawalRequestResultSchema.safeParse(data);

  if (!parsed.success) {
    console.error("[wallet] invalid withdrawal response", parsed.error);
    throw repositoryError("Não foi possível confirmar a solicitação de saque.");
  }

  return parsed.data;
}

export async function listWithdrawalRequestsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
  limit = 20,
): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("producer_id", producerId)
    .order("requested_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[wallet] list withdrawal requests failed", error);
    throw repositoryError("Não foi possível carregar os saques solicitados.");
  }

  return data ?? [];
}

export async function processWalletPaymentEvent(
  supabase: DatabaseClient,
  input: {
    gatewayFeeAmountCents?: number;
    paymentId: string;
    platformFeeFixedAmountCents: number;
    platformFeePercentage: number;
    settlementDays: number;
    status: Enums<"payment_status">;
  },
): Promise<ProcessWalletPaymentEventResult> {
  const { data, error } = await supabase.rpc("process_wallet_payment_event", {
    p_gateway_fee_amount_cents: input.gatewayFeeAmountCents ?? 0,
    p_payment_id: input.paymentId,
    p_platform_fee_fixed_amount_cents: input.platformFeeFixedAmountCents,
    p_platform_fee_percentage: input.platformFeePercentage,
    p_settlement_days: input.settlementDays,
    p_status: input.status,
  });

  if (error) {
    console.error("[wallet] process payment event failed", error);
    throw repositoryError("Não foi possível processar a carteira da venda.");
  }

  const parsed = walletPaymentEventResultSchema.safeParse(data);

  if (!parsed.success) {
    console.error("[wallet] invalid payment event response", parsed.error);
    throw repositoryError(
      "Não foi possível confirmar a movimentação da venda.",
    );
  }

  return parsed.data;
}

export async function updateWalletTotalsAfterWithdrawalStatus(
  supabase: DatabaseClient,
  input: {
    status: Enums<"withdrawal_status">;
    withdrawalRequestId: string;
  },
): Promise<void> {
  const payload: TablesUpdate<"withdrawal_requests"> = {
    status: input.status,
  };

  const { error } = await supabase
    .from("withdrawal_requests")
    .update(payload)
    .eq("id", input.withdrawalRequestId);

  if (error) {
    console.error("[wallet] update withdrawal status failed", error);
    throw repositoryError("Não foi possível atualizar o saque.");
  }
}
