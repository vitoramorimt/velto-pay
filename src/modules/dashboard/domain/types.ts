import type { Enums } from "@/shared/database.types";

export type DashboardOrderStatus = Enums<"order_status">;
export type DashboardPaymentMethod = Enums<"payment_method">;

export type DashboardPeriod = "7d" | "30d" | "90d" | "all";

export type DashboardFilters = {
  method: DashboardPaymentMethod | "all";
  period: DashboardPeriod;
  productId: string | "all";
  status: DashboardOrderStatus | "all";
};

export type DashboardMetrics = {
  activeProducts: number;
  approvalRate: number;
  approvedSales: number;
  chargebackAmountCents: number;
  chargebacks: number;
  conversionRate: number;
  customers: number;
  netRevenueCents: number;
  pendingSales: number;
  refunds: number;
  refundsAmountCents: number;
  averageTicketCents: number;
  totalRevenueCents: number;
};

export type DashboardChartPoint = {
  amountCents: number;
  approvedSales: number;
  day: string;
  percentage: number;
};

export type DashboardSale = {
  customer: string;
  createdAt: string;
  id: string;
  amountCents: number;
  method: DashboardPaymentMethod | null;
  product: string;
  status: DashboardOrderStatus;
};

export type DashboardBreakdownItem = {
  amountCents: number;
  count: number;
  label: string;
  percentage: number;
};

export type DashboardApprovalMethod = {
  approved: number;
  label: string;
  percentage: number;
  total: number;
};

export type DashboardProductOption = {
  id: string;
  name: string;
};

export type DashboardOverviewData = {
  approvalByMethod: DashboardApprovalMethod[];
  byMethod: DashboardBreakdownItem[];
  byProduct: DashboardBreakdownItem[];
  bySource: DashboardBreakdownItem[];
  chart: DashboardChartPoint[];
  filters: DashboardFilters;
  hasAnyData: boolean;
  latestSales: DashboardSale[];
  metrics: DashboardMetrics;
  productOptions: DashboardProductOption[];
};
