export interface CreateOrderInput {
  amountCents: number;
  currency: string;
  receipt: string;
}

export interface CreateOrderResult {
  providerOrderId: string;
  amountCents: number;
  currency: string;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  /** Verifies the payment signature server-side. Frontend-reported status must never be trusted directly. */
  verifyPayment(input: VerifyPaymentInput): Promise<boolean>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  refund(providerPaymentId: string, amountCents?: number): Promise<{ refundId: string }>;
}
