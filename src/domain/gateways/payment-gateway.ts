import type { Money } from "../entities/money";
import type {
  BoletoPaymentDetails,
  CardPaymentInput,
  Payment,
  PixPaymentDetails,
} from "../entities/payment";

export interface ChargeCardInput {
  checkoutSessionId: string;
  amount: Money;
  card: CardPaymentInput;
  method: "credit_card" | "debit_card";
}

export interface ChargePixInput {
  checkoutSessionId: string;
  amount: Money;
}

export interface ChargeBoletoInput {
  checkoutSessionId: string;
  amount: Money;
  payerName: string;
  payerDocument: string;
}

export interface PaymentGateway {
  chargeCard(input: ChargeCardInput): Promise<Payment>;
  chargePix(input: ChargePixInput): Promise<Payment & { pixDetails: PixPaymentDetails }>;
  chargeBoleto(
    input: ChargeBoletoInput,
  ): Promise<Payment & { boletoDetails: BoletoPaymentDetails }>;
  getPaymentStatus(paymentId: string): Promise<Payment>;
}
