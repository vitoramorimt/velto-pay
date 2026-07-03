import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CreateCheckoutSessionUseCase } from "@/application/use-cases/create-checkout-session";
import { Money } from "@/domain/entities/money";
import { getCheckoutSessionRepository } from "@/infrastructure/container";

const createSessionSchema = z.object({
  merchantId: z.string().min(1),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        quantity: z.number().int().min(1),
        unitAmountCents: z.number().int().min(0),
      }),
    )
    .min(1),
  allowedPaymentMethods: z
    .array(z.enum(["credit_card", "debit_card", "pix", "boleto"]))
    .min(1),
  customer: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      document: z.string().optional(),
    })
    .optional(),
  expiresInMinutes: z.number().int().min(1).max(1440).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const repository = await getCheckoutSessionRepository();
  const useCase = new CreateCheckoutSessionUseCase(repository);

  try {
    const session = await useCase.execute({
      merchantId: parsed.data.merchantId,
      items: parsed.data.items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitAmount: Money.fromCents(item.unitAmountCents),
      })),
      allowedPaymentMethods: parsed.data.allowedPaymentMethods,
      customer: parsed.data.customer,
      expiresInMinutes: parsed.data.expiresInMinutes,
      successUrl: parsed.data.successUrl,
      cancelUrl: parsed.data.cancelUrl,
    });

    return NextResponse.json(
      { id: session.id, checkoutUrl: `/checkout/${session.id}` },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
