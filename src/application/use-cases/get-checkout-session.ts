import type { CheckoutSession } from "@/domain/entities/checkout-session";
import type { CheckoutSessionRepository } from "@/domain/repositories/checkout-session-repository";

export class GetCheckoutSessionUseCase {
  constructor(private readonly repository: CheckoutSessionRepository) {}

  async execute(sessionId: string): Promise<CheckoutSession | null> {
    return this.repository.findById(sessionId);
  }
}
