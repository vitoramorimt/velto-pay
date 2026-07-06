import { describe, expect, it } from "vitest";

import {
  createNotificationMessage,
  getNotificationRoute,
} from "@/modules/notifications/domain/messages";

describe("notification messages", () => {
  it("creates a sale approved notification message", () => {
    const message = createNotificationMessage("sale_approved", {
      order_id: "order_123",
    });

    expect(message.title).toBe("Nova venda aprovada");
    expect(message.body).toContain("venda");
    expect(message.data.route).toBe("/dashboard");
    expect(message.data.order_id).toBe("order_123");
  });

  it("maps finance events to finance route", () => {
    expect(getNotificationRoute("refund_created")).toBe(
      "/dashboard/financeiro",
    );
    expect(getNotificationRoute("chargeback_created")).toBe(
      "/dashboard/financeiro",
    );
  });
});
