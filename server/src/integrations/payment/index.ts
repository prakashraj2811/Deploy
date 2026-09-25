import { PaymentProvider } from "./PaymentProvider";
import { MockPaymentProvider } from "./MockPaymentProvider";

// Swap in RazorpayPaymentProvider (implementing the same PaymentProvider interface) once
// RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET are set. No caller changes needed.
export const paymentProvider: PaymentProvider = new MockPaymentProvider();

export * from "./PaymentProvider";
