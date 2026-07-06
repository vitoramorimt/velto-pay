import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createNotification,
  markNotificationReadById,
} from "@/modules/notifications/infrastructure/notifications.repository";

function createQueryMock(row?: unknown) {
  const query = {
    error: null,
    eq: vi.fn(() => query),
    insert: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve({ data: row, error: null })),
    update: vi.fn(() => query),
  };

  return query;
}

describe("notifications repository", () => {
  it("marks a notification as read using user and producer scope", async () => {
    const query = createQueryMock();
    const supabase = {
      from: vi.fn(() => query),
    };

    await markNotificationReadById(supabase as never, {
      notificationId: "notification_123",
      producerId: "producer_123",
      userId: "user_123",
    });

    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(query.update).toHaveBeenCalledWith({
      read_at: expect.any(String),
    });
    expect(query.eq).toHaveBeenCalledWith("id", "notification_123");
    expect(query.eq).toHaveBeenCalledWith("user_id", "user_123");
    expect(query.eq).toHaveBeenCalledWith("producer_id", "producer_123");
  });

  it("creates a notification row", async () => {
    const row = {
      body: "Uma venda foi aprovada.",
      created_at: "2026-07-06T00:00:00.000Z",
      data: { route: "/dashboard" },
      event_type: "sale_approved" as const,
      id: "notification_123",
      producer_id: "producer_123",
      read_at: null,
      sent_at: null,
      title: "Nova venda aprovada",
      user_id: "user_123",
    };
    const query = createQueryMock(row);
    const supabase = {
      from: vi.fn(() => query),
    };

    const notification = await createNotification(supabase as never, row);

    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(query.insert).toHaveBeenCalledWith(row);
    expect(notification).toMatchObject({
      id: "notification_123",
      route: "/dashboard",
      title: "Nova venda aprovada",
    });
  });
});
