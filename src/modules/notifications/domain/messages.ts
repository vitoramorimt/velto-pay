import type {
  NotificationEventType,
  NotificationMessage,
  NotificationRoute,
} from "@/modules/notifications/domain/types";

type NotificationMessageTemplate = {
  body: string;
  preference:
    | "chargebacks_enabled"
    | "failed_payments_enabled"
    | "financial_enabled"
    | "pix_enabled"
    | "refunds_enabled"
    | "sales_enabled";
  route: NotificationRoute;
  title: string;
};

export const notificationMessageTemplates: Record<
  NotificationEventType,
  NotificationMessageTemplate
> = {
  chargeback_created: {
    body: "Um chargeback foi registrado na sua operação.",
    preference: "chargebacks_enabled",
    route: "/dashboard/financeiro",
    title: "Chargeback recebido",
  },
  customer_created: {
    body: "Um novo cliente entrou na sua base.",
    preference: "sales_enabled",
    route: "/dashboard",
    title: "Novo cliente",
  },
  order_created: {
    body: "Um novo pedido foi iniciado no checkout.",
    preference: "sales_enabled",
    route: "/dashboard/checkout",
    title: "Novo pedido",
  },
  payment_failed: {
    body: "Um pagamento foi recusado no checkout.",
    preference: "failed_payments_enabled",
    route: "/dashboard/checkout",
    title: "Pagamento recusado",
  },
  payment_paid: {
    body: "Um pagamento foi confirmado na Velto Pay.",
    preference: "sales_enabled",
    route: "/dashboard",
    title: "Pagamento aprovado",
  },
  payment_pending: {
    body: "Um pagamento foi iniciado e aguarda confirmação.",
    preference: "pix_enabled",
    route: "/dashboard/checkout",
    title: "Pagamento pendente",
  },
  pix_created: {
    body: "Um Pix foi gerado e aguarda pagamento.",
    preference: "pix_enabled",
    route: "/dashboard/checkout",
    title: "Pix gerado",
  },
  pix_expired: {
    body: "Um Pix expirou antes da confirmação de pagamento.",
    preference: "pix_enabled",
    route: "/dashboard/checkout",
    title: "Pix expirado",
  },
  refund_created: {
    body: "Um reembolso foi registrado na sua operação.",
    preference: "refunds_enabled",
    route: "/dashboard/financeiro",
    title: "Reembolso realizado",
  },
  sale_approved: {
    body: "Uma venda foi aprovada na Velto Pay.",
    preference: "sales_enabled",
    route: "/dashboard",
    title: "Nova venda aprovada",
  },
};

export function createNotificationMessage(
  eventType: NotificationEventType,
  data: Record<string, string | null | undefined> = {},
): NotificationMessage {
  const template = notificationMessageTemplates[eventType];

  return {
    body: template.body,
    data: {
      ...data,
      route: template.route,
    },
    title: template.title,
  };
}

export function getNotificationPreferenceKey(eventType: NotificationEventType) {
  return notificationMessageTemplates[eventType].preference;
}

export function getNotificationRoute(eventType: NotificationEventType) {
  return notificationMessageTemplates[eventType].route;
}
