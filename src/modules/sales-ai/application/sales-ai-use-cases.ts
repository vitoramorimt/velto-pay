import "server-only";

import { getCurrentUser } from "@/modules/auth/application/guards";
import { listCheckoutsByProducerId } from "@/modules/checkout/infrastructure/checkout.repository";
import { listOrdersByProducerId } from "@/modules/orders/infrastructure/orders.repository";
import {
  findProducerByUserId,
  listProductsByProducerId,
} from "@/modules/products/infrastructure/products.repository";
import type {
  SalesAiAnswer,
  SalesAiChatMessage,
  SalesAiContext,
} from "@/modules/sales-ai/domain/types";
import {
  ensureWalletForProducer,
  getWalletByProducerId,
  listWalletTransactionsByProducerId,
  releaseDueWalletTransactions,
} from "@/modules/wallet/infrastructure/wallet.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

type AssistantIntent =
  | "checkout"
  | "conversion"
  | "finance"
  | "general"
  | "next_steps"
  | "products"
  | "sales";

export class SalesAiUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SalesAiUseCaseError";
  }
}

function formatCents(amountCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(amountCents / 100);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function detectIntent(message: string): AssistantIntent {
  const normalizedMessage = normalizeText(message);

  if (
    /\b(venda|vendas|pedido|pedidos|faturamento|receita|ticket|aprovad)/.test(
      normalizedMessage,
    )
  ) {
    return "sales";
  }

  if (
    /\b(produto|produtos|catalogo|oferta|ofertas)\b/.test(normalizedMessage)
  ) {
    return "products";
  }

  if (
    /\b(checkout|link|slug|comprar|pagamento|publico)\b/.test(normalizedMessage)
  ) {
    return "checkout";
  }

  if (
    /\b(financeiro|saldo|liquid|liquido|reembolso|chargeback|bloqueado)\b/.test(
      normalizedMessage,
    )
  ) {
    return "finance";
  }

  if (
    /\b(conversao|converter|melhorar|otimizar|vender mais|aumentar)\b/.test(
      normalizedMessage,
    )
  ) {
    return "conversion";
  }

  if (
    /\b(comecar|inicio|primeiro|proximo|passo|passos|prioridade)\b/.test(
      normalizedMessage,
    )
  ) {
    return "next_steps";
  }

  return "general";
}

function getPercentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 1000) / 10;
}

function formatCheckoutStatuses(statusCounts: Record<string, number>): string {
  const entries = Object.entries(statusCounts);

  if (entries.length === 0) {
    return "nenhum checkout criado";
  }

  return entries
    .map(([status, count]) => `${status}: ${formatNumber(count)}`)
    .join(", ");
}

function formatProductList(
  products: SalesAiContext["productsWithoutCheckout"],
): string {
  if (products.length === 0) {
    return "Nenhum produto sem checkout foi encontrado.";
  }

  return products
    .slice(0, 5)
    .map((product) => `- ${product.name} (${product.status})`)
    .join("\n");
}

function createNoDataGuidance(): string {
  return [
    "Ainda não encontrei dados comerciais suficientes para comparar performance.",
    "",
    "Próximos passos recomendados:",
    "1. Cadastre pelo menos um produto com nome, descrição e preço claros.",
    "2. Gere um checkout público para esse produto.",
    "3. Abra o link do checkout e revise se a promessa, garantia e botão de compra estão claros.",
    "4. Compartilhe o link em um canal controlado antes de investir em tráfego.",
    "5. Quando as primeiras vendas entrarem, volte aqui para comparar faturamento, pedidos aprovados e reembolsos.",
  ].join("\n");
}

function answerSales(context: SalesAiContext): string {
  if (context.totalOrders === 0) {
    return createNoDataGuidance();
  }

  const approvalRate = getPercentage(
    context.approvedSales,
    context.totalOrders,
  );

  return [
    "Analisei suas vendas com base nos dados disponíveis da sua operação.",
    "",
    `- Faturamento bruto: ${formatCents(context.grossRevenueCents)}`,
    `- Vendas aprovadas: ${formatNumber(context.approvedSales)}`,
    `- Pedidos pendentes: ${formatNumber(context.pendingOrders)}`,
    `- Reembolsos: ${formatCents(context.refundsCents)}`,
    `- Ticket médio: ${formatCents(context.averageTicketCents)}`,
    `- Taxa de aprovação estimada: ${approvalRate}%`,
    "",
    context.approvedSales === 0
      ? "Prioridade: validar a oferta e o checkout antes de aumentar tráfego. Ainda não há vendas aprovadas para otimizar escala."
      : "Prioridade: entender quais canais e produtos geraram as vendas aprovadas antes de escalar investimento.",
  ].join("\n");
}

function answerProducts(context: SalesAiContext): string {
  if (context.productCount === 0) {
    return [
      "Seu catálogo ainda não tem produtos cadastrados.",
      "",
      "Recomendo começar com uma oferta simples: nome claro, descrição objetiva, preço em BRL e checkout publicado. Depois disso, acompanhe se o produto aparece na lista e se o link público abre corretamente.",
    ].join("\n");
  }

  return [
    "Resumo do catálogo:",
    "",
    `- Produtos cadastrados: ${formatNumber(context.productCount)}`,
    `- Produtos ativos: ${formatNumber(context.activeProducts)}`,
    `- Produtos sem checkout: ${formatNumber(context.productsWithoutCheckout.length)}`,
    "",
    "Produtos que precisam de atenção no checkout:",
    formatProductList(context.productsWithoutCheckout),
    "",
    context.productsWithoutCheckout.length > 0
      ? "Ação recomendada: priorize gerar checkout para os produtos ativos sem link. Sem checkout, o produto não tem caminho direto para venda."
      : "Boa base: todos os produtos analisados já possuem checkout associado. Agora vale revisar descrição, preço e página de vendas.",
  ].join("\n");
}

function answerCheckout(context: SalesAiContext): string {
  return [
    "Status dos checkouts:",
    "",
    `- Checkouts gerados: ${formatNumber(context.checkoutCount)}`,
    `- Distribuição por status: ${formatCheckoutStatuses(context.checkoutStatusCounts)}`,
    `- Produtos sem checkout: ${formatNumber(context.productsWithoutCheckout.length)}`,
    "",
    context.checkoutCount === 0
      ? "Ação recomendada: crie o primeiro checkout a partir de um produto ativo e teste o link público em modo mobile."
      : "Ação recomendada: abra os links públicos principais e confira promessa, descrição, preço, garantias e botão de compra em mobile.",
  ].join("\n");
}

function answerFinance(context: SalesAiContext): string {
  return [
    "Visão financeira atual:",
    "",
    `- Receita bruta: ${formatCents(context.grossRevenueCents)}`,
    `- Receita líquida estimada: ${formatCents(context.netRevenueCents)}`,
    `- Saldo disponível: ${formatCents(context.availableBalanceCents)}`,
    `- Saldo bloqueado: ${formatCents(context.blockedBalanceCents)}`,
    `- Reembolsos: ${formatCents(context.refundsCents)}`,
    `- Chargebacks: ${formatNumber(context.chargebackOrders)}`,
    "",
    context.grossRevenueCents === 0
      ? "Ainda não há receita para analisar. O foco agora deve ser publicar checkout e gerar as primeiras vendas controladas."
      : "Acompanhe reembolsos e chargebacks antes de escalar. Se eles crescerem, revise promessa da oferta, garantia e clareza do checkout.",
  ].join("\n");
}

function answerConversion(context: SalesAiContext): string {
  const hasCommercialBase =
    context.activeProducts > 0 && context.checkoutCount > 0;

  return [
    "Sugestões práticas para melhorar conversão:",
    "",
    hasCommercialBase
      ? "1. Teste o checkout em mobile e remova qualquer atrito antes do botão Comprar."
      : "1. Crie primeiro um produto ativo com checkout publicado. Sem esse caminho, ainda não há funil para otimizar.",
    "2. Use uma promessa específica no nome e na descrição do produto.",
    "3. Deixe preço, garantia e entrega visíveis antes do clique de compra.",
    "4. Se houver pedidos pendentes, revise se o método de pagamento e a comunicação pós-clique estão claros.",
    "5. Se houver reembolsos, alinhe melhor expectativa de entrega e benefício do produto.",
    "",
    `Base atual: ${formatNumber(context.activeProducts)} produtos ativos, ${formatNumber(context.checkoutCount)} checkouts e ${formatNumber(context.approvedSales)} vendas aprovadas.`,
  ].join("\n");
}

function answerNextSteps(context: SalesAiContext): string {
  if (context.productCount === 0 || context.checkoutCount === 0) {
    return createNoDataGuidance();
  }

  if (context.approvedSales === 0) {
    return [
      "Sua próxima prioridade é transformar a estrutura criada em primeira venda validada.",
      "",
      "Ordem recomendada:",
      "1. Escolha o produto ativo mais claro.",
      "2. Abra o checkout público e revise a experiência no celular.",
      "3. Compartilhe o link com uma audiência pequena.",
      "4. Acompanhe pedidos pendentes e tentativas de pagamento.",
      "5. Ajuste descrição, garantia e preço antes de escalar tráfego.",
    ].join("\n");
  }

  return [
    "Sua operação já tem sinais comerciais. Próxima prioridade: consistência.",
    "",
    "1. Identifique o produto que mais gerou vendas aprovadas.",
    "2. Proteja a experiência desse checkout em mobile.",
    "3. Monitore reembolsos e chargebacks semanalmente.",
    "4. Use ticket médio e aprovação como base antes de subir investimento.",
  ].join("\n");
}

function answerGeneral(context: SalesAiContext): string {
  return [
    "Sou o Assistente Comercial Velto. Eu respondo com base nos dados disponíveis da sua operação e foco em ações práticas.",
    "",
    "Posso ajudar com:",
    "- vendas e faturamento;",
    "- produtos ativos e produtos sem checkout;",
    "- status dos checkouts;",
    "- saldo, reembolsos e sinais financeiros;",
    "- ações práticas para melhorar conversão.",
    "",
    `Resumo atual: ${formatNumber(context.productCount)} produtos, ${formatNumber(context.checkoutCount)} checkouts, ${formatNumber(context.approvedSales)} vendas aprovadas e ${formatCents(context.grossRevenueCents)} em faturamento bruto.`,
  ].join("\n");
}

function buildRulesBasedAnswer({
  context,
  message,
}: {
  context: SalesAiContext;
  history: SalesAiChatMessage[];
  message: string;
}): string {
  const intent = detectIntent(message);

  if (intent === "sales") {
    return answerSales(context);
  }

  if (intent === "products") {
    return answerProducts(context);
  }

  if (intent === "checkout") {
    return answerCheckout(context);
  }

  if (intent === "finance") {
    return answerFinance(context);
  }

  if (intent === "conversion") {
    return answerConversion(context);
  }

  if (intent === "next_steps") {
    return answerNextSteps(context);
  }

  return answerGeneral(context);
}

async function getSalesAiContext(userId: string): Promise<SalesAiContext> {
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, userId);

  if (!producer) {
    throw new SalesAiUseCaseError("Produtor não encontrado.");
  }

  await ensureWalletForProducer(supabase, producer.id);
  await releaseDueWalletTransactions(supabase, producer.id);

  const [products, checkouts, orders, wallet, walletTransactions] =
    await Promise.all([
      listProductsByProducerId(supabase, producer.id),
      listCheckoutsByProducerId(supabase, producer.id),
      listOrdersByProducerId(supabase, producer.id),
      getWalletByProducerId(supabase, producer.id),
      listWalletTransactionsByProducerId(supabase, producer.id, 1000),
    ]);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const refundedOrders = orders.filter((order) => order.status === "refunded");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const chargebackOrders = orders.filter(
    (order) => order.status === "chargeback",
  );
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled",
  );
  const grossRevenueCents = paidOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const refundsCents = refundedOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const checkoutProductIds = new Set(
    checkouts.map((checkout) => checkout.product.id),
  );
  const productsWithoutCheckout = products
    .filter((product) => !checkoutProductIds.has(product.id))
    .map((product) => ({
      name: product.name,
      status: product.status,
    }));
  const checkoutStatusCounts = checkouts.reduce<Record<string, number>>(
    (counts, checkout) => {
      counts[checkout.checkoutStatus] =
        (counts[checkout.checkoutStatus] ?? 0) + 1;

      return counts;
    },
    {},
  );
  const refundsCentsFromWallet = walletTransactions
    .filter((transaction) => transaction.type === "refund")
    .reduce(
      (total, transaction) => total + Math.abs(transaction.net_amount_cents),
      0,
    );
  const chargebacksCentsFromWallet = walletTransactions
    .filter((transaction) => transaction.type === "chargeback")
    .reduce(
      (total, transaction) => total + Math.abs(transaction.net_amount_cents),
      0,
    );
  const walletNetRevenueCents = wallet
    ? Math.max(
        wallet.total_received_cents -
          refundsCentsFromWallet -
          chargebacksCentsFromWallet,
        0,
      )
    : null;

  return {
    activeProducts: products.filter((product) => product.status === "active")
      .length,
    approvedSales: paidOrders.length,
    availableBalanceCents: wallet?.available_balance_cents ?? 0,
    averageTicketCents:
      paidOrders.length > 0
        ? Math.round(grossRevenueCents / paidOrders.length)
        : 0,
    blockedBalanceCents: wallet?.pending_balance_cents ?? 0,
    cancelledOrders: cancelledOrders.length,
    chargebackOrders: chargebackOrders.length,
    checkoutCount: checkouts.length,
    checkoutStatusCounts,
    grossRevenueCents,
    netRevenueCents:
      walletNetRevenueCents ?? Math.max(grossRevenueCents - refundsCents, 0),
    pendingOrders: pendingOrders.length,
    productCount: products.length,
    productsWithoutCheckout,
    refundsCents: refundsCentsFromWallet || refundsCents,
    topProducts: products.slice(0, 5).map((product) => ({
      name: product.name,
      priceCents: product.price_cents,
      status: product.status,
    })),
    totalOrders: orders.length,
  };
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

  return {
    message: buildRulesBasedAnswer({
      context,
      history,
      message,
    }),
    source: "rules",
  };
}
