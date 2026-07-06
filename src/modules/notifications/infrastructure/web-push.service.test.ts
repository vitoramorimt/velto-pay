import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("web push service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "");
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    vi.stubEnv("VAPID_SUBJECT", "");
  });

  it("does not throw when VAPID is not configured", async () => {
    const {
      isInvalidSubscriptionError,
      sendPushNotificationToSubscriptions,
    } = await import(
      "@/modules/notifications/infrastructure/web-push.service"
    );

    expect(isInvalidSubscriptionError({ statusCode: 410 })).toBe(true);
    expect(isInvalidSubscriptionError({ statusCode: 500 })).toBe(false);

    await expect(
      sendPushNotificationToSubscriptions({} as never, {
        delivery: {
          body: "Uma venda foi aprovada.",
          eventType: "sale_approved",
          notificationId: "notification_123",
          producerId: "producer_123",
          targetUrl: "/dashboard",
          title: "Nova venda aprovada",
          userId: "user_123",
        },
        subscriptions: [],
      }),
    ).resolves.toEqual({
      delivered: 0,
      disabled: 0,
      skipped: true,
    });
  });
});
