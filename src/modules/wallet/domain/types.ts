import type { Enums, Tables } from "@/shared/database.types";

export type Wallet = Tables<"wallets">;
export type WalletTransaction = Tables<"wallet_transactions">;
export type WithdrawalRequest = Tables<"withdrawal_requests">;
export type WithdrawalSettings = Tables<"withdrawal_settings">;
export type PlatformRevenue = Tables<"platform_revenue">;

export type PixKeyType = Enums<"pix_key_type">;
export type WalletTransactionStatus = Enums<"wallet_transaction_status">;
export type WalletTransactionType = Enums<"wallet_transaction_type">;
export type WithdrawalStatus = Enums<"withdrawal_status">;

export type WalletBalance = Pick<
  Wallet,
  | "available_balance_cents"
  | "pending_balance_cents"
  | "total_fees_paid_cents"
  | "total_received_cents"
  | "total_withdrawn_cents"
>;

export type PlatformFee = {
  fixedAmountCents: number;
  percentage: number;
};

export type Settlement = {
  availableAt: string;
  settlementDays: number;
  status: WalletTransactionStatus;
};

export type PixKey = {
  key: string;
  type: PixKeyType;
};
