import { SmsProvider } from "./SmsProvider";
import { MockSmsProvider } from "./MockSmsProvider";

// Swap in a real provider (Twilio, MSG91, etc.) here once SMS_PROVIDER is set to something other than "mock".
export const smsProvider: SmsProvider = new MockSmsProvider();

export * from "./SmsProvider";
