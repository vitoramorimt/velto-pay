import { describe, expect, it } from "vitest";

import { normalizeProviderStatus } from "@/modules/payments/domain/provider";

describe("normalizeProviderStatus", () => {
  it("normalizes approved payments", () => {
    expect(normalizeProviderStatus("approved")).toBe("paid");
    expect(normalizeProviderStatus("succeeded")).toBe("paid");
  });

  it("normalizes declined payments", () => {
    expect(normalizeProviderStatus("rejected")).toBe("failed");
    expect(normalizeProviderStatus("declined")).toBe("failed");
  });

  it("normalizes refund and chargeback statuses", () => {
    expect(normalizeProviderStatus("refunded")).toBe("refunded");
    expect(normalizeProviderStatus("disputed")).toBe("chargeback");
  });

  it("keeps unknown statuses pending", () => {
    expect(normalizeProviderStatus("waiting_gateway")).toBe("pending");
  });
});
