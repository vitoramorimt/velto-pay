export type SalesAiChatMessage = {
  content: string;
  role: "assistant" | "user";
};

export type SalesAiContext = {
  activeProducts: number;
  approvedSales: number;
  averageTicketCents: number;
  blockedBalanceCents: number;
  cancelledOrders: number;
  chargebackOrders: number;
  checkoutCount: number;
  checkoutStatusCounts: Record<string, number>;
  grossRevenueCents: number;
  netRevenueCents: number;
  pendingOrders: number;
  productCount: number;
  productsWithoutCheckout: Array<{
    name: string;
    status: string;
  }>;
  refundsCents: number;
  availableBalanceCents: number;
  topProducts: Array<{
    name: string;
    priceCents: number;
    status: string;
  }>;
  totalOrders: number;
};

export type SalesAiAnswer = {
  message: string;
  source: "rules";
};
