import crypto from "crypto";
import {
  CreateOrderInput,
  CreateOrderResult,
  PaymentProvider,
  VerifyPaymentInput,
} from "./PaymentProvider";

/**
 * Sandbox payment provider used until real Razorpay keys are supplied.
 * Mirrors the Razorpay order/verify/webhook/refund flow shape so RazorpayPaymentProvider
 * can be dropped in later with no controller/service changes.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    return {
      providerOrderId: `mock_order_${crypto.randomUUID()}`,
      amountCents: input.amountCents,
      currency: input.currency,
    };
  }

  async verifyPayment(_input: VerifyPaymentInput): Promise<boolean> {
    // Sandbox mode: any payment reported by the mock checkout is considered valid.
    return true;
  }

  verifyWebhookSignature(_rawBody: string, _signature: string): boolean {
    return true;
  }

  async refund(providerPaymentId: string): Promise<{ refundId: string }> {
    return { refundId: `mock_refund_${providerPaymentId}` };
  }
}
