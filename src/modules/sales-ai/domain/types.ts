export type SalesAiChatMessage = {
  content: string;
  role: "assistant" | "user";
};

export type SalesAiContext = {
  approvedSales: number;
  averageTicketCents: number;
  checkoutCount: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  pendingOrders: number;
  productCount: number;
  refundsCents: number;
  topProducts: Array<{
    name: string;
    priceCents: number;
    status: string;
  }>;
};

export type SalesAiAnswer = {
  configured: boolean;
  message: string;
  model?: string;
};
