import { SmsProvider } from "./SmsProvider";

/** Logs SMS messages to the console instead of sending them. Used until an SMS gateway is configured. */
export class MockSmsProvider implements SmsProvider {
  async send(to: string, message: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[MockSmsProvider] To: ${to} | ${message}`);
  }
}
