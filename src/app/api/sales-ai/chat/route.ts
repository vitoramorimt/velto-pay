import { NextResponse } from "next/server";
import { z } from "zod";

import { createSalesAiAnswer } from "@/modules/sales-ai/application/sales-ai-use-cases";

export const runtime = "nodejs";

const chatRequestSchema = z.object({
  history: z
    .array(
      z.object({
        content: z.string().trim().min(1).max(4000),
        role: z.enum(["assistant", "user"]),
      }),
    )
    .max(12)
    .default([]),
  message: z.string().trim().min(2).max(1200),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Envie uma pergunta válida para a IA de Vendas.",
      },
      { status: 400 },
    );
  }

  const payload = chatRequestSchema.safeParse(body);

  if (!payload.success) {
    return NextResponse.json(
      {
        message: "Envie uma pergunta válida para a IA de Vendas.",
      },
      { status: 400 },
    );
  }

  try {
    const answer = await createSalesAiAnswer(payload.data);

    return NextResponse.json(answer);
  } catch (error) {
    console.error("[sales-ai] chat route failed", error);

    return NextResponse.json(
      {
        message:
          "Não foi possível responder agora. Tente novamente em instantes.",
      },
      { status: 500 },
    );
  }
}
