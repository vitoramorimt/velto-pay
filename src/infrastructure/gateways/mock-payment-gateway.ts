import { randomUUID } from "crypto";

import type {
  BoletoPaymentDetails,
  Payment,
  PixPaymentDetails,
} from "@/domain/entities/payment";
import type {
  ChargeBoletoInput,
  ChargeCardInput,
  ChargePixInput,
  PaymentGateway,
} from "@/domain/gateways/payment-gateway";

/**
 * Placeholder gateway used while no real acquirer/PSP is integrated.
 * Approves cards synchronously and simulates async PIX/boleto settlement.
 */
export class MockPaymentGateway implements PaymentGateway {
  private readonly payments = new Map<string, Payment>();

  async chargeCard(input: ChargeCardInput): Promise<Payment> {
    const isDeclined = input.card.number.trim().endsWith("0000");

    const payment: Payment = {
      id: randomUUID(),
      checkoutSessionId: input.checkoutSessionId,
      method: input.method,
      status: isDeclined ? "failed" : "approved",
      providerReference: `mock_card_${randomUUID()}`,
      createdAt: new Date().toISOString(),
      paidAt: isDeclined ? null : new Date().toISOString(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async chargePix(
    input: ChargePixInput,
  ): Promise<Payment & { pixDetails: PixPaymentDetails }> {
    const pixDetails: PixPaymentDetails = {
      qrCodeText: `00020126580014BR.GOV.BCB.PIX0136${randomUUID()}5204000053039865802BR5913VeltoPay6009SAO PAULO62070503***6304MOCK`,
      qrCodeImageUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><rect width='240' height='240' fill='%23f4f4f5'/><text x='50%25' y='50%25' text-anchor='middle' font-size='14' fill='%2371717a'>QR Code PIX (mock)</text></svg>`,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    };

    const payment: Payment & { pixDetails: PixPaymentDetails } = {
      id: randomUUID(),
      checkoutSessionId: input.checkoutSessionId,
      method: "pix",
      status: "pending",
      providerReference: `mock_pix_${randomUUID()}`,
      pixDetails,
      createdAt: new Date().toISOString(),
      paidAt: null,
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async chargeBoleto(
    input: ChargeBoletoInput,
  ): Promise<Payment & { boletoDetails: BoletoPaymentDetails }> {
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60_000).toISOString();
    const boletoDetails: BoletoPaymentDetails = {
      barcodeNumber: "23793.38128 60082.652282 31000.063305 1 96500000019700",
      pdfUrl: "#",
      dueDate,
    };

    const payment: Payment & { boletoDetails: BoletoPaymentDetails } = {
      id: randomUUID(),
      checkoutSessionId: input.checkoutSessionId,
      method: "boleto",
      status: "pending",
      providerReference: `mock_boleto_${randomUUID()}`,
      boletoDetails,
      createdAt: new Date().toISOString(),
      paidAt: null,
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    return payment;
  }
}
