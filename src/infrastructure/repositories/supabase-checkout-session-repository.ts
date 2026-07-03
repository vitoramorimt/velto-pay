import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type CheckoutSession,
  type CheckoutSessionItem,
} from "@/domain/entities/checkout-session";
import { Money } from "@/domain/entities/money";
import type {
  CheckoutSessionRepository,
  CreateCheckoutSessionData,
} from "@/domain/repositories/checkout-session-repository";

interface CheckoutSessionRow {
  id: string;
  merchant_id: string;
  merchant_name: string;
  status: CheckoutSession["status"];
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_amount_cents: number;
  }>;
  total_amount_cents: number;
  allowed_payment_methods: CheckoutSession["allowedPaymentMethods"];
  customer_name: string | null;
  customer_email: string | null;
  customer_document: string | null;
  expires_at: string;
  created_at: string;
  success_url: string | null;
  cancel_url: string | null;
}

function toDomain(row: CheckoutSessionRow): CheckoutSession {
  const items: CheckoutSessionItem[] = row.items.map((item) => ({
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unitAmount: Money.fromCents(item.unit_amount_cents),
  }));

  return {
    id: row.id,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name,
    status: row.status,
    items,
    totalAmount: Money.fromCents(row.total_amount_cents),
    allowedPaymentMethods: row.allowed_payment_methods,
    customer: {
      name: row.customer_name ?? undefined,
      email: row.customer_email ?? undefined,
      document: row.customer_document ?? undefined,
    },
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    successUrl: row.success_url,
    cancelUrl: row.cancel_url,
  };
}

export class SupabaseCheckoutSessionRepository implements CheckoutSessionRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<CheckoutSession | null> {
    const { data, error } = await this.client
      .from("checkout_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle<CheckoutSessionRow>();

    if (error) {
      throw new Error(`Failed to load checkout session: ${error.message}`);
    }
    if (!data) {
      return null;
    }
    return toDomain(data);
  }

  async create(data: CreateCheckoutSessionData): Promise<CheckoutSession> {
    const totalCents = data.items.reduce(
      (sum, item) => sum + item.unitAmount.cents * item.quantity,
      0,
    );
    const expiresInMinutes = data.expiresInMinutes ?? 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000).toISOString();

    const { data: row, error } = await this.client
      .from("checkout_sessions")
      .insert({
        merchant_id: data.merchantId,
        status: "open",
        items: data.items.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_amount_cents: item.unitAmount.cents,
        })),
        total_amount_cents: totalCents,
        allowed_payment_methods: data.allowedPaymentMethods,
        customer_name: data.customer?.name ?? null,
        customer_email: data.customer?.email ?? null,
        customer_document: data.customer?.document ?? null,
        expires_at: expiresAt,
        success_url: data.successUrl ?? null,
        cancel_url: data.cancelUrl ?? null,
      })
      .select("*")
      .single<CheckoutSessionRow>();

    if (error || !row) {
      throw new Error(`Failed to create checkout session: ${error?.message}`);
    }
    return toDomain(row);
  }

  async updateStatus(
    id: string,
    status: CheckoutSession["status"],
  ): Promise<CheckoutSession> {
    const { data: row, error } = await this.client
      .from("checkout_sessions")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single<CheckoutSessionRow>();

    if (error || !row) {
      throw new Error(`Failed to update checkout session: ${error?.message}`);
    }
    return toDomain(row);
  }
}
