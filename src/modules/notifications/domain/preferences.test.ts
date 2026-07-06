import { describe, expect, it } from "vitest";

import { isNotificationEnabledByPreferences } from "@/modules/notifications/domain/preferences";
import type { NotificationPreferenceInput } from "@/modules/notifications/domain/types";

const enabledPreferences: NotificationPreferenceInput = {
  chargebacks_enabled: true,
  failed_payments_enabled: true,
  financial_enabled: true,
  pix_enabled: true,
  refunds_enabled: true,
  sales_enabled: true,
};

describe("notification preferences", () => {
  it("blocks notification when the mapped preference is disabled", () => {
    expect(
      isNotificationEnabledByPreferences("payment_failed", {
        ...enabledPreferences,
        failed_payments_enabled: false,
      }),
    ).toBe(false);
  });

  it("allows sale notifications when sales preference is enabled", () => {
    expect(
      isNotificationEnabledByPreferences(
        "sale_approved",
        enabledPreferences,
      ),
    ).toBe(true);
  });
});
