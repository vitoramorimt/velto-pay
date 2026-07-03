export type PaymentMethod = "credit_card" | "debit_card" | "pix" | "boleto";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "approved"
  | "failed"
  | "expired";

export interface PixPaymentDetails {
  qrCodeText: string;
  qrCodeImageUrl: string;
  expiresAt: string;
}

export interface BoletoPaymentDetails {
  barcodeNumber: string;
  pdfUrl: string;
  dueDate: string;
}

export interface CardPaymentInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
}

export interface Payment {
  id: string;
  checkoutSessionId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  providerReference: string | null;
  pixDetails?: PixPaymentDetails;
  boletoDetails?: BoletoPaymentDetails;
  createdAt: string;
  paidAt: string | null;
}
