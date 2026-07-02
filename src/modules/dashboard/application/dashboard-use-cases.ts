import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import type {
  DashboardChartPoint,
  DashboardOverviewData,
  DashboardSale,
} from "@/modules/dashboard/domain/types";
import {
  countActiveProductsByProducerId,
  type DashboardOrder,
  listDashboardOrdersByProducerId,
  listProductSummariesByIds,
} from "@/modules/dashboard/infrastructure/dashboard.repository";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function getEmptyDashboardData(): DashboardOverviewData {
  return {
    chart: [],
    hasAnyData: false,
    latestSales: [],
    metrics: {
      activeProducts: 0,
      approvedSales: 0,
      customers: 0,
      pendingSales: 0,
      totalRevenueCents: 0,
    },
  };
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

  orders
    .filter((order) => order.status === "paid")
    .forEach((order) => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      const key = orderDate.toISOString().slice(0, 10);

      if (totalsByDay.has(key)) {
        totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + order.total_cents);
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
      day: shortDateFormatter.format(date),
      percentage: Math.max(6, Math.round((amountCents / maxAmount) * 100)),
    };
  });
}

function createLatestSales(
  orders: DashboardOrder[],
  productNamesById: Map<string, string>,
): DashboardSale[] {
  return orders.slice(0, 5).map((order) => ({
    amountCents: order.total_cents,
    createdAt: order.created_at,
    customer: `Cliente ${order.customer_id.slice(0, 8)}`,
    id: order.id,
    product: productNamesById.get(order.product_id) ?? "Produto removido",
    status: order.status,
  }));
}

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const emptyDashboard = getEmptyDashboardData();
  const user = await requireAuthenticatedUser("/dashboard");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    return emptyDashboard;
  }

  const [orders, activeProducts] = await Promise.all([
    listDashboardOrdersByProducerId(supabase, producer.id),
    countActiveProductsByProducerId(supabase, producer.id),
  ]);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const totalRevenueCents = paidOrders.reduce(
    (total, order) => total + order.total_cents,
    0,
  );
  const uniqueCustomers = new Set(orders.map((order) => order.customer_id)).size;
  const latestProductIds = Array.from(
    new Set(orders.slice(0, 5).map((order) => order.product_id)),
  );
  const products = await listProductSummariesByIds(
    supabase,
    producer.id,
    latestProductIds,
  );
  const productNamesById = new Map(
    products.map((product) => [product.id, product.name]),
  );
  const chart = createChart(orders);
  const latestSales = createLatestSales(orders, productNamesById);
  const hasAnyData =
    orders.length > 0 || activeProducts > 0 || latestSales.length > 0;

  return {
    chart,
    hasAnyData,
    latestSales,
    metrics: {
      activeProducts,
      approvedSales: paidOrders.length,
      customers: uniqueCustomers,
      pendingSales: pendingOrders.length,
      totalRevenueCents,
    },
  };
}
