import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import type {
  DashboardApprovalMethod,
  DashboardBreakdownItem,
  DashboardChartPoint,
  DashboardFilters,
  DashboardOrderStatus,
  DashboardOverviewData,
  DashboardPaymentMethod,
  DashboardProductOption,
  DashboardSale,
} from "@/modules/dashboard/domain/types";
import {
  countActiveProductsByProducerId,
  type DashboardOrder,
  listDashboardOrdersByProducerId,
  listDashboardProductOptionsByProducerId,
  listProductSummariesByIds,
} from "@/modules/dashboard/infrastructure/dashboard.repository";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import type { Json } from "@/shared/database.types";
import { createSupabaseServerClient } from "@/shared/supabase";

const DEFAULT_FILTERS: DashboardFilters = {
  method: "all",
  period: "30d",
  productId: "all",
  status: "all",
};

const orderStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "chargeback",
  "canceled",
  "expired",
] as const satisfies DashboardOrderStatus[];

const paymentMethods = [
  "pix",
  "credit_card",
  "boleto",
] as const satisfies DashboardPaymentMethod[];

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function parsePeriod(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue === "7d" || rawValue === "30d" || rawValue === "90d") {
    return rawValue;
  }

  if (rawValue === "all") {
    return "all";
  }

  return DEFAULT_FILTERS.period;
}

function parseMethod(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue && paymentMethods.includes(rawValue as DashboardPaymentMethod)) {
    return rawValue as DashboardPaymentMethod;
  }

  return DEFAULT_FILTERS.method;
}

function parseStatus(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue && orderStatuses.includes(rawValue as DashboardOrderStatus)) {
    return rawValue as DashboardOrderStatus;
  }

  return DEFAULT_FILTERS.status;
}

function parseProductId(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (
    rawValue &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      rawValue,
    )
  ) {
    return rawValue;
  }

  return DEFAULT_FILTERS.productId;
}

function getCreatedAfter(period: DashboardFilters["period"]) {
  if (period === "all") {
    return undefined;
  }

  const daysByPeriod: Record<
    Exclude<DashboardFilters["period"], "all">,
    number
  > = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  const date = new Date();

  date.setDate(date.getDate() - daysByPeriod[period]);
  date.setHours(0, 0, 0, 0);

  return date.toISOString();
}

function getEmptyDashboardData(
  filters: DashboardFilters,
  productOptions: DashboardProductOption[] = [],
): DashboardOverviewData {
  return {
    approvalByMethod: [],
    byMethod: [],
    byProduct: [],
    bySource: [],
    chart: [],
    filters,
    hasAnyData: false,
    latestSales: [],
    metrics: {
      activeProducts: 0,
      approvalRate: 0,
      approvedSales: 0,
      averageTicketCents: 0,
      chargebackAmountCents: 0,
      chargebacks: 0,
      conversionRate: 0,
      customers: 0,
      netRevenueCents: 0,
      pendingSales: 0,
      refunds: 0,
      refundsAmountCents: 0,
      totalRevenueCents: 0,
    },
    productOptions,
  };
}

function getPaymentMethodLabel(method: DashboardPaymentMethod | null): string {
  const labels: Record<DashboardPaymentMethod, string> = {
    boleto: "Boleto",
    credit_card: "Cartão",
    pix: "Pix",
  };

  return method ? labels[method] : "Não informado";
}

function isRecord(value: Json): value is Record<string, Json> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getOrderSource(order: DashboardOrder): string | null {
  if (!isRecord(order.metadata)) {
    return null;
  }

  const sourceKeys = ["source", "utm_source", "traffic_source", "origin"];

  for (const key of sourceKeys) {
    const value = order.metadata[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getPercentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
}

function createBreakdown(
  entries: Array<{ amountCents: number; key: string }>,
): DashboardBreakdownItem[] {
  const totals = new Map<string, { amountCents: number; count: number }>();

  entries.forEach((entry) => {
    const current = totals.get(entry.key) ?? { amountCents: 0, count: 0 };

    totals.set(entry.key, {
      amountCents: current.amountCents + entry.amountCents,
      count: current.count + 1,
    });
  });

  const totalAmountCents = Array.from(totals.values()).reduce(
    (total, item) => total + item.amountCents,
    0,
  );

  return Array.from(totals.entries())
    .map(([label, item]) => ({
      amountCents: item.amountCents,
      count: item.count,
      label,
      percentage: getPercentage(item.amountCents, totalAmountCents),
    }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

function createChart(orders: DashboardOrder[]): DashboardChartPoint[] {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return date;
  });
  const totalsByDay = new Map<string, number>(
    days.map((date) => [date.toISOString().slice(0, 10), 0]),
  );
  const salesByDay = new Map<string, number>(
    days.map((date) => [date.toISOString().slice(0, 10), 0]),
  );

  orders
    .filter((order) => order.status === "paid")
    .forEach((order) => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      const key = orderDate.toISOString().slice(0, 10);

      if (totalsByDay.has(key)) {
        totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + order.total_cents);
        salesByDay.set(key, (salesByDay.get(key) ?? 0) + 1);
      }
    });

  const maxAmount = Math.max(...totalsByDay.values());

  if (maxAmount === 0) {
    return [];
  }

  return days.map((date) => {
    const key = date.toISOString().slice(0, 10);
    const amountCents = totalsByDay.get(key) ?? 0;

    return {
      amountCents,
      approvedSales: salesByDay.get(key) ?? 0,
      day: shortDateFormatter.format(date),
      percentage: Math.max(6, Math.round((amountCents / maxAmount) * 100)),
    };
  });
}

function createLatestSales(
  orders: DashboardOrder[],
  productNamesById: Map<string, string>,
): DashboardSale[] {
  return orders.slice(0, 6).map((order) => ({
    amountCents: order.total_cents,
    createdAt: order.created_at,
    customer: `Cliente ${order.customer_id.slice(0, 8)}`,
    id: order.id,
    method: order.payment_method,
    product: productNamesById.get(order.product_id) ?? "Produto removido",
    status: order.status,
  }));
}

function createApprovalByMethod(
  orders: DashboardOrder[],
): DashboardApprovalMethod[] {
  const totals = new Map<string, { approved: number; total: number }>();

  orders
    .filter((order) => order.payment_method)
    .forEach((order) => {
      const label = getPaymentMethodLabel(order.payment_method);
      const current = totals.get(label) ?? { approved: 0, total: 0 };

      totals.set(label, {
        approved: current.approved + (order.status === "paid" ? 1 : 0),
        total: current.total + 1,
      });
    });

  return Array.from(totals.entries()).map(([label, item]) => ({
    approved: item.approved,
    label,
    percentage: getPercentage(item.approved, item.total),
    total: item.total,
  }));
}

export function parseDashboardFilters(
  searchParams: Record<string, string | string[] | undefined> = {},
): DashboardFilters {
  return {
    method: parseMethod(searchParams.metodo),
    period: parsePeriod(searchParams.periodo),
    productId: parseProductId(searchParams.produto),
    status: parseStatus(searchParams.status),
  };
}

export async function getDashboardOverviewData(
  filters = DEFAULT_FILTERS,
): Promise<DashboardOverviewData> {
  const user = await requireAuthenticatedUser("/dashboard");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    return getEmptyDashboardData(filters);
  }

  const productOptions = await listDashboardProductOptionsByProducerId(
    supabase,
    producer.id,
  );
  const selectedProductId =
    filters.productId !== "all" &&
    productOptions.some((product) => product.id === filters.productId)
      ? filters.productId
      : undefined;
  const [orders, activeProducts] = await Promise.all([
    listDashboardOrdersByProducerId(supabase, producer.id, {
      createdAfter: getCreatedAfter(filters.period),
      method: filters.method === "all" ? undefined : filters.method,
      productId: selectedProductId,
      status: filters.status === "all" ? undefined : filters.status,
    }),
    countActiveProductsByProducerId(supabase, producer.id, selectedProductId),
  ]);

  if (orders.length === 0 && activeProducts === 0) {
    return getEmptyDashboardData(filters, productOptions);
  }

  const paidOrders = orders.filter((order) => order.status === "paid");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const refundedOrders = orders.filter((order) => order.status === "refunded");
  const chargebackOrders = orders.filter(
    (order) => order.status === "chargeback",
  );
  const totalRevenueCents = paidOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const refundsAmountCents = refundedOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const chargebackAmountCents = chargebackOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const latestProductIds = Array.from(
    new Set(orders.slice(0, 6).map((order) => order.product_id)),
  );
  const breakdownProductIds = Array.from(
    new Set(orders.map((order) => order.product_id)),
  );
  const products = await listProductSummariesByIds(
    supabase,
    producer.id,
    Array.from(new Set([...latestProductIds, ...breakdownProductIds])),
  );
  const productNamesById = new Map(
    products.map((product) => [product.id, product.name]),
  );
  const paidEntries = paidOrders.map((order) => ({
    amountCents: order.total_cents,
    key: getPaymentMethodLabel(order.payment_method),
  }));
  const paidProductEntries = paidOrders.map((order) => ({
    amountCents: order.total_cents,
    key: productNamesById.get(order.product_id) ?? "Produto removido",
  }));
  const paidSourceEntries = paidOrders
    .map((order) => ({
      amountCents: order.total_cents,
      key: getOrderSource(order),
    }))
    .filter(
      (entry): entry is { amountCents: number; key: string } =>
        typeof entry.key === "string",
    );
  const uniqueCustomers = new Set(orders.map((order) => order.customer_id))
    .size;
  const approvalRate = getPercentage(paidOrders.length, orders.length);
  const averageTicketCents =
    paidOrders.length > 0
      ? Math.round(totalRevenueCents / paidOrders.length)
      : 0;

  return {
    approvalByMethod: createApprovalByMethod(orders),
    byMethod: createBreakdown(paidEntries),
    byProduct: createBreakdown(paidProductEntries),
    bySource: createBreakdown(paidSourceEntries),
    chart: createChart(orders),
    filters,
    hasAnyData: orders.length > 0 || activeProducts > 0,
    latestSales: createLatestSales(orders, productNamesById),
    metrics: {
      activeProducts,
      approvalRate,
      approvedSales: paidOrders.length,
      averageTicketCents,
      chargebackAmountCents,
      chargebacks: chargebackOrders.length,
      conversionRate: 0,
      customers: uniqueCustomers,
      netRevenueCents:
        totalRevenueCents - refundsAmountCents - chargebackAmountCents,
      pendingSales: pendingOrders.length,
      refunds: refundedOrders.length,
      refundsAmountCents,
      totalRevenueCents,
    },
    productOptions,
  };
}
