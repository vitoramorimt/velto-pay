import type { CheckoutSession } from "@/domain/entities/checkout-session";
import type {
  CheckoutSessionRepository,
  CreateCheckoutSessionData,
} from "@/domain/repositories/checkout-session-repository";

export class CreateCheckoutSessionUseCase {
  constructor(private readonly repository: CheckoutSessionRepository) {}

  async execute(data: CreateCheckoutSessionData): Promise<CheckoutSession> {
    if (data.items.length === 0) {
      throw new Error("A checkout session must have at least one item");
    }
    if (data.allowedPaymentMethods.length === 0) {
      throw new Error("A checkout session must allow at least one payment method");
    }

    return this.repository.create(data);
  }
}
