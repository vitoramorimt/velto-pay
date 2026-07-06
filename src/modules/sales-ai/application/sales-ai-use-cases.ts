import "server-only";

import { getCurrentUser } from "@/modules/auth/application/guards";
import type {
  SalesAiAnswer,
  SalesAiChatMessage,
  SalesAiContext,
} from "@/modules/sales-ai/domain/types";
import { listCheckoutsByProducerId } from "@/modules/checkout/infrastructure/checkout.repository";
import { listLedgerEntriesByProducerId } from "@/modules/finance/infrastructure/finance.repository";
import { listOrdersByProducerId } from "@/modules/orders/infrastructure/orders.repository";
import {
  findProducerByUserId,
  listProductsByProducerId,
} from "@/modules/products/infrastructure/products.repository";
import { aiEnv } from "@/shared/config/ai-env";
import { createSupabaseServerClient } from "@/shared/supabase";

type OpenAiResponse = {
  output_text?: string;
};

export class SalesAiUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SalesAiUseCaseError";
  }
}

function getFallbackAnswer(): SalesAiAnswer {
  return {
    configured: false,
    message:
      "A IA de Vendas ainda não está configurada neste ambiente. Configure OPENAI_API_KEY na Vercel para ativar respostas reais. Enquanto isso, seus dados continuam protegidos e a tela já está pronta para receber contexto de produtos, vendas, checkout, financeiro e pedidos.",
  };
}

function formatCents(amountCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(amountCents / 100);
}

function buildContextSummary(context: SalesAiContext): string {
  const topProducts = context.topProducts
    .map(
      (product) =>
        `- ${product.name} (${product.status}) por ${formatCents(product.priceCents)}`,
    )
    .join("\n");

  return [
    `Faturamento bruto: ${formatCents(context.grossRevenueCents)}`,
    `Receita líquida: ${formatCents(context.netRevenueCents)}`,
    `Vendas aprovadas: ${context.approvedSales}`,
    `Pedidos pendentes: ${context.pendingOrders}`,
    `Reembolsos: ${formatCents(context.refundsCents)}`,
    `Ticket médio: ${formatCents(context.averageTicketCents)}`,
    `Produtos cadastrados: ${context.productCount}`,
    `Checkouts gerados: ${context.checkoutCount}`,
    `Produtos em destaque:\n${topProducts || "- Nenhum produto cadastrado"}`,
  ].join("\n");
}

function buildInput({
  context,
  history,
  message,
}: {
  context: SalesAiContext;
  history: SalesAiChatMessage[];
  message: string;
}) {
  const trimmedHistory = history.slice(-8);

  return [
    {
      content:
        "Você é a IA de Vendas da Velto Pay. Responda em português brasileiro, com análise prática, objetiva e honesta para produtores digitais. Não invente dados. Use apenas o contexto fornecido. Se faltar dado, diga o que precisa ser medido.",
      role: "system",
    },
    {
      content: `Contexto real do produtor:\n${buildContextSummary(context)}`,
      role: "user",
    },
    ...trimmedHistory.map((item) => ({
      content: item.content,
      role: item.role,
    })),
    {
      content: message,
      role: "user",
    },
  ];
}

async function getSalesAiContext(userId: string): Promise<SalesAiContext> {
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, userId);

  if (!producer) {
    throw new SalesAiUseCaseError("Produtor não encontrado.");
  }

  const [products, checkouts, orders, ledgerEntries] = await Promise.all([
    listProductsByProducerId(supabase, producer.id),
    listCheckoutsByProducerId(supabase, producer.id),
    listOrdersByProducerId(supabase, producer.id),
    listLedgerEntriesByProducerId(supabase, producer.id),
  ]);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const refundedOrders = orders.filter((order) => order.status === "refunded");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const grossRevenueCents = paidOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const refundsCents = refundedOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const ledgerBalanceCents = ledgerEntries.reduce((total, entry) => {
    return entry.direction === "credit"
      ? total + entry.amount_cents
      : total - entry.amount_cents;
  }, 0);

  return {
    approvedSales: paidOrders.length,
    averageTicketCents:
      paidOrders.length > 0
        ? Math.round(grossRevenueCents / paidOrders.length)
        : 0,
    checkoutCount: checkouts.length,
    grossRevenueCents,
    netRevenueCents:
      ledgerEntries.length > 0
        ? ledgerBalanceCents
        : grossRevenueCents - refundsCents,
    pendingOrders: pendingOrders.length,
    productCount: products.length,
    refundsCents,
    topProducts: products.slice(0, 5).map((product) => ({
      name: product.name,
      priceCents: product.price_cents,
      status: product.status,
    })),
  };
}

function extractOpenAiText(data: OpenAiResponse): string | null {
  return typeof data.output_text === "string" && data.output_text.trim()
    ? data.output_text.trim()
    : null;
}

export async function createSalesAiAnswer({
  history,
  message,
}: {
  history: SalesAiChatMessage[];
  message: string;
}): Promise<SalesAiAnswer> {
  const user = await getCurrentUser();

  if (!user) {
    throw new SalesAiUseCaseError("Usuário não autenticado.");
  }

  const context = await getSalesAiContext(user.id);

  if (!aiEnv.OPENAI_API_KEY) {
    return getFallbackAnswer();
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: buildInput({ context, history, message }),
      max_output_tokens: 700,
      model: aiEnv.OPENAI_MODEL,
    }),
    headers: {
      Authorization: `Bearer ${aiEnv.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("[sales-ai] OpenAI request failed", {
      body: errorText.slice(0, 1000),
      status: response.status,
    });

    throw new SalesAiUseCaseError("Não foi possível consultar a IA.");
  }

  const data = (await response.json()) as OpenAiResponse;
  const answer = extractOpenAiText(data);

  if (!answer) {
    throw new SalesAiUseCaseError("A IA retornou uma resposta vazia.");
  }

  return {
    configured: true,
    message: answer,
    model: aiEnv.OPENAI_MODEL,
  };
}
