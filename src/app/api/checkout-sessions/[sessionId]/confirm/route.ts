import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ConfirmPaymentUseCase } from "@/application/use-cases/confirm-payment";
import { getCheckoutSessionRepository, getPaymentGateway } from "@/infrastructure/container";

const confirmPaymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.enum(["credit_card", "debit_card"]),
    card: z.object({
      holderName: z.string().min(1),
      number: z.string().min(1),
      expiryMonth: z.string().min(1),
      expiryYear: z.string().min(1),
      cvv: z.string().min(1),
      installments: z.number().int().min(1).max(12),
    }),
  }),
  z.object({ method: z.literal("pix") }),
  z.object({
    method: z.literal("boleto"),
    payerDocument: z.string().min(1),
  }),
]);

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { sessionId } = await params;
  const body = await request.json();
  const parsed = confirmPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const repository = await getCheckoutSessionRepository();
  const gateway = getPaymentGateway();
  const useCase = new ConfirmPaymentUseCase(repository, gateway);

  try {
    const payment = await useCase.execute({
      checkoutSessionId: sessionId,
      method: parsed.data.method,
      card: "card" in parsed.data ? parsed.data.card : undefined,
      payerDocument: "payerDocument" in parsed.data ? parsed.data.payerDocument : undefined,
    });

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 400 },
    );
  }
}
