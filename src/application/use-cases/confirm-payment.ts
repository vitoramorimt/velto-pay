import {
  isCheckoutSessionPayable,
} from "@/domain/entities/checkout-session";
import type { CardPaymentInput, Payment, PaymentMethod } from "@/domain/entities/payment";
import type { PaymentGateway } from "@/domain/gateways/payment-gateway";
import type { CheckoutSessionRepository } from "@/domain/repositories/checkout-session-repository";

export interface ConfirmPaymentInput {
  checkoutSessionId: string;
  method: PaymentMethod;
  card?: CardPaymentInput;
  payerDocument?: string;
}

export class ConfirmPaymentUseCase {
  constructor(
    private readonly sessionRepository: CheckoutSessionRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: ConfirmPaymentInput): Promise<Payment> {
    const session = await this.sessionRepository.findById(input.checkoutSessionId);
    if (!session) {
      throw new Error("Checkout session not found");
    }
    if (!isCheckoutSessionPayable(session)) {
      throw new Error("Checkout session is not payable");
    }
    if (!session.allowedPaymentMethods.includes(input.method)) {
      throw new Error("Payment method not allowed for this checkout session");
    }

    let payment: Payment;

    switch (input.method) {
      case "credit_card":
      case "debit_card": {
        if (!input.card) {
          throw new Error("Card details are required for this payment method");
        }
        payment = await this.paymentGateway.chargeCard({
          checkoutSessionId: session.id,
          amount: session.totalAmount,
          card: input.card,
          method: input.method,
        });
        break;
      }
      case "pix": {
        payment = await this.paymentGateway.chargePix({
          checkoutSessionId: session.id,
          amount: session.totalAmount,
        });
        break;
      }
      case "boleto": {
        if (!input.payerDocument || !session.customer.name) {
          throw new Error("Payer name and document are required for boleto");
        }
        payment = await this.paymentGateway.chargeBoleto({
          checkoutSessionId: session.id,
          amount: session.totalAmount,
          payerName: session.customer.name,
          payerDocument: input.payerDocument,
        });
        break;
      }
      default: {
        const exhaustiveCheck: never = input.method;
        throw new Error(`Unsupported payment method: ${exhaustiveCheck}`);
      }
    }

    if (payment.status === "approved") {
      await this.sessionRepository.updateStatus(session.id, "paid");
    } else if (payment.status === "processing" || payment.status === "pending") {
      await this.sessionRepository.updateStatus(session.id, "processing");
    }

    return payment;
  }
}
