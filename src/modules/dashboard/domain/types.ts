import type { Enums } from "@/shared/database.types";

export type DashboardOrderStatus = Enums<"order_status">;

export type DashboardMetrics = {
  activeProducts: number;
  approvedSales: number;
  customers: number;
  pendingSales: number;
  totalRevenueCents: number;
};

export type DashboardChartPoint = {
  amountCents: number;
  day: string;
  percentage: number;
};

export type DashboardSale = {
  customer: string;
  createdAt: string;
  id: string;
  amountCents: number;
  product: string;
  status: DashboardOrderStatus;
};

export type DashboardOverviewData = {
  chart: DashboardChartPoint[];
  hasAnyData: boolean;
  latestSales: DashboardSale[];
  metrics: DashboardMetrics;
};
